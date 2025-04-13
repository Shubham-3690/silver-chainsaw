import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Set mongoose options for better reliability
    mongoose.set('strictQuery', false);

    // Add timeout options to prevent hanging
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("Please check your MongoDB connection string and make sure your IP is whitelisted");
    // Don't crash the server on DB connection failure
    return false;
  }
};
