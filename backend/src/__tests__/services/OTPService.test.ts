import { OTPService } from '@/services/OTPService';
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/config/database');
jest.mock('@/config/redis');
jest.mock('@/utils/logger');

describe('OTPService', () => {
  let otpService: OTPService;
  let mockPrisma: jest.Mocked<typeof prisma>;
  let mockRedis: jest.Mocked<typeof redis>;

  beforeEach(() => {
    otpService = new OTPService();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    mockRedis = redis as jest.Mocked<typeof redis>;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('sendOTP', () => {
    it('should send OTP successfully for valid phone number', async () => {
      const phoneNumber = '+919876543210';
      const mockOTPRecord = {
        id: 'test-otp-id',
        phoneNumber,
        otp: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        createdAt: new Date(),
      };

      // Mock rate limit check (allowed)
      mockRedis.get.mockResolvedValue(null);
      
      // Mock OTP creation
      mockPrisma.oTPVerification.create.mockResolvedValue(mockOTPRecord);
      
      // Mock Redis operations
      mockRedis.setex.mockResolvedValue('OK');

      const result = await otpService.sendOTP(phoneNumber);

      expect(result.success).toBe(true);
      expect(result.data?.otpId).toBe('test-otp-id');
      expect(mockPrisma.oTPVerification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneNumber,
          otp: expect.any(String),
          expiresAt: expect.any(Date),
          verified: false,
        }),
      });
    });

    it('should reject OTP request when rate limited', async () => {
      const phoneNumber = '+919876543210';
      
      // Mock rate limit exceeded
      mockRedis.get.mockResolvedValue('3'); // Already 3 requests
      mockRedis.ttl.mockResolvedValue(900); // 15 minutes remaining

      const result = await otpService.sendOTP(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many OTP requests');
      expect(mockPrisma.oTPVerification.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const phoneNumber = '+919876543210';
      
      // Mock rate limit check (allowed)
      mockRedis.get.mockResolvedValue(null);
      
      // Mock database error
      mockPrisma.oTPVerification.create.mockRejectedValue(new Error('Database error'));

      const result = await otpService.sendOTP(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send OTP');
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const phoneNumber = '+919876543210';
      const otp = '123456';
      const mockOTPRecord = {
        id: 'test-otp-id',
        phoneNumber,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      };

      // Mock attempt limit check (allowed)
      mockRedis.get.mockResolvedValue(null);
      
      // Mock cached OTP
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        otp,
        otpId: 'test-otp-id',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }));
      
      // Mock database OTP record
      mockPrisma.oTPVerification.findUnique.mockResolvedValue(mockOTPRecord);
      
      // Mock OTP verification update
      mockPrisma.oTPVerification.update.mockResolvedValue({
        ...mockOTPRecord,
        verified: true,
      });
      
      // Mock Redis cleanup
      mockRedis.del.mockResolvedValue(1);

      const result = await otpService.verifyOTP(phoneNumber, otp);

      expect(result.success).toBe(true);
      expect(result.data?.verified).toBe(true);
      expect(mockPrisma.oTPVerification.update).toHaveBeenCalledWith({
        where: { id: 'test-otp-id' },
        data: { verified: true },
      });
    });

    it('should reject invalid OTP', async () => {
      const phoneNumber = '+919876543210';
      const otp = '000000';

      // Mock attempt limit check (allowed)
      mockRedis.get.mockResolvedValue(null);
      
      // Mock no cached OTP
      mockRedis.get.mockResolvedValue(null);
      
      // Mock no database OTP record found
      mockPrisma.oTPVerification.findFirst.mockResolvedValue(null);

      const result = await otpService.verifyOTP(phoneNumber, otp);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP');
    });

    it('should reject expired OTP', async () => {
      const phoneNumber = '+919876543210';
      const otp = '123456';
      const expiredOTPRecord = {
        id: 'test-otp-id',
        phoneNumber,
        otp,
        expiresAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        verified: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago (expired)
      };

      // Mock attempt limit check (allowed)
      mockRedis.get.mockResolvedValue(null);
      
      // Mock no cached OTP
      mockRedis.get.mockResolvedValue(null);
      
      // Mock expired database OTP record
      mockPrisma.oTPVerification.findFirst.mockResolvedValue(expiredOTPRecord);

      const result = await otpService.verifyOTP(phoneNumber, otp);

      expect(result.success).toBe(false);
      expect(result.error).toContain('OTP has expired');
    });

    it('should reject verification when attempt limit exceeded', async () => {
      const phoneNumber = '+919876543210';
      const otp = '123456';

      // Mock attempt limit exceeded
      mockRedis.get.mockResolvedValue('3'); // Already 3 attempts

      const result = await otpService.verifyOTP(phoneNumber, otp);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Too many failed attempts. Please request a new OTP.');
      expect(mockPrisma.oTPVerification.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('resendOTP', () => {
    it('should resend OTP successfully', async () => {
      const phoneNumber = '+919876543210';
      
      // Mock invalidating existing OTPs
      mockPrisma.oTPVerification.updateMany.mockResolvedValue({ count: 1 });
      
      // Mock Redis cleanup
      mockRedis.del.mockResolvedValue(1);
      
      // Mock rate limit check (allowed)
      mockRedis.get.mockResolvedValue(null);
      
      // Mock new OTP creation
      const mockNewOTPRecord = {
        id: 'new-otp-id',
        phoneNumber,
        otp: '654321',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        createdAt: new Date(),
      };
      mockPrisma.oTPVerification.create.mockResolvedValue(mockNewOTPRecord);
      
      // Mock Redis operations
      mockRedis.setex.mockResolvedValue('OK');

      const result = await otpService.resendOTP(phoneNumber);

      expect(result.success).toBe(true);
      expect(result.data?.otpId).toBe('new-otp-id');
      expect(mockPrisma.oTPVerification.updateMany).toHaveBeenCalledWith({
        where: {
          phoneNumber,
          verified: false,
        },
        data: { verified: true },
      });
    });
  });

  describe('cleanupExpiredOTPs', () => {
    it('should cleanup expired OTPs successfully', async () => {
      // Mock deletion of expired OTPs
      mockPrisma.oTPVerification.deleteMany.mockResolvedValue({ count: 5 });

      await otpService.cleanupExpiredOTPs();

      expect(mockPrisma.oTPVerification.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      // Mock database error
      mockPrisma.oTPVerification.deleteMany.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(otpService.cleanupExpiredOTPs()).resolves.toBeUndefined();
    });
  });
});