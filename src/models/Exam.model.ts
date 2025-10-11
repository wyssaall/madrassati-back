import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  type: "final" | "exam";
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  durationMinutes: number;
}

const examSchema = new Schema<IExam>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ["final", "exam"], required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IExam>("Exam", examSchema);
