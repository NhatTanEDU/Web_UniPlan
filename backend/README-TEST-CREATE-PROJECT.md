# Test UniPlan Backend - Dự Án, Kanban Task & Team Management

Các file test này kiểm tra chức năng đăng nhập, tạo dự án, quản lý task trong Kanban và quản lý team của hệ thống UniPlan.

## Files Test

### 1. Test Dự Án

#### `quick-test-create-project.js` - Test Nhanh Dự Án
File test đơn giản và nhanh để kiểm tra cơ bản tạo dự án.

**Cách chạy:**
```bash
node quick-test-create-project.js
```

**Chức năng kiểm tra:**
- ✅ Kiểm tra server health
- ✅ Đăng nhập với tài khoản admin1@gmail.com
- ✅ Tạo dự án mới
- ✅ Lấy danh sách dự án

#### `test-create-project.js` - Test Chi Tiết Dự Án
File test đầy đủ với nhiều tùy chọn và logging chi tiết.

**Cách chạy:**
```bash
# Test đầy đủ
node test-create-project.js

# Chỉ test server health
node test-create-project.js --health-only

# Chỉ test đăng nhập
node test-create-project.js --login-only
```

**Chức năng kiểm tra:**
- ✅ Kiểm tra server health
- ✅ Đăng nhập và lấy JWT token
- ✅ Tạo dự án mới với đầy đủ thông tin
- ✅ Lấy danh sách dự án của user
- ✅ Lấy chi tiết dự án vừa tạo

### 2. Test Kanban Task

#### `quick-test-kanban-task.js` - Test Nhanh Kanban Task
File test đơn giản để kiểm tra tạo và quản lý task trong Kanban.

**Cách chạy:**
```bash
node quick-test-kanban-task.js
```

**Chức năng kiểm tra:**
- ✅ Kiểm tra server health
- ✅ Đăng nhập với tài khoản admin1@gmail.com
- ✅ Kiểm tra thông tin Kanban cố định
- ✅ Tạo task mới trong Kanban
- ✅ Lấy danh sách tasks để xác nhận
- ✅ Cập nhật task vừa tạo

#### `test-kanban-task.js` - Test Chi Tiết Kanban Task
File test đầy đủ với nhiều tùy chọn và logging chi tiết cho Kanban Task.

**Cách chạy:**
```bash
# Test đầy đủ
node test-kanban-task.js

# Chỉ test server health
node test-kanban-task.js --health-only

# Chỉ test đăng nhập
node test-kanban-task.js --login-only

# Chỉ test thông tin Kanban
node test-kanban-task.js --kanban-info-only
```

**Chức năng kiểm tra:**
- ✅ Kiểm tra server health
- ✅ Đăng nhập và lấy JWT token
- ✅ Kiểm tra thông tin Kanban board
- ✅ Tạo task mới với đầy đủ thông tin
- ✅ Lấy danh sách tasks trong Kanban
- ✅ Cập nhật task (test update functionality)

### 3. Test Team Management

#### `quick-test-team-management.js` - Test Nhanh Team Management
File test đơn giản để kiểm tra tạo team và quản lý thành viên.

**Cách chạy:**
```bash
node quick-test-team-management.js
```

**Chức năng kiểm tra:**
- ✅ Kiểm tra server health
- ✅ Đăng nhập admin
- ✅ Tạo user mới (tự động tạo email unique)
- ✅ Đăng nhập user mới
- ✅ Tạo team mới
- ✅ Thêm user mới vào team
- ✅ Lấy danh sách thành viên team
- ✅ Xác nhận user mới có trong team

#### `test-team-management.js` - Test Chi Tiết Team Management
File test đầy đủ với nhiều tùy chọn và logging chi tiết cho Team Management.

**Cách chạy:**
```bash
# Test đầy đủ
node test-team-management.js

# Chỉ test server health
node test-team-management.js --health-only

# Chỉ test đăng nhập admin
node test-team-management.js --admin-login-only

# Chỉ test tạo user mới
node test-team-management.js --create-user-only
```

**Chức năng kiểm tra:**
- ✅ Kiểm tra server health
- ✅ Đăng nhập admin và lấy JWT token
- ✅ Tạo user mới với thông tin tự động
- ✅ Đăng nhập user mới để lấy token
- ✅ Tạo team mới với admin
- ✅ Thêm user mới vào team
- ✅ Lấy danh sách thành viên team để xác nhận
- ✅ Lấy danh sách teams của user mới để xác nhận

## Cấu Hình

### Thông tin đăng nhập mặc định:
- **Email:** admin1@gmail.com
- **Password:** 123456

### Server URL:
- **API Base:** http://localhost:5000/api

### ID cố định cho test Kanban Task:
- **Project ID:** 68700d62598889d1be8f673e
- **Kanban ID:** 68700d62598889d1be8f6742

### Thông tin user test tự động:
- **Email:** testuser{timestamp}@gmail.com (tự động tạo)
- **Password:** 123456
- **Full Name:** Test User {timestamp}

*Các ID này được lấy từ kết quả test tạo dự án trước đó. Nếu bạn có ID khác, hãy cập nhật trong file test.*

## Yêu Cầu Trước Khi Chạy Test

1. **Đảm bảo backend server đang chạy:**
   ```bash
   cd backend
   npm install
   npm start
   # hoặc
   node server.js
   ```

2. **Kiểm tra cổng server:** Mặc định là port 5000. Nếu khác, cập nhật trong file test.

3. **Đảm bảo database đã kết nối:** Server cần kết nối MongoDB thành công.

4. **Tài khoản test phải tồn tại:** Email admin1@gmail.com với mật khẩu 123456 phải có trong database.

## Kết Quả Mong Đợi

### Test Dự Án Thành Công:
```
🚀 Bắt đầu test nhanh...

1️⃣ Kiểm tra server...
✅ Server đang hoạt động: healthy

2️⃣ Đăng nhập...
✅ Đăng nhập thành công. User: Admin User

3️⃣ Tạo dự án mới...
✅ Tạo dự án thành công: Test Project 11/07/2025, 10:30:45
   ID: 676067a5f123456789abcdef
   Kanban ID: 676067a5f123456789abcdef

4️⃣ Lấy danh sách dự án...
✅ Có 3 dự án
   Dự án mới nhất: Test Project 11/07/2025, 10:30:45

🎉 Tất cả test đều PASS! API hoạt động tốt.
```

### Test Kanban Task Thành Công:
```
🚀 Bắt đầu test tạo task trong Kanban...
📌 Sử dụng Kanban ID: 68700d62598889d1be8f6742
📌 Sử dụng Project ID: 68700d62598889d1be8f673e

1️⃣ Kiểm tra server...
✅ Server đang hoạt động: healthy

2️⃣ Đăng nhập...
✅ Đăng nhập thành công. User: Admin User

3️⃣ Kiểm tra thông tin Kanban...
✅ Kanban tồn tại: Kanban - Test Project
   Project: Test Project
   Số tasks hiện tại: 5

4️⃣ Tạo task mới...
✅ Tạo task thành công: Task Test Nhanh 11/07/2025, 10:45:30
   ID: 676067a5f123456789abcd12
   Status: Cần làm
   Priority: Cao
   Order: 6

5️⃣ Lấy danh sách tasks...
✅ Có 6 tasks trong Kanban
   Phân bố theo trạng thái: {"Cần làm": 3, "Đang làm": 2, "Hoàn thành": 1}
✅ Task vừa tạo đã xuất hiện trong danh sách

6️⃣ Cập nhật task...
✅ Cập nhật task thành công
   Tiêu đề mới: Task Test Nhanh 11/07/2025, 10:45:30 [UPDATED]
   Trạng thái mới: Đang làm
   Độ ưu tiên mới: Trung bình

🎉 Tất cả test Kanban Task đều PASS! API hoạt động tốt.
```

### Test Thất Bại (Ví dụ):
```
❌ Test thất bại:
   Status: 404
   Message: User not found
```

## Troubleshooting

### Lỗi thường gặp:

1. **Server không phản hồi:**
   - Kiểm tra server có đang chạy không
   - Kiểm tra port có đúng không (mặc định 5000)

2. **User not found:**
   - Tài khoản admin1@gmail.com chưa tồn tại
   - Tạo tài khoản hoặc đổi thông tin đăng nhập

3. **Invalid credentials:**
   - Mật khẩu sai
   - Kiểm tra lại mật khẩu trong database

4. **Database connection error:**
   - MongoDB chưa kết nối
   - Kiểm tra connection string trong .env

## Tùy Chỉnh

### Thay đổi thông tin đăng nhập:
Sửa biến `USER_CREDENTIALS` hoặc `LOGIN_CREDENTIALS` trong file test:

```javascript
const USER_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};
```

### Thay đổi URL server:
Sửa biến `API_BASE` hoặc `SERVER_URL`:

```javascript
const API_BASE = 'http://localhost:3001/api'; // Ví dụ port khác
```

### Thay đổi dữ liệu test project:
Sửa object `projectData` hoặc `TEST_PROJECT_DATA` trong file test.

## API Endpoints Được Test

### Test Dự Án:
1. `GET /api/health` - Kiểm tra sức khỏe server
2. `POST /api/auth/login` - Đăng nhập
3. `POST /api/projects` - Tạo dự án mới
4. `GET /api/projects` - Lấy danh sách dự án
5. `GET /api/projects/:id` - Lấy chi tiết dự án (chỉ trong test chi tiết)

### Test Kanban Task:
1. `GET /api/health` - Kiểm tra sức khỏe server
2. `POST /api/auth/login` - Đăng nhập
3. `GET /api/kanban/:id` - Lấy thông tin Kanban board
4. `POST /api/kanban/tasks` - Tạo task mới
5. `GET /api/kanban-tasks/:kanban_id/tasks` - Lấy danh sách tasks
6. `PUT /api/kanban/tasks/:id` - Cập nhật task

### Test Team Management:
1. `GET /api/health` - Kiểm tra sức khỏe server
2. `POST /api/auth/login` - Đăng nhập admin
3. `POST /api/auth/register` - Tạo user mới
4. `POST /api/auth/login` - Đăng nhập user mới
5. `POST /api/teams` - Tạo team mới
6. `POST /api/teams/:teamId/members` - Thêm thành viên vào team
7. `GET /api/teams/:teamId/members` - Lấy danh sách thành viên team
8. `GET /api/teams` - Lấy danh sách teams của user

---

*Tạo bởi: GitHub Copilot*
*Ngày: 11/07/2025*
