import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { jwtService } from '@/utils/jwt';
import { otpService } from './OTPService';
import { sessionService } from './SessionService';
import { userService } from './UserService';
import {
  ApiResponse,
  UserProfile,
  UserRegistrationData,
  AuthTokens,
  LoginRequest,
  OTPRequest,
  IAuthService,
  validateRequiredFields,
  normalizePhoneNumber,
  isValidIndianPhoneNumber,
} from '@marketplace-mandi/shared';

export class AuthService implements IAuthService {
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>> {
    try {
      // Normalize and validate phone number
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (!isValidIndianPhoneNumber(normalizedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please use Indian phone number format.',
        };
      }

      // Send OTP
      const result = await otpService.sendOTP(normalizedPhone);
      return result;
    } catch (error) {
      logger.error('Error in sendOTP:', error);
      return {
        success: false,
        error: 'Failed to send OTP',
      };
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: UserProfile; tokens: AuthTokens }>> {
    try {
      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (!isValidIndianPhoneNumber(normalizedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Verify OTP
      const otpResult = await otpService.verifyOTP(normalizedPhone, otp);
      if (!otpResult.success) {
        return {
          success: false,
          error: otpResult.error,
        };
      }

      // Check if user exists
      const userResult = await userService.getUserByPhoneNumber(normalizedPhone);
      if (!userResult.success) {
        return {
          success: false,
          error: 'User not found. Please register first.',
        };
      }

      const user = userResult.data!;

      // Generate JWT tokens
      const tokens = jwtService.generateTokens(user);

      // Create session
      await sessionService.createSession(user.id);

      logger.info(`User logged in successfully: ${user.id}`);

      return {
        success: true,
        data: {
          user,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          },
        },
        message: 'Login successful',
      };
    } catch (error) {
      logger.error('Error in verifyOTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP',
      };
    }
  }

  async resendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>> {
    try {
      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (!isValidIndianPhoneNumber(normalizedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Resend OTP
      const result = await otpService.resendOTP(normalizedPhone);
      return result;
    } catch (error) {
      logger.error('Error in resendOTP:', error);
      return {
        success: false,
        error: 'Failed to resend OTP',
      };
    }
  }

  async registerUser(userData: UserRegistrationData, otp: string): Promise<ApiResponse<{ user: UserProfile; tokens: AuthTokens }>> {
    try {
      // Validate required fields
      const validation = validateRequiredFields(userData, [
        'name',
        'phoneNumber',
        'location',
        'preferredLanguage',
        'userType',
      ]);

      if (!validation.isValid) {
        return {
          success: false,
          error: `Missing required fields: ${validation.missingFields.join(', ')}`,
        };
      }

      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(userData.phoneNumber);
      if (!isValidIndianPhoneNumber(normalizedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Verify OTP first
      const otpResult = await otpService.verifyOTP(normalizedPhone, otp);
      if (!otpResult.success) {
        return {
          success: false,
          error: otpResult.error,
        };
      }

      // Check if user already exists
      const existingUserResult = await userService.getUserByPhoneNumber(normalizedPhone);
      if (existingUserResult.success) {
        return {
          success: false,
          error: 'User with this phone number already exists',
        };
      }

      // Create user with normalized phone number
      const normalizedUserData = {
        ...userData,
        phoneNumber: normalizedPhone,
      };

      const userResult = await userService.createUser(normalizedUserData);
      if (!userResult.success) {
        return {
          success: false,
          error: userResult.error,
        };
      }

      const user = userResult.data!;

      // Generate JWT tokens
      const tokens = jwtService.generateTokens(user);

      // Create session
      await sessionService.createSession(user.id);

      logger.info(`User registered successfully: ${user.id}`);

      return {
        success: true,
        data: {
          user,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          },
        },
        message: 'Registration successful',
      };
    } catch (error) {
      logger.error('Error in registerUser:', error);
      return {
        success: false,
        error: 'Failed to register user',
      };
    }
  }

  async createSession(userId: string): Promise<ApiResponse<any>> {
    try {
      const result = await sessionService.createSession(userId);
      return result;
    } catch (error) {
      logger.error('Error in createSession:', error);
      return {
        success: false,
        error: 'Failed to create session',
      };
    }
  }

  async validateSession(token: string): Promise<ApiResponse<UserProfile>> {
    try {
      const result = await sessionService.validateSession(token);
      return result;
    } catch (error) {
      logger.error('Error in validateSession:', error);
      return {
        success: false,
        error: 'Failed to validate session',
      };
    }
  }

  async refreshSession(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const result = await sessionService.refreshSession(refreshToken);
      return result;
    } catch (error) {
      logger.error('Error in refreshSession:', error);
      return {
        success: false,
        error: 'Failed to refresh session',
      };
    }
  }

  async revokeSession(token: string): Promise<ApiResponse<void>> {
    try {
      const result = await sessionService.revokeSession(token);
      return result;
    } catch (error) {
      logger.error('Error in revokeSession:', error);
      return {
        success: false,
        error: 'Failed to revoke session',
      };
    }
  }

  /**
   * Login with phone number and OTP (alternative method)
   */
  async login(loginData: LoginRequest): Promise<ApiResponse<{ user: UserProfile; tokens: AuthTokens }>> {
    return this.verifyOTP(loginData.phoneNumber, loginData.otp);
  }

  /**
   * Logout user by revoking session
   */
  async logout(token: string): Promise<ApiResponse<void>> {
    return this.revokeSession(token);
  }

  /**
   * Logout user from all devices
   */
  async logoutAll(userId: string): Promise<ApiResponse<void>> {
    try {
      const result = await sessionService.revokeAllUserSessions(userId);
      return result;
    } catch (error) {
      logger.error('Error in logoutAll:', error);
      return {
        success: false,
        error: 'Failed to logout from all devices',
      };
    }
  }

  /**
   * Validate JWT token (for middleware)
   */
  async validateJWTToken(token: string): Promise<ApiResponse<UserProfile>> {
    try {
      const payload = jwtService.verifyAccessToken(token);
      if (!payload) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }

      // Get user data
      const userResult = await userService.getUserById(payload.userId);
      if (!userResult.success) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: userResult.data!,
      };
    } catch (error) {
      logger.error('Error in validateJWTToken:', error);
      return {
        success: false,
        error: 'Failed to validate token',
      };
    }
  }

  /**
   * Change user phone number (requires OTP verification for both old and new numbers)
   */
  async changePhoneNumber(
    userId: string,
    oldPhoneNumber: string,
    newPhoneNumber: string,
    oldOTP: string,
    newOTP: string
  ): Promise<ApiResponse<UserProfile>> {
    try {
      // Normalize phone numbers
      const normalizedOldPhone = normalizePhoneNumber(oldPhoneNumber);
      const normalizedNewPhone = normalizePhoneNumber(newPhoneNumber);

      if (!isValidIndianPhoneNumber(normalizedOldPhone) || !isValidIndianPhoneNumber(normalizedNewPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Verify old phone number OTP
      const oldOTPResult = await otpService.verifyOTP(normalizedOldPhone, oldOTP);
      if (!oldOTPResult.success) {
        return {
          success: false,
          error: `Old phone verification failed: ${oldOTPResult.error}`,
        };
      }

      // Verify new phone number OTP
      const newOTPResult = await otpService.verifyOTP(normalizedNewPhone, newOTP);
      if (!newOTPResult.success) {
        return {
          success: false,
          error: `New phone verification failed: ${newOTPResult.error}`,
        };
      }

      // Check if new phone number is already in use
      const existingUserResult = await userService.getUserByPhoneNumber(normalizedNewPhone);
      if (existingUserResult.success) {
        return {
          success: false,
          error: 'New phone number is already in use',
        };
      }

      // Update user phone number
      const updateResult = await userService.updateUser(userId, {
        phoneNumber: normalizedNewPhone,
      } as Partial<UserProfile>);

      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
        };
      }

      // Revoke all existing sessions for security
      await sessionService.revokeAllUserSessions(userId);

      logger.info(`Phone number changed for user ${userId}: ${normalizedOldPhone} -> ${normalizedNewPhone}`);

      return {
        success: true,
        data: updateResult.data!,
        message: 'Phone number changed successfully. Please login again.',
      };
    } catch (error) {
      logger.error('Error in changePhoneNumber:', error);
      return {
        success: false,
        error: 'Failed to change phone number',
      };
    }
  }

  /**
   * Get user authentication status and session info
   */
  async getAuthStatus(token: string): Promise<ApiResponse<{
    user: UserProfile;
    sessionCount: number;
    tokenExpiry: number | null;
  }>> {
    try {
      // Validate token
      const userResult = await this.validateJWTToken(token);
      if (!userResult.success) {
        return {
          success: false,
          error: userResult.error,
        };
      }

      const user = userResult.data!;

      // Get session count
      const sessionCount = await sessionService.getUserSessionCount(user.id);

      // Get token expiry
      const tokenExpiry = jwtService.getTokenExpiration(token);

      return {
        success: true,
        data: {
          user,
          sessionCount,
          tokenExpiry,
        },
      };
    } catch (error) {
      logger.error('Error in getAuthStatus:', error);
      return {
        success: false,
        error: 'Failed to get authentication status',
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();