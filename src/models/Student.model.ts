import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  userId?: mongoose.Types.ObjectId; // Reference to User
  name: string;
  email: string;
  password: string;
  gradeLevel?: string;
  gpa?: number;
  classesToday?: number;
  pendingHomework?: number;
  upcomingExams?: number;
  profilePicture?: string;
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  enrollmentDate?: Date;
  attendance?: number;
  createdAt?: Date;
}

const studentSchema = new Schema<IStudent>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gradeLevel: { type: String },
  gpa: { type: Number, default: 0 },
  classesToday: { type: Number, default: 0 },
  pendingHomework: { type: Number, default: 0 },
  upcomingExams: { type: Number, default: 0 },
  profilePicture: { type: String },
  phone: { type: String },
  address: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  enrollmentDate: { type: Date, default: Date.now },
  attendance: { type: Number, default: 95 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IStudent>("Student", studentSchema);