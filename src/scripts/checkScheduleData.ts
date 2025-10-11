import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function checkScheduleData() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find Wissal's student record
    const wissal = await Student.findOne({ email: 'wissal@example.com' });
    
    if (!wissal) {
      console.log('❌ Wissal not found!');
      return;
    }

    console.log('👤 Student Found:');
    console.log('   Name:', wissal.name);
    console.log('   Student ID:', wissal._id);
    console.log('   User ID:', wissal.userId);
    console.log('');

    // Find all schedules for this student
    const schedules = await ClassSchedule.find({ studentId: wissal._id });

    console.log('📅 Class Schedules Found:', schedules.length);
    console.log('═'.repeat(80));
    
    if (schedules.length === 0) {
      console.log('❌ No schedules found for this student!');
    } else {
      schedules.forEach((schedule, index) => {
        console.log(`\n${index + 1}. ${schedule.subject}`);
        console.log(`   Day: ${schedule.day}`);
        console.log(`   Time: ${schedule.startTime} - ${schedule.endTime}`);
        console.log(`   Room: ${schedule.room}`);
        console.log(`   Status: ${schedule.status}`);
        console.log(`   Student ID: ${schedule.studentId}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Total Schedules: ${schedules.length}`);
    
    // Group by day
    const byDay: any = {};
    schedules.forEach(s => {
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push(s.subject);
    });
    
    console.log('\n   By Day:');
    Object.keys(byDay).forEach(day => {
      console.log(`   - ${day}: ${byDay[day].length} class(es) - ${byDay[day].join(', ')}`);
    });

    console.log('\n💡 To test API:');
    console.log(`   GET http://localhost:5000/api/student/${wissal.userId}/schedule`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkScheduleData();

