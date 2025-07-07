# API Testing Guide - Personal Member Lists

## Prerequisites
1. Server backend đang chạy tại `http://localhost:5000`
2. Database MongoDB đã được kết nối
3. Đã có tài khoản user để đăng nhập và lấy token

## 1. Authentication (Lấy Token)
Trước tiên bạn cần đăng nhập để lấy token:

### POST /api/auth/login
```
URL: http://localhost:5000/api/auth/login
Method: POST
Headers: 
  Content-Type: application/json

Body (JSON):
{
  "email": "admin@example.com",
  "password": "12345678"
}
```

**Response sẽ trả về token, copy token này để dùng cho các API sau.**

---

## 2. CRUD Operations - Personal Member Lists

### 2.1. Tìm kiếm người dùng để thêm vào danh sách

#### GET /api/personal-members/search
```
URL: http://localhost:5000/api/personal-members/search?query=user&page=1&limit=5
Method: GET
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.2. Lấy danh sách thành viên cá nhân

#### GET /api/personal-members
```
URL: http://localhost:5000/api/personal-members
Method: GET
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.3. Thêm thành viên mới vào danh sách

#### POST /api/personal-members
```
URL: http://localhost:5000/api/personal-members
Method: POST
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json

Body (JSON):
{
  "member_user_id": "USER_ID_HERE",
  "custom_role": "Nhân viên IT",
  "notes": "Chuyên gia phát triển frontend"
}
```

### 2.4. Lấy chi tiết một thành viên

#### GET /api/personal-members/:id
```
URL: http://localhost:5000/api/personal-members/MEMBER_ID_HERE
Method: GET
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.5. Cập nhật thông tin thành viên

#### PUT /api/personal-members/:id
```
URL: http://localhost:5000/api/personal-members/MEMBER_ID_HERE
Method: PUT
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json

Body (JSON):
{
  "custom_role": "Trưởng nhóm UI/UX",
  "notes": "Cập nhật: Đã thăng chức",
  "is_active": true
}
```

### 2.6. Xóa thành viên (soft delete)

#### DELETE /api/personal-members/:id
```
URL: http://localhost:5000/api/personal-members/MEMBER_ID_HERE
Method: DELETE
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

### 2.7. Xóa vĩnh viễn thành viên

#### DELETE /api/personal-members/:id/permanent
```
URL: http://localhost:5000/api/personal-members/MEMBER_ID_HERE/permanent
Method: DELETE
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 3. Expected Responses

### Successful Response (200/201):
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... },
  "total": 5 // (chỉ có trong GET list)
}
```

### Error Response (400/404/500):
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi (nếu có)"
}
```

---

## 4. Testing Flow

### Bước 1: Đăng nhập và lấy token
1. Sử dụng API login để lấy token
2. Copy token từ response

### Bước 2: Test tìm kiếm người dùng
1. Gọi API search với query = "user" hoặc "admin"
2. Lấy user_id từ kết quả để dùng cho bước tiếp theo

### Bước 3: Test thêm thành viên
1. Sử dụng user_id từ bước 2
2. Gọi API POST để thêm thành viên mới
3. Lưu member_id từ response

### Bước 4: Test lấy danh sách
1. Gọi API GET để xem danh sách thành viên
2. Verify thành viên vừa thêm có trong danh sách

### Bước 5: Test cập nhật
1. Sử dụng member_id từ bước 3
2. Gọi API PUT để cập nhật thông tin

### Bước 6: Test lấy chi tiết
1. Gọi API GET với member_id để xem chi tiết

### Bước 7: Test xóa
1. Gọi API DELETE để soft delete
2. Gọi lại API GET list để verify thành viên đã bị ẩn
3. (Tùy chọn) Gọi API DELETE permanent để xóa vĩnh viễn

---

## 5. Common Error Cases to Test

### 5.1. Thêm chính mình vào danh sách
```json
{
  "member_user_id": "YOUR_OWN_USER_ID"
}
```
**Expected**: Error 400 - "Không thể thêm chính mình vào danh sách thành viên"

### 5.2. Thêm thành viên đã tồn tại
**Expected**: Error 409 - "Thành viên này đã có trong danh sách của bạn"

### 5.3. Sử dụng ID không hợp lệ
**Expected**: Error 400 - "ID không hợp lệ"

### 5.4. Không có token
**Expected**: Error 401 - "Không có token truy cập"

### 5.5. Token hết hạn
**Expected**: Error 403 - "Token đã hết hạn"

---

## 6. Postman Collection Setup

Bạn có thể tạo một Postman Collection với structure sau:

```
📁 Personal Member Lists API
├── 🔐 Auth
│   └── POST Login
├── 👥 Personal Members
│   ├── GET Search Users
│   ├── GET List Members  
│   ├── POST Add Member
│   ├── GET Member Detail
│   ├── PUT Update Member
│   ├── DELETE Remove Member
│   └── DELETE Permanent Delete
```

**Environment Variables:**
- `base_url`: http://localhost:5000
- `token`: {{token}} (set từ login response)
- `member_id`: {{member_id}} (set từ add member response)

**Auto-set Token Script** (trong Tests tab của Login request):
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```
