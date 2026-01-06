# Hướng dẫn Test App BKMindCare

## ✅ Đã sửa các lỗi:

1. ✅ Backend timeout → Đã thêm timeout 15s và error handling
2. ✅ Field names mismatch → Đã đổi `fullName` → `full_name`, `phoneNumber` → `phone_number`
3. ✅ Response format → Đã cập nhật để match với backend API
4. ✅ Navigation flow → Register/Login → MoodCheckIn hoặc DoctorDashboard

## 🚀 Cách chạy:

### 1. Khởi động Backend (Terminal 1)

```bash
cd D:\Mobile_App_Dev\BE\BKMindCare_BE
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Kiểm tra: http://localhost:8000 → Phải thấy `{"message":"Welcome to BEMindCare API"}`

### 2. Khởi động Frontend (Terminal 2)

```bash
cd D:\Mobile_App_Dev\FE\BKMindCare_FE
npx expo start -c
```

### 3. Cấu hình API URL

**Mở file:** `src/config/api.config.ts`

**Chọn config phù hợp:**

#### A. Test trên điện thoại thật (Expo Go):
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.55.113:8000',  // ⚠️ THAY ĐỔI IP
  VERSION: '/api',
  TIMEOUT: 15000,
};
```

**Cách tìm IP máy tính:**
- Mở CMD, gõ: `ipconfig`
- Tìm "IPv4 Address" của WiFi adapter
- Ví dụ: `192.168.1.100`

#### B. Test trên Android Emulator:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:8000',
  VERSION: '/api',
  TIMEOUT: 15000,
};
```

#### C. Test trên iOS Simulator:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  VERSION: '/api',
  TIMEOUT: 15000,
};
```

### 4. Test Flow

1. **Mở app** → Splash Screen → Onboarding
2. **Bấm "Đăng nhập"** → LoginScreen
3. **Bấm "Đăng ký ngay"** → RegisterScreen
4. **Điền form đăng ký:**
   - Họ tên: `Nguyen Van A`
   - Email: `test@student.hcmut.edu.vn`
   - SĐT: `0123456789`
   - Mật khẩu: `test123456`
   - Vai trò: Sinh viên hoặc Bác sĩ
5. **Bấm "Đăng ký"** → Tự động đăng nhập
6. **Navigate:**
   - Sinh viên → MoodCheckIn
   - Bác sĩ → DoctorDashboard

## 🔧 Troubleshooting

### Lỗi: "Không thể kết nối đến server"

**Nguyên nhân:**
1. Backend chưa chạy
2. IP address sai
3. Không cùng mạng WiFi
4. Firewall chặn port 8000

**Giải pháp:**

1. **Kiểm tra backend:**
```bash
curl http://localhost:8000
# Hoặc mở browser: http://localhost:8000
```

2. **Kiểm tra IP:**
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

3. **Test từ điện thoại:**
- Mở browser trên điện thoại
- Vào: `http://192.168.x.x:8000` (IP máy tính)
- Phải thấy: `{"message":"Welcome to BEMindCare API"}`

4. **Tắt Firewall (tạm thời):**
- Windows: Settings → Windows Security → Firewall
- Hoặc cho phép port 8000

### Lỗi: "Email already registered"

Đổi email khác hoặc xóa user trong database:

```sql
DELETE FROM users WHERE email = 'test@student.hcmut.edu.vn';
```

### App không reload sau khi sửa code

```bash
# Trong terminal Expo, bấm:
r  # reload
# Hoặc trên điện thoại: lắc và chọn "Reload"
```

## 📱 Test Accounts

Sau khi đăng ký, có thể dùng các tài khoản này để test:

| Email | Password | Role |
|-------|----------|------|
| test2@student.hcmut.edu.vn | test123456 | PATIENT |

## 🎯 Checklist trước khi test:

- [ ] Backend đang chạy (port 8000)
- [ ] Frontend đang chạy (Expo)
- [ ] Đã cập nhật IP trong `api.config.ts`
- [ ] Điện thoại và máy tính cùng WiFi
- [ ] Đã clear cache Expo (`npx expo start -c`)

## 📚 API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- Xem thêm: `BE/BKMindCare_BE/endpoint.md`

## 🐛 Debug

Xem logs:
- **Backend:** Terminal chạy uvicorn
- **Frontend:** Terminal chạy Expo
- **App:** Lắc điện thoại → "Show Dev Menu" → "Debug Remote JS"

