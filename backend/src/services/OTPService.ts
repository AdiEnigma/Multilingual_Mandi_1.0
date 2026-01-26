import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { getEnv } from '@/config/env';
import {
  ApiResponse,
  OTPVerification,
  generateOTP,
  isOTPExpired,
  OTP_EXPIRY_MINUTES,
} from '@marketplace-mandi/shared';

export interface IOTPService {
  sendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>>;
  verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ verified: boolean }>>;
  resendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>>;
  cleanupExpiredOTPs(): Promise<void>;
}

export class OTPService implements IOTPService {
  private readonly OTP_RATE_LIMIT_KEY = 'otp_rate_limit';
  private readonly OTP_ATTEMPTS_KEY = 'otp_attempts';
  private readonly MAX_OTP_ATTEMPTS = 3;
  private readonly RATE_LIMIT_WINDOW = 15 * 60; // 15 minutes in seconds
  private readonly MAX_OTP_REQUESTS = 3; // Max 3 OTP requests per 15 minutes

  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>> {
    try {
      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit(phoneNumber);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: `Too many OTP requests. Please try again after ${rateLimitCheck.retryAfter} minutes.`,
        };
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

      // Store OTP in database
      const otpRecord = await prisma.oTPVerification.create({
        data: {
          phoneNumber,
          otp,
          expiresAt,
          verified: false,
        },
      });

      // Cache OTP in Redis for faster verification
      await redis.setex(
        `otp:${phoneNumber}`,
        OTP_EXPIRY_MINUTES * 60,
        JSON.stringify({ otp, otpId: otpRecord.id, expiresAt })
      );

      // Update rate limiting
      await this.updateRateLimit(phoneNumber);

      // In development, log the OTP (in production, send via SMS)
      if (getEnv().NODE_ENV === 'development') {
        logger.info(`OTP for ${phoneNumber}: ${otp} (ID: ${otpRecord.id})`);
      } else {
        // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
        await this.sendSMS(phoneNumber, otp);
      }

      return {
        success: true,
        data: { otpId: otpRecord.id },
        message: 'OTP sent successfully',
      };
    } catch (error) {
      logger.error('Error sending OTP:', error);
      return {
        success: false,
        error: 'Failed to send OTP',
      };
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> {
    try {
      // Check attempt rate limiting
      const attemptCheck = await this.checkAttemptLimit(phoneNumber);
      if (!attemptCheck.allowed) {
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.',
        };
      }

      // First check Redis cache for faster verification
      const cachedOTP = await redis.get(`otp:${phoneNumber}`);
      let otpRecord: OTPVerification | null = null;

      if (cachedOTP) {
        const cached = JSON.parse(cachedOTP);
        if (cached.otp === otp && new Date() < new Date(cached.expiresAt)) {
          // Valid OTP from cache, get full record from database
          otpRecord = await prisma.oTPVerification.findUnique({
            where: { id: cached.otpId },
          });
        }
      }

      // If not found in cache or cache miss, check database
      if (!otpRecord) {
        otpRecord = await prisma.oTPVerification.findFirst({
          where: {
            phoneNumber,
            otp,
            verified: false,
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!otpRecord) {
        await this.incrementAttemptCount(phoneNumber);
        return {
          success: false,
          error: 'Invalid OTP',
        };
      }

      // Check if OTP is expired
      if (isOTPExpired(otpRecord.createdAt)) {
        await this.incrementAttemptCount(phoneNumber);
        return {
          success: false,
          error: 'OTP has expired. Please request a new one.',
        };
      }

      // Mark OTP as verified
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      // Clean up cache and rate limiting
      await redis.del(`otp:${phoneNumber}`);
      await redis.del(`${this.OTP_ATTEMPTS_KEY}:${phoneNumber}`);

      logger.info(`OTP verified successfully for ${phoneNumber}`);

      return {
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP',
      };
    }
  }

  async resendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>> {
    try {
      // Invalidate any existing OTPs for this phone number
      await prisma.oTPVerification.updateMany({
        where: {
          phoneNumber,
          verified: false,
        },
        data: { verified: true }, // Mark as verified to invalidate
      });

      // Clear cache
      await redis.del(`otp:${phoneNumber}`);

      // Send new OTP
      return await this.sendOTP(phoneNumber);
    } catch (error) {
      logger.error('Error resending OTP:', error);
      return {
        success: false,
        error: 'Failed to resend OTP',
      };
    }
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const expiredCount = await prisma.oTPVerification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      logger.info(`Cleaned up ${expiredCount.count} expired OTP records`);
    } catch (error) {
      logger.error('Error cleaning up expired OTPs:', error);
    }
  }

  private async checkRateLimit(phoneNumber: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${this.OTP_RATE_LIMIT_KEY}:${phoneNumber}`;
    const count = await redis.get(key);
    
    if (count && parseInt(count) >= this.MAX_OTP_REQUESTS) {
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        retryAfter: Math.ceil(ttl / 60), // Convert to minutes
      };
    }

    return { allowed: true };
  }

  private async updateRateLimit(phoneNumber: string): Promise<void> {
    const key = `${this.OTP_RATE_LIMIT_KEY}:${phoneNumber}`;
    const current = await redis.get(key);
    
    if (current) {
      await redis.incr(key);
    } else {
      await redis.setex(key, this.RATE_LIMIT_WINDOW, '1');
    }
  }

  private async checkAttemptLimit(phoneNumber: string): Promise<{ allowed: boolean }> {
    const key = `${this.OTP_ATTEMPTS_KEY}:${phoneNumber}`;
    const attempts = await redis.get(key);
    
    if (attempts && parseInt(attempts) >= this.MAX_OTP_ATTEMPTS) {
      return { allowed: false };
    }

    return { allowed: true };
  }

  private async incrementAttemptCount(phoneNumber: string): Promise<void> {
    const key = `${this.OTP_ATTEMPTS_KEY}:${phoneNumber}`;
    const current = await redis.get(key);
    
    if (current) {
      await redis.incr(key);
    } else {
      await redis.setex(key, OTP_EXPIRY_MINUTES * 60, '1');
    }
  }

  private async sendSMS(phoneNumber: string, otp: string): Promise<void> {
    // Mock SMS service for development
    // In production, integrate with actual SMS provider
    logger.info(`SMS would be sent to ${phoneNumber}: Your Marketplace Mandi OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`);
    
    // TODO: Implement actual SMS sending
    // Example with Twilio:
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: `Your Marketplace Mandi OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
    //   from: twilioPhoneNumber,
    //   to: phoneNumber
    // });
  }
}

// Export singleton instance
export const otpService = new OTPService();