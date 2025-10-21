import mongoose from 'mongoose';
import { TeacherClass } from '../models/TeacherClass.model.js';
import { Teacher } from '../models/Teacher.model.js';
import Student from '../models/Student.model.js';
import Grade from '../models/Grade.model.js';
import 'dotenv/config';

/**
 * Create sample TeacherClass data for testing
 */

async function createTeacherClasses() {
  try {
    console.log('🏫 Creating sample teacher classes...\n');

    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find existing teacher
    const teacher = await Teacher.findOne().lean();
    if (!teacher) {
      console.log('❌ No teacher found. Please create a teacher first.');
      return;
    }

    console.log(`👨‍🏫 Using teacher: ${teacher.fullName} (ID: ${teacher._id})\n`);

    // Clear existing teacher classes
    await TeacherClass.deleteMany({ teacherId: teacher._id });
    console.log('🗑️ Cleared existing teacher classes\n');

    // Create sample teacher classes
    const sampleClasses = [
      {
        teacherId: teacher._id,
        className: 'Grade 10A',
        subject: 'Mathematics',
        room: 'Room 101',
        studentsCount: 0, // Will be calculated automatically
        avgGrade: 0, // Will be calculated automatically
        avgAttendance: 0 // Will be calculated automatically
      },
      {
        teacherId: teacher._id,
        className: 'Grade 10B',
        subject: 'Mathematics',
        room: 'Room 102',
        studentsCount: 0,
        avgGrade: 0,
        avgAttendance: 0
      },
      {
        teacherId: teacher._id,
        className: 'Grade 11A',
        subject: 'Mathematics',
        room: 'Room 201',
        studentsCount: 0,
        avgGrade: 0,
        avgAttendance: 0
      },
      {
        teacherId: teacher._id,
        className: 'Grade 11B',
        subject: 'Mathematics',
        room: 'Room 202',
        studentsCount: 0,
        avgGrade: 0,
        avgAttendance: 0
      }
    ];

    await TeacherClass.insertMany(sampleClasses);
    console.log(`✅ Created ${sampleClasses.length} teacher classes\n`);

    // Create additional students for different classes
    console.log('📝 Creating additional students for different classes...');
    const additionalStudents = [
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Ahmed Al-Rashid',
        email: 'ahmed.rashid@student.madrassati.edu',
        password: 'password123',
        phone: '+966501234567',
        gradeLevel: 'Grade 10',
        className: 'Grade 10B',
        address: '456 Education Street, Riyadh',
        parentName: 'Mohammed Al-Rashid',
        parentPhone: '+966501234568',
        enrollmentDate: new Date('2024-09-01'),
        attendance: 88,
        gpa: 82.5
      },
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Fatima Al-Zahra',
        email: 'fatima.zahra@student.madrassati.edu',
        password: 'password123',
        phone: '+966501234569',
        gradeLevel: 'Grade 11',
        className: 'Grade 11A',
        address: '789 Education Street, Riyadh',
        parentName: 'Ali Al-Zahra',
        parentPhone: '+966501234570',
        enrollmentDate: new Date('2024-09-01'),
        attendance: 95,
        gpa: 91.2
      },
      {
        userId: new mongoose.Types.ObjectId(),
        name: 'Omar Al-Mahmoud',
        email: 'omar.mahmoud@student.madrassati.edu',
        password: 'password123',
        phone: '+966501234571',
        gradeLevel: 'Grade 11',
        className: 'Grade 11B',
        address: '321 Education Street, Riyadh',
        parentName: 'Hassan Al-Mahmoud',
        parentPhone: '+966501234572',
        enrollmentDate: new Date('2024-09-01'),
        attendance: 90,
        gpa: 87.8
      }
    ];

    await Student.insertMany(additionalStudents);
    console.log(`✅ Created ${additionalStudents.length} additional students\n`);

    // Create sample grades for the students
    console.log('📊 Creating sample grades...');
    const students = await Student.find().lean();
    const sampleGrades = [];

    for (const student of students) {
      const grade = {
        studentId: student._id,
        subject: 'Mathematics',
        homework: Math.floor(Math.random() * 5) + 10, // 10-14
        test: Math.floor(Math.random() * 5) + 12, // 12-16
        exam: Math.floor(Math.random() * 5) + 13, // 13-17
        finalGrade: 0, // Will be calculated
        status: 'Pass'
      };
      
      // Calculate final grade (weighted average)
      grade.finalGrade = Math.round((grade.homework * 0.2 + grade.test * 0.3 + grade.exam * 0.5) * 100) / 100;
      
      sampleGrades.push(grade);
    }

    await Grade.insertMany(sampleGrades);
    console.log(`✅ Created ${sampleGrades.length} sample grades\n`);

    // Test the API endpoint
    console.log('🧪 Testing the classes endpoint...');
    const teacherClasses = await TeacherClass.find({ teacherId: teacher._id }).lean();
    console.log(`✅ Found ${teacherClasses.length} classes for teacher`);

    console.log('\n✅✅✅ Teacher Classes Setup Complete! ✅✅✅');
    console.log(`\n📋 Summary:`);
    console.log(`   - Teacher: ${teacher.fullName}`);
    console.log(`   - Classes created: ${sampleClasses.length}`);
    console.log(`   - Additional students: ${additionalStudents.length}`);
    console.log(`   - Sample grades: ${sampleGrades.length}`);
    console.log(`\n🔗 Test the endpoint:`);
    console.log(`   GET /api/teacher/${teacher._id}/classes`);

  } catch (error) {
    console.error('❌ Error creating teacher classes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createTeacherClasses();
