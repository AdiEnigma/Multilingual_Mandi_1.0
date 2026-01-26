import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/AuthService';
import { jwtService } from '@/utils/jwt';
import { logger } from '@/utils/logger';
import { UserProfile } from '@marketplace-mandi/shared';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
      token?: string;
    }
  }
}

/**
 * Authentication middleware that validates JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    // Validate token
    const result = await authService.validateJWTToken(token);
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    // Attach user and token to request
    req.user = result.data!;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const result = await authService.validateJWTToken(token);
      if (result.success) {
        req.user = result.data!;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // Continue without authentication
    next();
  }
};

/**
 * Authorization middleware that checks user roles/types
 */
export const authorize = (allowedUserTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedUserTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Account verification required',
    });
  }

  next();
};

/**
 * Middleware to check minimum reputation score
 */
export const requireMinReputation = (minScore: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (req.user.reputationScore < minScore) {
      return res.status(403).json({
        success: false,
        error: `Minimum reputation score of ${minScore} required`,
      });
    }

    next();
  };
};

/**
 * Middleware to validate resource ownership
 */
export const requireOwnership = (resourceIdParam: string = 'id', userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    // For resources that have a direct user ID field
    if (req.body && req.body[userIdField] && req.body[userIdField] !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Resource ownership required',
      });
    }

    // Store for further validation in route handlers
    req.resourceId = resourceId;
    next();
  };
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (maxAttempts: number = 5, windowMinutes: number = 15) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or initialize attempts
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      next();
    } else if (userAttempts.count < maxAttempts) {
      // Increment attempts
      userAttempts.count++;
      next();
    } else {
      // Rate limit exceeded
      const resetIn = Math.ceil((userAttempts.resetTime - now) / 60000);
      return res.status(429).json({
        success: false,
        error: `Too many authentication attempts. Try again in ${resetIn} minutes.`,
      });
    }
  };
};

/**
 * Session validation middleware (alternative to JWT)
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers['x-session-token'] as string;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required',
      });
    }

    const result = await authService.validateSession(sessionToken);
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    req.user = result.data!;
    req.token = sessionToken;

    next();
  } catch (error) {
    logger.error('Session validation middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Session validation failed',
    });
  }
};

// Extend Request interface for custom properties
declare global {
  namespace Express {
    interface Request {
      resourceId?: string;
    }
  }
}