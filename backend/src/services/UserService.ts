import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import {
  UserProfile,
  UserRegistrationData,
  IUserService,
  ApiResponse,
  PaginatedResponse,
  DatabaseTransformers,
  QueryBuilders,
  UserQueryOptions,
  validateRequiredFields,
  parseDatabaseError,
  isDatabaseError,
  createPaginationInfo,
  Location,
  Rating,
} from '@marketplace-mandi/shared';

export class UserService implements IUserService {
  async createUser(userData: UserRegistrationData): Promise<ApiResponse<UserProfile>> {
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

      // Create user in database
      const dbUser = await prisma.user.create({
        data: {
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          locationState: userData.location.state,
          locationDistrict: userData.location.district,
          locationPincode: userData.location.pincode,
          locationLat: userData.location.coordinates?.latitude || null,
          locationLng: userData.location.coordinates?.longitude || null,
          preferredLanguage: userData.preferredLanguage,
          userType: userData.userType,
          reputationScore: 0.0,
          isVerified: false,
        } as any,
      });

      // Transform database result to UserProfile
      const user = DatabaseTransformers.user(dbUser);

      logger.info(`User created successfully: ${user.id}`);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error) {
      logger.error('Error creating user:', error);

      if (isDatabaseError(error)) {
        const dbError = parseDatabaseError(error);
        return {
          success: false,
          error: dbError.message,
        };
      }

      return {
        success: false,
        error: 'Failed to create user',
      };
    }
  }

  async getUserById(id: string): Promise<ApiResponse<UserProfile>> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!dbUser) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const user = DatabaseTransformers.user(dbUser);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      return {
        success: false,
        error: 'Failed to fetch user',
      };
    }
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<ApiResponse<UserProfile>> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!dbUser) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const user = DatabaseTransformers.user(dbUser);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      logger.error('Error fetching user by phone number:', error);
      return {
        success: false,
        error: 'Failed to fetch user',
      };
    }
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      // Remove fields that shouldn't be updated directly
      const { id: _, createdAt, updatedAt, reputationScore, ...allowedUpdates } = updates;

      const updateData: any = {
        ...allowedUpdates,
        updatedAt: new Date(),
      };

      // Handle location updates
      if (allowedUpdates.location) {
        updateData.locationState = allowedUpdates.location.state;
        updateData.locationDistrict = allowedUpdates.location.district;
        updateData.locationPincode = allowedUpdates.location.pincode;
        updateData.locationLat = allowedUpdates.location.coordinates?.latitude || null;
        updateData.locationLng = allowedUpdates.location.coordinates?.longitude || null;
        delete updateData.location;
      }

      const dbUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      const user = DatabaseTransformers.user(dbUser);
      logger.info(`User updated successfully: ${user.id}`);

      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
    } catch (error) {
      logger.error('Error updating user:', error);

      if (isDatabaseError(error)) {
        const dbError = parseDatabaseError(error);
        return {
          success: false,
          error: dbError.message,
        };
      }

      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      await prisma.user.delete({
        where: { id },
      });

      logger.info(`User deleted successfully: ${id}`);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      logger.error('Error deleting user:', error);

      if (isDatabaseError(error)) {
        const dbError = parseDatabaseError(error);
        return {
          success: false,
          error: dbError.message,
        };
      }

      return {
        success: false,
        error: 'Failed to delete user',
      };
    }
  }

  async searchUsers(query: {
    name?: string;
    location?: Partial<Location>;
    userType?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<UserProfile>>> {
    try {
      const options: UserQueryOptions = {
        userType: query.userType as any,
        isVerified: query.isVerified,
        location: query.location,
        page: query.page || 1,
        limit: Math.min(query.limit || 20, 100), // Max 100 per page
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      // Build query using shared utility
      const prismaQuery = QueryBuilders.user(options);

      // Add name search if provided
      if (query.name) {
        prismaQuery.where.name = {
          contains: query.name,
          mode: 'insensitive',
        };
      }

      // Execute query and count
      const [dbUsers, totalCount] = await Promise.all([
        prisma.user.findMany(prismaQuery),
        prisma.user.count({ where: prismaQuery.where }),
      ]);

      // Transform results
      const users = dbUsers.map(DatabaseTransformers.user);
      const pagination = createPaginationInfo(options.page!, options.limit!, totalCount);

      return {
        success: true,
        data: {
          data: users,
          pagination,
        },
      };
    } catch (error) {
      logger.error('Error searching users:', error);
      return {
        success: false,
        error: 'Failed to search users',
      };
    }
  }

  async updateReputationScore(userId: string, newRating: number): Promise<ApiResponse<UserProfile>> {
    try {
      // Get all ratings for this user
      const ratings = await prisma.rating.findMany({
        where: { ratedId: userId },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate new reputation score using shared utility
      const ratingValues = ratings.map((r: any) => r.rating);
      ratingValues.push(newRating);
      
      // Use a simple average for now (can be enhanced with weighted calculation)
      const newReputationScore = ratingValues.reduce((sum: number, rating: number) => sum + rating, 0) / ratingValues.length;

      const dbUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          reputationScore: Math.round(newReputationScore * 100) / 100, // Round to 2 decimal places
          updatedAt: new Date(),
        },
      });

      const user = DatabaseTransformers.user(dbUser);
      logger.info(`User reputation updated: ${userId} -> ${newReputationScore}`);

      return {
        success: true,
        data: user,
        message: 'Reputation score updated successfully',
      };
    } catch (error) {
      logger.error('Error updating reputation score:', error);
      return {
        success: false,
        error: 'Failed to update reputation score',
      };
    }
  }

  async getUserRatings(userId: string): Promise<ApiResponse<Rating[]>> {
    try {
      const dbRatings = await prisma.rating.findMany({
        where: { ratedId: userId },
        include: {
          rater: true,
          deal: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const ratings = dbRatings.map(DatabaseTransformers.rating);
      return {
        success: true,
        data: ratings,
      };
    } catch (error) {
      logger.error('Error fetching user ratings:', error);
      return {
        success: false,
        error: 'Failed to fetch user ratings',
      };
    }
  }

  async verifyUser(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const dbUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          isVerified: true,
          updatedAt: new Date(),
        },
      });

      const user = DatabaseTransformers.user(dbUser);
      logger.info(`User verified: ${userId}`);

      return {
        success: true,
        data: user,
        message: 'User verified successfully',
      };
    } catch (error) {
      logger.error('Error verifying user:', error);
      return {
        success: false,
        error: 'Failed to verify user',
      };
    }
  }

  async unverifyUser(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const dbUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          isVerified: false,
          updatedAt: new Date(),
        },
      });

      const user = DatabaseTransformers.user(dbUser);
      logger.info(`User unverified: ${userId}`);

      return {
        success: true,
        data: user,
        message: 'User verification removed successfully',
      };
    } catch (error) {
      logger.error('Error unverifying user:', error);
      return {
        success: false,
        error: 'Failed to remove user verification',
      };
    }
  }
}

// Export singleton instance
export const userService = new UserService();