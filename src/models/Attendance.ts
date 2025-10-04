import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['present', 'absent', 'late', 'excused'], 
      required: true 
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
