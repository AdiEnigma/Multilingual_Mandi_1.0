import request from 'supertest';
import { app } from '../index';
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { authService } from '@/services/AuthService';
import { otpService } from '@/services/OTPService';
import { SupportedLanguage } from '@marketplace-mandi/shared';

// Mock external dependencies
jest.mock('@/config/redis');
jest.mock('@/services/OTPService');

describe('Authentication System', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.oTPVerification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear test data before each test
    await prisma.oTPVerification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/request-otp', () => {
    it('should send OTP for valid phone number', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.sendOTP.mockResolvedValue({
        success: true,
        data: { otpId: 'test-otp-id' },
        message: 'OTP sent successfully',
      });

      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({
          phoneNumber: '+919876543210',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.otpId).toBe('test-otp-id');
    });

    it('should reject invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({
          phoneNumber: 'invalid-phone',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle rate limiting', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.sendOTP.mockResolvedValue({
        success: false,
        error: 'Too many OTP requests. Please try again after 15 minutes.',
      });

      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({
          phoneNumber: '+919876543210',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Too many OTP requests');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data and OTP', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const userData = {
        name: 'Test User',
        phoneNumber: '+919876543210',
        location: {
          state: 'Karnataka',
          district: 'Bangalore',
          pincode: '560001',
        },
        preferredLanguage: SupportedLanguage.HINDI,
        userType: 'buyer' as const,
        otp: '123456',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.user.phoneNumber).toBe(userData.phoneNumber);
      expect(response.body.data.user.name).toBe(userData.name);
    });

    it('should reject registration with invalid OTP', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: false,
        error: 'Invalid OTP',
      });

      const userData = {
        name: 'Test User',
        phoneNumber: '+919876543210',
        location: {
          state: 'Karnataka',
          district: 'Bangalore',
          pincode: '560001',
        },
        preferredLanguage: SupportedLanguage.HINDI,
        userType: 'buyer' as const,
        otp: '000000',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid OTP');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          // Missing required fields
          otp: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject duplicate phone number registration', async () => {
      // First, create a user
      await prisma.user.create({
        data: {
          name: 'Existing User',
          phoneNumber: '+919876543210',
          location: {
            state: 'Karnataka',
            district: 'Bangalore',
            pincode: '560001',
          },
          preferredLanguage: SupportedLanguage.HINDI,
          userType: 'buyer',
        },
      });

      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const userData = {
        name: 'Test User',
        phoneNumber: '+919876543210', // Same phone number
        location: {
          state: 'Karnataka',
          district: 'Bangalore',
          pincode: '560001',
        },
        preferredLanguage: SupportedLanguage.HINDI,
        userType: 'buyer' as const,
        otp: '123456',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/verify-otp (Login)', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          name: 'Test User',
          phoneNumber: '+919876543210',
          location: {
            state: 'Karnataka',
            district: 'Bangalore',
            pincode: '560001',
          },
          preferredLanguage: SupportedLanguage.HINDI,
          userType: 'buyer',
        },
      });
    });

    it('should login existing user with valid OTP', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: '+919876543210',
          otp: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.user.phoneNumber).toBe('+919876543210');
    });

    it('should reject login with invalid OTP', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: false,
        error: 'Invalid OTP',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: '+919876543210',
          otp: '000000',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid OTP');
    });

    it('should reject login for non-existent user', async () => {
      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: '+919999999999', // Non-existent user
          otp: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('Authentication Middleware', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create a test user and get auth token
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          phoneNumber: '+919876543210',
          location: {
            state: 'Karnataka',
            district: 'Bangalore',
            pincode: '560001',
          },
          preferredLanguage: SupportedLanguage.HINDI,
          userType: 'buyer',
        },
      });

      userId = user.id;

      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const loginResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: '+919876543210',
          otp: '123456',
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access token required');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid or expired token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create a test user and get auth token
      await prisma.user.create({
        data: {
          name: 'Test User',
          phoneNumber: '+919876543210',
          location: {
            state: 'Karnataka',
            district: 'Bangalore',
            pincode: '560001',
          },
          preferredLanguage: SupportedLanguage.HINDI,
          userType: 'buyer',
        },
      });

      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const loginResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: '+919876543210',
          otp: '123456',
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user and get tokens
      await prisma.user.create({
        data: {
          name: 'Test User',
          phoneNumber: '+919876543210',
          location: {
            state: 'Karnataka',
            district: 'Bangalore',
            pincode: '560001',
          },
          preferredLanguage: SupportedLanguage.HINDI,
          userType: 'buyer',
        },
      });

      const mockOTPService = otpService as jest.Mocked<typeof otpService>;
      mockOTPService.verifyOTP.mockResolvedValue({
        success: true,
        data: { verified: true },
        message: 'OTP verified successfully',
      });

      const loginResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber: '+919876543210',
          otp: '123456',
        });

      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});