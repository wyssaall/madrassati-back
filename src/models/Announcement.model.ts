import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  type: "urgent" | "info";
  priority: "low" | "medium" | "high";
  content: string;
  date: Date;
  postedBy: string;
  announcementId: string;
}

const announcementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  type: { type: String, enum: ["urgent", "info"], default: "info" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  postedBy: { type: String, required: true },
  announcementId: { type: String, unique: true },
});

export default mongoose.model<IAnnouncement>("Announcement", announcementSchema);
