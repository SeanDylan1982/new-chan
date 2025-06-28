import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import threadRoutes from './routes/threads.js';
import postRoutes from './routes/posts.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables first
dotenv.config();

console.log('🚀 Starting NeoBoard Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 MongoDB URI exists:', !!process.env.MONGO_URI);
console.log('🔐 JWT Secret exists:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'https://new-chan.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Initialize MongoDB connection (don't await - let it connect in background)
console.log('🔄 Initializing database connection...');
connectDB()
  .then(() => {
    console.log('✅ Database initialization complete');
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error.message);
  });

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only for API routes to reduce noise)
app.use('/api', (req, res, next) => {
  console.log(`📥 API ${req.method} ${req.path} - DB State: ${mongoose.connection.readyState}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown';

  let dbStats = {};
  if (dbState === 1) {
    try {
      dbStats = {
        boards: await mongoose.connection.db.collection('boards').countDocuments(),
        users: await mongoose.connection.db.collection('users').countDocuments(),
        threads: await mongoose.connection.db.collection('threads').countDocuments(),
        posts: await mongoose.connection.db.collection('posts').countDocuments(),
      };
    } catch (error) {
      dbStats = { error: 'Could not fetch stats' };
    }
  }

  const healthData = { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      readyState: dbState,
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
      stats: dbStats
    },
    server: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }
  };

  console.log('🏥 Health check requested - DB Status:', dbStatus);
  res.json(healthData);
});

// Root endpoint (minimal logging)
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({ 
    message: 'NeoBoard API Server',
    status: 'running',
    version: '1.0.0',
    database: dbState === 1 ? 'connected' : `not connected (state: ${dbState})`,
    endpoints: {
      health: '/api/health',
      boards: '/api/boards',
      auth: '/api/auth'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log('❌ 404 - API Route not found:', req.originalUrl);
  }
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Base: http://localhost:${PORT}/api`);
  console.log(`🔍 Initial Database Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
  
  // Check database connection status every 5 seconds for the first minute
  let checkCount = 0;
  const connectionChecker = setInterval(() => {
    checkCount++;
    const dbState = mongoose.connection.readyState;
    const status = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting', 
      3: 'disconnecting'
    }[dbState] || 'unknown';
    
    console.log(`🔍 DB Status Check ${checkCount}: ${status} (${dbState})`);
    
    if (dbState === 1) {
      console.log('✅ Database connection established!');
      clearInterval(connectionChecker);
    } else if (checkCount >= 12) { // Stop after 1 minute
      console.log('⏰ Stopped checking database status after 1 minute');
      clearInterval(connectionChecker);
    }
  }, 5000);
});