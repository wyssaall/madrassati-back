import mongoose from 'mongoose';
import Student from '../models/Student.model.js';
import 'dotenv/config';

/**
 * Migration script to add className field to existing students
 * This script adds a default className to students who don't have one
 */

async function addClassNameToStudents() {
  try {
    console.log('🔄 Adding className field to existing students...\n');

    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find students without className field or with empty className
    const studentsToUpdate = await Student.find({
      $or: [
        { className: { $exists: false } },
        { className: null },
        { className: '' }
      ]
    }).lean();

    console.log(`📊 Found ${studentsToUpdate.length} students that need className field`);

    if (studentsToUpdate.length === 0) {
      console.log('✅ All students already have className field');
      return;
    }

    // Update each student with a default className based on gradeLevel
    for (const student of studentsToUpdate) {
      let defaultClassName = 'Grade 1A'; // Default fallback

      if (student.gradeLevel) {
        // Map gradeLevel to className
        const gradeMap: { [key: string]: string } = {
          'Grade 1': 'Grade 1A',
          'Grade 2': 'Grade 2A',
          'Grade 3': 'Grade 3A',
          'Grade 4': 'Grade 4A',
          'Grade 5': 'Grade 5A',
          'Grade 6': 'Grade 6A',
          'Grade 7': 'Grade 7A',
          'Grade 8': 'Grade 8A',
          'Grade 9': 'Grade 9A',
          'Grade 10': 'Grade 10A',
          'Grade 11': 'Grade 11A',
          'Grade 12': 'Grade 12A'
        };

        defaultClassName = gradeMap[student.gradeLevel] || `${student.gradeLevel}A`;
      }

      await Student.updateOne(
        { _id: student._id },
        { $set: { className: defaultClassName } }
      );

      console.log(`✅ Updated student ${student.name} with className: ${defaultClassName}`);
    }

    console.log('\n✅✅✅ Migration completed successfully! ✅✅✅');
    console.log(`\n📋 Summary:`);
    console.log(`   - Students updated: ${studentsToUpdate.length}`);
    console.log(`   - Field added: className (String, required)`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
addClassNameToStudents();







