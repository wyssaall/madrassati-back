import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  className: string;
  subject: string;
  date: Date; // normalized to 00:00:00 of the day
  status: 'Present' | 'Absent';
  time?: string; // optional time range like 08:00–09:30
  expiresAt: Date; // TTL field for automatic cleanup after 7 days
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  time: { type: String },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

// Unique per student, subject, date
AttendanceSchema.index({ studentId: 1, subject: 1, date: 1 }, { unique: true });

// TTL index for automatic cleanup after 7 days
AttendanceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);


