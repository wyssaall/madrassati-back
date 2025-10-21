import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User' // Can reference either Teacher or Parent
  },
  receiverId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User' // Can reference either Teacher or Parent
  },
  childId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Student'
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Index for fast queries on conversations
MessageSchema.index({ senderId: 1, receiverId: 1, childId: 1 });
MessageSchema.index({ receiverId: 1, read: 1 });
MessageSchema.index({ timestamp: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
