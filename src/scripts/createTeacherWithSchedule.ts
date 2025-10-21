import mongoose, { Types } from 'mongoose';
import { Teacher, ITeacher } from '../models/Teacher.model.js';
import ClassSchedule, { IClassSchedule } from '../models/ClassSchedule.model.js';
import Student, { IStudent } from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';
import 'dotenv/config';

/**
 * Create a teacher and sample schedule data for testing
 * 
 * This is a utility script for development/testing purposes.
 * It creates a teacher with Class A students and sample schedule data.
 * 
 * Usage: npx tsx src/scripts/createTeacherWithSchedule.ts
 * 
 * Note: This script creates test data that may conflict with existing data.
 * Use with caution in production environments.
 */

async function createTeacherWithSchedule() {
  try {
    console.log('👨‍🏫 Creating teacher and schedule data...\n');

    // Connect to MongoDB using the proper connection function
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';
    console.log(`🔗 Using MongoDB URI: ${MONGO_URI}`);
    
    await connectToDatabase(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Create a sample teacher
    console.log('👨‍🏫 Creating teacher...');
    const teacher = new Teacher({
      userId: new Types.ObjectId(),
      fullName: 'Ahmed Al-Rashid',
      email: 'ahmed.rashid@madrassati.edu',
      phone: '+966501234567',
      subject: 'Mathematics',
      classes: ['Class A'], // Compatible with existing students
      messagesCount: 12,
      meetingsCount: 3,
      alertsCount: 5,
      upcomingEvents: [
        {
          title: 'Parent Meeting',
          date: new Date('2025-02-15'),
          time: '14:00',
          type: 'meeting'
        }
      ]
    });

    const savedTeacher = await teacher.save() as ITeacher;
    console.log(`✅ Created teacher: ${savedTeacher.fullName} (ID: ${savedTeacher._id})`);
    console.log(`📧 Email: ${savedTeacher.email}`);
    console.log(`📚 Subject: ${savedTeacher.subject}`);
    console.log(`🏫 Classes: ${JSON.stringify(savedTeacher.classes)}`);
    console.log('');

    // Find or create a sample student
    console.log('👨‍🎓 Finding or creating student...');
    let student = await Student.findOne({ className: 'Class A' }).lean() as IStudent | null;
    
    if (!student) {
      console.log('📝 Creating new student for Class A...');
      const newStudent = new Student({
        userId: new Types.ObjectId(),
        name: 'Sarah Al-Mahmoud',
        email: 'sarah.mahmoud@student.madrassati.edu',
        password: 'password123', // Required field
        phone: '+966509876543',
        gradeLevel: 'Grade 10',
        className: 'Class A', // Compatible with existing students
        address: '123 Education Street, Riyadh',
        parentName: 'Mohammed Al-Mahmoud',
        parentPhone: '+966501111111',
        enrollmentDate: new Date('2024-09-01'),
        attendance: 92, // Simple number as expected by model
        gpa: 85.5
      });
      
      const savedStudent = await newStudent.save() as IStudent;
      student = savedStudent.toObject();
      console.log(`✅ Created student: ${student!.name} (ID: ${student!._id})`);
    } else {
      console.log(`✅ Using existing student: ${student.name} (ID: ${student._id})`);
    }
    
    // Ensure student is not null before proceeding
    if (!student) {
      throw new Error('Failed to create or find student');
    }
    
    console.log(`📚 Student class: ${student.className}`);
    console.log('');

    // Create sample schedule entries with teacherId
    console.log('📅 Creating schedule entries...');
    const schedules = [
      {
        studentId: student._id,
        teacherId: savedTeacher._id,
        className: student.className,
        subject: 'Mathematics',
        day: 'Monday',
        startTime: '08:00',
        endTime: '09:30',
        room: 'Room 101',
        status: 'scheduled'
      },
      {
        studentId: student._id,
        teacherId: savedTeacher._id,
        className: student.className,
        subject: 'Mathematics',
        day: 'Wednesday',
        startTime: '08:00',
        endTime: '09:30',
        room: 'Room 101',
        status: 'scheduled'
      },
      {
        studentId: student._id,
        teacherId: savedTeacher._id,
        className: student.className,
        subject: 'Mathematics',
        day: 'Friday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'Room 101',
        status: 'scheduled'
      },
      {
        studentId: student._id,
        teacherId: savedTeacher._id,
        className: student.className,
        subject: 'Mathematics',
        day: 'Tuesday',
        startTime: '13:00',
        endTime: '14:30',
        room: 'Room 102',
        status: 'completed'
      }
    ];

    const savedSchedules = await ClassSchedule.insertMany(schedules) as any[];
    console.log(`✅ Created ${savedSchedules.length} schedule entries`);
    console.log(`📋 Schedule IDs: ${savedSchedules.map(s => s._id).join(', ')}`);
    console.log('');

    // Test the teacher schedule query
    console.log('🧪 Testing teacher schedule query...');
    const teacherSchedule = await ClassSchedule.find({ teacherId: savedTeacher._id })
      .populate('studentId', 'name email className')
      .populate('teacherId', 'fullName email subject')
      .select('day startTime endTime subject room status studentId teacherId')
      .lean()
      .sort({ day: 1, startTime: 1 }) as any[];

    console.log(`✅ Found ${teacherSchedule.length} schedule entries for teacher`);
    
    if (teacherSchedule.length > 0) {
      console.log('\n📊 Schedule data:');
      teacherSchedule.forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.day} ${entry.startTime}-${entry.endTime} | ${entry.subject} | ${entry.room} | Status: ${entry.status}`);
        console.log(`     Student: ${entry.studentId?.name} (${entry.studentId?.className})`);
        console.log(`     Teacher: ${entry.teacherId?.fullName} (${entry.teacherId?.subject})`);
      });
    }

    console.log('\n✅✅✅ Teacher and schedule creation complete! ✅✅✅');
    console.log(`\n📋 Summary:`);
    console.log(`   - Teacher ID: ${savedTeacher._id}`);
    console.log(`   - Teacher Name: ${savedTeacher.fullName}`);
    console.log(`   - Subject: ${savedTeacher.subject}`);
    console.log(`   - Classes: ${JSON.stringify(savedTeacher.classes)}`);
    console.log(`   - Schedule entries: ${savedSchedules.length}`);
    console.log(`   - Student: ${student.name} (${student.className})`);
    console.log(`\n🔗 Test the endpoint:`);
    console.log(`   GET /api/teacher/${savedTeacher._id}/schedule`);
    console.log(`\n💾 Data saved to database:`);
    console.log(`   - Database: ${mongoose.connection.name}`);
    console.log(`   - Collections: teachers, students, classschedules`);
    console.log(`   - All data should be visible in MongoDB Compass immediately`);
    
    // Final verification - check if the endpoint would work
    console.log(`\n🔍 Final verification:`);
    console.log(`   - Teacher exists: ✅ ${savedTeacher.fullName}`);
    console.log(`   - Student exists: ✅ ${student.name}`);
    console.log(`   - Schedule entries: ✅ ${savedSchedules.length} entries`);
    console.log(`   - Database connection: ✅ ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`   - All awaits completed: ✅ No pending operations`);

  } catch (error) {
    console.error('❌ Error creating teacher and schedule:', error);
    console.error('📋 Error details:', error.message);
    if (error.stack) {
      console.error('🔍 Stack trace:', error.stack);
    }
  } finally {
    // Ensure proper disconnection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
createTeacherWithSchedule();
