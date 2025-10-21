import mongoose, { Schema, Document } from "mongoose";

export interface IHomework extends Document {
  teacherId: mongoose.Types.ObjectId;
  className: string;
  subject: string;
  title: string;
  description: string;
  homeworkId: string;
  startDate: Date;
  dueDate: Date;
  status: "active" | "overdue" | "upcoming" | "completed";
  durationDays: number;
  daysLeft: number;
  createdAt: Date;
  updatedAt: Date;
}

const homeworkSchema = new Schema<IHomework>({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  homeworkId: { type: String, unique: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["active", "overdue", "upcoming", "completed"], 
    default: "upcoming" 
  },
  durationDays: { type: Number, default: 0 },
  daysLeft: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Automatically calculate durationDays, daysLeft, status, and generate homeworkId before saving
homeworkSchema.pre('save', function(next) {
  // Generate unique homeworkId if not exists
  if (!this.homeworkId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    this.homeworkId = `HW${timestamp.slice(-6)}${random.toUpperCase()}`;
  }
  
  // Calculate duration in days
  const startTime = this.startDate.getTime();
  const dueTime = this.dueDate.getTime();
  this.durationDays = Math.ceil((dueTime - startTime) / (1000 * 60 * 60 * 24));
  
  // Calculate days left
  const now = new Date().getTime();
  this.daysLeft = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
  
  // Update status based on dates
  if (this.daysLeft < 0) {
    this.status = "overdue";
  } else if (this.daysLeft <= 1) {
    this.status = "active";
  } else {
    this.status = "upcoming";
  }
  
  next();
});

// Also update on findOneAndUpdate
homeworkSchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate();
  
  if (update.$set) {
    const { startDate, dueDate } = update.$set;
    
    if (startDate || dueDate) {
      const startTime = startDate ? new Date(startDate).getTime() : update.$set.startDate?.getTime();
      const dueTime = dueDate ? new Date(dueDate).getTime() : update.$set.dueDate?.getTime();
      
      if (startTime && dueTime) {
        update.$set.durationDays = Math.ceil((dueTime - startTime) / (1000 * 60 * 60 * 24));
        
        const now = new Date().getTime();
        update.$set.daysLeft = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        
        if (update.$set.daysLeft < 0) {
          update.$set.status = "overdue";
        } else if (update.$set.daysLeft <= 1) {
          update.$set.status = "active";
        } else {
          update.$set.status = "upcoming";
        }
      }
    }
  }
  
  next();
});

export default mongoose.model<IHomework>("Homework", homeworkSchema);