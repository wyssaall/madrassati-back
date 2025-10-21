import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Homework from '../models/Homework.model.js';
import Student from '../models/Student.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function fixHomeworkLinks() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('\n🔧 Fixing homework links...');

    // Get all students and their classes
    const students = await Student.find({});
    console.log(`👥 Found ${students.length} students`);

    // Group students by className
    const studentsByClass = {};
    students.forEach(student => {
      if (!studentsByClass[student.className]) {
        studentsByClass[student.className] = [];
      }
      studentsByClass[student.className].push(student);
    });

    console.log('\n📊 Students by class:');
    Object.keys(studentsByClass).forEach(className => {
      console.log(`  - ${className}: ${studentsByClass[className].length} students`);
    });

    // Get all homeworks
    const homeworks = await Homework.find({});
    console.log(`\n📚 Found ${homeworks.length} homeworks`);

    // Update homework to match existing student classes
    console.log('\n🔄 Updating homework class names to match existing students...');
    
    for (const homework of homeworks) {
      // Find a class that has students
      const availableClasses = Object.keys(studentsByClass);
      if (availableClasses.length > 0) {
        // Use the first available class or keep existing if it exists
        const targetClass = availableClasses.includes(homework.className) 
          ? homework.className 
          : availableClasses[0];
        
        if (homework.className !== targetClass) {
          await Homework.findByIdAndUpdate(homework._id, { className: targetClass });
          console.log(`  ✅ Updated "${homework.title}" to class ${targetClass}`);
        } else {
          console.log(`  ✓ "${homework.title}" already in correct class ${targetClass}`);
        }
      }
    }

    // Create additional homework for other classes if needed
    const classesWithStudents = Object.keys(studentsByClass);
    const existingHomeworkClasses = [...new Set(homeworks.map(hw => hw.className))];
    
    console.log('\n📝 Creating additional homework for classes without any...');
    for (const className of classesWithStudents) {
      if (!existingHomeworkClasses.includes(className)) {
        const newHomework = new Homework({
          teacherId: new mongoose.Types.ObjectId('68ed2c9bcbb24b8ec436e12f'),
          className: className,
          subject: 'Mathematics',
          title: `${className} Math Assignment`,
          description: `Complete the assigned math problems for ${className}`,
          startDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        
        await newHomework.save();
        console.log(`  ✅ Created homework for ${className}`);
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalHomeworks = await Homework.find({});
    console.log(`📚 Total homeworks after fix: ${finalHomeworks.length}`);
    
    for (const className of classesWithStudents) {
      const classHomeworks = await Homework.find({ className });
      const classStudents = studentsByClass[className];
      console.log(`  - ${className}: ${classHomeworks.length} homeworks, ${classStudents.length} students`);
    }

    console.log('\n✅✅✅ Homework links fixed successfully! ✅✅✅');

  } catch (error) {
    console.error('❌ Error fixing homework links:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixHomeworkLinks();