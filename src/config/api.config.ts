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
export const API_CONFIG = {
  BASE_URL: 'http://192.168.91.125:8000',  // ⚠️ THAY ĐỔI IP NÀY
  VERSION: '/api',
  TIMEOUT: 15000, // 15 seconds
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

