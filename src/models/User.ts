import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "student" | "teacher" | "parent";
export type Gender = "male" | "female";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  gender?: Gender;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["student", "teacher", "parent"],
      required: true,
    },
    phoneNumber: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female"], trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  const user = this as IUser;
  return bcrypt.compare(candidate, user.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
