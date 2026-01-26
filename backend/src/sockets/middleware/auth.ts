import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { logger } from '@/utils/logger';
import { cacheService } from '@/config/redis';

export const authMiddleware = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Socket connection attempted without token', {
        socketId: socket.id,
        ip: socket.handshake.address
      });
      return next(new Error('Authentication token required'));
    }

    // For now, we'll implement a simple session-based auth
    // In a real implementation, you would verify JWT tokens here
    const session = await cacheService.getSession(token);
    
    if (!session) {
      logger.warn('Socket connection attempted with invalid token', {
        socketId: socket.id,
        token: token.substring(0, 10) + '...',
        ip: socket.handshake.address
      });
      return next(new Error('Invalid authentication token'));
    }

    // Attach user data to socket
    socket.data.userId = session.userId;
    socket.data.sessionId = token;

    logger.info('Socket authenticated successfully', {
      socketId: socket.id,
      userId: session.userId,
      ip: socket.handshake.address
    });

    next();
  } catch (error) {
    logger.error('Socket authentication error', {
      socketId: socket.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: socket.handshake.address
    });
    next(new Error('Authentication failed'));
  }
};