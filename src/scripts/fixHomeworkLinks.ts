import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Homework from '../models/Homework.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixHomeworkLinks() {
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
    console.log(`   ✅ Student ID (correct): ${wissal._id}`);
    console.log(`   ✅ User ID (for reference): ${wissal.userId}`);
    console.log('');

    // Get ALL homework
    const allHomework = await Homework.find({});

    console.log(`📝 Found ${allHomework.length} total homework assignments`);
    console.log('═'.repeat(80));

    // Fix each homework
    let updated = 0;
    for (const hw of allHomework) {
      console.log(`\n📚 ${hw.title}`);
      console.log(`   Current studentId: ${hw.studentId}`);
      
      if (hw.studentId?.toString() !== wissal._id.toString()) {
        await Homework.findByIdAndUpdate(hw._id, {
          $set: { studentId: wissal._id }
        });
        console.log(`   ✅ Updated to: ${wissal._id} (Wissal's Student ID)`);
        updated++;
      } else {
        console.log(`   ✅ Already correct`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Updated ${updated} homework assignment(s)`);

    // Verify
    const wissalHomework = await Homework.find({ studentId: wissal._id }).sort({ dueDate: 1 });
    console.log(`\n📊 Wissal's Homework (${wissalHomework.length}):`);
    console.log('═'.repeat(80));
    
    wissalHomework.forEach((hw, i) => {
      const today = new Date();
      const dueDate = new Date(hw.dueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${i + 1}. ${hw.title}`);
      console.log(`   Subject: ${hw.subject}`);
      console.log(`   Status: ${hw.status}`);
      console.log(`   Priority: ${hw.priority || 'N/A'}`);
      console.log(`   Due Date: ${hw.dueDate.toDateString()}`);
      console.log(`   Days Until Due: ${daysUntil > 0 ? daysUntil : 'Overdue'}`);
      console.log(`   Description: ${hw.description || 'N/A'}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 Refresh browser to see all homework!');
    console.log(`   http://localhost:5173/student/${wissal.userId}/homework`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

fixHomeworkLinks();

