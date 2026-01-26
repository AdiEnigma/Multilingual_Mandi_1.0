import jwt from 'jsonwebtoken';
import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';
import { UserProfile } from '@marketplace-mandi/shared';

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshTokenExpiresIn: string = '30d';

  constructor() {
    const env = getEnv();
    this.jwtSecret = env.JWT_SECRET;
    this.jwtExpiresIn = env.JWT_EXPIRES_IN;
  }

  /**
   * Generate access and refresh tokens for a user
   */
  generateTokens(user: UserProfile): TokenPair {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
    };

    const accessToken = (jwt.sign as any)(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'marketplace-mandi',
      audience: 'marketplace-mandi-users',
    });

    const refreshToken = (jwt.sign as any)(
      { ...payload, type: 'refresh' },
      this.jwtSecret,
      {
        expiresIn: this.refreshTokenExpiresIn,
        issuer: 'marketplace-mandi',
        audience: 'marketplace-mandi-users',
      }
    );

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpirationTime(this.jwtExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify and decode an access token
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'marketplace-mandi',
        audience: 'marketplace-mandi-users',
      }) as JWTPayload;

      // Ensure it's not a refresh token
      if ((decoded as any).type === 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.debug('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.debug('Invalid access token');
      } else {
        logger.error('Error verifying access token:', error);
      }
      return null;
    }
  }

  /**
   * Verify and decode a refresh token
   */
  verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'marketplace-mandi',
        audience: 'marketplace-mandi-users',
      }) as JWTPayload & { type?: string };

      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        return null;
      }

      // Remove the type field before returning
      const { type, ...payload } = decoded;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.debug('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.debug('Invalid refresh token');
      } else {
        logger.error('Error verifying refresh token:', error);
      }
      return null;
    }
  }

  /**
   * Generate a new access token from a refresh token
   */
  refreshAccessToken(refreshToken: string): string | null {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    // Generate new access token with same payload
    const newAccessToken = (jwt.sign as any)(
      {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        userType: payload.userType,
      },
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiresIn,
        issuer: 'marketplace-mandi',
        audience: 'marketplace-mandi-users',
      }
    );

    return newAccessToken;
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Get token expiration time in seconds
   */
  getTokenExpiration(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded.exp || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const exp = this.getTokenExpiration(token);
    if (!exp) {
      return true;
    }

    return Date.now() >= exp * 1000;
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default to 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}

// Export singleton instance
export const jwtService = new JWTService();

// Export utility functions
export const generateTokens = (user: UserProfile): TokenPair => jwtService.generateTokens(user);
export const verifyAccessToken = (token: string): JWTPayload | null => jwtService.verifyAccessToken(token);
export const verifyRefreshToken = (token: string): JWTPayload | null => jwtService.verifyRefreshToken(token);
export const refreshAccessToken = (refreshToken: string): string | null => jwtService.refreshAccessToken(refreshToken);
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => jwtService.extractTokenFromHeader(authHeader);
export const isTokenExpired = (token: string): boolean => jwtService.isTokenExpired(token);