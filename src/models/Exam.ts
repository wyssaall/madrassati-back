import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  title: string;
  description: string;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  subject: string;
  examDate: Date;
  duration: number; // in minutes
  maxGrade: number;
  location?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    maxGrade: { type: Number, required: true, min: 1 },
    location: { type: String, trim: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
