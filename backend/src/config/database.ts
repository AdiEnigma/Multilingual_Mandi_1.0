import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { validateDatabaseConnection } from '@marketplace-mandi/shared';

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log database errors
prisma.$on('error', (e: any) => {
  logger.error('Database error:', e);
});

// Log database info
prisma.$on('info', (e: any) => {
  logger.info('Database info:', e.message);
});

// Log database warnings
prisma.$on('warn', (e: any) => {
  logger.warn('Database warning:', e.message);
});

// Test database connection using shared utility
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const isValid = await validateDatabaseConnection(prisma);
    if (isValid) {
      logger.info('Database connection test successful');
    } else {
      logger.error('Database connection test failed');
    }
    return isValid;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}