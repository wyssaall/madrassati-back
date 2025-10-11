import mongoose, { Schema, Document } from "mongoose";

export interface IHomework extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  status: "active" | "overdue" | "upcoming";
  priority: "low" | "medium" | "high";
  description: string;
  startDate: Date;
  dueDate: Date;
  durationDays: number;
  homeworkId: string;
}

const homeworkSchema = new Schema<IHomework>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ["active", "overdue", "upcoming"], default: "active" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  description: { type: String },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  durationDays: { type: Number },
  homeworkId: { type: String, unique: true },
});

export default mongoose.model<IHomework>("Homework", homeworkSchema);
