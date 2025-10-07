// src/routes/auth.routes.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

const router = Router();

// 📌 Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, gender, role } = req.body;

    // check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,   // optional
      gender,  // optional
      role,    // student | teacher | parent
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Determine redirect URL based on user role
    let redirectUrl: string;
    switch (user.role) {
      case "student":
        // For students, include their ID in the URL to fetch specific data
        redirectUrl = `/student/dashboard`;
        break;
      case "teacher":
        redirectUrl = "/teacher/dashboard";
        break;
      case "parent":
        redirectUrl = "/parent/dashboard";
        break;
      default:
        redirectUrl = "/dashboard"; // A default fallback
    }

    // Prepare user data to send back (excluding sensitive info like password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // You can include other non-sensitive fields like phone, gender if needed
    };

    res.json({ message: "Login successful", redirectUrl, user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
