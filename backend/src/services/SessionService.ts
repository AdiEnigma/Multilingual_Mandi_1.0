import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { jwtService } from '@/utils/jwt';
import {
  ApiResponse,
  Session,
  UserProfile,
  generateSessionToken,
  SESSION_EXPIRY_HOURS,
} from '@marketplace-mandi/shared';

export interface ISessionService {
  createSession(userId: string): Promise<ApiResponse<Session>>;
  validateSession(token: string): Promise<ApiResponse<UserProfile>>;
  refreshSession(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>>;
  revokeSession(token: string): Promise<ApiResponse<void>>;
  revokeAllUserSessions(userId: string): Promise<ApiResponse<void>>;
  cleanupExpiredSessions(): Promise<void>;
}

export class SessionService implements ISessionService {
  private readonly SESSION_CACHE_PREFIX = 'session';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions';

  async createSession(userId: string): Promise<ApiResponse<Session>> {
    try {
      // Generate session token
      const token = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

      // Create session in database
      const session = await prisma.session.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      });

      // Cache session in Redis for faster validation
      await redis.setex(
        `${this.SESSION_CACHE_PREFIX}:${token}`,
        SESSION_EXPIRY_HOURS * 3600,
        JSON.stringify({
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
        })
      );

      // Track user sessions for bulk operations
      await redis.sadd(`${this.USER_SESSIONS_PREFIX}:${userId}`, token);
      await redis.expire(`${this.USER_SESSIONS_PREFIX}:${userId}`, SESSION_EXPIRY_HOURS * 3600);

      logger.info(`Session created for user ${userId}: ${session.id}`);

      return {
        success: true,
        data: session,
        message: 'Session created successfully',
      };
    } catch (error) {
      logger.error('Error creating session:', error);
      return {
        success: false,
        error: 'Failed to create session',
      };
    }
  }

  async validateSession(token: string): Promise<ApiResponse<UserProfile>> {
    try {
      // First check Redis cache
      const cachedSession = await redis.get(`${this.SESSION_CACHE_PREFIX}:${token}`);
      let sessionData: any = null;

      if (cachedSession) {
        sessionData = JSON.parse(cachedSession);
        
        // Check if cached session is expired
        if (new Date() > new Date(sessionData.expiresAt)) {
          await this.revokeSession(token);
          return {
            success: false,
            error: 'Session expired',
          };
        }
      } else {
        // Check database if not in cache
        const dbSession = await prisma.session.findUnique({
          where: { token },
        });

        if (!dbSession) {
          return {
            success: false,
            error: 'Invalid session',
          };
        }

        // Check if database session is expired
        if (new Date() > dbSession.expiresAt) {
          await this.revokeSession(token);
          return {
            success: false,
            error: 'Session expired',
          };
        }

        sessionData = {
          id: dbSession.id,
          userId: dbSession.userId,
          expiresAt: dbSession.expiresAt,
        };

        // Cache the session for future requests
        const ttl = Math.floor((dbSession.expiresAt.getTime() - Date.now()) / 1000);
        if (ttl > 0) {
          await redis.setex(`${this.SESSION_CACHE_PREFIX}:${token}`, ttl, JSON.stringify(sessionData));
        }
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: sessionData.userId },
      });

      if (!user) {
        await this.revokeSession(token);
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Transform user data with type assertion
      const userWithLocation = user as any;
      const userProfile: UserProfile = {
        id: userWithLocation.id,
        name: userWithLocation.name,
        phoneNumber: userWithLocation.phoneNumber,
        location: {
          state: userWithLocation.locationState,
          district: userWithLocation.locationDistrict,
          pincode: userWithLocation.locationPincode,
          coordinates: userWithLocation.locationLat && userWithLocation.locationLng ? {
            latitude: userWithLocation.locationLat,
            longitude: userWithLocation.locationLng,
          } : undefined,
        },
        preferredLanguage: userWithLocation.preferredLanguage as any,
        userType: userWithLocation.userType as any,
        reputationScore: userWithLocation.reputationScore,
        isVerified: userWithLocation.isVerified,
        createdAt: userWithLocation.createdAt,
        updatedAt: userWithLocation.updatedAt,
        lastActive: userWithLocation.lastActive,
      };

      // Update last active timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });

      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      logger.error('Error validating session:', error);
      return {
        success: false,
        error: 'Failed to validate session',
      };
    }
  }

  async refreshSession(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      // Verify refresh token
      const payload = jwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return {
          success: false,
          error: 'Invalid refresh token',
        };
      }

      // Get user to generate new tokens
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Transform user data with type assertion
      const userWithLocation = user as any;
      const userProfile: UserProfile = {
        id: userWithLocation.id,
        name: userWithLocation.name,
        phoneNumber: userWithLocation.phoneNumber,
        location: {
          state: userWithLocation.locationState,
          district: userWithLocation.locationDistrict,
          pincode: userWithLocation.locationPincode,
          coordinates: userWithLocation.locationLat && userWithLocation.locationLng ? {
            latitude: userWithLocation.locationLat,
            longitude: userWithLocation.locationLng,
          } : undefined,
        },
        preferredLanguage: userWithLocation.preferredLanguage as any,
        userType: userWithLocation.userType as any,
        reputationScore: userWithLocation.reputationScore,
        isVerified: userWithLocation.isVerified,
        createdAt: userWithLocation.createdAt,
        updatedAt: userWithLocation.updatedAt,
        lastActive: userWithLocation.lastActive,
      };

      // Generate new tokens
      const tokens = jwtService.generateTokens(userProfile);

      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      logger.error('Error refreshing session:', error);
      return {
        success: false,
        error: 'Failed to refresh session',
      };
    }
  }

  async revokeSession(token: string): Promise<ApiResponse<void>> {
    try {
      // Get session info before deletion for cleanup
      const cachedSession = await redis.get(`${this.SESSION_CACHE_PREFIX}:${token}`);
      let userId: string | null = null;

      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession);
        userId = sessionData.userId;
      } else {
        // Get from database
        const dbSession = await prisma.session.findUnique({
          where: { token },
        });
        if (dbSession) {
          userId = dbSession.userId;
        }
      }

      // Delete from database
      await prisma.session.deleteMany({
        where: { token },
      });

      // Remove from cache
      await redis.del(`${this.SESSION_CACHE_PREFIX}:${token}`);

      // Remove from user sessions set
      if (userId) {
        await redis.srem(`${this.USER_SESSIONS_PREFIX}:${userId}`, token);
      }

      logger.info(`Session revoked: ${token}`);

      return {
        success: true,
        message: 'Session revoked successfully',
      };
    } catch (error) {
      logger.error('Error revoking session:', error);
      return {
        success: false,
        error: 'Failed to revoke session',
      };
    }
  }

  async revokeAllUserSessions(userId: string): Promise<ApiResponse<void>> {
    try {
      // Get all user sessions from Redis
      const userSessions = await redis.smembers(`${this.USER_SESSIONS_PREFIX}:${userId}`);

      // Delete all sessions from database
      await prisma.session.deleteMany({
        where: { userId },
      });

      // Remove all sessions from cache
      if (userSessions.length > 0) {
        const cacheKeys = userSessions.map((token: string) => `${this.SESSION_CACHE_PREFIX}:${token}`);
        await redis.del(...cacheKeys);
      }

      // Clear user sessions set
      await redis.del(`${this.USER_SESSIONS_PREFIX}:${userId}`);

      logger.info(`All sessions revoked for user ${userId}: ${userSessions.length} sessions`);

      return {
        success: true,
        message: 'All sessions revoked successfully',
      };
    } catch (error) {
      logger.error('Error revoking all user sessions:', error);
      return {
        success: false,
        error: 'Failed to revoke all sessions',
      };
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiredSessions = await prisma.session.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
        select: {
          token: true,
          userId: true,
        },
      });

      if (expiredSessions.length === 0) {
        return;
      }

      // Delete expired sessions from database
      const deletedCount = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Clean up cache
      const cacheKeys = expiredSessions.map((session: any) => `${this.SESSION_CACHE_PREFIX}:${session.token}`);
      if (cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
      }

      // Clean up user sessions sets
      for (const session of expiredSessions) {
        await redis.srem(`${this.USER_SESSIONS_PREFIX}:${session.userId}`, session.token);
      }

      logger.info(`Cleaned up ${deletedCount.count} expired sessions`);
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Get active session count for a user
   */
  async getUserSessionCount(userId: string): Promise<number> {
    try {
      const count = await prisma.session.count({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      return count;
    } catch (error) {
      logger.error('Error getting user session count:', error);
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return sessions;
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();