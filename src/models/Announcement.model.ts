import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  teacherId: mongoose.Types.ObjectId;
  className?: string; // backward compatibility (single class)
  targetClasses?: string[]; // multi-class targeting
  title: string;
  type: "urgent" | "info";
  priority: "low" | "medium" | "high";
  content: string;
  date: Date;
  postedBy: string;
  announcementId: string;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  className: { type: String, required: false }, // deprecated in favor of targetClasses
  targetClasses: [{ type: String }],
  title: { type: String, required: true },
  type: { type: String, enum: ["urgent", "info"], default: "info" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  postedBy: { type: String, required: true },
  announcementId: { type: String, unique: true },
}, { timestamps: true });

// Generate unique announcementId before saving
announcementSchema.pre('save', function(next) {
  if (!this.announcementId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    this.announcementId = `AN${timestamp.slice(-6)}${random.toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IAnnouncement>("Announcement", announcementSchema);
