import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string) {
  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: "madrassati",
    });
    console.log(`✅ Connected to MongoDB`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`🌍 Host: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", (error as Error).message);
    process.exit(1);
  }
}
