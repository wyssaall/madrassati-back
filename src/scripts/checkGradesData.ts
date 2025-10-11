import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Grade from '../models/Grade.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function checkGradesData() {
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

    // Get all grades for Wissal
    const grades = await Grade.find({ studentId: wissal._id });

    console.log(`📊 Grades Found: ${grades.length}`);
    console.log('═'.repeat(80));

    if (grades.length === 0) {
      console.log('❌ No grades found!');
    } else {
      grades.forEach((grade, index) => {
        console.log(`\n${index + 1}. ${grade.subject}`);
        console.log(`   Final Grade: ${grade.finalGrade}`);
        console.log(`   Homework: ${grade.homework !== undefined ? grade.homework : '❌ MISSING'}`);
        console.log(`   Test: ${grade.test !== undefined ? grade.test : '❌ MISSING'}`);
        console.log(`   Exam: ${grade.exam !== undefined ? grade.exam : '❌ MISSING'}`);
        console.log(`   Status: ${grade.status || '❌ MISSING'}`);
        console.log(`   Document ID: ${grade._id}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 DIAGNOSIS:');
    
    const missingFields = grades.filter(g => 
      g.homework === undefined || 
      g.test === undefined || 
      g.exam === undefined
    );

    if (missingFields.length > 0) {
      console.log(`\n❌ ${missingFields.length} grade(s) missing homework/test/exam values!`);
      console.log('\n💡 SOLUTION: Update these grades with proper values');
      console.log('\n   I can fix this for you. The grades should have:');
      console.log('   - homework: number (out of 20)');
      console.log('   - test: number (out of 20)');
      console.log('   - exam: number (out of 20)');
      console.log('   - finalGrade: calculated average');
    } else {
      console.log('✅ All grades have complete data!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

checkGradesData();

