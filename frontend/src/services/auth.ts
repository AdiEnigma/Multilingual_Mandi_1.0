import { UserProfile, AuthTokens } from '@shared/types';

export interface LoginCredentials {
  phoneNumber: string;
  otp: string;
}

export interface RegisterData {
  name: string;
  phoneNumber: string;
  location: {
    state: string;
    district: string;
    pincode: string;
  };
  preferredLanguage: string;
  userType: 'buyer' | 'seller' | 'both';
}

export interface OTPRequest {
  phoneNumber: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  async requestOTP(data: OTPRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to request OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Request OTP error:', error);
      throw error;
    }
  }

  async verifyOTP(credentials: LoginCredentials): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      this.setTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          await this.refreshToken();
          return this.getCurrentUser();
        }
        throw new Error('Failed to get current user');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry
          await this.refreshToken();
          return this.updateProfile(userId, updates);
        }
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Token management
  setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();