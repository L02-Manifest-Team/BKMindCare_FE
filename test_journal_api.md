# Test Journal API

## Cách test:

1. **Đảm bảo đã đăng nhập** và có access token
2. **Mở JournalScreen** trong app
3. **Xem console logs** để debug:
   - `Loading journal entries...`
   - `Journal response: ...`
   - `Error loading entries: ...`

## Kiểm tra:

1. **Backend đang chạy?**
   - http://localhost:8000/docs
   - Tìm endpoint `/api/journal`

2. **Có token không?**
   - Check AsyncStorage: `accessToken`

3. **Test bằng curl:**
```bash
# Lấy token từ app, rồi test:
curl -X GET "http://localhost:8000/api/journal?skip=0&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Các lỗi có thể gặp:

1. **404 Not Found** → Endpoint không tồn tại hoặc path sai
2. **401 Unauthorized** → Token không hợp lệ hoặc hết hạn
3. **500 Internal Server Error** → Lỗi backend
4. **Network Error** → Không kết nối được backend

