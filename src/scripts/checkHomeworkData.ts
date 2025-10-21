import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Homework from '../models/Homework.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function checkHomeworkData() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n🔍 Checking homework data...');

    // Check total homeworks
    const totalHomeworks = await Homework.countDocuments();
    console.log(`📊 Total homeworks in database: ${totalHomeworks}`);

    // Check homeworks for specific teacher
    const teacherHomeworks = await Homework.find({ 
      teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f') 
    });
    console.log(`👨‍🏫 Homeworks for teacher 68ed2c9bcbb24b8ec436e12f: ${teacherHomeworks.length}`);

    // Check homeworks for Grade 10A
    const grade10AHomeworks = await Homework.find({ className: 'Grade 10A' });
    console.log(`🎓 Homeworks for Grade 10A: ${grade10AHomeworks.length}`);

    // Display sample homeworks
    if (teacherHomeworks.length > 0) {
      console.log('\n📋 Sample Homeworks:');
      teacherHomeworks.slice(0, 3).forEach(hw => {
        console.log(`  - ${hw.homeworkId}: ${hw.title} (${hw.subject}) - Class: ${hw.className}`);
      });
    }

    // Check students in Grade 10A
    const grade10AStudents = await Student.find({ className: 'Grade 10A' });
    console.log(`\n👥 Students in Grade 10A: ${grade10AStudents.length}`);
    
    if (grade10AStudents.length > 0) {
      console.log('📝 Sample Students:');
      grade10AStudents.slice(0, 3).forEach(student => {
        console.log(`  - ${student.name} (${student.className})`);
      });
    }

    console.log('\n✅✅✅ Data check completed! ✅✅✅');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkHomeworkData();