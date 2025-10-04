import mongoose, { Document, Schema } from 'mongoose';

export interface IGrade extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  subject: string;
  grade: number;
  maxGrade: number;
  type: 'homework' | 'exam' | 'quiz' | 'project';
  title: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGrade>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: Number, required: true, min: 0 },
    maxGrade: { type: Number, required: true, min: 1 },
    type: { 
      type: String, 
      enum: ['homework', 'exam', 'quiz', 'project'], 
      required: true 
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Grade = mongoose.model<IGrade>('Grade', GradeSchema);
