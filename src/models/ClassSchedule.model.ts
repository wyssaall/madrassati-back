import mongoose, { Schema, Document } from "mongoose";

export interface IClassSchedule extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  status: string;
}

const classScheduleSchema = new Schema<IClassSchedule>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  subject: { type: String, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  status: { type: String, default: "scheduled" },
});

export default mongoose.model<IClassSchedule>("ClassSchedule", classScheduleSchema);
