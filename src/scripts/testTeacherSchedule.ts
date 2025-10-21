import mongoose from 'mongoose';
import ClassSchedule from '../models/ClassSchedule.model.js';
import { Teacher } from '../models/Teacher.model.js';
import 'dotenv/config';

/**
 * Test script to verify teacher schedule functionality
 * This script tests the teacher schedule endpoint and data structure
 */

async function testTeacherSchedule() {
  try {
    console.log('🧪 Testing Teacher Schedule Implementation...\n');

    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check if there are any teachers in the database
    const teachers = await Teacher.find().limit(5).lean();
    console.log(`👨‍🏫 Found ${teachers.length} teachers in database`);
    
    if (teachers.length === 0) {
      console.log('⚠️ No teachers found. Please create some teachers first.');
      return;
    }

    const testTeacher = teachers[0];
    console.log(`📋 Testing with teacher: ${testTeacher.fullName} (ID: ${testTeacher._id})\n`);

    // 2. Check ClassSchedule model structure
    console.log('🔍 Checking ClassSchedule model structure...');
    const sampleSchedule = await ClassSchedule.findOne().lean();
    if (sampleSchedule) {
      console.log('✅ Sample schedule found:', {
        hasTeacherId: !!sampleSchedule.teacherId,
        hasSubject: !!sampleSchedule.subject,
        hasStudentId: !!sampleSchedule.studentId,
        fields: Object.keys(sampleSchedule)
      });
    } else {
      console.log('⚠️ No schedule data found in database');
    }

    // 3. Test querying schedule for the teacher
    console.log(`\n📅 Testing schedule query for teacher: ${testTeacher._id}`);
    const teacherSchedule = await ClassSchedule.find({ teacherId: testTeacher._id })
      .populate('studentId', 'fullName email')
      .populate('teacherId', 'fullName email subject')
      .select('day startTime endTime subject room status studentId teacherId')
      .lean()
      .sort({ day: 1, startTime: 1 });

    console.log(`✅ Found ${teacherSchedule.length} schedule entries for this teacher`);

    if (teacherSchedule.length > 0) {
      console.log('\n📊 Sample schedule data:');
      teacherSchedule.slice(0, 3).forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.day} ${entry.startTime}-${entry.endTime} | ${entry.subject} | ${entry.room} | Status: ${entry.status}`);
        if (entry.studentId && typeof entry.studentId === 'object' && 'fullName' in entry.studentId) {
          console.log(`     Student: ${(entry.studentId as any).fullName}`);
        }
      });

      // Group by day to test the grouping logic
      const groupedSchedule = teacherSchedule.reduce((acc, classItem) => {
        const day = classItem.day;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push({
          id: classItem._id,
          startTime: classItem.startTime,
          endTime: classItem.endTime,
          subject: classItem.subject,
          room: classItem.room,
          status: classItem.status,
          student: classItem.studentId,
          teacher: classItem.teacherId
        });
        return acc;
      }, {});

      console.log('\n🗓️ Grouped schedule by day:');
      Object.keys(groupedSchedule).forEach(day => {
        console.log(`  ${day}: ${groupedSchedule[day].length} classes`);
      });

      // Test API response format
      const apiResponse = {
        success: true,
        data: {
          teacherId: testTeacher._id,
          schedule: groupedSchedule,
          totalClasses: teacherSchedule.length
        },
        message: 'Schedule retrieved successfully'
      };

      console.log('\n📡 API Response format test:');
      console.log(`  Success: ${apiResponse.success}`);
      console.log(`  Teacher ID: ${apiResponse.data.teacherId}`);
      console.log(`  Total Classes: ${apiResponse.data.totalClasses}`);
      console.log(`  Days with classes: ${Object.keys(apiResponse.data.schedule).length}`);

    } else {
      console.log('⚠️ No schedule entries found for this teacher');
      console.log('💡 You may need to create some schedule entries with teacherId field');
    }

    // 4. Check for schedules without teacherId (potential data issues)
    console.log('\n🔍 Checking for schedules without teacherId...');
    const schedulesWithoutTeacher = await ClassSchedule.countDocuments({ teacherId: { $exists: false } });
    console.log(`⚠️ Found ${schedulesWithoutTeacher} schedule entries without teacherId field`);

    if (schedulesWithoutTeacher > 0) {
      console.log('💡 Consider running a migration script to add teacherId to existing schedules');
    }

    console.log('\n✅ Teacher Schedule Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`  - Teachers in database: ${teachers.length}`);
    console.log(`  - Schedule entries for test teacher: ${teacherSchedule.length}`);
    console.log(`  - Schedules without teacherId: ${schedulesWithoutTeacher}`);
    console.log(`  - API endpoint: GET /api/teacher/${testTeacher._id}/schedule`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testTeacherSchedule();
