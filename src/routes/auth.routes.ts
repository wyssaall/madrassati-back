import { Router, Request, Response } from "express";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { User } from "../models/User";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

function signToken(userId: string, role: "student" | "teacher" | "parent") {
  const secret: Secret = (process.env.JWT_SECRET || "change_me") as Secret;
  const expiresInEnv = process.env.JWT_EXPIRES_IN;
  let expiresIn: number = 60 * 60 * 24 * 7; // 7 days in seconds
  if (expiresInEnv) {
    const numeric = Number(expiresInEnv);
    if (!Number.isNaN(numeric) && numeric > 0) {
      expiresIn = numeric;
    }
  }
  const options: SignOptions = { expiresIn };
  return jwt.sign({ userId, role }, secret, options);
}

function roleToRedirectPath(role: "student" | "teacher" | "parent"): string {
  switch (role) {
    case "student":
      return "/student";
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    default:
      return "/";
  }
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      phoneNumber,
      gender,
    } = req.body as {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: "student" | "teacher" | "parent";
      phoneNumber?: string;
      gender?: "male" | "female";
    };

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res
        .status(400)
        .json({
          message:
            "fullName, email, password, confirmPassword, role are required",
        });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phoneNumber,
      gender,
    });
    const token = signToken(user.id, user.role);
    const redirectPath = roleToRedirectPath(user.role);
    return res.status(201).json({
      message: "Registered successfully",
      token,
      redirectPath,
      user: {
        id: user.id,
        fullName: user.fullName as any,
        email: user.email,
        role: user.role,
        phoneNumber: (user as any).phoneNumber,
        gender: (user as any).gender,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await (user as any).comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user.id, user.role as any);
    const redirectPath = roleToRedirectPath(user.role as any);
    return res.json({
      message: "Logged in",
      token,
      redirectPath,
      user: {
        id: user.id,
        fullName: (user as any).fullName,
        email: user.email,
        role: user.role,
        phoneNumber: (user as any).phoneNumber,
        gender: (user as any).gender,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  // Stateless JWT: client should discard the token
  return res.json({ message: "Logged out" });
});

router.get(
  "/me",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({
        user: {
          id: user.id,
          fullName: (user as any).fullName,
          email: user.email,
          role: user.role,
          phoneNumber: (user as any).phoneNumber,
          gender: (user as any).gender,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
