import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Grade from '../models/Grade.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import Homework from '../models/Homework.model.js';
import Announcement from '../models/Announcement.model.js';
import { connectToDatabase } from '../config/db.js';

// Load environment variables
dotenv.config();

/**
 * Sample data population script
 * This script populates the database with sample data for testing
 * 
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Update the STUDENT_ID constant with a valid student._id from your database
 * 3. Run: npx tsx src/scripts/populateSampleData.ts
 */

// ⚠️ IMPORTANT: Replace this with a valid student._id from your students collection
// Run: npx tsx src/scripts/findStudents.ts to get your student ID
const STUDENT_ID = new mongoose.Types.ObjectId('PASTE_YOUR_STUDENT_ID_HERE');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function populateData() {
  try {
    await connectToDatabase(MONGODB_URI);

    // Clear existing data for this student
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      ClassSchedule.deleteMany({ studentId: STUDENT_ID }),
      Grade.deleteMany({ studentId: STUDENT_ID }),
      Exam.deleteMany({ studentId: STUDENT_ID }),
      Test.deleteMany({ studentId: STUDENT_ID }),
      Homework.deleteMany({ studentId: STUDENT_ID })
    ]);
    console.log('✅ Existing data cleared');

    // Populate Class Schedules
    console.log('\n📅 Populating class schedules...');
    const schedules = [
      // Monday
      {
        studentId: STUDENT_ID,
        day: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Mathematics',
        room: 'Room 101',
        status: 'Completed'
      },
      {
        studentId: STUDENT_ID,
        day: 'Monday',
        startTime: '10:15',
        endTime: '12:15',
        subject: 'Physics',
        room: 'Lab 201',
        status: 'Completed'
      },
      {
        studentId: STUDENT_ID,
        day: 'Monday',
        startTime: '13:00',
        endTime: '15:00',
        subject: 'English',
        room: 'Room 103',
        status: 'Completed'
      },
      // Tuesday
      {
        studentId: STUDENT_ID,
        day: 'Tuesday',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Chemistry',
        room: 'Lab 202',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Tuesday',
        startTime: '10:15',
        endTime: '12:15',
        subject: 'History',
        room: 'Room 105',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Tuesday',
        startTime: '13:00',
        endTime: '15:00',
        subject: 'Arabic',
        room: 'Room 106',
        status: 'Scheduled'
      },
      // Wednesday
      {
        studentId: STUDENT_ID,
        day: 'Wednesday',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Mathematics',
        room: 'Room 101',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Wednesday',
        startTime: '10:15',
        endTime: '12:15',
        subject: 'Computer Science',
        room: 'Computer Lab',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Wednesday',
        startTime: '13:00',
        endTime: '15:00',
        subject: 'Physical Education',
        room: 'Gymnasium',
        status: 'Scheduled'
      },
      // Thursday
      {
        studentId: STUDENT_ID,
        day: 'Thursday',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Physics',
        room: 'Lab 201',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Thursday',
        startTime: '10:15',
        endTime: '12:15',
        subject: 'English',
        room: 'Room 103',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Thursday',
        startTime: '13:00',
        endTime: '15:00',
        subject: 'Islamic Studies',
        room: 'Room 107',
        status: 'Scheduled'
      },
      // Friday
      {
        studentId: STUDENT_ID,
        day: 'Friday',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Chemistry',
        room: 'Lab 202',
        status: 'Scheduled'
      },
      {
        studentId: STUDENT_ID,
        day: 'Friday',
        startTime: '10:15',
        endTime: '12:15',
        subject: 'Biology',
        room: 'Lab 203',
        status: 'Scheduled'
      }
    ];
    await ClassSchedule.insertMany(schedules);
    console.log(`✅ Created ${schedules.length} schedule entries`);

    // Populate Grades
    console.log('\n📊 Populating grades...');
    const grades = [
      {
        studentId: STUDENT_ID,
        subject: 'Mathematics',
        homework: 14,
        test: 16,
        exam: 15,
        finalGrade: 15.2,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'Physics',
        homework: 13,
        test: 15,
        exam: 14,
        finalGrade: 14.1,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'Chemistry',
        homework: 15,
        test: 17,
        exam: 16,
        finalGrade: 16.0,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'English',
        homework: 16,
        test: 18,
        exam: 17,
        finalGrade: 17.1,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'History',
        homework: 12,
        test: 14,
        exam: 13,
        finalGrade: 13.1,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'Arabic',
        homework: 17,
        test: 19,
        exam: 18,
        finalGrade: 18.0,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'Computer Science',
        homework: 18,
        test: 19,
        exam: 19,
        finalGrade: 18.8,
        status: 'Pass'
      },
      {
        studentId: STUDENT_ID,
        subject: 'Islamic Studies',
        homework: 16,
        test: 17,
        exam: 16,
        finalGrade: 16.4,
        status: 'Pass'
      }
    ];
    await Grade.insertMany(grades);
    console.log(`✅ Created ${grades.length} grade entries`);

    // Populate Tests (quiz, test, midterm)
    console.log('\n📝 Populating tests...');
    const tests = [
      {
        studentId: STUDENT_ID,
        title: 'Mathematics Quiz 1',
        subject: 'Mathematics',
        type: 'quiz',
        date: new Date('2025-01-20T09:00:00Z'),
        startTime: '09:00',
        endTime: '09:30',
        room: 'Room 101',
        durationMinutes: 30
      },
      {
        studentId: STUDENT_ID,
        title: 'Physics Test',
        subject: 'Physics',
        type: 'test',
        date: new Date('2025-01-25T10:00:00Z'),
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lab 201',
        durationMinutes: 90
      },
      {
        studentId: STUDENT_ID,
        title: 'Chemistry Midterm',
        subject: 'Chemistry',
        type: 'midterm',
        date: new Date('2025-02-05T08:00:00Z'),
        startTime: '08:00',
        endTime: '10:00',
        room: 'Lab 202',
        durationMinutes: 120
      },
      {
        studentId: STUDENT_ID,
        title: 'English Grammar Quiz',
        subject: 'English',
        type: 'quiz',
        date: new Date('2025-10-20T13:00:00Z'),
        startTime: '13:00',
        endTime: '13:30',
        room: 'Room 103',
        durationMinutes: 30
      },
      {
        studentId: STUDENT_ID,
        title: 'Computer Science Test',
        subject: 'Computer Science',
        type: 'test',
        date: new Date('2025-10-25T10:00:00Z'),
        startTime: '10:00',
        endTime: '11:30',
        room: 'Computer Lab',
        durationMinutes: 90
      }
    ];
    await Test.insertMany(tests);
    console.log(`✅ Created ${tests.length} test entries`);

    // Populate Exams (final, exam)
    console.log('\n📋 Populating exams...');
    const exams = [
      {
        studentId: STUDENT_ID,
        title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        type: 'final',
        date: new Date('2025-02-15T09:00:00Z'),
        startTime: '09:00',
        endTime: '12:00',
        room: 'A101',
        durationMinutes: 180
      },
      {
        studentId: STUDENT_ID,
        title: 'Physics Final Exam',
        subject: 'Physics',
        type: 'final',
        date: new Date('2025-02-18T09:00:00Z'),
        startTime: '09:00',
        endTime: '12:00',
        room: 'A102',
        durationMinutes: 180
      },
      {
        studentId: STUDENT_ID,
        title: 'Chemistry Comprehensive Exam',
        subject: 'Chemistry',
        type: 'exam',
        date: new Date('2025-02-20T09:00:00Z'),
        startTime: '09:00',
        endTime: '11:30',
        room: 'Lab 202',
        durationMinutes: 150
      },
      {
        studentId: STUDENT_ID,
        title: 'English Final Exam',
        subject: 'English',
        type: 'final',
        date: new Date('2025-10-28T13:00:00Z'),
        startTime: '13:00',
        endTime: '16:00',
        room: 'A103',
        durationMinutes: 180
      }
    ];
    await Exam.insertMany(exams);
    console.log(`✅ Created ${exams.length} exam entries`);

    // Populate Homework
    console.log('\n📚 Populating homework...');
    const today = new Date();
    const homework = [
      {
        studentId: STUDENT_ID,
        title: 'Algebra Problems Set',
        subject: 'Mathematics',
        description: 'Complete exercises 1-20 from Chapter 5',
        startDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        dueDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        durationDays: 7,
        status: 'active',
        priority: 'high'
      },
      {
        studentId: STUDENT_ID,
        title: 'Newton\'s Laws Essay',
        subject: 'Physics',
        description: 'Write a 500-word essay on Newton\'s three laws of motion',
        startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        durationDays: 7,
        status: 'active',
        priority: 'medium'
      },
      {
        studentId: STUDENT_ID,
        title: 'Chemical Reactions Lab Report',
        subject: 'Chemistry',
        description: 'Submit lab report for experiment on chemical reactions',
        startDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        durationDays: 8,
        status: 'overdue',
        priority: 'high'
      },
      {
        studentId: STUDENT_ID,
        title: 'Shakespeare Analysis',
        subject: 'English',
        description: 'Analyze Act 3 of Hamlet',
        startDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        dueDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        durationDays: 7,
        status: 'active',
        priority: 'medium'
      },
      {
        studentId: STUDENT_ID,
        title: 'Programming Assignment',
        subject: 'Computer Science',
        description: 'Create a simple calculator using Python',
        startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        dueDate: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        durationDays: 7,
        status: 'upcoming',
        priority: 'low'
      },
      {
        studentId: STUDENT_ID,
        title: 'History Essay: World War II',
        subject: 'History',
        description: 'Write a detailed essay about the causes and effects of WWII',
        startDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        durationDays: 7,
        status: 'active',
        priority: 'high'
      }
    ];
    await Homework.insertMany(homework);
    console.log(`✅ Created ${homework.length} homework entries`);

    // Populate Announcements (global, not student-specific)
    console.log('\n📢 Populating announcements...');
    const announcements = [
      {
        title: 'Winter Break Schedule',
        content: 'School will be closed for winter break from December 20 to January 3',
        type: 'general',
        date: new Date('2025-01-05'),
        priority: 'high'
      },
      {
        title: 'Parent-Teacher Meeting',
        content: 'Annual parent-teacher meetings scheduled for next week',
        type: 'event',
        date: new Date('2025-01-08'),
        priority: 'medium'
      },
      {
        title: 'Exam Schedule Released',
        content: 'Final exam schedule has been posted on the student portal',
        type: 'academic',
        date: new Date('2025-01-10'),
        priority: 'high'
      }
    ];
    await Announcement.insertMany(announcements);
    console.log(`✅ Created ${announcements.length} announcements`);

    console.log('\n✅✅✅ All sample data populated successfully! ✅✅✅');
    console.log(`\n📊 Summary:`);
    console.log(`   - Student ID: ${STUDENT_ID}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Grades: ${grades.length}`);
    console.log(`   - Tests: ${tests.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`   - Homework: ${homework.length}`);
    console.log(`   - Announcements: ${announcements.length}`);

  } catch (error) {
    console.error('❌ Error populating data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

populateData();

