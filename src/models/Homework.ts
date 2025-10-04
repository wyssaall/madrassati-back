import mongoose, { Document, Schema } from 'mongoose';

export interface IHomework extends Document {
  title: string;
  description: string;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  subject: string;
  dueDate: Date;
  attachments?: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSchema = new Schema<IHomework>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    attachments: [{ type: String }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Homework = mongoose.model<IHomework>('Homework', HomeworkSchema);
