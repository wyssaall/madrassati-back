import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { TeacherClass } from '../models/TeacherClass.model.js';
import Grade from '../models/Grade.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function testGrades() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n📊 Testing Grades functionality...');

    // Find a teacher class
    const teacherClass = await TeacherClass.findOne().lean();
    if (!teacherClass) {
      console.log('❌ No teacher classes found. Please run createTeacherClasses script first.');
      return;
    }

    console.log(`✅ Found teacher class: ${teacherClass.className} (Teacher: ${teacherClass.teacherId})`);

    // Find a student
    let student = await Student.findOne().lean();
    if (!student) {
      console.log('⚠️ No students found. Creating a sample student...');
      const newStudent = new Student({
        userId: new mongoose.Types.ObjectId(),
        name: 'Test Student',
        email: 'test.student@madrassati.edu',
        password: 'password123',
        studentId: 'S001',
        gradeLevel: 'Grade 10',
        className: teacherClass.className,
        attendance: 95,
        gpa: 0
      });
      await newStudent.save();
      student = newStudent.toObject();
      console.log(`✅ Created test student: ${student.name} (ID: ${student._id})`);
    } else {
      console.log(`✅ Found student: ${student.name} (ID: ${student._id})`);
    }

    // Test creating a grade
    console.log('\n➕ Creating a test grade...');
    const testGrade = new Grade({
      studentId: student._id,
      teacherId: teacherClass.teacherId,
      className: teacherClass.className,
      subject: teacherClass.subject,
      homework: 8,
      test: 7,
      exam: 15
      // finalGrade will be auto-calculated
    });

    await testGrade.save();
    console.log(`✅ Created grade: ${testGrade.finalGrade}/20 (auto-calculated)`);

    // Test fetching grades
    console.log('\n📊 Fetching grades for class...');
    const grades = await Grade.find({ 
      teacherId: teacherClass.teacherId, 
      className: teacherClass.className 
    })
    .populate('studentId', 'name email studentId')
    .lean();

    console.log(`✅ Found ${grades.length} grades for class ${teacherClass.className}`);
    grades.forEach(grade => {
      const studentName = (grade.studentId && typeof grade.studentId === 'object' && 'name' in grade.studentId) 
        ? grade.studentId.name 
        : 'Unknown';
      console.log(`   - ${studentName}: ${grade.finalGrade}/20`);
    });

    console.log('\n✅✅✅ Grades functionality test completed! ✅✅✅');

  } catch (error) {
    console.error('❌ Error testing grades:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testGrades();
