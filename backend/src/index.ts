import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler, notFoundHandler } from '@/middleware/error';
import { logger } from '@/utils/logger';
import { connectRedis } from '@/config/redis';
import { prisma } from '@/config/database';
import { validateEnv } from '@/config/env';
import { cleanupJob } from '@/jobs/cleanup';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import listingRoutes from '@/routes/listings';
import categoryRoutes from '@/routes/categories';
import uploadRoutes from '@/routes/upload';
import chatRoutes from '@/routes/chats';
import priceRoutes from '@/routes/prices';
import searchRoutes from '@/routes/search';

// Import socket handlers
import { initializeSocketHandlers } from '@/sockets';

// Load environment variables
dotenv.config();

// Validate environment variables
const env = validateEnv();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      services: {
        database: 'connected',
        redis: 'connected', // Assume connected if we reach this point
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      error: 'Service unavailable'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/search', searchRoutes);

// Socket.IO initialization
initializeSocketHandlers(io);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  // Stop cleanup job
  cleanupJob.stop();
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close database connection
  await prisma.$disconnect();
  logger.info('Database connection closed');
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Test database connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    // Start cleanup job
    cleanupJob.start();
    logger.info('Cleanup job started');

    // Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📱 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`🔧 Backend URL: ${env.BACKEND_URL}`);
      logger.info(`🔐 Authentication system ready`);
      logger.info(`📞 OTP system ready (${env.NODE_ENV === 'development' ? 'mock mode' : 'SMS mode'})`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, server, io };