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
import attendanceRouter from './routes/attendance.routes.js';
import messageRouter from './routes/message.routes.js';
import testRouter from './routes/test.routes.js';
import debugRouter from './routes/debug.routes.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/madrassati';
console.log('🔗 Using MongoDB URI:', mongoUri);
connectToDatabase(mongoUri);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
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

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`📨 Request: ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Madrassati API is running 🚀" });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Temporary: Bypass auth for teacher routes
app.use('/api/teacher', (req, res, next) => {
  console.log('🔥 Teacher route intercepted:', req.method, req.path);
  next();
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/test', testRouter);
app.use('/api/debug', debugRouter);
app.use('/api/student', studentRouter);
app.use('/api/parents', parentRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/messages', messageRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
