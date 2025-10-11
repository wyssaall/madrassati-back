import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Grade from '../models/Grade.model.js';
import Homework from '../models/Homework.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import { connectToDatabase } from '../config/db.js';

// Load environment variables
dotenv.config();

/**
 * Helper script to find existing students in the database
 * This will show you the student IDs you need for the populateSampleData script
 * 
 * Usage: npx tsx src/scripts/findStudents.ts
 */

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function findStudents() {
  try {
    // Connect to MongoDB using existing function
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find all students
    const students = await Student.find({}).select('_id userId name email gradeLevel').limit(10);
    
    if (students.length === 0) {
      console.log('❌ No students found in the database!');
      console.log('\n💡 Tip: You need to create a student account first.');
      console.log('   You can do this through the registration endpoint or by creating one manually.\n');
    } else {
      console.log(`📚 Found ${students.length} student(s):\n`);
      console.log('═'.repeat(100));
      
      for (const student of students) {
        console.log(`\n👤 Full Name: ${student.name || 'N/A'}`);
        console.log(`   📧 Email: ${student.email || 'N/A'}`);
        console.log(`   🎓 Grade Level: ${student.gradeLevel || 'N/A'}`);
        console.log(`   🆔 Student ID (for data script): ${student._id}`);
        console.log(`   🔑 Linked User ID (for API calls): ${student.userId || 'Not linked'}`);
        
        // Count data for this student
        const [scheduleCount, gradeCount, homeworkCount, examCount, testCount] = await Promise.all([
          ClassSchedule.countDocuments({ studentId: student._id }),
          Grade.countDocuments({ studentId: student._id }),
          Homework.countDocuments({ studentId: student._id }),
          Exam.countDocuments({ studentId: student._id }),
          Test.countDocuments({ studentId: student._id })
        ]);
        
        console.log(`\n   📊 Data Summary:`);
        console.log(`      - Class Schedules: ${scheduleCount}`);
        console.log(`      - Grades: ${gradeCount}`);
        console.log(`      - Homework Assignments: ${homeworkCount}`);
        console.log(`      - Exams: ${examCount}`);
        console.log(`      - Tests: ${testCount}`);
        console.log(`      - Total Items: ${scheduleCount + gradeCount + homeworkCount + examCount + testCount}`);
        
        const hasData = scheduleCount > 0 || gradeCount > 0 || homeworkCount > 0 || examCount > 0 || testCount > 0;
        
        if (!hasData) {
          console.log(`\n   ⚠️  This student has NO data yet!`);
          console.log(`   💡 To populate sample data for this student:`);
          console.log(`      1. Edit src/scripts/populateSampleData.ts`);
          console.log(`      2. Change STUDENT_ID to: new mongoose.Types.ObjectId('${student._id}')`);
          console.log(`      3. Run: npx ts-node src/scripts/populateSampleData.ts`);
        } else {
          console.log(`\n   ✅ This student has data!`);
          console.log(`   🌐 Test API endpoints with User ID: ${student.userId || student._id}`);
        }
        
        console.log('\n' + '─'.repeat(100));
      }
      
      console.log('\n\n📝 API Testing URLs (use User ID from above):\n');
      console.log('   GET http://localhost:5000/api/student/{userId}/profile');
      console.log('   GET http://localhost:5000/api/student/{userId}/dashboard');
      console.log('   GET http://localhost:5000/api/student/{userId}/schedule');
      console.log('   GET http://localhost:5000/api/student/{userId}/grades');
      console.log('   GET http://localhost:5000/api/student/{userId}/homework');
      console.log('   GET http://localhost:5000/api/student/{userId}/exams');
      console.log('   GET http://localhost:5000/api/student/{userId}/announcements\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

findStudents();

