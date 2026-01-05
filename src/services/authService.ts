import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken, removeAuthToken } from './api';

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;  // Backend uses snake_case
  phone_number: string;  // Backend uses snake_case
  role: 'PATIENT' | 'DOCTOR';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  // Backend might return refresh_token in response
  [key: string]: any;
}

export interface UserProfile {
  id: number | string;  // Backend returns int, but we convert to string for consistency
  email: string;
  full_name: string;  // Backend uses snake_case
  phone_number: string | null;  // Backend uses snake_case
  avatar: string | null;
  role: 'PATIENT' | 'DOCTOR';
  specialization?: string | null;
  bio?: string | null;
  created_at: string;  // Backend uses snake_case
  is_active?: boolean;
  updated_at?: string;
}

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<UserProfile> => {
    try {
      // Register returns user profile, not tokens
      const userProfile = await api.post<UserProfile>('/auth/register', data);
      
      // Then login to get tokens
      const loginResponse = await api.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });
      
      // Save tokens
      await setAuthToken(loginResponse.access_token);
      if (loginResponse.refresh_token) {
        await AsyncStorage.setItem('refreshToken', loginResponse.refresh_token);
      }
      await AsyncStorage.setItem('userRole', userProfile.role);
      await AsyncStorage.setItem('userId', String(userProfile.id));
      
      return userProfile;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Login user
  login: async (data: LoginData): Promise<UserProfile> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      
      // Save access token
      await setAuthToken(response.access_token);
      
      // Save refresh token
      const refreshToken = response.refresh_token || 
                          (response as any).refreshToken || 
                          (response as any)['refresh_token'];
      
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      
      
      // Get user profile
      const userProfile = await api.get<UserProfile>('/auth/me');
      await AsyncStorage.setItem('userRole', userProfile.role);
      await AsyncStorage.setItem('userId', String(userProfile.id));
      
      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      console.log('[AuthService] Logging out and clearing all auth data...');
      // Remove all auth-related data
      await removeAuthToken();
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      console.log('[AuthService] Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      // Save new tokens
      await setAuthToken(response.access_token);
      if (response.refresh_token) {
        await AsyncStorage.setItem('refreshToken', response.refresh_token);
      }
      
      return response.access_token;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear tokens if refresh fails
      await removeAuthToken();
      await AsyncStorage.removeItem('refreshToken');
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<any>('/auth/me');
      // Convert id to string for consistency with frontend
      return {
        ...response,
        id: String(response.id),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get user role
  getUserRole: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('userRole');
    } catch (error) {
      return null;
    }
  },
};

