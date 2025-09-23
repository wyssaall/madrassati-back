import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string): Promise<void> {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri);

    console.log("✅ Connected to MongoDB");
    console.log("📂 Database:", mongoose.connection.name);
    console.log("🌍 Host:", mongoose.connection.host);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}
