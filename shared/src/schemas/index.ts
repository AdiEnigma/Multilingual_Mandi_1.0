import { z } from 'zod';
import { SupportedLanguage } from '../types';

// Location Schema
export const LocationSchema = z.object({
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
});

// User Registration Schema
export const UserRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number format'),
  location: LocationSchema,
  preferredLanguage: z.nativeEnum(SupportedLanguage),
  userType: z.enum(['buyer', 'seller', 'both'])
});

// Product Listing Schema
export const ProductListingSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters').max(200, 'Product name must be less than 200 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  quantity: z.object({
    amount: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required')
  }),
  askingPrice: z.object({
    amount: z.number().positive('Price must be positive'),
    currency: z.literal('INR'),
    unit: z.string().min(1, 'Price unit is required')
  }),
  location: LocationSchema,
  images: z.array(z.string().url()).max(10, 'Maximum 10 images allowed').optional().default([]),
  language: z.nativeEnum(SupportedLanguage)
});

// Message Schema
export const MessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  originalText: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
  originalLanguage: z.nativeEnum(SupportedLanguage),
  chatId: z.string().uuid('Invalid chat ID')
});

// Search Query Schema
export const SearchQuerySchema = z.object({
  text: z.string().max(200, 'Search text must be less than 200 characters').optional(),
  category: z.string().optional(),
  location: LocationSchema.partial().optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).refine(data => data.max >= data.min, {
    message: 'Maximum price must be greater than or equal to minimum price'
  }).optional(),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'distance', 'rating']).default('relevance'),
  language: z.nativeEnum(SupportedLanguage),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// OTP Request Schema
export const OTPRequestSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number format')
});

// Login Schema
export const LoginSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number format'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
});

// Deal Completion Schema
export const DealCompletionSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID'),
  agreedPrice: z.number().positive('Agreed price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  buyerRating: z.number().int().min(1).max(5).optional(),
  sellerRating: z.number().int().min(1).max(5).optional()
});

// Rating Schema
export const RatingSchema = z.object({
  dealId: z.string().uuid('Invalid deal ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional()
});

// Translation Request Schema
export const TranslationRequestSchema = z.object({
  text: z.string().min(1, 'Text to translate cannot be empty').max(5000, 'Text must be less than 5000 characters'),
  fromLanguage: z.nativeEnum(SupportedLanguage),
  toLanguage: z.nativeEnum(SupportedLanguage)
});

// Price Insights Request Schema
export const PriceInsightsRequestSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  location: LocationSchema.partial()
});

// User Profile Update Schema
export const UserProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  location: LocationSchema.optional(),
  preferredLanguage: z.nativeEnum(SupportedLanguage).optional(),
  userType: z.enum(['buyer', 'seller', 'both']).optional()
});

// Product Listing Update Schema
export const ProductListingUpdateSchema = ProductListingSchema.partial().extend({
  status: z.enum(['active', 'sold', 'expired', 'draft']).optional()
});

// Category Schema
export const CategorySchema = z.object({
  id: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  parentId: z.string().uuid('Invalid parent category ID').optional()
});

// Create Category Schema
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  parentId: z.string().uuid('Invalid parent category ID').optional()
});

// Chat Schema
export const ChatSchema = z.object({
  buyerId: z.string().uuid('Invalid buyer ID'),
  sellerId: z.string().uuid('Invalid seller ID'),
  listingId: z.string().uuid('Invalid listing ID')
});

// Deal Schema
export const DealSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID'),
  buyerId: z.string().uuid('Invalid buyer ID'),
  sellerId: z.string().uuid('Invalid seller ID'),
  agreedPrice: z.number().positive('Agreed price must be positive'),
  quantity: z.number().positive('Quantity must be positive')
});

// Deal Update Schema
export const DealUpdateSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  completedAt: z.date().optional()
});

// Price Data Schema
export const PriceDataSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  category: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  source: z.string().min(1, 'Source is required'),
  sourceName: z.string().min(1, 'Source name is required'),
  location: LocationSchema.partial().optional(),
  confidenceScore: z.number().min(0).max(1).optional()
});

// OTP Verification Schema
export const OTPVerificationSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number format'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
});

// Session Schema
export const SessionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(1, 'Token is required'),
  expiresAt: z.date()
});

// Bulk Operations Schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID')).min(1, 'At least one ID is required').max(100, 'Maximum 100 IDs allowed')
});

export const BulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID')).min(1, 'At least one ID is required').max(100, 'Maximum 100 IDs allowed'),
  updates: z.record(z.any())
});

// Advanced Search Schema
export const AdvancedSearchSchema = SearchQuerySchema.extend({
  filters: z.object({
    category: z.string().optional(),
    location: LocationSchema.partial().optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0)
    }).refine(data => data.max >= data.min, {
      message: 'Maximum price must be greater than or equal to minimum price'
    }).optional(),
    sellerRating: z.number().min(0).max(5).optional(),
    verified: z.boolean().optional(),
    dateRange: z.object({
      from: z.date(),
      to: z.date()
    }).refine(data => data.to >= data.from, {
      message: 'End date must be after start date'
    }).optional()
  }).optional()
});

// Notification Schema
export const NotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['message', 'deal', 'rating', 'system']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  data: z.record(z.any()).optional(),
  read: z.boolean().default(false)
});

// Analytics Schema
export const AnalyticsEventSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  event: z.string().min(1, 'Event name is required'),
  properties: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date())
});

// Report Schema
export const ReportSchema = z.object({
  reporterId: z.string().uuid('Invalid reporter ID'),
  reportedId: z.string().uuid('Invalid reported user ID'),
  type: z.enum(['spam', 'fraud', 'inappropriate', 'other']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason must be less than 1000 characters'),
  evidence: z.array(z.string().url()).max(10, 'Maximum 10 evidence files allowed').optional()
});

// Validation helper functions
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return /^\+91[6-9]\d{9}$/.test(phoneNumber);
};

export const validatePincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

export const validateUUID = (uuid: string): boolean => {
  return z.string().uuid().safeParse(uuid).success;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 91, add +
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // If it's 10 digits, add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  return phoneNumber; // Return as-is if format is unclear
};

// File Upload Schema
export const FileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Only JPEG, PNG, and WebP images are allowed'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB')
});

// Environment Variables Schema
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('8000'),
  DATABASE_URL: z.string().url('Invalid database URL'),
  REDIS_URL: z.string().url('Invalid Redis URL'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  AZURE_TRANSLATOR_KEY: z.string().min(1, 'Azure Translator API key is required'),
  AZURE_TRANSLATOR_REGION: z.string().min(1, 'Azure Translator region is required'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  FRONTEND_URL: z.string().url('Invalid frontend URL'),
  BACKEND_URL: z.string().url('Invalid backend URL')
});

// Export all schemas
export * from '../types';