import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';

async function separateExamsAndTests() {
  try {
    await connectToDatabase(MONGODB_URI);
    console.log('');

    // Find Wissal
    const wissal = await Student.findOne({ email: 'wissal@example.com' });
    
    if (!wissal) {
      console.log('❌ Wissal not found!');
      return;
    }

    console.log('👤 Wissal Zabour');
    console.log(`   Student ID: ${wissal._id}`);
    console.log(`   User ID: ${wissal.userId}`);
    console.log('');

    // Get all items from exams collection
    const allExamsCollection = await Exam.find({ studentId: wissal._id });
    
    console.log(`📋 Items in EXAMS collection: ${allExamsCollection.length}`);
    console.log('═'.repeat(80));

    let movedToTests = 0;
    let keptInExams = 0;
    let fixedStudentId = 0;

    for (const item of allExamsCollection) {
      const type = item.type;
      
      console.log(`\n📚 ${item.title}`);
      console.log(`   Type: ${type}`);
      console.log(`   Subject: ${item.subject}`);
      console.log(`   Date: ${new Date(item.date).toLocaleDateString()}`);
      console.log(`   Current studentId: ${item.studentId}`);
      
      // Check if type should be in tests collection
      const typeStr = type as string;
      if (typeStr === 'test' || typeStr === 'quiz' || typeStr === 'midterm') {
        console.log(`   ⚠️  This should be in TESTS collection!`);
        
        // Create in tests collection
        await Test.create({
          studentId: wissal._id,
          title: item.title,
          subject: item.subject,
          type: type as "test" | "quiz" | "midterm",
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room,
          durationMinutes: item.durationMinutes || 90
        });
        
        // Remove from exams collection
        await Exam.findByIdAndDelete(item._id);
        
        console.log(`   ✅ Moved to TESTS collection`);
        movedToTests++;
        
      } else if (type === 'final' || type === 'exam') {
        console.log(`   ✅ Correct collection (EXAMS)`);
        
        // Update studentId if needed
        if (item.studentId?.toString() !== wissal._id.toString()) {
          await Exam.findByIdAndUpdate(item._id, {
            $set: { studentId: wissal._id }
          });
          console.log(`   ✅ Updated studentId to Wissal`);
          fixedStudentId++;
        }
        
        keptInExams++;
        
      } else {
        console.log(`   ⚠️  Unknown type: ${type} - converting to 'exam'`);
        
        await Exam.findByIdAndUpdate(item._id, {
          $set: { 
            type: 'exam',
            studentId: wissal._id
          }
        });
        
        console.log(`   ✅ Updated to type 'exam' and linked to Wissal`);
        keptInExams++;
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Separation Complete!`);
    console.log(`   Moved to TESTS: ${movedToTests}`);
    console.log(`   Kept in EXAMS: ${keptInExams}`);
    console.log(`   Fixed studentId: ${fixedStudentId}`);

    // Verify final state
    const finalExams = await Exam.find({ studentId: wissal._id });
    const finalTests = await Test.find({ studentId: wissal._id });

    console.log('\n📊 FINAL STATE:');
    console.log('═'.repeat(80));
    
    console.log(`\n📋 EXAMS (${finalExams.length}):`);
    finalExams.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.title} (${e.type}) - ${e.subject}`);
    });
    
    console.log(`\n📝 TESTS (${finalTests.length}):`);
    finalTests.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.title} (${t.type}) - ${t.subject}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 Refresh browser to see separated tables!');
    console.log(`   http://localhost:5173/student/${wissal.userId}/exams`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

separateExamsAndTests();

