import mongoose, { Schema, Document } from "mongoose";

export interface IGrade extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  finalGrade: number;
  homework: number;
  test: number;
  exam: number;
  status: "Pass" | "Needs Improvement";
}

const gradeSchema = new Schema<IGrade>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  subject: { type: String, required: true },
  finalGrade: { type: Number, required: true },
  homework: { type: Number, required: true },
  test: { type: Number, required: true },
  exam: { type: Number, required: true },
  status: { type: String, enum: ["Pass", "Needs Improvement"], default: "Pass" },
});

export default mongoose.model<IGrade>("Grade", gradeSchema);
