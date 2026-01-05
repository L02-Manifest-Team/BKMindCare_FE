import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_CONFIG } from '../config/api.config';

export { API_URL };

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to set auth token
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Helper function to remove auth token
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Generic API request function with timeout
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  };

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    }, API_CONFIG.TIMEOUT);
  });

  try {
    const response = await Promise.race([
      fetch(`${API_URL}${endpoint}`, config),
      timeoutPromise
    ]);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    
    // Handle 204 No Content (e.g., DELETE requests)
    if (response.status === 204) {
      return {} as T;
    }
    
    if (contentType && contentType.includes('application/json')) {
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        if (__DEV__) {
          console.error('Failed to parse JSON response:', jsonError);
        }
        throw new Error(`Lỗi server: ${response.status} - Không thể parse response`);
      }
      
      if (!response.ok) {
        if (__DEV__) {
          console.error('API Error:', {
            endpoint,
            status: response.status,
            data,
          });
        }
        // Handle authentication errors - try to refresh token
        if (response.status === 401 || response.status === 403) {
          const errorMsg = data.detail || 'Not authenticated';
          
          // Try to refresh token (only for non-auth endpoints and only once)
          if (!endpoint.includes('/auth/') && !(options as any)._retryCount) {
            try {
              // Get refresh token directly from AsyncStorage to avoid circular dependency
              const refreshToken = await AsyncStorage.getItem('refreshToken');
              
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }
              
              // Call refresh endpoint directly
              const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });
              
              if (!refreshResponse.ok) {
                throw new Error('Refresh failed');
              }
              
              const refreshData = await refreshResponse.json();
              
              // Save new tokens
              await setAuthToken(refreshData.access_token);
              if (refreshData.refresh_token) {
                await AsyncStorage.setItem('refreshToken', refreshData.refresh_token);
              }
              
              // Retry original request with new token (mark as retry)
              return apiRequest<T>(endpoint, { ...options, _retryCount: 1 } as any);
            } catch (refreshError: any) {
              // Clear invalid tokens
              await removeAuthToken();
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
          } else {
            // For auth endpoints or already retried, just clear token
            await removeAuthToken();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        }
        throw new Error(data.detail || `Lỗi server: ${response.status}`);
      }
      
      return data as T;
    } else {
      if (!response.ok) {
        // Handle authentication errors for non-JSON responses
        if (response.status === 401 || response.status === 403) {
          await removeAuthToken();
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`Lỗi server: ${response.status}`);
      }
      return {} as T;
    }
  } catch (error: any) {
    // Better error messages
    if (error.message && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch'))) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    throw error;
  }
};


// API methods
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

