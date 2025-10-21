import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Homework from '../models/Homework.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixStudentClasses() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n🔧 Fixing student class assignments...');

    // Update all students to have a className
    const updateResult = await Student.updateMany(
      { className: { $exists: false } }, // Find students without className
      { $set: { className: 'Grade 10A' } } // Set default class
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} students to have className: Grade 10A`);

    // Also update students with undefined className
    const updateUndefinedResult = await Student.updateMany(
      { className: undefined }, // Find students with undefined className
      { $set: { className: 'Grade 10A' } } // Set default class
    );

    console.log(`✅ Updated ${updateUndefinedResult.modifiedCount} students with undefined className to: Grade 10A`);

    // Fix Wissal's class name specifically
    const fixWissalResult = await Student.updateMany(
      { name: 'Wissal Zabour' }, // Find Wissal specifically
      { $set: { className: 'Grade 10A' } } // Set to Grade 10A
    );

    console.log(`✅ Updated ${fixWissalResult.modifiedCount} Wissal Zabour to: Grade 10A`);

    // Verify the update
    const students = await Student.find({});
    console.log(`\n👥 Total students: ${students.length}`);
    
    students.forEach(student => {
      console.log(`  - ${student.name}: ${student.className || 'NO CLASS'}`);
    });

    // Now update homework to match
    const homeworkUpdateResult = await Homework.updateMany(
      {}, // Update all homework
      { $set: { className: 'Grade 10A' } }
    );

    console.log(`\n📚 Updated ${homeworkUpdateResult.modifiedCount} homework assignments to class: Grade 10A`);

    // Final verification
    const homeworksForStudents = await Homework.find({ className: 'Grade 10A' });
    console.log(`📋 Total homeworks now available for Grade 10A: ${homeworksForStudents.length}`);

    if (homeworksForStudents.length > 0) {
      console.log('\n📝 Sample homeworks:');
      homeworksForStudents.slice(0, 3).forEach(hw => {
        console.log(`  - ${hw.title} (${hw.subject}) - Due: ${hw.dueDate.toDateString()}`);
      });
    }

    console.log('\n✅✅✅ Student classes fixed successfully! ✅✅✅');
    console.log(`\n💡 Now test with any student ID from the list above`);

  } catch (error) {
    console.error('❌ Error fixing student classes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixStudentClasses();
