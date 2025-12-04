# BKMindCare - Ứng dụng Chăm sóc Sức khỏe Tâm thần

## ✨ Tính năng chính

### 👤 Dành cho Người dùng (User)
- **Dashboard cá nhân**: Xem tổng quan về tình trạng sức khỏe tâm thần
- **Theo dõi tâm trạng (Mood Check-in)**: Ghi lại cảm xúc hàng ngày với 4 loại tâm trạng:
  - Happy (Vui vẻ) - Màu tím
  - Calm (Bình tĩnh) - Màu xanh dương
  - Relax (Thư giãn) - Màu cam
  - Focus (Tập trung) - Màu xanh ngọc
- **Lịch sử tâm trạng**: Xem biểu đồ và lịch sử các lần check-in
- **Đặt lịch hẹn**: Đặt lịch hẹn với bác sĩ (trực tiếp hoặc video call)
- **Lịch sử cuộc hẹn**: Xem tất cả các cuộc hẹn đã đặt
- **Danh sách bác sĩ**: Xem thông tin các bác sĩ có sẵn
- **Chat tư vấn**: Trò chuyện với bác sĩ để được tư vấn
- **Kiểm tra sức khỏe tâm thần**: Thực hiện các bài test đánh giá
- **FAQ**: Câu hỏi thường gặp
- **Thông báo**: Nhận thông báo về cuộc hẹn và tin nhắn
- **Hồ sơ cá nhân**: Quản lý thông tin tài khoản

### 👨‍⚕️ Dành cho Bác sĩ (Doctor)
- **Dashboard bác sĩ**: Xem tổng quan về lịch hẹn và bệnh nhân
- **Quản lý cuộc hẹn**: Xem chi tiết và quản lý các cuộc hẹn
- **Expert Dashboard**: Bảng điều khiển chuyên sâu cho chuyên gia

## 🛠️ Công nghệ sử dụng

### Framework & Libraries
- **React Native**: 0.81.5
- **Expo**: ^54.0.25
- **React**: 19.1.0
- **TypeScript**: ^5.1.3

### Navigation
- **@react-navigation/native**: ^6.1.9
- **@react-navigation/stack**: ^6.3.20
- **@react-navigation/bottom-tabs**: ^6.5.11

### UI Components & Icons
- **@expo/vector-icons**: ^15.0.3
- **react-native-vector-icons**: ^10.0.3
- **react-native-calendars**: ^1.1301.0
- **react-native-gifted-chat**: ^2.4.0

### Storage & State Management
- **@react-native-async-storage/async-storage**: 2.2.0
- **React Context API**: Quản lý authentication state

### Utilities
- **react-native-gesture-handler**: ~2.28.0
- **react-native-reanimated**: ~4.1.1
- **react-native-safe-area-context**: ~5.6.0
- **react-native-screens**: ~4.16.0
- **@react-native-community/datetimepicker**: 8.4.4

## 📁 Cấu trúc dự án

```
btl/
├── App.tsx                      # Entry point của ứng dụng
├── app.json                     # Cấu hình Expo
├── package.json                 # Dependencies và scripts
├── tsconfig.json               # Cấu hình TypeScript
├── babel.config.js             # Cấu hình Babel
├── metro.config.js             # Cấu hình Metro bundler
│
└── src/
    ├── components/             # Các component tái sử dụng
    │   ├── CustomButton.tsx
    │   ├── EmotionalTendenciesChart.tsx
    │   └── MoodSelector.tsx
    │
    ├── config/                 # Cấu hình
    │   └── firebase.ts         # Cấu hình Firebase (hiện tại dùng mock)
    │
    ├── constants/              # Hằng số
    │   ├── colors.ts           # Màu sắc của ứng dụng
    │   └── data.ts             # Dữ liệu mock (doctors, appointments)
    │
    ├── context/                # React Context
    │   └── AuthContext.tsx     # Context quản lý authentication
    │
    ├── hooks/                  # Custom hooks
    │   └── useMoodCheckIn.ts   # Hook quản lý mood check-in
    │
    ├── screens/                # Các màn hình
    │   ├── SplashScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── NotificationScreen.tsx
    │   │
    │   ├── user/               # Màn hình cho người dùng
    │   │   ├── UserDashboard.tsx
    │   │   ├── MoodCheckInScreen.tsx
    │   │   ├── MoodHistoryScreen.tsx
    │   │   ├── AppointmentScreen.tsx
    │   │   ├── AppointmentHistoryScreen.tsx
    │   │   ├── AllDoctorsScreen.tsx
    │   │   ├── ChatScreen.tsx
    │   │   ├── MentalHealthTestScreen.tsx
    │   │   ├── FAQScreen.tsx
    │   │   └── ProfileScreen.tsx
    │   │
    │   └── doctor/             # Màn hình cho bác sĩ
    │       ├── DoctorDashboard.tsx
    │       ├── ExpertDashboard.tsx
    │       └── DetailAppointmentScreen.tsx
    │
    ├── services/               # Services
    │   └── mockFirebase.ts     # Mock Firebase service (cho testing)
    │
    ├── types/                   # TypeScript types
    │   └── index.ts            # Định nghĩa các types và interfaces
    │
    └── utils/                   # Utilities
        └── storage.ts           # Wrapper cho AsyncStorage
```

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Expo CLI (cài đặt global: `npm install -g expo-cli`)
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd btl
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
# Khởi động Expo development server
npm start

# Hoặc chạy trên Android
npm run android

# Hoặc chạy trên iOS
npm run ios

# Hoặc chạy trên Web
npm run web

# Xóa cache và khởi động lại
npm run clear
```

4. **Quét QR code**
   - Mở ứng dụng Expo Go trên điện thoại
   - Quét QR code hiển thị trong terminal hoặc trình duyệt

## 🔐 Authentication

Hiện tại ứng dụng sử dụng mock authentication. Có hai loại đăng nhập:
- **HCMUT Account**: Đăng nhập bằng tài khoản HCMUT (chưa được implement)
- **Admin**: Đăng nhập với quyền admin/bác sĩ

Thông tin người dùng được lưu trữ local bằng AsyncStorage.

## 🗄️ Database & Backend

### Mock Firebase
Ứng dụng hiện tại sử dụng **Mock Firebase** (`src/services/mockFirebase.ts`) để phục vụ việc phát triển và testing UI mà không cần backend thực sự.

Mock Firebase cung cấp:
- **Mock Auth**: Authentication giả lập
- **Mock Firestore**: Database giả lập với các collections:
  - `moodCheckIns`: Lưu trữ các lần check-in tâm trạng
  - `appointments`: Lưu trữ các cuộc hẹn
  - `chats/{chatId}/messages`: Lưu trữ tin nhắn chat
- **Mock Storage**: File storage giả lập

### Chuyển sang Firebase thật
Để sử dụng Firebase thật, thực hiện các bước sau:

1. Cài đặt Firebase SDK:
```bash
npm install firebase
```

2. Cập nhật file `src/config/firebase.ts`:
   - Uncomment code Firebase
   - Thêm thông tin cấu hình Firebase của bạn
   - Comment lại import mockFirebase

3. Cấu hình Firebase:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 📊 Types & Interfaces

### User Roles
- `student`: Sinh viên
- `doctor`: Bác sĩ
- `admin`: Quản trị viên

### Mood Types
- `happy`: Vui vẻ
- `calm`: Bình tĩnh
- `relax`: Thư giãn
- `focus`: Tập trung

### Appointment Types
- `in-person`: Gặp trực tiếp
- `video-call`: Gọi video

### Appointment Status
- `pending`: Đang chờ
- `confirmed`: Đã xác nhận
- `completed`: Đã hoàn thành
- `cancelled`: Đã hủy

## 🎨 Design System

### Màu sắc chính
- **Primary**: `#4A90E2` (Xanh dương)
- **Primary Light**: `#E3F2FD` (Xanh dương nhạt)
- **Success**: `#4CAF50` (Xanh lá)
- **Warning**: `#FFC107` (Vàng)
- **Error**: `#F44336` (Đỏ)
- **Teal**: `#26A69A` (Xanh ngọc)
- **Purple**: `#9C27B0` (Tím)

Xem chi tiết trong `src/constants/colors.ts`

## 📱 Navigation Flow

```
Splash Screen
    ↓
Onboarding Screen (lần đầu)
    ↓
Login Screen
    ↓
    ├─→ User Dashboard (nếu đăng nhập user)
    │       ├─→ Mood Check-in
    │       ├─→ Mood History
    │       ├─→ Appointment
    │       ├─→ Appointment History
    │       ├─→ All Doctors
    │       ├─→ Chat
    │       ├─→ Mental Health Test
    │       ├─→ FAQ
    │       └─→ Profile
    │
    └─→ Doctor Dashboard (nếu đăng nhập admin)
            ├─→ Expert Dashboard
            └─→ Detail Appointment
```

## 🔧 Scripts có sẵn

- `npm start`: Khởi động Expo development server
- `npm run android`: Chạy trên Android emulator/device
- `npm run ios`: Chạy trên iOS simulator/device
- `npm run web`: Chạy trên web browser
- `npm run clear`: Xóa cache và khởi động lại

## 📝 Ghi chú phát triển

### TODO
- [ ] Implement HCMUT authentication
- [ ] Implement admin authentication
- [ ] Tích hợp Firebase thật
- [ ] Thêm push notifications
- [ ] Cải thiện error handling
- [ ] Thêm unit tests
- [ ] Thêm integration tests

### Mock Data
Dữ liệu mock được định nghĩa trong:
- `src/constants/data.ts`: Mock doctors và appointments
- `src/services/mockFirebase.ts`: Mock Firebase services

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này là private project.

## 👥 Tác giả

Dự án được phát triển cho môn học Mobile Development - BTL.

## 📞 Liên hệ

Nếu có câu hỏi hoặc vấn đề, vui lòng tạo issue trên repository.

---

**Lưu ý**: Đây là phiên bản phát triển sử dụng mock data. Để sử dụng trong production, cần tích hợp backend thật và cấu hình Firebase đầy đủ.
