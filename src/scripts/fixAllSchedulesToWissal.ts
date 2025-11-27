import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixAllSchedulesToWissal() {
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

    // Get ALL schedules
    const allSchedules = await ClassSchedule.find({});

    console.log(`📅 Found ${allSchedules.length} total schedules`);
    console.log('═'.repeat(80));

    // Update ALL to link to Wissal
    let updated = 0;
    for (const schedule of allSchedules) {
      console.log(`\n📚 ${schedule.subject} (${schedule.day} ${schedule.startTime}-${schedule.endTime})`);
      console.log(`   Current: ${schedule.studentId}`);
      
      if (schedule.studentId?.toString() !== wissal._id.toString()) {
        await ClassSchedule.findByIdAndUpdate(schedule._id, {
          studentId: wissal._id
        });
        console.log(`   ✅ Updated to: ${wissal._id} (Wissal)`);
        updated++;
      } else {
        console.log(`   ✅ Already linked to Wissal`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Updated ${updated} schedule(s)`);

    // Verify all schedules for Wissal
    const wissalSchedules = await ClassSchedule.find({ studentId: wissal._id }).sort({ day: 1, startTime: 1 });
    console.log(`\n📊 Wissal's Complete Schedule (${wissalSchedules.length} classes):`);
    console.log('═'.repeat(80));
    
    // Group by day
    const byDay: any = {};
    wissalSchedules.forEach(s => {
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push(s);
    });

    // Display grouped schedule
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    daysOrder.forEach(day => {
      const classes = byDay[day] || [];
      if (classes.length > 0) {
        console.log(`\n📅 ${day} - ${classes.length} class(es):`);
        classes.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.subject}`);
          console.log(`      ⏰ ${c.startTime} - ${c.endTime}`);
          console.log(`      🏫 ${c.room}`);
          console.log(`      📊 ${c.status}`);
        });
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ All schedules now linked to Wissal!');
    console.log('\n💡 Refresh your browser to see all 3 classes:');
    console.log(`   http://localhost:5173/student/${wissal.userId}/schedule`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

fixAllSchedulesToWissal();















