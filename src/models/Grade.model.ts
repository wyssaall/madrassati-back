import mongoose, { Schema, Document } from "mongoose";

export interface IGrade extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  finalGrade: number;
  homework: number;
  test: number;
  exam: number;
  status: "Pass" | "Needs Improvement";
}

const gradeSchema = new Schema<IGrade>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  subject: { type: String, required: true },
  finalGrade: { type: Number },
  homework: { type: Number, required: true },
  test: { type: Number, required: true },
  exam: { type: Number, required: true },
  status: { type: String, enum: ["Pass", "Needs Improvement"], default: "Pass" },
});

// Automatically calculate finalGrade and status before saving
gradeSchema.pre('save', function(next) {
  // Calculate weighted average: homework(20%) + test(30%) + exam(50%)
  this.finalGrade = parseFloat(
    ((this.homework * 0.2) + (this.test * 0.3) + (this.exam * 0.5)).toFixed(2)
  );
  
  // Automatically set status based on finalGrade
  this.status = this.finalGrade >= 10 ? "Pass" : "Needs Improvement";
  
  next();
});

// Also update on findOneAndUpdate
gradeSchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate();
  
  if (update.$set) {
    const { homework, test, exam } = update.$set;
    
    if (homework !== undefined || test !== undefined || exam !== undefined) {
      // Get current values or use updated ones
      const hw = homework !== undefined ? homework : update.$set.homework;
      const tst = test !== undefined ? test : update.$set.test;
      const ex = exam !== undefined ? exam : update.$set.exam;
      
      if (hw !== undefined && tst !== undefined && ex !== undefined) {
        // Calculate weighted average: homework(20%) + test(30%) + exam(50%)
        update.$set.finalGrade = parseFloat(
          ((hw * 0.2) + (tst * 0.3) + (ex * 0.5)).toFixed(2)
        );
        update.$set.status = update.$set.finalGrade >= 10 ? "Pass" : "Needs Improvement";
      }
    }
  } else if (update.homework !== undefined || update.test !== undefined || update.exam !== undefined) {
    const hw = update.homework;
    const tst = update.test;
    const ex = update.exam;
    
    if (hw !== undefined && tst !== undefined && ex !== undefined) {
      // Calculate weighted average: homework(20%) + test(30%) + exam(50%)
      update.finalGrade = parseFloat(
        ((hw * 0.2) + (tst * 0.3) + (ex * 0.5)).toFixed(2)
      );
      update.status = update.finalGrade >= 10 ? "Pass" : "Needs Improvement";
    }
  }
  
  next();
});

export default mongoose.model<IGrade>("Grade", gradeSchema);
