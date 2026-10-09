import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Fail early with a clear message if the environment variable is missing
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in."
    );
  }

  // 5-second timeout instead of the default 30, so a wrong address
  // fails quickly instead of looking like a frozen terminal.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  console.log("MongoDB connected:", mongoose.connection.name);
}