// API client using shared types and schemas
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  UserProfile,
  UserRegistrationData,
  ProductListing,
  SearchQuery,
  SearchResult,
  ApiResponse,
  PaginatedResponse,
  UserRegistrationSchema,
  ProductListingSchema,
  SearchQuerySchema,
  SupportedLanguage,
} from '@marketplace-mandi/shared';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          // Redirect to login or refresh token
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // User API methods
  async registerUser(userData: UserRegistrationData): Promise<ApiResponse<UserProfile>> {
    try {
      // Validate data using shared schema
      const validatedData = UserRegistrationSchema.parse(userData);
      
      const response: AxiosResponse<ApiResponse<UserProfile>> = await this.client.post(
        '/api/auth/register',
        validatedData
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const response: AxiosResponse<ApiResponse<UserProfile>> = await this.client.get('/api/users/me');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user profile',
      };
    }
  }

  async updateUser(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response: AxiosResponse<ApiResponse<UserProfile>> = await this.client.put(
        '/api/users/me',
        updates
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user profile',
      };
    }
  }

  // Listing API methods
  async createListing(listingData: Omit<ProductListing, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProductListing>> {
    try {
      // Validate data using shared schema
      const validatedData = ProductListingSchema.parse(listingData);
      
      const response: AxiosResponse<ApiResponse<ProductListing>> = await this.client.post(
        '/api/listings',
        validatedData
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create listing',
      };
    }
  }

  async getListings(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<ProductListing>>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<ProductListing>>> = await this.client.get(
        `/api/listings?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch listings',
      };
    }
  }

  async getListingById(id: string): Promise<ApiResponse<ProductListing>> {
    try {
      const response: AxiosResponse<ApiResponse<ProductListing>> = await this.client.get(
        `/api/listings/${id}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch listing',
      };
    }
  }

  async searchListings(query: SearchQuery): Promise<ApiResponse<SearchResult>> {
    try {
      // Validate search query using shared schema
      const validatedQuery = SearchQuerySchema.parse(query);
      
      const response: AxiosResponse<ApiResponse<SearchResult>> = await this.client.post(
        '/api/listings/search',
        validatedQuery
      );
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Search failed',
      };
    }
  }

  // Authentication methods
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ otpId: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ otpId: string }>> = await this.client.post(
        '/api/auth/send-otp',
        { phoneNumber }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send OTP',
      };
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>> = await this.client.post(
        '/api/auth/verify-otp',
        { phoneNumber, otp }
      );
      
      if (response.data.success && response.data.data?.tokens.accessToken) {
        this.setAuthToken(response.data.data.tokens.accessToken);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'OTP verification failed',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearAuthToken();
    }
  }

  // Generic HTTP methods for flexibility
  async get(url: string, config?: any): Promise<AxiosResponse> {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    return this.client.put(url, data, config);
  }

  async delete(url: string, config?: any): Promise<AxiosResponse> {
    return this.client.delete(url, config);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  setLanguage(language: SupportedLanguage): void {
    this.client.defaults.headers['Accept-Language'] = language;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };

// Type-safe API hooks for React Query (if using)
export const apiKeys = {
  users: {
    me: ['users', 'me'] as const,
    profile: (id: string) => ['users', 'profile', id] as const,
  },
  listings: {
    all: ['listings'] as const,
    list: (page: number, limit: number) => ['listings', 'list', page, limit] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    search: (query: SearchQuery) => ['listings', 'search', query] as const,
    userListings: (userId: string) => ['listings', 'user', userId] as const,
  },
  categories: {
    all: ['categories'] as const,
    hierarchy: ['categories', 'hierarchy'] as const,
  },
} as const;