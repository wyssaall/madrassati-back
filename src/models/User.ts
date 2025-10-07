// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string; // optional
  gender?: "male" | "female"; // optional
  role: "student" | "teacher" | "parent";
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    gender: { type: String, enum: ["male", "female"], required: false },
    role: {
      type: String,
      enum: ["student", "teacher", "parent"], // ✅ no admin
      default: "student",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
