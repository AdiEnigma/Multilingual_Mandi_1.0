import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/error';
import { authenticate, authRateLimit } from '@/middleware/auth';
import { authService } from '@/services/AuthService';
import { logger } from '@/utils/logger';
import {
  OTPRequestSchema,
  LoginSchema,
  UserRegistrationSchema,
  normalizePhoneNumber,
} from '@marketplace-mandi/shared';

const router = Router();

// Validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// POST /api/auth/request-otp
router.post('/request-otp', 
  authRateLimit(3, 15), // Max 3 OTP requests per 15 minutes
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .custom((value) => {
        const normalized = normalizePhoneNumber(value);
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        if (!phoneRegex.test(normalized)) {
          throw new Error('Invalid Indian phone number format');
        }
        return true;
      }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      // Validate with Zod schema
      const validation = OTPRequestSchema.safeParse({ phoneNumber });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format',
          details: validation.error.errors,
        });
      }

      const result = await authService.sendOTP(phoneNumber);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Request OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send OTP',
      });
    }
  })
);

// POST /api/auth/resend-otp
router.post('/resend-otp',
  authRateLimit(2, 10), // Max 2 resend requests per 10 minutes
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .custom((value) => {
        const normalized = normalizePhoneNumber(value);
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        if (!phoneRegex.test(normalized)) {
          throw new Error('Invalid Indian phone number format');
        }
        return true;
      }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      const result = await authService.resendOTP(phoneNumber);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resend OTP',
      });
    }
  })
);

// POST /api/auth/verify-otp (Login)
router.post('/verify-otp',
  authRateLimit(5, 15), // Max 5 verification attempts per 15 minutes
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      // Validate with Zod schema
      const validation = LoginSchema.safeParse({ phoneNumber, otp });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.error.errors,
        });
      }

      const result = await authService.verifyOTP(phoneNumber, otp);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify OTP',
      });
    }
  })
);

// POST /api/auth/register
router.post('/register',
  authRateLimit(3, 60), // Max 3 registration attempts per hour
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('location.state')
      .notEmpty()
      .withMessage('State is required'),
    body('location.district')
      .notEmpty()
      .withMessage('District is required'),
    body('location.pincode')
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('preferredLanguage')
      .notEmpty()
      .withMessage('Preferred language is required'),
    body('userType')
      .isIn(['buyer', 'seller', 'both'])
      .withMessage('User type must be buyer, seller, or both'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { otp, ...userData } = req.body;
      
      // Validate with Zod schema
      const validation = UserRegistrationSchema.safeParse(userData);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid registration data',
          details: validation.error.errors,
        });
      }

      const result = await authService.registerUser(userData, otp);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user',
      });
    }
  })
);

// POST /api/auth/login (Alternative endpoint using phone + OTP)
router.post('/login',
  authRateLimit(5, 15),
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const loginData = req.body;
      
      const result = await authService.login(loginData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login',
      });
    }
  })
);

// POST /api/auth/logout
router.post('/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const token = req.token!;
      
      const result = await authService.logout(token);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout',
      });
    }
  })
);

// POST /api/auth/logout-all
router.post('/logout-all',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = await authService.logoutAll(userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout from all devices',
      });
    }
  })
);

// POST /api/auth/refresh
router.post('/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      const result = await authService.refreshSession(refreshToken);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh token',
      });
    }
  })
);

// GET /api/auth/me
router.get('/me',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const user = req.user!;
      const token = req.token!;
      
      const result = await authService.getAuthStatus(token);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Get auth status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get authentication status',
      });
    }
  })
);

// POST /api/auth/change-phone
router.post('/change-phone',
  authenticate,
  [
    body('oldPhoneNumber')
      .notEmpty()
      .withMessage('Old phone number is required'),
    body('newPhoneNumber')
      .notEmpty()
      .withMessage('New phone number is required'),
    body('oldOTP')
      .isLength({ min: 6, max: 6 })
      .withMessage('Old phone OTP must be 6 digits')
      .isNumeric()
      .withMessage('Old phone OTP must contain only numbers'),
    body('newOTP')
      .isLength({ min: 6, max: 6 })
      .withMessage('New phone OTP must be 6 digits')
      .isNumeric()
      .withMessage('New phone OTP must contain only numbers'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { oldPhoneNumber, newPhoneNumber, oldOTP, newOTP } = req.body;
      const userId = req.user!.id;
      
      const result = await authService.changePhoneNumber(
        userId,
        oldPhoneNumber,
        newPhoneNumber,
        oldOTP,
        newOTP
      );
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Change phone number error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change phone number',
      });
    }
  })
);

export default router;