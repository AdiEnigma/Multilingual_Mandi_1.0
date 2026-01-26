import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/error';
import { authenticate, authorize, requireVerified, optionalAuthenticate } from '@/middleware/auth';
import { userService } from '@/services/UserService';
import { logger } from '@/utils/logger';
import {
  UserProfileUpdateSchema,
  SupportedLanguage,
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

// GET /api/users/profile (Get current user profile)
router.get('/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = await userService.getUserById(userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile',
      });
    }
  })
);

// PUT /api/users/profile (Update current user profile)
router.put('/profile',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('location.state')
      .optional()
      .notEmpty()
      .withMessage('State cannot be empty'),
    body('location.district')
      .optional()
      .notEmpty()
      .withMessage('District cannot be empty'),
    body('location.pincode')
      .optional()
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('preferredLanguage')
      .optional()
      .isIn(Object.values(SupportedLanguage))
      .withMessage('Invalid preferred language'),
    body('userType')
      .optional()
      .isIn(['buyer', 'seller', 'both'])
      .withMessage('User type must be buyer, seller, or both'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      const updates = req.body;
      
      // Validate with Zod schema
      const validation = UserProfileUpdateSchema.safeParse(updates);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid update data',
          details: validation.error.errors,
        });
      }

      const result = await userService.updateUser(userId, updates);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile',
      });
    }
  })
);

// PUT /api/users/:id (Update user profile by ID)
router.put('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID format'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('location.state')
      .optional()
      .notEmpty()
      .withMessage('State cannot be empty'),
    body('location.district')
      .optional()
      .notEmpty()
      .withMessage('District cannot be empty'),
    body('location.pincode')
      .optional()
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('preferredLanguage')
      .optional()
      .isIn(Object.values(SupportedLanguage))
      .withMessage('Invalid preferred language'),
    body('userType')
      .optional()
      .isIn(['buyer', 'seller', 'both'])
      .withMessage('User type must be buyer, seller, or both'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const currentUserId = req.user!.id;
      
      // Users can only update their own profile
      if (id !== currentUserId) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own profile',
        });
      }
      
      // Validate with Zod schema
      const validation = UserProfileUpdateSchema.safeParse(updates);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid update data',
          details: validation.error.errors,
        });
      }

      const result = await userService.updateUser(id, updates);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile',
      });
    }
  })
);

// GET /api/users/:id (Get user by ID - public info only)
router.get('/:id',
  optionalAuthenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID format'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await userService.getUserById(id);
      
      if (result.success) {
        const user = result.data!;
        
        // Return public profile information only
        const publicProfile = {
          id: user.id,
          name: user.name,
          location: {
            state: user.location.state,
            district: user.location.district,
            // Don't expose exact pincode for privacy
          },
          userType: user.userType,
          reputationScore: user.reputationScore,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          // Don't expose phone number, exact location, or last active
        };
        
        res.status(200).json({
          success: true,
          data: publicProfile,
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user',
      });
    }
  })
);

export default router;