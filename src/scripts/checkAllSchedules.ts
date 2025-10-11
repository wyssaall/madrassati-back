import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function checkAllSchedules() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Get ALL schedules in the database
    const allSchedules = await ClassSchedule.find({});
    
    console.log('📅 Total Class Schedules in Database:', allSchedules.length);
    console.log('═'.repeat(80));

    if (allSchedules.length === 0) {
      console.log('❌ No schedules found in the entire database!');
    } else {
      for (const schedule of allSchedules) {
        console.log(`\n📚 ${schedule.subject}`);
        console.log(`   Day: ${schedule.day}`);
        console.log(`   Time: ${schedule.startTime} - ${schedule.endTime}`);
        console.log(`   Room: ${schedule.room}`);
        console.log(`   Status: ${schedule.status}`);
        console.log(`   Linked to Student ID: ${schedule.studentId}`);
        
        // Try to find which student this belongs to
        const student = await Student.findById(schedule.studentId);
        if (student) {
          console.log(`   ✅ Student: ${student.name} (${student.email})`);
          console.log(`   User ID for API: ${student.userId}`);
        } else {
          console.log(`   ❌ No student found with this ID!`);
        }
      }
    }

    console.log('\n' + '═'.repeat(80));
    
    // List all students
    const allStudents = await Student.find({});
    console.log('\n👥 All Students in Database:');
    console.log('─'.repeat(80));
    
    for (const student of allStudents) {
      const scheduleCount = await ClassSchedule.countDocuments({ studentId: student._id });
      console.log(`\n   ${student.name} (${student.email})`);
      console.log(`   Student ID: ${student._id}`);
      console.log(`   User ID: ${student.userId}`);
      console.log(`   Schedules: ${scheduleCount}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 To fix: Link the 2 schedules to Wissal\'s Student ID');
    console.log('   Wissal\'s Student ID: 68e93e47c8e0f5017d87eb42');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkAllSchedules();

