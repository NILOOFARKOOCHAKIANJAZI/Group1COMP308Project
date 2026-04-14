// analytics-ai-service/config/mongoose.js
import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
  try {
    if (!config.db) {
      throw new Error('MongoDB connection string is missing.');
    }

    await mongoose.connect(config.db);

    console.log(`Analytics AI Service connected to MongoDB: ${config.db}`);
  } catch (error) {
    console.error('Analytics AI Service MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;