import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  name: string;
  grade: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  subject: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subject: { type: String, required: true, trim: true },
    schedule: [{
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    }],
  },
  { timestamps: true }
);

export const Class = mongoose.model<IClass>('Class', ClassSchema);
