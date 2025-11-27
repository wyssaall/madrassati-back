import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function createTestStudents() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n👥 Creating test students with studentId values...');

    // Clear existing test students
    await Student.deleteMany({ studentId: { $in: ['S001', 'S002', 'S003', 'S004', 'S005'] } });
    console.log('✅ Cleared existing test students');

    // Create test students
    const testStudents = [
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        email: 'john.doe@madrassati.edu',
        password: 'password123',
        studentId: 'S001',
        gradeLevel: 'Grade 10',
        className: 'Grade 10A',
        attendance: 95,
        gpa: 0
      },
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Jane Smith',
        email: 'jane.smith@madrassati.edu',
        password: 'password123',
        studentId: 'S002',
        gradeLevel: 'Grade 10',
        className: 'Grade 10A',
        attendance: 92,
        gpa: 0
      },
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Ahmed Al-Rashid',
        email: 'ahmed.alrashid@madrassati.edu',
        password: 'password123',
        studentId: 'S003',
        gradeLevel: 'Grade 10',
        className: 'Grade 10A',
        attendance: 88,
        gpa: 0
      },
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Sarah Johnson',
        email: 'sarah.johnson@madrassati.edu',
        password: 'password123',
        studentId: 'S004',
        gradeLevel: 'Grade 10',
        className: 'Grade 10A',
        attendance: 98,
        gpa: 0
      },
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Mohammed Hassan',
        email: 'mohammed.hassan@madrassati.edu',
        password: 'password123',
        studentId: 'S005',
        gradeLevel: 'Grade 10',
        className: 'Grade 10A',
        attendance: 90,
        gpa: 0
      }
    ];

    await Student.insertMany(testStudents);
    console.log(`✅ Created ${testStudents.length} test students`);

    console.log('\n📋 Test Students Created:');
    testStudents.forEach(student => {
      console.log(`   - ${student.studentId}: ${student.name}`);
    });

    console.log('\n✅✅✅ Test students created successfully! ✅✅✅');
    console.log('\n🔗 You can now use these student IDs in the Manage Grades form:');
    console.log('   S001, S002, S003, S004, S005');

  } catch (error) {
    console.error('❌ Error creating test students:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createTestStudents();







