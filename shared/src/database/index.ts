// Database utilities and type-safe data access patterns
import { 
  UserProfile, 
  ProductListing, 
  Message, 
  Chat, 
  Deal, 
  Rating, 
  PriceData,
  Location,
  SupportedLanguage,
  UserType
} from '../types';

// Type-safe database query builders
export interface DatabaseQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  include?: string[];
}

export interface UserQueryOptions extends DatabaseQueryOptions {
  userType?: UserType;
  isVerified?: boolean;
  minReputationScore?: number;
  location?: Partial<Location>;
}

export interface ListingQueryOptions extends DatabaseQueryOptions {
  sellerId?: string;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: Partial<Location>;
  language?: SupportedLanguage;
  isExpired?: boolean;
}

export interface MessageQueryOptions extends DatabaseQueryOptions {
  chatId?: string;
  senderId?: string;
  receiverId?: string;
  language?: SupportedLanguage;
  fromDate?: Date;
  toDate?: Date;
}

export interface PriceDataQueryOptions extends DatabaseQueryOptions {
  productName?: string;
  category?: string;
  source?: string;
  minConfidence?: number;
  location?: Partial<Location>;
  fromDate?: Date;
  toDate?: Date;
}

// Database transformation utilities
export const transformDatabaseUser = (dbUser: any): UserProfile => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    phoneNumber: dbUser.phoneNumber,
    location: {
      state: dbUser.locationState,
      district: dbUser.locationDistrict,
      pincode: dbUser.locationPincode,
      coordinates: dbUser.locationLat && dbUser.locationLng ? {
        latitude: dbUser.locationLat,
        longitude: dbUser.locationLng,
      } : undefined,
    },
    preferredLanguage: dbUser.preferredLanguage as SupportedLanguage,
    userType: dbUser.userType as UserType,
    reputationScore: dbUser.reputationScore,
    isVerified: dbUser.isVerified,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
    lastActive: dbUser.lastActive,
  };
};

export const transformDatabaseListing = (dbListing: any): ProductListing => {
  return {
    id: dbListing.id,
    sellerId: dbListing.sellerId,
    productName: dbListing.productName,
    categoryId: dbListing.categoryId,
    description: dbListing.description,
    quantity: {
      amount: dbListing.quantityAmount,
      unit: dbListing.quantityUnit,
    },
    askingPrice: {
      amount: dbListing.priceAmount,
      currency: dbListing.priceCurrency,
      unit: dbListing.priceUnit,
    },
    location: {
      state: dbListing.locationState,
      district: dbListing.locationDistrict,
      pincode: dbListing.locationPincode,
      coordinates: dbListing.locationLat && dbListing.locationLng ? {
        latitude: dbListing.locationLat,
        longitude: dbListing.locationLng,
      } : undefined,
    },
    images: dbListing.images ? dbListing.images.split(',').filter(Boolean) : [],
    language: dbListing.language as SupportedLanguage,
    status: dbListing.status as 'active' | 'sold' | 'expired' | 'draft',
    createdAt: dbListing.createdAt,
    updatedAt: dbListing.updatedAt,
    expiresAt: dbListing.expiresAt,
    // Include relations if populated
    seller: dbListing.seller ? transformDatabaseUser(dbListing.seller) : undefined,
    category: dbListing.category ? {
      id: dbListing.category.id,
      name: dbListing.category.name,
      parentId: dbListing.category.parentId,
    } : undefined,
  };
};

export const transformDatabaseMessage = (dbMessage: any): Message => {
  return {
    id: dbMessage.id,
    chatId: dbMessage.chatId,
    senderId: dbMessage.senderId,
    receiverId: dbMessage.receiverId,
    originalText: dbMessage.originalText,
    originalLanguage: dbMessage.originalLanguage as SupportedLanguage,
    createdAt: dbMessage.createdAt,
    // Include relations if populated
    sender: dbMessage.sender ? transformDatabaseUser(dbMessage.sender) : undefined,
    receiver: dbMessage.receiver ? transformDatabaseUser(dbMessage.receiver) : undefined,
    chat: dbMessage.chat ? transformDatabaseChat(dbMessage.chat) : undefined,
  };
};

export const transformDatabaseChat = (dbChat: any): Chat => {
  return {
    id: dbChat.id,
    buyerId: dbChat.buyerId,
    sellerId: dbChat.sellerId,
    listingId: dbChat.listingId,
    status: dbChat.status as 'active' | 'completed' | 'cancelled',
    createdAt: dbChat.createdAt,
    lastMessageAt: dbChat.lastMessageAt,
    // Include deal details if populated
    dealDetails: dbChat.deals && dbChat.deals.length > 0 ? transformDatabaseDeal(dbChat.deals[0]) : undefined,
  };
};

export const transformDatabaseDeal = (dbDeal: any): Deal => {
  return {
    id: dbDeal.id,
    chatId: dbDeal.chatId,
    buyerId: dbDeal.buyerId,
    sellerId: dbDeal.sellerId,
    agreedPrice: dbDeal.agreedPrice,
    quantity: dbDeal.quantity,
    status: dbDeal.status as 'pending' | 'completed' | 'cancelled',
    createdAt: dbDeal.createdAt,
    completedAt: dbDeal.completedAt,
    // Include relations if populated
    buyer: dbDeal.buyer ? transformDatabaseUser(dbDeal.buyer) : undefined,
    seller: dbDeal.seller ? transformDatabaseUser(dbDeal.seller) : undefined,
    chat: dbDeal.chat ? transformDatabaseChat(dbDeal.chat) : undefined,
    ratings: dbDeal.ratings ? dbDeal.ratings.map(transformDatabaseRating) : undefined,
  };
};

export const transformDatabaseRating = (dbRating: any): Rating => {
  return {
    id: dbRating.id,
    dealId: dbRating.dealId,
    raterId: dbRating.raterId,
    ratedId: dbRating.ratedId,
    rating: dbRating.rating,
    comment: dbRating.comment,
    createdAt: dbRating.createdAt,
    // Include relations if populated
    deal: dbRating.deal ? transformDatabaseDeal(dbRating.deal) : undefined,
    rater: dbRating.rater ? transformDatabaseUser(dbRating.rater) : undefined,
    rated: dbRating.rated ? transformDatabaseUser(dbRating.rated) : undefined,
  };
};

export const transformDatabasePriceData = (dbPriceData: any): PriceData => {
  return {
    id: dbPriceData.id,
    productName: dbPriceData.productName,
    category: dbPriceData.category,
    price: dbPriceData.price,
    unit: dbPriceData.unit,
    source: dbPriceData.source,
    sourceName: dbPriceData.sourceName,
    location: dbPriceData.locationState ? {
      state: dbPriceData.locationState,
      district: dbPriceData.locationDistrict,
      pincode: dbPriceData.locationPincode,
    } : undefined,
    confidenceScore: dbPriceData.confidenceScore,
    collectedAt: dbPriceData.collectedAt,
    createdAt: dbPriceData.createdAt,
  };
};

// Query builders for common database operations
export const buildUserQuery = (options: UserQueryOptions = {}) => {
  const where: any = {};
  
  if (options.userType) where.userType = options.userType;
  if (options.isVerified !== undefined) where.isVerified = options.isVerified;
  if (options.minReputationScore !== undefined) where.reputationScore = { gte: options.minReputationScore };
  
  if (options.location) {
    if (options.location.state) where.locationState = options.location.state;
    if (options.location.district) where.locationDistrict = options.location.district;
    if (options.location.pincode) where.locationPincode = options.location.pincode;
  }
  
  const query: any = { where };
  
  if (options.page && options.limit) {
    query.skip = (options.page - 1) * options.limit;
    query.take = options.limit;
  }
  
  if (options.sortBy) {
    query.orderBy = { [options.sortBy]: options.sortDirection || 'asc' };
  }
  
  if (options.include) {
    query.include = options.include.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);
  }
  
  return query;
};

export const buildListingQuery = (options: ListingQueryOptions = {}) => {
  const where: any = {};
  
  if (options.sellerId) where.sellerId = options.sellerId;
  if (options.categoryId) where.categoryId = options.categoryId;
  if (options.status) where.status = options.status;
  if (options.language) where.language = options.language;
  
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    if (options.minPrice !== undefined) where.priceAmount = { gte: options.minPrice };
    if (options.maxPrice !== undefined) {
      where.priceAmount = { ...where.priceAmount, lte: options.maxPrice };
    }
  }
  
  if (options.isExpired !== undefined) {
    if (options.isExpired) {
      where.expiresAt = { lt: new Date() };
    } else {
      where.expiresAt = { gte: new Date() };
    }
  }
  
  if (options.location) {
    if (options.location.state) where.locationState = options.location.state;
    if (options.location.district) where.locationDistrict = options.location.district;
    if (options.location.pincode) where.locationPincode = options.location.pincode;
  }
  
  const query: any = { where };
  
  if (options.page && options.limit) {
    query.skip = (options.page - 1) * options.limit;
    query.take = options.limit;
  }
  
  if (options.sortBy) {
    query.orderBy = { [options.sortBy]: options.sortDirection || 'asc' };
  }
  
  if (options.include) {
    query.include = options.include.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);
  }
  
  return query;
};

export const buildMessageQuery = (options: MessageQueryOptions = {}) => {
  const where: any = {};
  
  if (options.chatId) where.chatId = options.chatId;
  if (options.senderId) where.senderId = options.senderId;
  if (options.receiverId) where.receiverId = options.receiverId;
  if (options.language) where.originalLanguage = options.language;
  
  if (options.fromDate || options.toDate) {
    where.createdAt = {};
    if (options.fromDate) where.createdAt.gte = options.fromDate;
    if (options.toDate) where.createdAt.lte = options.toDate;
  }
  
  const query: any = { where };
  
  if (options.page && options.limit) {
    query.skip = (options.page - 1) * options.limit;
    query.take = options.limit;
  }
  
  if (options.sortBy) {
    query.orderBy = { [options.sortBy]: options.sortDirection || 'asc' };
  } else {
    query.orderBy = { createdAt: 'desc' }; // Default to newest first
  }
  
  if (options.include) {
    query.include = options.include.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);
  }
  
  return query;
};

export const buildPriceDataQuery = (options: PriceDataQueryOptions = {}) => {
  const where: any = {};
  
  if (options.productName) {
    where.productName = { contains: options.productName, mode: 'insensitive' };
  }
  if (options.category) where.category = options.category;
  if (options.source) where.source = options.source;
  if (options.minConfidence !== undefined) {
    where.confidenceScore = { gte: options.minConfidence };
  }
  
  if (options.fromDate || options.toDate) {
    where.collectedAt = {};
    if (options.fromDate) where.collectedAt.gte = options.fromDate;
    if (options.toDate) where.collectedAt.lte = options.toDate;
  }
  
  if (options.location) {
    if (options.location.state) where.locationState = options.location.state;
    if (options.location.district) where.locationDistrict = options.location.district;
    if (options.location.pincode) where.locationPincode = options.location.pincode;
  }
  
  const query: any = { where };
  
  if (options.page && options.limit) {
    query.skip = (options.page - 1) * options.limit;
    query.take = options.limit;
  }
  
  if (options.sortBy) {
    query.orderBy = { [options.sortBy]: options.sortDirection || 'desc' };
  } else {
    query.orderBy = { collectedAt: 'desc' }; // Default to newest first
  }
  
  return query;
};

// Common database operations
export const createPaginationInfo = (
  page: number,
  limit: number,
  totalCount: number
) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  return {
    page,
    limit,
    total: totalCount,
    totalPages,
  };
};

// Database validation helpers
export const validateDatabaseConnection = async (prisma: any): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection validation failed:', error);
    return false;
  }
};

export const validateRequiredFields = <T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(String(field));
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

// Database error handling
export const isDatabaseError = (error: any): boolean => {
  return error?.code?.startsWith('P') || error?.name === 'PrismaClientKnownRequestError';
};

export const parseDatabaseError = (error: any): { code: string; message: string; field?: string } => {
  if (error?.code === 'P2002') {
    return {
      code: 'UNIQUE_CONSTRAINT_VIOLATION',
      message: 'A record with this value already exists',
      field: error?.meta?.target?.[0],
    };
  }
  
  if (error?.code === 'P2025') {
    return {
      code: 'RECORD_NOT_FOUND',
      message: 'The requested record was not found',
    };
  }
  
  if (error?.code === 'P2003') {
    return {
      code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
      message: 'The referenced record does not exist',
      field: error?.meta?.field_name,
    };
  }
  
  return {
    code: 'DATABASE_ERROR',
    message: error?.message || 'An unknown database error occurred',
  };
};

// Export all transformation functions as a utility object
export const DatabaseTransformers = {
  user: transformDatabaseUser,
  listing: transformDatabaseListing,
  message: transformDatabaseMessage,
  chat: transformDatabaseChat,
  deal: transformDatabaseDeal,
  rating: transformDatabaseRating,
  priceData: transformDatabasePriceData,
};

// Export all query builders as a utility object
export const QueryBuilders = {
  user: buildUserQuery,
  listing: buildListingQuery,
  message: buildMessageQuery,
  priceData: buildPriceDataQuery,
};