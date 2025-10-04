import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  subject: string;
  content: string;
  threadId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    threadId: { type: Schema.Types.ObjectId, ref: 'Message' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
