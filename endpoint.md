# BKMindCare API Endpoints

## 1. Xác thực người dùng

### Đăng ký tài khoản
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```typescript
  {
    "email": string,
    "password": string,
    "fullName": string,
    "phoneNumber": string,
    "role": "PATIENT" | "DOCTOR"
  }
  ```
- **Response**:
  ```typescript
  {
    "userId": string,
    "email": string,
    "fullName": string,
    "role": string,
    "accessToken": string,
    "refreshToken": string
  }
  ```

### Đăng nhập
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```typescript
  {
    "email": string,
    "password": string
  }
  ```
- **Response**:
  ```typescript
  {
    "userId": string,
    "email": string,
    "fullName": string,
    "role": string,
    "accessToken": string,
    "refreshToken": string
  }
  ```

### Lấy thông tin người dùng hiện tại
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```typescript
  {
    "id": string,
    "email": string,
    "fullName": string,
    "phoneNumber": string,
    "avatar": string | null,
    "role": "PATIENT" | "DOCTOR",
    "specialization"?: string, // Chỉ có với role DOCTOR
    "bio"?: string, // Chỉ có với role DOCTOR
    "createdAt": string
  }
  ```

## 2. Quản lý bác sĩ

### Lấy danh sách bác sĩ
- **Endpoint**: `GET /api/doctors`
- **Query Parameters**:
  - `specialization`: string (optional)
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `sort`: 'rating' | 'appointmentCount' (optional)
  - `order`: 'asc' | 'desc' (default: 'desc')
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "fullName": string,
        "specialization": string,
        "rating": number,
        "reviewCount": number,
        "avatar": string | null,
        "yearsOfExperience": number
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```

### Lấy chi tiết bác sĩ
- **Endpoint**: `GET /api/doctors/:id`
- **Response**:
  ```typescript
  {
    "id": string,
    "fullName": string,
    "email": string,
    "phoneNumber": string,
    "specialization": string,
    "bio": string,
    "education": Array<{
      "degree": string,
      "university": string,
      "year": number
    }>,
    "experience": Array<{
      "position": string,
      "hospital": string,
      "startYear": number,
      "endYear": number | null,
      "current": boolean
    }>,
    "rating": number,
    "reviewCount": number,
    "avatar": string | null,
    "consultationFee": number,
    "availableSlots": Array<{
      "date": string, // YYYY-MM-DD
      "timeSlots": string[] // HH:mm
    }>
  }
  ```

## 3. Quản lý lịch hẹn

### Tạo lịch hẹn mới
- **Endpoint**: `POST /api/appointments`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    "doctorId": string,
    "appointmentDate": string, // YYYY-MM-DD
    "timeSlot": string, // HH:mm
    "reason": string,
    "notes": string
  }
  ```
- **Response**:
  ```typescript
  {
    "id": string,
    "doctorId": string,
    "patientId": string,
    "appointmentDate": string,
    "timeSlot": string,
    "status": "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
    "reason": string,
    "notes": string,
    "createdAt": string,
    "updatedAt": string
  }
  ```

### Lấy danh sách lịch hẹn
- **Endpoint**: `GET /api/appointments`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `status`: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' (optional)
  - `startDate`: string (YYYY-MM-DD, optional)
  - `endDate`: string (YYYY-MM-DD, optional)
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "doctor": {
          "id": string,
          "fullName": string,
          "specialization": string,
          "avatar": string | null
        },
        "patient": {
          "id": string,
          "fullName": string,
          "avatar": string | null
        },
        "appointmentDate": string,
        "timeSlot": string,
        "status": string,
        "reason": string,
        "createdAt": string
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```

## 4. Quản lý tin nhắn

### Lấy danh sách cuộc trò chuyện
- **Endpoint**: `GET /api/chats`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "participants": [
          {
            "id": string,
            "fullName": string,
            "avatar": string | null,
            "role": "PATIENT" | "DOCTOR"
          }
        ],
        "lastMessage": {
          "id": string,
          "content": string,
          "senderId": string,
          "createdAt": string,
          "read": boolean
        } | null,
        "unreadCount": number
      }
    ]
  }
  ```

### Gửi tin nhắn
- **Endpoint**: `POST /api/chats/:chatId/messages`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    "content": string
  }
  ```
- **Response**:
  ```typescript
  {
    "id": string,
    "content": string,
    "senderId": string,
    "chatId": string,
    "createdAt": string,
    "read": boolean
  }
  ```

## 5. Theo dõi tâm trạng

### Gửi cảm xúc hiện tại
- **Endpoint**: `POST /api/mood`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    "mood": "HAPPY" | "SAD" | "ANXIOUS" | "STRESSED" | "CALM" | "ANGRY" | "TIRED" | "EXCITED",
    "notes": string | null
  }
  ```
- **Response**:
  ```typescript
  {
    "id": string,
    "userId": string,
    "mood": string,
    "notes": string | null,
    "createdAt": string
  }
  ```

### Lấy lịch sử tâm trạng
- **Endpoint**: `GET /api/mood/history`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `startDate`: string (YYYY-MM-DD, optional)
  - `endDate`: string (YYYY-MM-DD, optional)
  - `limit`: number (default: 30)
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "mood": string,
        "notes": string | null,
        "createdAt": string
      }
    ]
  }
  ```

## 6. Bài kiểm tra sức khỏe tâm thần

### Lấy danh sách bài kiểm tra
- **Endpoint**: `GET /api/mental-health-tests`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "title": string,
        "description": string,
        "estimatedTime": number, // in minutes
        "questionCount": number,
        "imageUrl": string | null
      }
    ]
  }
  ```

### Nộp bài kiểm tra
- **Endpoint**: `POST /api/mental-health-tests/:testId/submit`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    "answers": Array<{
      "questionId": string,
      "answer": number | string | number[]
    }>
  }
  ```
- **Response**:
  ```typescript
  {
    "testId": string,
    "score": number,
    "result": string,
    "recommendations": string[],
    "completedAt": string
  }
  ```

## 7. Thông báo

### Lấy danh sách thông báo
- **Endpoint**: `GET /api/notifications`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 20)
  - `unreadOnly`: boolean (default: false)
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "title": string,
        "message": string,
        "type": "APPOINTMENT" | "MESSAGE" | "SYSTEM" | "REMINDER",
        "read": boolean,
        "data": any, // Additional data specific to notification type
        "createdAt": string
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```

### Đánh dấu đã đọc thông báo
- **Endpoint**: `PATCH /api/notifications/:id/read`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```typescript
  {
    "success": boolean
  }
  ```

## 8. Hỗ trợ và FAQ

### Lấy danh sách câu hỏi thường gặp
- **Endpoint**: `GET /api/faqs`
- **Query Parameters**:
  - `category`: string (optional)
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "question": string,
        "answer": string,
        "category": string,
        "createdAt": string
      }
    ]
  }
  ```

### Gửi yêu cầu hỗ trợ
- **Endpoint**: `POST /api/support`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    "subject": string,
    "message": string,
    "attachments": Array<{
      "name": string,
      "url": string,
      "type": string
    }> | null
  }
  ```
- **Response**:
  ```typescript
  {
    "id": string,
    "subject": string,
    "status": "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
    "createdAt": string
  }
  ```

## 9. Cập nhật thông tin cá nhân

### Cập nhật thông tin hồ sơ
- **Endpoint**: `PUT /api/users/profile`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    "fullName": string,
    "phoneNumber": string,
    "dateOfBirth": string, // YYYY-MM-DD
    "gender": "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
    "address": {
      "street": string,
      "city": string,
      "state": string,
      "postalCode": string,
      "country": string
    } | null
  }
  ```
- **Response**:
  ```typescript
  {
    "id": string,
    "email": string,
    "fullName": string,
    "phoneNumber": string,
    "dateOfBirth": string | null,
    "gender": string | null,
    "avatar": string | null,
    "address": {
      "street": string,
      "city": string,
      "state": string,
      "postalCode": string,
      "country": string
    } | null,
    "updatedAt": string
  }
  ```

### Tải lên ảnh đại diện
- **Endpoint**: `POST /api/users/upload-avatar`
- **Headers**: 
  - `Authorization: Bearer <access_token>`
  - `Content-Type: multipart/form-data`
- **Request Body**:
  - `file`: File ảnh (jpeg, png, gif)
- **Response**:
  ```typescript
  {
    "avatarUrl": string
  }
  ```

## 10. Quản lý bác sĩ (Admin)

### Tạo tài khoản bác sĩ (Admin)
- **Endpoint**: `POST /api/admin/doctors`
- **Headers**: `Authorization: Bearer <admin_access_token>`
- **Request Body**:
  ```typescript
  {
    "email": string,
    "password": string,
    "fullName": string,
    "phoneNumber": string,
    "specialization": string,
    "bio": string,
    "education": Array<{
      "degree": string,
      "university": string,
      "year": number
    }>,
    "experience": Array<{
      "position": string,
      "hospital": string,
      "startYear": number,
      "endYear": number | null,
      "current": boolean
    }>,
    "consultationFee": number
  }
  ```
- **Response**:
  ```typescript
  {
    "id": string,
    "email": string,
    "fullName": string,
    "specialization": string,
    "createdAt": string
  }
  ```

### Lấy danh sách bệnh nhân (Bác sĩ)
- **Endpoint**: `GET /api/doctor/patients`
- **Headers**: `Authorization: Bearer <doctor_access_token>`
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (optional)
- **Response**:
  ```typescript
  {
    "data": [
      {
        "id": string,
        "fullName": string,
        "email": string,
        "phoneNumber": string,
        "lastAppointment": string | null,
        "nextAppointment": string | null,
        "appointmentCount": number
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```

## Ghi chú chung

1. Tất cả các endpoint (trừ các endpoint công khai) đều yêu cầu xác thực qua header `Authorization: Bearer <access_token>`
2. Các trường date/time đều sử dụng định dạng ISO 8601 (VD: `2023-01-01T00:00:00.000Z`)
3. Mã lỗi HTTP thông thường:
   - 200: Thành công
   - 201: Tạo mới thành công
   - 400: Lỗi dữ liệu đầu vào không hợp lệ
   - 401: Chưa xác thực
   - 403: Không có quyền truy cập
   - 404: Không tìm thấy tài nguyên
   - 500: Lỗi máy chủ
4. Đối với phân trang:
   - `page`: Số trang bắt đầu từ 1
   - `limit`: Số lượng bản ghi mỗi trang
   - `total`: Tổng số bản ghi
   - `totalPages`: Tổng số trang
