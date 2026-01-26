import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserProfile, AuthTokens, SupportedLanguage } from '@shared/types';
import { authService } from '@/services/auth';
import { logger } from '@/utils/logger';

interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_TOKENS'; payload: AuthTokens | null }
  | { type: 'LOGOUT' };

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  requestOTP: (phoneNumber: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check for stored tokens
      const storedTokens = localStorage.getItem('auth_tokens');
      if (storedTokens) {
        const tokens: AuthTokens = JSON.parse(storedTokens);
        dispatch({ type: 'SET_TOKENS', payload: tokens });
        
        // Verify token and get user profile
        const user = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      logger.error('Failed to initialize auth:', error);
      // Clear invalid tokens
      localStorage.removeItem('auth_tokens');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (phoneNumber: string, otp: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.verifyOTP({ phoneNumber, otp });
      
      // Store tokens
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      dispatch({ type: 'SET_TOKENS', payload: response.tokens });
      dispatch({ type: 'SET_USER', payload: response.user });
      
      logger.info('User logged in successfully');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth_tokens');
      dispatch({ type: 'LOGOUT' });
      logger.info('User logged out');
    }
  };

  const requestOTP = async (phoneNumber: string) => {
    await authService.requestOTP({ phoneNumber });
    logger.info('OTP requested for phone number');
  };

  const register = async (userData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.register(userData);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      logger.info('User registered successfully');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const newTokens = await authService.refreshToken();
      
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      dispatch({ type: 'SET_TOKENS', payload: newTokens });
      
      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        throw new Error('No user logged in');
      }

      const updatedUser = await authService.updateProfile(state.user.id, updates);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      logger.info('User profile updated successfully');
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    requestOTP,
    register,
    refreshToken,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}