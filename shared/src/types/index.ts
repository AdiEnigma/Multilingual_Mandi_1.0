// Supported Languages Enum
export enum SupportedLanguage {
  ENGLISH = 'en',
  ASSAMESE = 'as',
  BENGALI = 'bn',
  BODO = 'brx',
  DOGRI = 'doi',
  GUJARATI = 'gu',
  HINDI = 'hi',
  KANNADA = 'kn',
  KASHMIRI = 'ks',
  KONKANI = 'gom',
  MAITHILI = 'mai',
  MALAYALAM = 'ml',
  MANIPURI = 'mni',
  MARATHI = 'mr',
  NEPALI = 'ne',
  ODIA = 'or',
  PUNJABI = 'pa',
  SANSKRIT = 'sa',
  SANTALI = 'sat',
  SINDHI = 'sd',
  TAMIL = 'ta',
  TELUGU = 'te',
  URDU = 'ur'
}

// User Types
export type UserType = 'buyer' | 'seller' | 'both';

export interface Location {
  state: string;
  district: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  location: Location;
  preferredLanguage: SupportedLanguage;
  userType: UserType;
  reputationScore: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

export interface UserRegistrationData {
  name: string;
  phoneNumber: string;
  location: Location;
  preferredLanguage: SupportedLanguage;
  userType: UserType;
}

// Product and Listing Types
export interface ProductCategory {
  id: string;
  name: string;
  parentId?: string;
  subcategories?: ProductCategory[];
}

export interface ProductListing {
  id: string;
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
  location: Location;
  images: string[];
  language: SupportedLanguage;
  status: 'active' | 'sold' | 'expired' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  // Relations (optional for populated data)
  seller?: UserProfile;
  category?: ProductCategory;
}

// Translation Types
export interface TranslationResult {
  translatedText: string;
  confidence: number;
  detectedLanguage?: SupportedLanguage;
  error?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  originalText: string;
  originalLanguage: SupportedLanguage;
  createdAt: Date;
  // Relations (optional for populated data)
  sender?: UserProfile;
  receiver?: UserProfile;
  chat?: Chat;
}

export interface TranslatedMessage extends Message {
  translatedText: string;
  targetLanguage: SupportedLanguage;
  translationConfidence: number;
}

// Chat and Deal Types
export interface Chat {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  lastMessageAt: Date;
  dealDetails?: Deal;
}

export interface Deal {
  id: string;
  chatId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  // Relations (optional for populated data)
  buyer?: UserProfile;
  seller?: UserProfile;
  chat?: Chat;
  ratings?: Rating[];
}

// Rating and Reputation Types
export interface Rating {
  id: string;
  dealId: string;
  raterId: string;
  ratedId: string;
  rating: number; // 1-5 scale
  comment?: string;
  createdAt: Date;
  // Relations (optional for populated data)
  deal?: Deal;
  rater?: UserProfile;
  rated?: UserProfile;
}

// Price Discovery Types
export interface PriceDataSource {
  source: 'government' | 'marketplace' | 'user_listings' | 'historical';
  name: string;
  price: number;
  timestamp: Date;
  confidence: number;
}

// Database PriceData model interface
export interface PriceData {
  id: string;
  productName: string;
  category?: string;
  price: number;
  unit: string;
  source: string;
  sourceName: string;
  location?: Location;
  confidenceScore?: number;
  collectedAt: Date;
  createdAt: Date;
}

export interface PriceInsights {
  suggestedPriceRange: {
    min: number;
    max: number;
    currency: 'INR';
    unit: string;
  };
  marketTrend: 'rising' | 'falling' | 'stable';
  confidenceScore: number;
  dataSources: PriceDataSource[];
  lastUpdated: Date;
  dataFreshness: 'fresh' | 'stale' | 'outdated';
}

export interface MarketTrend {
  direction: 'rising' | 'falling' | 'stable';
  percentage: number;
  timeframe: string;
  confidence: number;
}

// AI Negotiation Types
export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    frustration: number;
    eagerness: number;
    hesitation: number;
    satisfaction: number;
  };
  urgencyLevel: number;
}

export interface NegotiationAnalysis {
  currentPhase: 'opening' | 'bargaining' | 'closing' | 'deadlock';
  sentimentTrend: SentimentAnalysis[];
  priceGap: number;
  negotiationStrength: {
    buyer: number;
    seller: number;
  };
  recommendedStrategy: string;
  riskFactors: string[];
}

export interface NegotiationSuggestion {
  suggestedPrice: number;
  reasoning: string;
  confidence: number;
  alternativeOffers: number[];
  negotiationTactics: string[];
  warningFlags: string[];
}

// Search Types
export interface SearchFilters {
  category?: string;
  location?: Location;
  priceRange?: {
    min: number;
    max: number;
  };
  sellerRating?: number;
  verified?: boolean;
}

export interface SearchQuery {
  text?: string;
  category?: string;
  location?: Location;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'distance' | 'rating';
  filters: SearchFilters;
  language: SupportedLanguage;
  page: number;
  limit: number;
}

export interface SearchFacets {
  categories: { name: string; count: number }[];
  priceRanges: { range: string; count: number }[];
  locations: { location: string; count: number }[];
}

export interface SearchResult {
  listings: ProductListing[];
  totalCount: number;
  facets: SearchFacets;
  suggestions: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  phoneNumber: string;
  otp: string;
}

export interface OTPRequest {
  phoneNumber: string;
}

// OTP Verification interface
export interface OTPVerification {
  id: string;
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

// Session interface
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface ChatEvent extends WebSocketEvent {
  type: 'message' | 'typing' | 'read' | 'user_joined' | 'user_left';
  chatId: string;
  userId: string;
}

export interface MessageEvent extends ChatEvent {
  type: 'message';
  payload: Message;
}

export interface TypingEvent extends ChatEvent {
  type: 'typing';
  payload: {
    isTyping: boolean;
  };
}