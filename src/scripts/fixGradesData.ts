import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Grade from '../models/Grade.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixGradesData() {
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
    console.log(`   User ID: ${wissal.userId}`);
    console.log('');

    // Get all grades
    const grades = await Grade.find({ studentId: wissal._id });

    console.log(`📊 Found ${grades.length} grades to fix`);
    console.log('═'.repeat(80));

    for (const grade of grades) {
      console.log(`\n📚 ${grade.subject}`);
      console.log(`   Current finalGrade: ${grade.finalGrade}`);
      
      // Calculate realistic breakdown from finalGrade
      // finalGrade is average of homework, test, exam
      const finalGrade = grade.finalGrade;
      
      // Create realistic variation
      const homework = Math.round(finalGrade - 1 + Math.random() * 2); // ±1 from final
      const test = Math.round(finalGrade + Math.random() * 2); // 0-2 above final
      const exam = Math.round(finalGrade - 0.5 + Math.random() * 1.5); // Around final
      
      const updates: any = {};
      
      if (grade.homework === undefined) {
        updates.homework = homework;
        console.log(`   ✅ Adding homework: ${homework}`);
      }
      
      if (grade.test === undefined) {
        updates.test = test;
        console.log(`   ✅ Adding test: ${test}`);
      }
      
      if (grade.exam === undefined) {
        updates.exam = exam;
        console.log(`   ✅ Adding exam: ${exam}`);
      }

      if (Object.keys(updates).length > 0) {
        await Grade.findByIdAndUpdate(grade._id, updates);
        console.log('   ✅ Updated successfully!');
      } else {
        console.log('   ✅ Already has all fields');
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ All grades fixed!');
    
    // Verify
    const updatedGrades = await Grade.find({ studentId: wissal._id });
    console.log(`\n📊 Wissal's Complete Grades (${updatedGrades.length}):`);
    console.log('═'.repeat(80));
    
    updatedGrades.forEach((g, i) => {
      console.log(`\n${i + 1}. ${g.subject}`);
      console.log(`   Homework: ${g.homework}/20`);
      console.log(`   Test: ${g.test}/20`);
      console.log(`   Exam: ${g.exam}/20`);
      console.log(`   Final Grade: ${g.finalGrade}`);
      console.log(`   Status: ${g.status}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 Refresh your browser to see the breakdown on frontend!');
    console.log(`   http://localhost:5173/student/${wissal.userId}/grades`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

fixGradesData();












