// API Configuration
// Thay đổi URL này tùy theo môi trường test

// HƯỚNG DẪN:
// 1. Test trên điện thoại thật (Expo Go):
//    - Tìm IP máy tính: mở CMD, gõ "ipconfig", tìm IPv4 Address
//    - Dùng: http://192.168.x.x:8000 (thay x.x bằng IP của bạn)
//    - Đảm bảo điện thoại và máy tính cùng mạng WiFi

// 2. Test trên Android Emulator:
//    - Dùng: http://10.0.2.2:8000

// 3. Test trên iOS Simulator:
//    - Dùng: http://localhost:8000

// Chọn một trong các config dưới đây:

// Config cho điện thoại thật (Expo Go)
import { Platform } from 'react-native';

export const API_CONFIG = {
  // Dynamically determine base URL based on platform and environment
  BASE_URL: (() => {
    try {
      // Try to get debugger host for Expo Go on real devices
      const Constants = require('expo-constants').default;
      
      // For Expo SDK 46+, use expoConfig instead of manifest
      const debuggerHost = 
        Constants?.expoConfig?.hostUri?.split(':').shift() ||
        Constants?.manifest?.debuggerHost?.split(':').shift() ||
        Constants?.manifest2?.extra?.expoGo?.debuggerHost?.split(':').shift();
      
      if (debuggerHost && 
          !debuggerHost.includes('localhost') && 
          debuggerHost !== '127.0.0.1') {
        return `http://${debuggerHost}:8000`;
      }
    } catch (e) {
      console.warn('[API Config] Could not detect debugger host:', e);
    }
    
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    }
    
    return 'http://localhost:8000';
  })(),
  VERSION: '/api',
  TIMEOUT: 15000,
};

// Config cho Android Emulator (uncomment để dùng)
// export const API_CONFIG = {
//   BASE_URL: 'http://10.0.2.2:8000',
//   VERSION: '/api',
//   TIMEOUT: 15000,
// };

// Config cho iOS Simulator (uncomment để dùng)
// export const API_CONFIG = {
//   BASE_URL: 'http://localhost:8000',
//   VERSION: '/api',
//   TIMEOUT: 15000,
// };

export const API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.VERSION}`;

