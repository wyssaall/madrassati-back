import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Homework from '../models/Homework.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function checkHomeworkData() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find Wissal
    const wissal = await Student.findOne({ email: 'wissal@example.com' });
    
    if (!wissal) {
      console.log('❌ Wissal not found!');
      return;
    }

    console.log('👤 Student: Wissal Zabour');
    console.log(`   Student ID: ${wissal._id}`);
    console.log(`   User ID: ${wissal.userId}`);
    console.log('');

    // Get all homework for Wissal
    const homework = await Homework.find({ studentId: wissal._id });

    console.log(`📝 Homework Found for Wissal: ${homework.length}`);
    console.log('═'.repeat(80));

    if (homework.length === 0) {
      console.log('❌ No homework found for Wissal!');
      console.log('\n💡 Checking ALL homework in database...\n');
      
      const allHomework = await Homework.find({});
      console.log(`📝 Total Homework in Database: ${allHomework.length}`);
      console.log('═'.repeat(80));
      
      if (allHomework.length > 0) {
        console.log('\n⚠️  Homework exists but NOT linked to Wissal!\n');
        
        for (const hw of allHomework) {
          console.log(`📚 ${hw.title || 'No title'}`);
          console.log(`   Subject: ${hw.subject || 'N/A'}`);
          console.log(`   Linked to Student ID: ${hw.studentId || '❌ MISSING'}`);
          console.log(`   Status: ${hw.status || 'N/A'}`);
          console.log(`   Due Date: ${hw.dueDate || 'N/A'}`);
          
          // Try to find which student this belongs to
          if (hw.studentId) {
            const student = await Student.findById(hw.studentId);
            if (student) {
              console.log(`   ✅ Student: ${student.name} (${student.email})`);
            } else {
              console.log(`   ❌ No student found with this ID!`);
            }
          }
          console.log('');
        }
      }
    } else {
      homework.forEach((hw, index) => {
        console.log(`\n${index + 1}. ${hw.title}`);
        console.log(`   Subject: ${hw.subject}`);
        console.log(`   Description: ${hw.description || 'N/A'}`);
        console.log(`   Start Date: ${hw.startDate}`);
        console.log(`   Due Date: ${hw.dueDate}`);
        console.log(`   Status: ${hw.status}`);
        console.log(`   Priority: ${hw.priority || 'N/A'}`);
        console.log(`   Duration: ${hw.durationDays || 'N/A'} days`);
        console.log(`   Student ID: ${hw.studentId}`);
        
        // Check if fields are present
        const missingFields = [];
        if (!hw.title) missingFields.push('title');
        if (!hw.subject) missingFields.push('subject');
        if (!hw.startDate) missingFields.push('startDate');
        if (!hw.dueDate) missingFields.push('dueDate');
        if (!hw.status) missingFields.push('status');
        
        if (missingFields.length > 0) {
          console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`   ✅ All required fields present`);
        }
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 To test API:');
    console.log(`   GET http://localhost:5000/api/student/${wissal.userId}/homework`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkHomeworkData();

