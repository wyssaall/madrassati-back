import mongoose, { Schema, Document } from "mongoose";

export interface ITest extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  type: "test" | "quiz" | "midterm";
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  durationMinutes: number;
}

const testSchema = new Schema<ITest>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ["test", "quiz", "midterm"], required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<ITest>("Test", testSchema);

