import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "student" | "parent" | "teacher" | "admin";
export type Gender = "M" | "F" | "O";

export interface IUserProfile {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  gender?: Gender;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: IUserProfile;
  linkedId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  avatarUrl: { type: String, trim: true },
  gender: { type: String, enum: ["M", "F", "O"], trim: true },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { 
      type: String, 
      required: true, 
      select: false 
    },
    role: {
      type: String,
      enum: ["student", "parent", "teacher", "admin"],
      default: "student",
      required: true,
    },
    profile: {
      type: UserProfileSchema,
      default: {}
    },
    linkedId: { 
      type: String, 
      trim: true 
    },
    lastLoginAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

// Index pour optimiser les requêtes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ linkedId: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
