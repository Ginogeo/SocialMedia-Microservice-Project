import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import redis from 'ioredis';
import { RedisStore } from 'rate-limit-redis';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many requests' });
  }
});
app.use('/api', limiter);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Comment Service API' });
});

app.listen(PORT, () => {
  console.log(`Comment Service running on port ${PORT}`);
});