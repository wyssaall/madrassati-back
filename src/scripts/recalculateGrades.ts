import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Grade from '../models/Grade.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function recalculateGrades() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find Wissal
    const wissal = await Student.findOne({ email: 'wissal@example.com' });
    
    if (!wissal) {
      console.log('❌ Wissal not found!');
      return;
    }

    console.log('👤 Wissal Zabour');
    console.log(`   Student ID: ${wissal._id}`);
    console.log('');

    // Get all grades for Wissal
    const grades = await Grade.find({ studentId: wissal._id });

    console.log(`📊 Recalculating ${grades.length} grades with weighted formula:`);
    console.log('   finalGrade = (homework × 0.2) + (test × 0.3) + (exam × 0.5)');
    console.log('═'.repeat(80));

    for (const grade of grades) {
      console.log(`\n📚 ${grade.subject}`);
      console.log(`   Homework: ${grade.homework}/20`);
      console.log(`   Test: ${grade.test}/20`);
      console.log(`   Exam: ${grade.exam}/20`);
      
      // Calculate weighted average
      const oldFinalGrade = grade.finalGrade;
      const newFinalGrade = parseFloat(
        ((grade.homework * 0.2) + (grade.test * 0.3) + (grade.exam * 0.5)).toFixed(2)
      );
      const newStatus = newFinalGrade >= 10 ? "Pass" : "Needs Improvement";
      
      console.log(`   Old Final Grade: ${oldFinalGrade}`);
      console.log(`   New Final Grade: ${newFinalGrade} ← Weighted calculation`);
      console.log(`   Status: ${newStatus}`);
      
      // Update the grade
      await Grade.findByIdAndUpdate(grade._id, {
        $set: {
          finalGrade: newFinalGrade,
          status: newStatus
        }
      });
      
      console.log('   ✅ Updated!');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ All grades recalculated!');
    
    // Verify
    const updatedGrades = await Grade.find({ studentId: wissal._id });
    console.log(`\n📊 Wissal's Grades with Weighted Calculation:`);
    console.log('═'.repeat(80));
    
    updatedGrades.forEach((g, i) => {
      console.log(`\n${i + 1}. ${g.subject}`);
      console.log(`   Homework: ${g.homework}/20 (20% weight)`);
      console.log(`   Test: ${g.test}/20 (30% weight)`);
      console.log(`   Exam: ${g.exam}/20 (50% weight)`);
      console.log(`   ─────────────────────────────────`);
      console.log(`   Final Grade: ${g.finalGrade}/20`);
      console.log(`   Status: ${g.status}`);
      
      // Show calculation
      const calc = (g.homework * 0.2) + (g.test * 0.3) + (g.exam * 0.5);
      console.log(`   Calculation: (${g.homework} × 0.2) + (${g.test} × 0.3) + (${g.exam} × 0.5) = ${calc.toFixed(2)}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 Refresh browser to see updated grades!');
    console.log(`   http://localhost:5173/student/${wissal.userId}/grades`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

recalculateGrades();

