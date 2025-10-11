import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database Connection Diagnostic Script
 * This will help you identify connection issues
 */

async function diagnoseConnection() {
  console.log('\n🔍 DATABASE CONNECTION DIAGNOSIS\n');
  console.log('═'.repeat(60));
  
  // Check environment variables
  console.log('\n1️⃣ ENVIRONMENT VARIABLES:');
  console.log('─'.repeat(60));
  console.log('MONGO_URI:', process.env.MONGO_URI || '❌ NOT SET');
  console.log('MONGODB_URI:', process.env.MONGODB_URI || '❌ NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('PORT:', process.env.PORT || 'not set');
  
  // Determine which URI to use
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/madrassati';
  
  console.log('\n2️⃣ CONNECTION ATTEMPT:');
  console.log('─'.repeat(60));
  console.log('Using URI:', MONGO_URI);
  console.log('Expected DB Name: madrassati');
  
  try {
    console.log('\n⏳ Connecting...');
    
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: 'madrassati',
    });
    
    console.log('✅ Connected successfully!\n');
    
    // Show connection details
    console.log('3️⃣ CONNECTION DETAILS:');
    console.log('─'.repeat(60));
    console.log('📂 Database Name:', conn.connection.name);
    console.log('🌍 Host:', conn.connection.host);
    console.log('🔌 Port:', conn.connection.port);
    console.log('🏷️  Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // List all collections
    console.log('\n4️⃣ COLLECTIONS IN DATABASE:');
    console.log('─'.repeat(60));
    const collections = await conn.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('❌ No collections found! Database is empty.');
    } else {
      console.log(`Found ${collections.length} collection(s):\n`);
      for (const coll of collections) {
        const count = await conn.connection.db.collection(coll.name).countDocuments();
        console.log(`   📁 ${coll.name.padEnd(20)} → ${count} document(s)`);
      }
    }
    
    // Check specifically for students
    console.log('\n5️⃣ STUDENTS COLLECTION CHECK:');
    console.log('─'.repeat(60));
    
    const studentsCollection = conn.connection.db.collection('students');
    const studentCount = await studentsCollection.countDocuments();
    
    console.log(`Total students: ${studentCount}`);
    
    if (studentCount > 0) {
      console.log('\n✅ Students found! Here they are:\n');
      const students = await studentsCollection.find({}).limit(5).toArray();
      
      students.forEach((student, index) => {
        console.log(`${index + 1}. Name: ${student.name || 'N/A'}`);
        console.log(`   Email: ${student.email || 'N/A'}`);
        console.log(`   _id: ${student._id}`);
        console.log(`   userId: ${student.userId || 'Not linked'}`);
        console.log('');
      });
    } else {
      console.log('❌ No students found in the "students" collection.');
      
      // Check if there's a differently named collection
      console.log('\n🔍 Checking for similar collections...');
      const allColls = await conn.connection.db.listCollections().toArray();
      const similarColls = allColls.filter(c => 
        c.name.toLowerCase().includes('student') || 
        c.name.toLowerCase().includes('user')
      );
      
      if (similarColls.length > 0) {
        console.log('Found similar collections:');
        for (const coll of similarColls) {
          const count = await conn.connection.db.collection(coll.name).countDocuments();
          console.log(`   - ${coll.name} (${count} documents)`);
        }
      }
    }
    
    // Check model registration
    console.log('\n6️⃣ MONGOOSE MODEL CHECK:');
    console.log('─'.repeat(60));
    const modelNames = mongoose.modelNames();
    console.log('Registered models:', modelNames.join(', ') || 'None');
    
    // Summary
    console.log('\n7️⃣ DIAGNOSIS SUMMARY:');
    console.log('═'.repeat(60));
    
    if (studentCount > 0) {
      console.log('✅ Database connection: OK');
      console.log('✅ Students collection: EXISTS');
      console.log('✅ Students found:', studentCount);
      console.log('\n🎉 Everything looks good!');
      console.log('\nIf findStudents.ts still says "no students",');
      console.log('the issue might be with model imports or caching.');
    } else {
      console.log('✅ Database connection: OK');
      console.log('❌ Students collection: EMPTY or WRONG NAME');
      console.log('\n💡 Possible issues:');
      console.log('   1. Students are in a different database');
      console.log('   2. Collection is named differently (e.g., "student" not "students")');
      console.log('   3. You need to create a student account first');
    }
    
  } catch (error) {
    console.log('❌ Connection FAILED!');
    console.log('Error:', (error as Error).message);
    console.log('\n💡 Possible issues:');
    console.log('   1. MongoDB is not running');
    console.log('   2. Wrong connection string');
    console.log('   3. Database authentication required');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

diagnoseConnection();

