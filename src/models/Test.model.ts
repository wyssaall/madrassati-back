import mongoose, { Schema, Document } from "mongoose";

export interface ITest extends Document {
  teacherId: mongoose.Types.ObjectId;
  className: string;
  subject: string;
  title: string;
  type: "test" | "quiz" | "midterm";
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  durationMinutes: number;
  testId: string;
  createdAt: Date;
  updatedAt: Date;
}

const testSchema = new Schema<ITest>({
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["test", "quiz", "midterm"], required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  testId: { type: String, unique: true },
}, { timestamps: true });

// Generate unique testId before saving
testSchema.pre('save', function(next) {
  if (!this.testId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    this.testId = `TS${timestamp.slice(-6)}${random.toUpperCase()}`;
  }
  next();
});

export default mongoose.model<ITest>("Test", testSchema);









