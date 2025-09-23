import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtUserPayload = {
  userId: string;
  role: "student" | "teacher" | "parent";
};

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const secret = process.env.JWT_SECRET as string;
    if (!secret) throw new Error("JWT_SECRET missing");
    const decoded = jwt.verify(token, secret) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorizeRoles(...roles: Array<JwtUserPayload["role"]>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
