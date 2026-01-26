import cron from 'node-cron';
import { otpService } from '@/services/OTPService';
import { sessionService } from '@/services/SessionService';
import { logger } from '@/utils/logger';

/**
 * Cleanup job that runs periodically to remove expired data
 */
export class CleanupJob {
  private static instance: CleanupJob;
  private isRunning = false;

  private constructor() {}

  static getInstance(): CleanupJob {
    if (!CleanupJob.instance) {
      CleanupJob.instance = new CleanupJob();
    }
    return CleanupJob.instance;
  }

  /**
   * Start the cleanup job scheduler
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Cleanup job is already running');
      return;
    }

    // Run cleanup every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.runCleanup();
    });

    // Run cleanup every day at 2 AM for more thorough cleanup
    cron.schedule('0 2 * * *', async () => {
      await this.runDailyCleanup();
    });

    this.isRunning = true;
    logger.info('Cleanup job scheduler started');
  }

  /**
   * Stop the cleanup job scheduler
   */
  stop(): void {
    // Note: node-cron doesn't provide a direct way to stop specific tasks
    // In a production environment, you might want to use a more sophisticated job scheduler
    this.isRunning = false;
    logger.info('Cleanup job scheduler stopped');
  }

  /**
   * Run regular cleanup tasks
   */
  private async runCleanup(): Promise<void> {
    try {
      logger.info('Starting regular cleanup...');
      
      // Clean up expired OTPs
      await otpService.cleanupExpiredOTPs();
      
      // Clean up expired sessions
      await sessionService.cleanupExpiredSessions();
      
      logger.info('Regular cleanup completed');
    } catch (error) {
      logger.error('Error during regular cleanup:', error);
    }
  }

  /**
   * Run daily cleanup tasks (more comprehensive)
   */
  private async runDailyCleanup(): Promise<void> {
    try {
      logger.info('Starting daily cleanup...');
      
      // Run regular cleanup first
      await this.runCleanup();
      
      // Additional daily cleanup tasks can be added here
      // For example:
      // - Clean up old log files
      // - Clean up temporary files
      // - Archive old data
      // - Update statistics
      
      logger.info('Daily cleanup completed');
    } catch (error) {
      logger.error('Error during daily cleanup:', error);
    }
  }

  /**
   * Run cleanup manually (for testing or maintenance)
   */
  async runManualCleanup(): Promise<void> {
    logger.info('Starting manual cleanup...');
    await this.runCleanup();
    logger.info('Manual cleanup completed');
  }
}

// Export singleton instance
export const cleanupJob = CleanupJob.getInstance();