// Service interfaces for type-safe data access patterns
import {
  UserProfile,
  UserRegistrationData,
  ProductListing,
  Message,
  TranslatedMessage,
  Chat,
  Deal,
  Rating,
  PriceData,
  PriceInsights,
  SearchQuery,
  SearchResult,
  TranslationResult,
  NegotiationAnalysis,
  NegotiationSuggestion,
  SentimentAnalysis,
  ApiResponse,
  PaginatedResponse,
  SupportedLanguage,
  Location,
  OTPVerification,
  Session,
} from '../types';

// User Service Interface
export interface IUserService {
  // User management
  createUser(userData: UserRegistrationData): Promise<ApiResponse<UserProfile>>;
  getUserById(id: string): Promise<ApiResponse<UserProfile>>;
  getUserByPhoneNumber(phoneNumber: string): Promise<ApiResponse<UserProfile>>;
  updateUser(id: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>>;
  deleteUser(id: string): Promise<ApiResponse<void>>;
  
  // User search and listing
  searchUsers(query: {
    name?: string;
    location?: Partial<Location>;
    userType?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<UserProfile>>>;
  
  // Reputation management
  updateReputationScore(userId: string, newRating: number): Promise<ApiResponse<UserProfile>>;
  getUserRatings(userId: string): Promise<ApiResponse<Rating[]>>;
  
  // User verification
  verifyUser(userId: string): Promise<ApiResponse<UserProfile>>;
  unverifyUser(userId: string): Promise<ApiResponse<UserProfile>>;
}

// Authentication Service Interface
export interface IAuthService {
  // OTP operations
  sendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>>;
  verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>>;
  resendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>>;
  
  // Session management
  createSession(userId: string): Promise<ApiResponse<Session>>;
  validateSession(token: string): Promise<ApiResponse<UserProfile>>;
  refreshSession(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>>;
  revokeSession(token: string): Promise<ApiResponse<void>>;
  
  // User registration with OTP
  registerUser(userData: UserRegistrationData, otp: string): Promise<ApiResponse<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>>;
}

// Product Listing Service Interface
export interface IListingService {
  // CRUD operations
  createListing(sellerId: string, listingData: Omit<ProductListing, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProductListing>>;
  getListingById(id: string): Promise<ApiResponse<ProductListing>>;
  updateListing(id: string, sellerId: string, updates: Partial<ProductListing>): Promise<ApiResponse<ProductListing>>;
  deleteListing(id: string, sellerId: string): Promise<ApiResponse<void>>;
  
  // Listing queries
  getSellerListings(sellerId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  getActiveListings(page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  getExpiredListings(page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  
  // Search and filtering
  searchListings(query: SearchQuery): Promise<ApiResponse<SearchResult>>;
  getListingsByCategory(categoryId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  getListingsByLocation(location: Partial<Location>, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
  
  // Listing management
  markListingAsSold(id: string, sellerId: string): Promise<ApiResponse<ProductListing>>;
  renewListing(id: string, sellerId: string): Promise<ApiResponse<ProductListing>>;
  getRecommendedListings(userId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<ProductListing>>>;
}

// Chat Service Interface
export interface IChatService {
  // Chat management
  createChat(buyerId: string, sellerId: string, listingId: string): Promise<ApiResponse<Chat>>;
  getChatById(id: string): Promise<ApiResponse<Chat>>;
  getUserChats(userId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<Chat>>>;
  
  // Message operations
  sendMessage(chatId: string, senderId: string, message: string, language: SupportedLanguage): Promise<ApiResponse<Message>>;
  getChatMessages(chatId: string, userId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<TranslatedMessage>>>;
  markMessagesAsRead(chatId: string, userId: string): Promise<ApiResponse<void>>;
  
  // Chat status
  updateChatStatus(chatId: string, status: 'active' | 'completed' | 'cancelled'): Promise<ApiResponse<Chat>>;
  getActiveChatCount(userId: string): Promise<ApiResponse<{ count: number }>>;
}

// Translation Service Interface
export interface ITranslationService {
  // Translation operations
  translateText(text: string, fromLanguage: SupportedLanguage, toLanguage: SupportedLanguage): Promise<ApiResponse<TranslationResult>>;
  detectLanguage(text: string): Promise<ApiResponse<{ language: SupportedLanguage; confidence: number }>>;
  translateBulk(texts: string[], fromLanguage: SupportedLanguage, toLanguage: SupportedLanguage): Promise<ApiResponse<TranslationResult[]>>;
  
  // Translation cache
  getCachedTranslation(text: string, fromLanguage: SupportedLanguage, toLanguage: SupportedLanguage): Promise<ApiResponse<TranslationResult | null>>;
  cacheTranslation(text: string, fromLanguage: SupportedLanguage, toLanguage: SupportedLanguage, result: TranslationResult): Promise<ApiResponse<void>>;
}

// Price Discovery Service Interface
export interface IPriceDiscoveryService {
  // Price insights
  getPriceInsights(productName: string, category: string, location?: Partial<Location>): Promise<ApiResponse<PriceInsights>>;
  getMarketTrend(productName: string, timeframe?: string): Promise<ApiResponse<{ trend: 'rising' | 'falling' | 'stable'; percentage: number }>>;
  
  // Price data management
  addPriceData(priceData: Omit<PriceData, 'id' | 'createdAt'>): Promise<ApiResponse<PriceData>>;
  getPriceHistory(productName: string, category?: string, days?: number): Promise<ApiResponse<PriceData[]>>;
  updatePriceData(): Promise<ApiResponse<{ updated: number; errors: string[] }>>;
  
  // Data sources
  getDataSources(): Promise<ApiResponse<{ source: string; name: string; lastUpdated: Date; status: 'active' | 'inactive' }[]>>;
  refreshDataSource(source: string): Promise<ApiResponse<{ updated: number; errors: string[] }>>;
}

// AI Negotiation Service Interface
export interface IAINegotiationService {
  // Negotiation analysis
  analyzeNegotiation(chatId: string, userId: string): Promise<ApiResponse<NegotiationAnalysis>>;
  suggestCounterOffer(chatId: string, userId: string, currentOffer: number): Promise<ApiResponse<NegotiationSuggestion>>;
  analyzeSentiment(message: string): Promise<ApiResponse<SentimentAnalysis>>;
  
  // Negotiation insights
  getNegotiationInsights(chatId: string): Promise<ApiResponse<{
    phase: string;
    recommendations: string[];
    riskFactors: string[];
    successProbability: number;
  }>>;
  
  // AI configuration
  updateAISettings(userId: string, settings: { enableSuggestions: boolean; aggressiveness: number }): Promise<ApiResponse<void>>;
  getAISettings(userId: string): Promise<ApiResponse<{ enableSuggestions: boolean; aggressiveness: number }>>;
}

// Deal Service Interface
export interface IDealService {
  // Deal management
  createDeal(chatId: string, buyerId: string, sellerId: string, agreedPrice: number, quantity: number): Promise<ApiResponse<Deal>>;
  getDealById(id: string): Promise<ApiResponse<Deal>>;
  getUserDeals(userId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<Deal>>>;
  
  // Deal completion
  completeDeal(dealId: string, userId: string): Promise<ApiResponse<Deal>>;
  cancelDeal(dealId: string, userId: string, reason?: string): Promise<ApiResponse<Deal>>;
  
  // Rating system
  rateDeal(dealId: string, raterId: string, ratedId: string, rating: number, comment?: string): Promise<ApiResponse<Rating>>;
  getDealRatings(dealId: string): Promise<ApiResponse<Rating[]>>;
  
  // Deal statistics
  getDealStats(userId: string): Promise<ApiResponse<{
    totalDeals: number;
    completedDeals: number;
    cancelledDeals: number;
    averageRating: number;
    totalValue: number;
  }>>;
}

// Category Service Interface
export interface ICategoryService {
  // Category management
  createCategory(name: string, parentId?: string): Promise<ApiResponse<{ id: string; name: string; parentId?: string }>>;
  getCategoryById(id: string): Promise<ApiResponse<{ id: string; name: string; parentId?: string; subcategories?: any[] }>>;
  getAllCategories(): Promise<ApiResponse<{ id: string; name: string; parentId?: string }[]>>;
  updateCategory(id: string, updates: { name?: string; parentId?: string }): Promise<ApiResponse<{ id: string; name: string; parentId?: string }>>;
  deleteCategory(id: string): Promise<ApiResponse<void>>;
  
  // Category hierarchy
  getCategoryHierarchy(): Promise<ApiResponse<any[]>>;
  getCategoryPath(categoryId: string): Promise<ApiResponse<string[]>>;
  getPopularCategories(limit?: number): Promise<ApiResponse<{ id: string; name: string; listingCount: number }[]>>;
}

// Notification Service Interface
export interface INotificationService {
  // Notification management
  sendNotification(userId: string, type: string, title: string, message: string, data?: any): Promise<ApiResponse<void>>;
  getUserNotifications(userId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: Date;
  }>>>;
  
  // Notification actions
  markNotificationAsRead(notificationId: string, userId: string): Promise<ApiResponse<void>>;
  markAllNotificationsAsRead(userId: string): Promise<ApiResponse<void>>;
  deleteNotification(notificationId: string, userId: string): Promise<ApiResponse<void>>;
  
  // Notification preferences
  updateNotificationPreferences(userId: string, preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    types: string[];
  }): Promise<ApiResponse<void>>;
  getNotificationPreferences(userId: string): Promise<ApiResponse<{
    email: boolean;
    push: boolean;
    sms: boolean;
    types: string[];
  }>>;
}

// Analytics Service Interface
export interface IAnalyticsService {
  // User analytics
  trackUserEvent(userId: string, event: string, properties?: any): Promise<ApiResponse<void>>;
  getUserAnalytics(userId: string, timeframe?: string): Promise<ApiResponse<{
    profileViews: number;
    listingViews: number;
    messagesReceived: number;
    dealsCompleted: number;
  }>>;
  
  // Platform analytics
  getPlatformStats(): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    totalListings: number;
    activeListings: number;
    totalDeals: number;
    completedDeals: number;
  }>>;
  
  // Market analytics
  getMarketInsights(category?: string, location?: Partial<Location>): Promise<ApiResponse<{
    averagePrice: number;
    priceRange: { min: number; max: number };
    totalListings: number;
    averageTimeToSell: number;
    popularProducts: string[];
  }>>;
}

// File Upload Service Interface
export interface IFileUploadService {
  // File operations
  uploadFile(file: Buffer, filename: string, mimetype: string, userId: string): Promise<ApiResponse<{ url: string; filename: string }>>;
  uploadMultipleFiles(files: { buffer: Buffer; filename: string; mimetype: string }[], userId: string): Promise<ApiResponse<{ url: string; filename: string }[]>>;
  deleteFile(filename: string, userId: string): Promise<ApiResponse<void>>;
  
  // File validation
  validateFile(filename: string, mimetype: string, size: number): Promise<ApiResponse<{ valid: boolean; errors: string[] }>>;
  getFileInfo(filename: string): Promise<ApiResponse<{ size: number; mimetype: string; uploadedAt: Date }>>;
}

// Export all service interfaces

// Service factory interface for dependency injection
export interface IServiceFactory {
  userService: IUserService;
  authService: IAuthService;
  listingService: IListingService;
  chatService: IChatService;
  translationService: ITranslationService;
  priceDiscoveryService: IPriceDiscoveryService;
  aiNegotiationService: IAINegotiationService;
  dealService: IDealService;
  categoryService: ICategoryService;
  notificationService: INotificationService;
  analyticsService: IAnalyticsService;
  fileUploadService: IFileUploadService;
}

// Service configuration interface
export interface ServiceConfig {
  database: {
    url: string;
    maxConnections?: number;
    timeout?: number;
  };
  redis: {
    url: string;
    keyPrefix?: string;
  };
  translation: {
    apiKey: string;
    region: string;
    cacheEnabled?: boolean;
  };
  ai: {
    apiKey: string;
    model?: string;
    maxTokens?: number;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    storageProvider: 'local' | 's3' | 'cloudinary';
    storageConfig: any;
  };
}