import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixSchedules() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find Wissal
    const wissal = await Student.findOne({ email: 'wissal@example.com' });
    
    if (!wissal) {
      console.log('❌ Wissal not found!');
      return;
    }

    console.log('👤 Found Wissal Zabour');
    console.log(`   Student ID: ${wissal._id}`);
    console.log(`   User ID: ${wissal.userId}`);
    console.log('');

    // Get all schedules without studentId
    const orphanedSchedules = await ClassSchedule.find({ 
      $or: [
        { studentId: null },
        { studentId: undefined },
        { studentId: { $exists: false } }
      ]
    });

    console.log(`📅 Found ${orphanedSchedules.length} orphaned schedules`);
    console.log('═'.repeat(80));

    if (orphanedSchedules.length === 0) {
      console.log('✅ No orphaned schedules to fix!');
      return;
    }

    // Fix each schedule
    for (let i = 0; i < orphanedSchedules.length; i++) {
      const schedule = orphanedSchedules[i];
      
      console.log(`\n${i + 1}. Fixing: ${schedule.subject} (${schedule.day})`);
      
      // Add missing fields
      const updates: any = {
        studentId: wissal._id
      };

      // Add startTime if missing
      if (!schedule.startTime) {
        // Assign different times for each schedule
        if (i === 0) {
          updates.startTime = '08:00';
          updates.endTime = '10:00';
        } else {
          updates.startTime = '10:15';
          updates.endTime = '12:15';
        }
      }

      // Add status if missing
      if (!schedule.status) {
        updates.status = 'Scheduled';
      }

      // Update the schedule
      await ClassSchedule.findByIdAndUpdate(schedule._id, updates);
      
      console.log(`   ✅ Updated:`);
      console.log(`      - Linked to: ${wissal.name}`);
      console.log(`      - Time: ${updates.startTime || schedule.startTime} - ${updates.endTime || schedule.endTime}`);
      console.log(`      - Status: ${updates.status || schedule.status}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ All schedules fixed!');
    
    // Verify
    const wissalSchedules = await ClassSchedule.find({ studentId: wissal._id });
    console.log(`\n📊 Wissal now has ${wissalSchedules.length} schedule(s):`);
    
    wissalSchedules.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.subject} - ${s.day} ${s.startTime}-${s.endTime} (${s.room})`);
    });

    console.log('\n💡 Test the API:');
    console.log(`   GET http://localhost:5000/api/student/${wissal.userId}/schedule`);
    console.log('\n💡 Or visit in browser:');
    console.log(`   http://localhost:5173/student/${wissal.userId}/schedule`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

fixSchedules();

