import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/db.js';

// Import routes
import authRouter from './routes/auth.routes.js';
import studentRouter from './routes/student.routes.js';
import parentRouter from './routes/parent.routes.js';
import teacherRouter from './routes/teacher.routes.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Connect to MongoDB
if (process.env.MONGO_URI) {
  connectToDatabase(process.env.MONGO_URI);
} else {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/student', studentRouter);
app.use('/parent', parentRouter);
app.use('/teacher', teacherRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
