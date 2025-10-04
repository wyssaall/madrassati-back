import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  targetAudience: 'all' | 'students' | 'parents' | 'teachers' | 'specific_class';
  targetClass?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetAudience: { 
      type: String, 
      enum: ['all', 'students', 'parents', 'teachers', 'specific_class'],
      required: true 
    },
    targetClass: { type: Schema.Types.ObjectId, ref: 'Class' },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
