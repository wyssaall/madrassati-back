import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Homework from '../models/Homework.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function createSampleHomeworks() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n📚 Creating sample homework assignments...');

    // Clear existing sample homeworks
    await Homework.deleteMany({ 
      homeworkId: { $in: ['HW001', 'HW002', 'HW003', 'HW004', 'HW005'] } 
    });
    console.log('✅ Cleared existing sample homeworks');

    // Create sample homeworks
    const sampleHomeworks = [
      {
        teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f'), // Use existing teacher ID
        className: 'Grade 10A',
        subject: 'Mathematics',
        title: 'Algebra Practice Problems',
        description: 'Complete exercises 1-20 from Chapter 3. Focus on solving linear equations and inequalities.',
        homeworkId: 'HW001',
        startDate: new Date('2025-01-15'),
        dueDate: new Date('2025-01-20'),
        status: 'active',
        durationDays: 5,
        daysLeft: 3
      },
      {
        teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f'),
        className: 'Grade 10A',
        subject: 'Science',
        title: 'Biology Research Project',
        description: 'Research and write a 2-page report on photosynthesis. Include diagrams and examples.',
        homeworkId: 'HW002',
        startDate: new Date('2025-01-18'),
        dueDate: new Date('2025-01-25'),
        status: 'upcoming',
        durationDays: 7,
        daysLeft: 6
      },
      {
        teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f'),
        className: 'Grade 10A',
        subject: 'English',
        title: 'Essay Writing Assignment',
        description: 'Write a 500-word essay on "The Importance of Education in Modern Society".',
        homeworkId: 'HW003',
        startDate: new Date('2025-01-10'),
        dueDate: new Date('2025-01-17'),
        status: 'overdue',
        durationDays: 7,
        daysLeft: -2
      },
      {
        teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f'),
        className: 'Grade 10A',
        subject: 'Mathematics',
        title: 'Geometry Problem Set',
        description: 'Solve problems 1-15 from the geometry textbook. Show all work and calculations.',
        homeworkId: 'HW004',
        startDate: new Date('2025-01-20'),
        dueDate: new Date('2025-01-27'),
        status: 'upcoming',
        durationDays: 7,
        daysLeft: 8
      },
      {
        teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f'),
        className: 'Grade 10A',
        subject: 'History',
        title: 'World War II Timeline',
        description: 'Create a detailed timeline of major events during World War II (1939-1945).',
        homeworkId: 'HW005',
        startDate: new Date('2025-01-22'),
        dueDate: new Date('2025-01-30'),
        status: 'upcoming',
        durationDays: 8,
        daysLeft: 10
      }
    ];

    await Homework.insertMany(sampleHomeworks);
    console.log(`✅ Created ${sampleHomeworks.length} sample homework assignments`);

    // Display created homeworks
    console.log('\n📋 Sample Homeworks Created:');
    sampleHomeworks.forEach(hw => {
      console.log(`  - ${hw.homeworkId}: ${hw.title} (${hw.subject}) - Due: ${hw.dueDate.toDateString()}`);
    });

    console.log('\n✅✅✅ Sample homeworks created successfully! ✅✅✅');

  } catch (error) {
    console.error('❌ Error creating sample homeworks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createSampleHomeworks();




