import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Debug: Track user state changes
  useEffect(() => {
    console.log('[AuthContext] User state changed:', user ? `ID=${user.id}, Role=${user.role}` : 'null');
  }, [user]);

  // Disable auto-login (remember me) - user must login every time
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AuthContext] Starting auth check...');
      const token = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      console.log('[AuthContext] Token exists:', !!token);
      console.log('[AuthContext] Refresh token exists:', !!refreshToken);
      
      if (token) {
        // If we have access token but no refresh token, it's an old session
        // Clear it and require re-login to get refresh_token
        if (!refreshToken) {
          console.warn('[AuthContext] No refresh token, clearing old session');
          // Silently clear old session and require re-login
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        try {
          console.log('[AuthContext] Fetching current user...');
          const userProfile = await authService.getCurrentUser();
          console.log('[AuthContext] User profile loaded:', { id: userProfile.id, role: userProfile.role, name: userProfile.full_name });
          setUser(userProfile);
          setIsAuthenticated(true);
        } catch (error: any) {
          console.error('[AuthContext] Get current user error:', error);
          console.error('[AuthContext] Error details:', error.response?.data || error.message);
          
          // Token invalid, clear everything and require re-login
          console.warn('[AuthContext] Token invalid, clearing session');
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('[AuthContext] No token found, user not authenticated');
      }
    } catch (error) {
      console.error('[AuthContext] Auth check error:', error);
      // If token is invalid, clear it
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log('[AuthContext] Auth check complete. User:', user ? 'loaded' : 'null');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<UserProfile> => {
    try {
      const userProfile = await authService.login({ email, password });
      setUser(userProfile);
      setIsAuthenticated(true);
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    try {
      const userProfile = await authService.register(data);
      setUser(userProfile);
      setIsAuthenticated(true);
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('[AuthContext] Logging out...');
      // Clear state immediately for instant UI update
      setUser(null);
      setIsAuthenticated(false);
      
      // Then clear storage
      await authService.logout();
      console.log('[AuthContext] Logout complete');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Even if logout fails, keep user cleared
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userProfile = await authService.getCurrentUser();
      setUser(userProfile);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
