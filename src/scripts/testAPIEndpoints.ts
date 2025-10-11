import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Grade from '../models/Grade.model.js';
import Homework from '../models/Homework.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function testAPILogic() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find Wissal
    const wissal = await Student.findOne({ email: 'wissal@example.com' });
    
    if (!wissal) {
      console.log('❌ Wissal not found!');
      return;
    }

    console.log('👤 WISSAL ZABOUR');
    console.log('═'.repeat(80));
    console.log(`   Name: ${wissal.name}`);
    console.log(`   Email: ${wissal.email}`);
    console.log(`   Student ID: ${wissal._id}`);
    console.log(`   User ID: ${wissal.userId}`);
    console.log('');

    // Test what each API endpoint should return
    console.log('🔍 TESTING API LOGIC (What backend will return):');
    console.log('═'.repeat(80));

    // Test Profile
    console.log('\n1️⃣ PROFILE API (/api/student/:userId/profile)');
    console.log('   userId param:', wissal.userId);
    console.log('   Step 1: Find student by userId...');
    const studentByUserId = await Student.findOne({ userId: wissal.userId });
    if (studentByUserId) {
      console.log('   ✅ Found student:', studentByUserId.name);
      console.log('   ✅ Student._id:', studentByUserId._id);
    } else {
      console.log('   ❌ NOT FOUND! Problem with userId link!');
    }

    // Test Schedule
    console.log('\n2️⃣ SCHEDULE API (/api/student/:userId/schedule)');
    console.log('   userId param:', wissal.userId);
    console.log('   Step 1: Find student by userId...');
    const student1 = await Student.findOne({ userId: wissal.userId });
    if (student1) {
      console.log('   ✅ Found student:', student1.name);
      const studentId = student1._id;
      console.log('   Step 2: Query schedules with studentId:', studentId);
      const schedules = await ClassSchedule.find({ studentId: studentId });
      console.log(`   ✅ Found ${schedules.length} schedule(s)`);
      
      if (schedules.length > 0) {
        schedules.forEach((s, i) => {
          console.log(`      ${i + 1}. ${s.subject} (${s.day} ${s.startTime}-${s.endTime})`);
        });
      }
    } else {
      console.log('   ❌ Student not found by userId!');
    }

    // Test Grades
    console.log('\n3️⃣ GRADES API (/api/student/:userId/grades)');
    console.log('   userId param:', wissal.userId);
    const student2 = await Student.findOne({ userId: wissal.userId });
    if (student2) {
      console.log('   ✅ Found student:', student2.name);
      const studentId = student2._id;
      const grades = await Grade.find({ studentId: studentId });
      console.log(`   ✅ Found ${grades.length} grade(s)`);
      
      if (grades.length > 0) {
        grades.forEach((g, i) => {
          console.log(`      ${i + 1}. ${g.subject}: ${g.finalGrade} (hw:${g.homework}, test:${g.test}, exam:${g.exam})`);
        });
      }
    }

    // Test Homework
    console.log('\n4️⃣ HOMEWORK API (/api/student/:userId/homework)');
    const student3 = await Student.findOne({ userId: wissal.userId });
    if (student3) {
      const studentId = student3._id;
      const homework = await Homework.find({ studentId: studentId });
      console.log(`   ✅ Found ${homework.length} homework assignment(s)`);
      
      if (homework.length > 0) {
        homework.forEach((h, i) => {
          console.log(`      ${i + 1}. ${h.title} (${h.subject}) - Due: ${h.dueDate}`);
        });
      }
    }

    // Test Exams
    console.log('\n5️⃣ EXAMS API (/api/student/:userId/exams)');
    const student4 = await Student.findOne({ userId: wissal.userId });
    if (student4) {
      const studentId = student4._id;
      const [exams, tests] = await Promise.all([
        Exam.find({ studentId: studentId }),
        Test.find({ studentId: studentId })
      ]);
      console.log(`   ✅ Found ${exams.length} exam(s) and ${tests.length} test(s)`);
      
      if (exams.length > 0) {
        console.log('   Exams:');
        exams.forEach((e, i) => {
          console.log(`      ${i + 1}. ${e.title} (${e.subject}) - ${new Date(e.date).toLocaleDateString()}`);
        });
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 SUMMARY FOR WISSAL:');
    console.log('─'.repeat(80));
    
    const finalStudent = await Student.findOne({ userId: wissal.userId });
    if (finalStudent) {
      const studentId = finalStudent._id;
      const [schedCount, gradeCount, hwCount, examCount, testCount] = await Promise.all([
        ClassSchedule.countDocuments({ studentId: studentId }),
        Grade.countDocuments({ studentId: studentId }),
        Homework.countDocuments({ studentId: studentId }),
        Exam.countDocuments({ studentId: studentId }),
        Test.countDocuments({ studentId: studentId })
      ]);

      console.log(`   User ID (for login/API): ${wissal.userId}`);
      console.log(`   Student ID (internal): ${studentId}`);
      console.log('');
      console.log(`   Class Schedules: ${schedCount}`);
      console.log(`   Grades: ${gradeCount}`);
      console.log(`   Homework: ${hwCount}`);
      console.log(`   Exams: ${examCount}`);
      console.log(`   Tests: ${testCount}`);
      console.log('');
      
      if (schedCount === 0) {
        console.log('   ⚠️  No class schedules! Schedule page will be empty.');
      } else {
        console.log('   ✅ Class schedules exist! Should display on frontend.');
      }
      
      if (gradeCount === 0) {
        console.log('   ⚠️  No grades! Grades page will be empty.');
      } else {
        console.log('   ✅ Grades exist! Should display on frontend.');
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 BACKEND LOGIC IS CORRECT IF:');
    console.log('   1. Student has userId field linking to users collection ✅');
    console.log('   2. All collections use studentId (student._id) ✅');
    console.log('   3. Backend finds student by userId, then queries by studentId ✅');
    console.log('\n💡 FRONTEND WORKS IF:');
    console.log('   1. URLs use userId: /student/{userId}/... ✅');
    console.log('   2. Each page fetches on mount with useEffect ✅');
    console.log('   3. Browser is refreshed after adding data ✅');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

testAPILogic();

