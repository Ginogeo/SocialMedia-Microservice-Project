import mongoose from 'mongoose';
import {Redis} from 'ioredis'; 
import { logger } from '../utils/logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('Connection to MongoDB successfully!');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export const connectRedis = (): Redis => { 
  try {
    const redisClient = new Redis(process.env.REDIS_URL!);
    return redisClient;
  } catch (err) {
    logger.error('Redis connection error:', err);
    throw err;
  }
};