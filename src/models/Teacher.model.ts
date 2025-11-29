import mongoose, { Document, Schema } from "mongoose";

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  classes: string[]; // Array of class names/IDs that the teacher teaches
  subject: string; // The subject the teacher teaches (one subject per teacher)
  messagesCount: number;
  meetingsCount: number;
  alertsCount: number;
  upcomingEvents: {
    title: string;
    date: Date;
    time: string;
  }[];
}

const TeacherSchema = new Schema<ITeacher>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  classes: [{ type: String }], // Array of class names
  subject: { type: String, required: true },
  messagesCount: { type: Number, default: 0 },
  meetingsCount: { type: Number, default: 0 },
  alertsCount: { type: Number, default: 0 },
  upcomingEvents: [
    {
      title: String,
      date: Date,
      time: String,
    },
  ],
});

export const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);











