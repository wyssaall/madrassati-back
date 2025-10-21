import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  teacherId: mongoose.Types.ObjectId;
  className: string;
  subject: string;
  title: string;
  type: "final" | "exam";
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  durationMinutes: number;
  examId: string;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["final", "exam"], required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  examId: { type: String, unique: true },
}, { timestamps: true });

// Generate unique examId before saving
examSchema.pre('save', function(next) {
  if (!this.examId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    this.examId = `EX${timestamp.slice(-6)}${random.toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IExam>("Exam", examSchema);
