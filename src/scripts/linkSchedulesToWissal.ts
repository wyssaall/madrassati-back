import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function linkSchedulesToWissal() {
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
    console.log(`   ✅ Student ID: ${wissal._id}`);
    console.log(`   ✅ User ID: ${wissal.userId}`);
    console.log('');

    // Get ALL schedules (regardless of studentId)
    const allSchedules = await ClassSchedule.find({});

    console.log(`📅 Total schedules in database: ${allSchedules.length}`);
    console.log('═'.repeat(80));

    if (allSchedules.length === 0) {
      console.log('❌ No schedules found!');
      return;
    }

    // Update ALL schedules to link to Wissal
    let updated = 0;
    for (const schedule of allSchedules) {
      console.log(`\n📚 ${schedule.subject} (${schedule.day} ${schedule.startTime}-${schedule.endTime})`);
      console.log(`   Current studentId: ${schedule.studentId}`);
      
      if (schedule.studentId?.toString() !== wissal._id.toString()) {
        await ClassSchedule.findByIdAndUpdate(schedule._id, {
          studentId: wissal._id
        });
        console.log(`   ✅ Updated to link to Wissal`);
        updated++;
      } else {
        console.log(`   ✅ Already linked to Wissal`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Updated ${updated} schedule(s) to link to Wissal`);

    // Verify
    const wissalSchedules = await ClassSchedule.find({ studentId: wissal._id });
    console.log(`\n📊 Wissal now has ${wissalSchedules.length} schedule(s):`);
    console.log('─'.repeat(80));
    
    wissalSchedules.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.subject}`);
      console.log(`      Day: ${s.day}`);
      console.log(`      Time: ${s.startTime} - ${s.endTime}`);
      console.log(`      Room: ${s.room}`);
      console.log(`      Status: ${s.status}`);
      console.log('');
    });

    console.log('═'.repeat(80));
    console.log('\n💡 Test in browser:');
    console.log(`   http://localhost:5173/student/${wissal.userId}/schedule`);
    console.log('\n💡 Test API:');
    console.log(`   GET http://localhost:5000/api/student/${wissal.userId}/schedule`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

linkSchedulesToWissal();

