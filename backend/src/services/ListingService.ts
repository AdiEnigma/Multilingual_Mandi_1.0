import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import {
  ApiResponse,
  ProductListing,
  PaginatedResponse,
  SearchQuery,
  SearchResult,
  validateRequiredFields,
} from '@marketplace-mandi/shared';

export interface CreateListingData {
  sellerId: string;
  productName: string;
  categoryId: string;
  description?: string;
  quantity: {
    amount: number;
    unit: string;
  };
  askingPrice: {
    amount: number;
    currency: 'INR';
    unit: string;
  };
  location: {
    state: string;
    district: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  language: string;
  expiresAt?: Date;
}

export interface UpdateListingData {
  productName?: string;
  categoryId?: string;
  description?: string;
  quantity?: {
    amount: number;
    unit: string;
  };
  askingPrice?: {
    amount: number;
    currency: 'INR';
    unit: string;
  };
  location?: {
    state: string;
    district: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images?: string[];
  status?: 'active' | 'sold' | 'expired' | 'draft';
  expiresAt?: Date;
}

export interface ListingFilters {
  sellerId?: string;
  categoryId?: string;
  status?: string;
  location?: {
    state?: string;
    district?: string;
    pincode?: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface IListingService {
  createListing(data: CreateListingData): Promise<ApiResponse<ProductListing>>;
  getListingById(id: string): Promise<ApiResponse<ProductListing>>;
  updateListing(id: string, data: UpdateListingData): Promise<ApiResponse<ProductListing>>;
  deleteListing(id: string): Promise<ApiResponse<void>>;
  getListings(filters: ListingFilters, page: number, limit: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  getUserListings(userId: string, page: number, limit: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  searchListings(query: SearchQuery): Promise<ApiResponse<SearchResult>>;
  expireOldListings(): Promise<ApiResponse<{ expiredCount: number }>>;
}

export class ListingService implements IListingService {
  async createListing(data: CreateListingData): Promise<ApiResponse<ProductListing>> {
    try {
      // Validate required fields
      const validation = validateRequiredFields(data, [
        'sellerId',
        'productName',
        'categoryId',
        'quantity',
        'askingPrice',
        'location',
        'language',
      ]);

      if (!validation.isValid) {
        return {
          success: false,
          error: `Missing required fields: ${validation.missingFields.join(', ')}`,
        };
      }

      // Validate seller exists
      const seller = await prisma.user.findUnique({
        where: { id: data.sellerId },
      });

      if (!seller) {
        return {
          success: false,
          error: 'Seller not found',
        };
      }

      // Validate category exists
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      // Set default expiry (30 days from now)
      const expiresAt = data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Create listing
      const listing = await prisma.productListing.create({
        data: {
          sellerId: data.sellerId,
          productName: data.productName,
          categoryId: data.categoryId,
          description: data.description,
          quantityAmount: data.quantity.amount,
          quantityUnit: data.quantity.unit,
          priceAmount: data.askingPrice.amount,
          priceCurrency: data.askingPrice.currency,
          priceUnit: data.askingPrice.unit,
          locationState: data.location.state,
          locationDistrict: data.location.district,
          locationPincode: data.location.pincode,
          locationLat: data.location.coordinates?.latitude || null,
          locationLng: data.location.coordinates?.longitude || null,
          images: data.images.length > 0 ? data.images.join(',') : undefined,
          language: data.language,
          status: 'active',
          expiresAt,
        } as any,
        include: {
          seller: true,
          category: true,
        },
      });

      logger.info(`Listing created: ${listing.id} by seller ${data.sellerId}`);

      return {
        success: true,
        data: this.transformListing(listing),
        message: 'Listing created successfully',
      };
    } catch (error) {
      logger.error('Error in createListing:', error);
      return {
        success: false,
        error: 'Failed to create listing',
      };
    }
  }

  async getListingById(id: string): Promise<ApiResponse<ProductListing>> {
    try {
      const listing = await prisma.productListing.findUnique({
        where: { id },
        include: {
          seller: true,
          category: true,
        },
      });

      if (!listing) {
        return {
          success: false,
          error: 'Listing not found',
        };
      }

      return {
        success: true,
        data: this.transformListing(listing),
      };
    } catch (error) {
      logger.error('Error in getListingById:', error);
      return {
        success: false,
        error: 'Failed to get listing',
      };
    }
  }

  async updateListing(id: string, data: UpdateListingData): Promise<ApiResponse<ProductListing>> {
    try {
      // Check if listing exists
      const existingListing = await prisma.productListing.findUnique({
        where: { id },
      });

      if (!existingListing) {
        return {
          success: false,
          error: 'Listing not found',
        };
      }

      // Validate category if provided
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          return {
            success: false,
            error: 'Category not found',
          };
        }
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Handle simple fields
      if (data.productName) updateData.productName = data.productName;
      if (data.categoryId) updateData.categoryId = data.categoryId;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status) updateData.status = data.status;
      if (data.expiresAt) updateData.expiresAt = data.expiresAt;

      // Handle quantity
      if (data.quantity) {
        updateData.quantityAmount = data.quantity.amount;
        updateData.quantityUnit = data.quantity.unit;
      }

      // Handle asking price
      if (data.askingPrice) {
        updateData.priceAmount = data.askingPrice.amount;
        updateData.priceCurrency = data.askingPrice.currency;
        updateData.priceUnit = data.askingPrice.unit;
      }

      // Handle location
      if (data.location) {
        updateData.locationState = data.location.state;
        updateData.locationDistrict = data.location.district;
        updateData.locationPincode = data.location.pincode;
        updateData.locationLat = data.location.coordinates?.latitude || null;
        updateData.locationLng = data.location.coordinates?.longitude || null;
      }

      // Handle images
      if (data.images) {
        updateData.images = data.images.join(',');
      }

      // Update listing
      const updatedListing = await prisma.productListing.update({
        where: { id },
        data: updateData,
        include: {
          seller: true,
          category: true,
        },
      });

      logger.info(`Listing updated: ${id}`);

      return {
        success: true,
        data: this.transformListing(updatedListing),
        message: 'Listing updated successfully',
      };
    } catch (error) {
      logger.error('Error in updateListing:', error);
      return {
        success: false,
        error: 'Failed to update listing',
      };
    }
  }

  async deleteListing(id: string): Promise<ApiResponse<void>> {
    try {
      // Check if listing exists
      const existingListing = await prisma.productListing.findUnique({
        where: { id },
      });

      if (!existingListing) {
        return {
          success: false,
          error: 'Listing not found',
        };
      }

      // Delete listing (cascade will handle related records)
      await prisma.productListing.delete({
        where: { id },
      });

      logger.info(`Listing deleted: ${id}`);

      return {
        success: true,
        message: 'Listing deleted successfully',
      };
    } catch (error) {
      logger.error('Error in deleteListing:', error);
      return {
        success: false,
        error: 'Failed to delete listing',
      };
    }
  }

  async getListings(
    filters: ListingFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ProductListing>>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.sellerId) {
        where.sellerId = filters.sellerId;
      }

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        where.OR = [
          { productName: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.priceRange) {
        where.priceAmount = {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max,
        };
      }

      // Location filtering (if provided)
      if (filters.location) {
        if (filters.location.state) {
          where.locationState = filters.location.state;
        }
        if (filters.location.district) {
          where.locationDistrict = filters.location.district;
        }
        if (filters.location.pincode) {
          where.locationPincode = filters.location.pincode;
        }
      }

      // Get listings with pagination
      const [listings, total] = await Promise.all([
        prisma.productListing.findMany({
          where,
          include: {
            seller: true,
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.productListing.count({ where }),
      ]);

      const transformedListings = listings.map((listing: any) => this.transformListing(listing));

      return {
        success: true,
        data: {
          data: transformedListings,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      logger.error('Error in getListings:', error);
      return {
        success: false,
        error: 'Failed to get listings',
      };
    }
  }

  async getUserListings(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ProductListing>>> {
    return this.getListings({ sellerId: userId }, page, limit);
  }

  async searchListings(query: SearchQuery): Promise<ApiResponse<SearchResult>> {
    try {
      const filters: ListingFilters = {
        search: query.text,
        categoryId: query.category,
        location: query.location,
        priceRange: query.priceRange,
      };

      const result = await this.getListings(filters, query.page, query.limit);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      // For now, return basic search result
      // TODO: Implement facets and suggestions in future iterations
      const searchResult: SearchResult = {
        listings: result.data!.data,
        totalCount: result.data!.pagination.total,
        facets: {
          categories: [],
          priceRanges: [],
          locations: [],
        },
        suggestions: [],
      };

      return {
        success: true,
        data: searchResult,
      };
    } catch (error) {
      logger.error('Error in searchListings:', error);
      return {
        success: false,
        error: 'Failed to search listings',
      };
    }
  }

  async expireOldListings(): Promise<ApiResponse<{ expiredCount: number }>> {
    try {
      const now = new Date();

      const result = await prisma.productListing.updateMany({
        where: {
          expiresAt: {
            lt: now,
          },
          status: 'active',
        },
        data: {
          status: 'expired',
          updatedAt: now,
        },
      });

      logger.info(`Expired ${result.count} old listings`);

      return {
        success: true,
        data: { expiredCount: result.count },
        message: `Expired ${result.count} old listings`,
      };
    } catch (error) {
      logger.error('Error in expireOldListings:', error);
      return {
        success: false,
        error: 'Failed to expire old listings',
      };
    }
  }

  /**
   * Transform database listing to API format
   */
  private transformListing(listing: any): ProductListing {
    return {
      id: listing.id,
      sellerId: listing.sellerId,
      productName: listing.productName,
      categoryId: listing.categoryId,
      description: listing.description,
      quantity: {
        amount: listing.quantityAmount,
        unit: listing.quantityUnit,
      },
      askingPrice: {
        amount: listing.priceAmount,
        currency: listing.priceCurrency,
        unit: listing.priceUnit,
      },
      location: {
        state: listing.locationState,
        district: listing.locationDistrict,
        pincode: listing.locationPincode,
        coordinates: listing.locationLat && listing.locationLng ? {
          latitude: listing.locationLat,
          longitude: listing.locationLng,
        } : undefined,
      },
      images: listing.images ? listing.images.split(',').filter(Boolean) : [],
      language: listing.language,
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      expiresAt: listing.expiresAt,
      seller: listing.seller ? {
        id: listing.seller.id,
        name: listing.seller.name,
        phoneNumber: listing.seller.phoneNumber,
        location: {
          state: (listing.seller as any).locationState,
          district: (listing.seller as any).locationDistrict,
          pincode: (listing.seller as any).locationPincode,
          coordinates: (listing.seller as any).locationLat && (listing.seller as any).locationLng ? {
            latitude: (listing.seller as any).locationLat,
            longitude: (listing.seller as any).locationLng,
          } : undefined,
        },
        preferredLanguage: listing.seller.preferredLanguage,
        userType: listing.seller.userType,
        reputationScore: listing.seller.reputationScore,
        isVerified: listing.seller.isVerified,
        createdAt: listing.seller.createdAt,
        updatedAt: listing.seller.updatedAt,
        lastActive: listing.seller.lastActive,
      } : undefined,
      category: listing.category ? {
        id: listing.category.id,
        name: listing.category.name,
        parentId: listing.category.parentId,
      } : undefined,
    };
  }
}

// Export singleton instance
export const listingService = new ListingService();