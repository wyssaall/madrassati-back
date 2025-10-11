import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function checkExamsData() {
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

    // Check Exams collection (should be: final, exam)
    const exams = await Exam.find({ studentId: wissal._id });
    console.log(`📋 EXAMS Collection (type: final/exam): ${exams.length}`);
    console.log('═'.repeat(80));
    
    if (exams.length === 0) {
      console.log('❌ No exams found for Wissal!');
      console.log('\n💡 Checking ALL exams in database...\n');
      
      const allExams = await Exam.find({});
      console.log(`Total exams in database: ${allExams.length}`);
      
      if (allExams.length > 0) {
        console.log('\n⚠️  Exams exist but NOT linked to Wissal!\n');
        for (const exam of allExams) {
          console.log(`📋 ${exam.title}`);
          console.log(`   Type: ${exam.type}`);
          console.log(`   Student ID: ${exam.studentId}`);
          
          if (exam.studentId) {
            const student = await Student.findById(exam.studentId);
            if (student) {
              console.log(`   ✅ Linked to: ${student.name}`);
            } else {
              console.log(`   ❌ No student found with this ID!`);
            }
          }
          console.log('');
        }
      }
    } else {
      exams.forEach((exam, i) => {
        console.log(`\n${i + 1}. ${exam.title}`);
        console.log(`   Subject: ${exam.subject}`);
        console.log(`   Type: ${exam.type} ← Should be 'final' or 'exam'`);
        console.log(`   Date: ${new Date(exam.date).toLocaleDateString()}`);
        console.log(`   Time: ${exam.startTime} - ${exam.endTime}`);
        console.log(`   Room: ${exam.room}`);
        console.log(`   Duration: ${exam.durationMinutes} minutes`);
      });
    }

    // Check Tests collection (should be: test, quiz, midterm)
    console.log('\n' + '═'.repeat(80));
    const tests = await Test.find({ studentId: wissal._id });
    console.log(`\n📝 TESTS Collection (type: test/quiz/midterm): ${tests.length}`);
    console.log('═'.repeat(80));
    
    if (tests.length === 0) {
      console.log('❌ No tests found for Wissal!');
      
      const allTests = await Test.find({});
      console.log(`\nTotal tests in database: ${allTests.length}`);
    } else {
      tests.forEach((test, i) => {
        console.log(`\n${i + 1}. ${test.title}`);
        console.log(`   Subject: ${test.subject}`);
        console.log(`   Type: ${test.type} ← Should be 'test', 'quiz', or 'midterm'`);
        console.log(`   Date: ${new Date(test.date).toLocaleDateString()}`);
        console.log(`   Time: ${test.startTime} - ${test.endTime}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 SUMMARY:');
    console.log(`   Exams (final/exam): ${exams.length}`);
    console.log(`   Tests (test/quiz/midterm): ${tests.length}`);
    console.log(`   Total Assessments: ${exams.length + tests.length}`);

    console.log('\n💡 Frontend should show:');
    console.log(`   - Exams table: ${exams.length} items`);
    console.log(`   - Tests table: ${tests.length} items`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkExamsData();

