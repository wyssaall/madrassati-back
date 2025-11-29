import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Homework from '../models/Homework.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixHomeworkClasses() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n🔧 Fixing homework class assignments...');

    // Get a sample student to check their class
    const student = await Student.findOne({});
    if (!student) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`👤 Sample student: ${student.name}`);
    console.log(`📚 Student's class: ${student.className}`);

    // Update all homework to match this student's class
    const updateResult = await Homework.updateMany(
      {}, // Update all homework
      { 
        $set: { 
          className: student.className 
        } 
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} homework assignments to class: ${student.className}`);

    // Verify the update
    const homeworksForStudent = await Homework.find({ className: student.className });
    console.log(`📋 Total homeworks now available for ${student.className}: ${homeworksForStudent.length}`);

    // Display sample homeworks
    if (homeworksForStudent.length > 0) {
      console.log('\n📝 Sample homeworks:');
      homeworksForStudent.slice(0, 3).forEach(hw => {
        console.log(`  - ${hw.title} (${hw.subject}) - Due: ${hw.dueDate.toDateString()}`);
      });
    }

    console.log('\n✅✅✅ Homework classes fixed successfully! ✅✅✅');
    console.log(`\n💡 Now test with: http://localhost:5173/student/${student.userId}/homework`);

  } catch (error) {
    console.error('❌ Error fixing homework classes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixHomeworkClasses();








