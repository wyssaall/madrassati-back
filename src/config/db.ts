import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string) {
  try {
    console.log(`🔌 Attempting to connect to MongoDB...`);
    console.log(`🔗 Connection URI: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      dbName: "madrassati",
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✅ Connected to MongoDB`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`🌍 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`🔗 Full connection string: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    
    // Verify the connection
    const adminDb = conn.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`📊 MongoDB Version: ${serverStatus.version}`);
    console.log(`🏃 MongoDB Uptime: ${serverStatus.uptime} seconds`);
    
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", (error as Error).message);
    process.exit(1);
  }
}
