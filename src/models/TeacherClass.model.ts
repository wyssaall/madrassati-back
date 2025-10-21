import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherClass extends Document {
  teacherId: mongoose.Types.ObjectId;
  className: string;
  subject: string;
  room: string;
  studentsCount: number;
  avgGrade: number;
  avgAttendance: number;
}

const TeacherClassSchema = new Schema<ITeacherClass>({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  room: { type: String, required: true },
  studentsCount: { type: Number, default: 0 },
  avgGrade: { type: Number, default: 0 },
  avgAttendance: { type: Number, default: 0 },
});

export const TeacherClass = mongoose.model<ITeacherClass>("TeacherClass", TeacherClassSchema);
