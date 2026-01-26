import { SupportedLanguage } from '../types';

// Language utilities
export const SUPPORTED_LANGUAGES = Object.values(SupportedLanguage);

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  [SupportedLanguage.ENGLISH]: 'English',
  [SupportedLanguage.ASSAMESE]: 'অসমীয়া',
  [SupportedLanguage.BENGALI]: 'বাংলা',
  [SupportedLanguage.BODO]: 'बर\'',
  [SupportedLanguage.DOGRI]: 'डोगरी',
  [SupportedLanguage.GUJARATI]: 'ગુજરાતી',
  [SupportedLanguage.HINDI]: 'हिन्दी',
  [SupportedLanguage.KANNADA]: 'ಕನ್ನಡ',
  [SupportedLanguage.KASHMIRI]: 'कॉशुर',
  [SupportedLanguage.KONKANI]: 'कोंकणी',
  [SupportedLanguage.MAITHILI]: 'मैथिली',
  [SupportedLanguage.MALAYALAM]: 'മലയാളം',
  [SupportedLanguage.MANIPURI]: 'মৈতৈলোন্',
  [SupportedLanguage.MARATHI]: 'मराठी',
  [SupportedLanguage.NEPALI]: 'नेपाली',
  [SupportedLanguage.ODIA]: 'ଓଡ଼ିଆ',
  [SupportedLanguage.PUNJABI]: 'ਪੰਜਾਬੀ',
  [SupportedLanguage.SANSKRIT]: 'संस्कृतम्',
  [SupportedLanguage.SANTALI]: 'ᱥᱟᱱᱛᱟᱲᱤ',
  [SupportedLanguage.SINDHI]: 'سنڌي',
  [SupportedLanguage.TAMIL]: 'தமிழ்',
  [SupportedLanguage.TELUGU]: 'తెలుగు',
  [SupportedLanguage.URDU]: 'اردو'
};

export const LANGUAGE_ENGLISH_NAMES: Record<SupportedLanguage, string> = {
  [SupportedLanguage.ENGLISH]: 'English',
  [SupportedLanguage.ASSAMESE]: 'Assamese',
  [SupportedLanguage.BENGALI]: 'Bengali',
  [SupportedLanguage.BODO]: 'Bodo',
  [SupportedLanguage.DOGRI]: 'Dogri',
  [SupportedLanguage.GUJARATI]: 'Gujarati',
  [SupportedLanguage.HINDI]: 'Hindi',
  [SupportedLanguage.KANNADA]: 'Kannada',
  [SupportedLanguage.KASHMIRI]: 'Kashmiri',
  [SupportedLanguage.KONKANI]: 'Konkani',
  [SupportedLanguage.MAITHILI]: 'Maithili',
  [SupportedLanguage.MALAYALAM]: 'Malayalam',
  [SupportedLanguage.MANIPURI]: 'Manipuri',
  [SupportedLanguage.MARATHI]: 'Marathi',
  [SupportedLanguage.NEPALI]: 'Nepali',
  [SupportedLanguage.ODIA]: 'Odia',
  [SupportedLanguage.PUNJABI]: 'Punjabi',
  [SupportedLanguage.SANSKRIT]: 'Sanskrit',
  [SupportedLanguage.SANTALI]: 'Santali',
  [SupportedLanguage.SINDHI]: 'Sindhi',
  [SupportedLanguage.TAMIL]: 'Tamil',
  [SupportedLanguage.TELUGU]: 'Telugu',
  [SupportedLanguage.URDU]: 'Urdu'
};

// Utility functions
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export function getLanguageName(lang: SupportedLanguage, inEnglish = false): string {
  return inEnglish ? LANGUAGE_ENGLISH_NAMES[lang] : LANGUAGE_NAMES[lang];
}

// Phone number utilities
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add +91 prefix if not present
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  } else if (digits.length === 13 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  return phoneNumber; // Return as-is if format is unclear
}

export function isValidIndianPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

// Price utilities
export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPriceCompact(amount: number): string {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount}`;
  }
}

// Date utilities
export function formatDate(date: Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatDateTime(date: Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getRelativeTime(date: Date, locale = 'en-IN'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
  }
}

// Distance utilities
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 100) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Object utilities
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Error utilities
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createError(message: string, statusCode: number, code: string): AppError {
  return new AppError(message, statusCode, code);
}

// Data transformation utilities for Prisma models
export const transformPrismaUser = (prismaUser: any) => {
  return {
    ...prismaUser,
    location: typeof prismaUser.location === 'string' 
      ? JSON.parse(prismaUser.location) 
      : prismaUser.location,
  };
};

export const transformPrismaListing = (prismaListing: any) => {
  return {
    ...prismaListing,
    location: typeof prismaListing.location === 'string' 
      ? JSON.parse(prismaListing.location) 
      : prismaListing.location,
    quantity: typeof prismaListing.quantity === 'string' 
      ? JSON.parse(prismaListing.quantity) 
      : prismaListing.quantity,
    askingPrice: typeof prismaListing.askingPrice === 'string' 
      ? JSON.parse(prismaListing.askingPrice) 
      : prismaListing.askingPrice,
  };
};

export const transformPrismaPriceData = (prismaPriceData: any) => {
  return {
    ...prismaPriceData,
    location: prismaPriceData.location && typeof prismaPriceData.location === 'string' 
      ? JSON.parse(prismaPriceData.location) 
      : prismaPriceData.location,
  };
};

// Database query helpers
export const buildPaginationQuery = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const buildSortQuery = (sortBy: string, direction: 'asc' | 'desc' = 'asc') => {
  return { [sortBy]: direction };
};

// Type-safe data access patterns
export const safeJsonParse = <T>(jsonString: string | null | undefined, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
};

// Constants for the application
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const OTP_EXPIRY_MINUTES = 10;
export const SESSION_EXPIRY_HOURS = 24;
export const LISTING_EXPIRY_DAYS = 30;
export const MAX_IMAGES_PER_LISTING = 10;
export const MIN_REPUTATION_SCORE = 0;
export const MAX_REPUTATION_SCORE = 5;
export const DEFAULT_REPUTATION_SCORE = 0;

// Business logic utilities
export const calculateReputationScore = (ratings: number[]): number => {
  if (ratings.length === 0) return DEFAULT_REPUTATION_SCORE;
  
  // Weight recent ratings more heavily
  const weightedSum = ratings.reduce((sum, rating, index) => {
    const weight = Math.pow(0.9, ratings.length - index - 1); // More recent = higher weight
    return sum + (rating * weight);
  }, 0);
  
  const weightSum = ratings.reduce((sum, _, index) => {
    const weight = Math.pow(0.9, ratings.length - index - 1);
    return sum + weight;
  }, 0);
  
  return Math.round((weightedSum / weightSum) * 100) / 100; // Round to 2 decimal places
};

export const isListingExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

export const isListingActive = (status: string, expiresAt: Date): boolean => {
  return status === 'active' && !isListingExpired(expiresAt);
};

export const calculateListingExpiryDate = (createdAt: Date = new Date()): Date => {
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + LISTING_EXPIRY_DAYS);
  return expiryDate;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const isOTPExpired = (createdAt: Date): boolean => {
  const expiryTime = new Date(createdAt);
  expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);
  return new Date() > expiryTime;
};

export const isSessionExpired = (createdAt: Date): boolean => {
  const expiryTime = new Date(createdAt);
  expiryTime.setHours(expiryTime.getHours() + SESSION_EXPIRY_HOURS);
  return new Date() > expiryTime;
};

// Search utilities
export const normalizeSearchQuery = (query: string): string => {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, ''); // Remove special characters
};

export const buildSearchTerms = (query: string): string[] => {
  return normalizeSearchQuery(query)
    .split(' ')
    .filter(term => term.length > 2); // Only include terms longer than 2 characters
};

// Price utilities specific to marketplace
export const calculatePriceRange = (prices: number[], confidenceThreshold: number = 0.7): { min: number; max: number } => {
  if (prices.length === 0) return { min: 0, max: 0 };
  
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const q1Index = Math.floor(sortedPrices.length * 0.25);
  const q3Index = Math.floor(sortedPrices.length * 0.75);
  
  const q1 = sortedPrices[q1Index];
  const q3 = sortedPrices[q3Index];
  
  // Use interquartile range for price suggestions
  return {
    min: Math.max(0, q1),
    max: q3
  };
};

export const calculateMarketTrend = (
  currentPrices: number[], 
  historicalPrices: number[]
): 'rising' | 'falling' | 'stable' => {
  if (currentPrices.length === 0 || historicalPrices.length === 0) return 'stable';
  
  const currentAvg = currentPrices.reduce((sum, price) => sum + price, 0) / currentPrices.length;
  const historicalAvg = historicalPrices.reduce((sum, price) => sum + price, 0) / historicalPrices.length;
  
  const changePercent = ((currentAvg - historicalAvg) / historicalAvg) * 100;
  
  if (changePercent > 5) return 'rising';
  if (changePercent < -5) return 'falling';
  return 'stable';
};

export const calculateConfidenceScore = (
  dataPoints: number,
  dataFreshness: number, // days since last update
  sourceReliability: number // 0-1 scale
): number => {
  const dataPointsScore = Math.min(dataPoints / 10, 1); // Max score at 10+ data points
  const freshnessScore = Math.max(0, 1 - (dataFreshness / 7)); // Decreases over 7 days
  
  return Math.round((dataPointsScore * 0.4 + freshnessScore * 0.3 + sourceReliability * 0.3) * 100) / 100;
};