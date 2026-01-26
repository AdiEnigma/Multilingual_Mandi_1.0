import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { chatHandlers } from './chat';
import { authMiddleware } from './middleware/auth';

export function initializeSocketHandlers(io: SocketIOServer) {
  // Apply authentication middleware
  io.use(authMiddleware);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`, {
      userId: socket.data.userId,
      userAgent: socket.handshake.headers['user-agent'],
      ip: socket.handshake.address
    });

    // Initialize chat handlers
    chatHandlers(socket, io);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}`, {
        userId: socket.data.userId,
        reason
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, {
        userId: socket.data.userId,
        error: error.message,
        stack: error.stack
      });
    });
  });

  logger.info('Socket.IO handlers initialized');
}