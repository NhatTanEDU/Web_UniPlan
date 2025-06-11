# 🎯 Hệ Thống Test Teams - UniPlan

Hệ thống test tự động hoàn chỉnh cho các chức năng Teams trong dự án UniPlan.

## 📋 Tổng Quan

Hệ thống này cung cấp 6 menu test chính và chức năng auto-run toàn bộ với thống kê chi tiết:

### 🎪 Các Menu Chính:
1. **🔐 Đăng nhập Admin** - Xác thực với tài khoản Admin cố định
2. **👥 CRUD Teams** - Tạo, đọc, cập nhật, xóa teams
3. **👤 Quản lý thành viên** - Xem danh sách, thêm thành viên vào teams
4. **🔄 Thay đổi vai trò** - Chuyển đổi vai trò Member ↔ Editor
5. **🗑️ Xóa thành viên** - Xóa thành viên khỏi teams
6. **📁 Quản lý dự án** - Tạo, quản lý dự án trong teams

### ⚡ Chức Năng Đặc Biệt:
- **Auto-Run**: Chạy tất cả 6 menu tự động
- **📊 Thống kê**: Lưu kết quả vào file .txt (tối đa 3 files)
- **🧹 Auto-cleanup**: Tự động xóa file thống kê cũ

## 🚀 Cài Đặt

### Yêu Cầu Hệ Thống:
- Node.js >= 14.0.0
- NPM hoặc Yarn
- Server API UniPlan đang chạy tại `localhost:5000`

### Bước 1: Clone/Download
```bash
# Clone repository (nếu có)
git clone https://github.com/uniplan/test-teams
cd test-teams

# Hoặc tải về và giải nén
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
# hoặc
yarn install
```

### Bước 3: Cấu Hình
Mở `src/config/constants.js` và kiểm tra:
- `BASE_URL`: Đường dẫn API server (mặc định: `http://localhost:5000/api`)
- `ADMIN_ACCOUNT`: Thông tin tài khoản Admin test

## 🎮 Sử Dụng

### Chạy Hệ Thống Chính:
```bash
npm start
# hoặc
node src/mainTestSystem.js
```

### Chạy Từng Menu Riêng Lẻ:
```bash
# Menu 1: Đăng nhập Admin
npm run menu1

# Menu 2: CRUD Teams  
npm run menu2

# Menu 3: Quản lý thành viên
npm run menu3

# Menu 4: Thay đổi vai trò
npm run menu4

# Menu 5: Xóa thành viên
npm run menu5

# Menu 6: Quản lý dự án
npm run menu6
```

### Chạy Tự Động:
```bash
# Chạy tất cả menu tự động
npm run auto-run
```

### Xem Thống Kê:
```bash
# Xem thống kê đã lưu
npm run stats
```

## 📁 Cấu Trúc Dự Án

```
test_teams/
├── src/
│   ├── config/
│   │   └── constants.js          # Cấu hình và hằng số
│   ├── services/
│   │   ├── apiService.js         # Service API chung
│   │   ├── authService.js        # Menu 1: Đăng nhập
│   │   ├── teamService.js        # Menu 2: CRUD Teams
│   │   ├── memberService.js      # Menu 3: Quản lý thành viên
│   │   ├── roleService.js        # Menu 4: Thay đổi vai trò
│   │   ├── memberRemovalService.js # Menu 5: Xóa thành viên
│   │   ├── projectService.js     # Menu 6: Quản lý dự án
│   │   └── statisticsManager.js  # Quản lý thống kê
│   └── mainTestSystem.js         # Hệ thống chính
├── ketquathongke/               # Thư mục lưu file thống kê .txt
├── package.json
└── README.md
```

## 🎯 Chi Tiết Các Menu

### Menu 1: 🔐 Đăng nhập Admin
- Đăng nhập với tài khoản Admin cố định
- Lưu token để sử dụng cho các menu khác
- Kiểm tra phản hồi từ server

### Menu 2: 👥 CRUD Teams
- **Tạo**: Tạo 3 teams mới với dữ liệu ngẫu nhiên
- **Đọc**: Tìm kiếm teams theo tên
- **Cập nhật**: Sửa thông tin teams đã tạo
- **Xóa**: Xóa 1 team để test chức năng delete

### Menu 3: 👤 Quản lý thành viên
- Xem danh sách thành viên cá nhân
- Thêm thành viên vào teams
- Tìm kiếm thành viên trong team

### Menu 4: 🔄 Thay đổi vai trò
- Chuyển đổi vai trò thành viên: Member ↔ Editor
- Kiểm tra kết quả thay đổi
- Thống kê số lượng thay đổi thành công

### Menu 5: 🗑️ Xóa thành viên
- Chọn team có nhiều thành viên
- Xóa một số thành viên (giữ lại ít nhất 1)
- Kiểm tra danh sách sau khi xóa

### Menu 6: 📁 Quản lý dự án
- Tạo nhiều dự án với các thông tin khác nhau
- Cập nhật thông tin dự án
- Lấy chi tiết dự án
- Xóa dự án test

## 📊 Thống Kê và Báo Cáo

### File Thống Kê (.txt):
- Tự động tạo file với timestamp
- Chỉ giữ lại 3 files mới nhất
- Bao gồm:
  - Tổng quan kết quả
  - Chi tiết từng menu
  - Danh sách lỗi
  - Khuyến nghị cải thiện

### Thông Tin Thống Kê:
- Tổng số test thực hiện
- Tỷ lệ thành công/thất bại
- Thời gian thực thi
- Chi tiết lỗi theo menu

## ⚙️ Cấu Hình

### Constants.js:
```javascript
// API Configuration
BASE_URL: 'http://localhost:5000/api'

// Admin Account
ADMIN_ACCOUNT: {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
}

// File Management
MAX_TXT_FILES: 3  // Số file thống kê tối đa
```

### Delays (ms):
- `SHORT`: 500ms
- `MEDIUM`: 1000ms  
- `LONG`: 2000ms

## 🛠️ Tính Năng Nâng Cao

### Error Handling:
- Try-catch chi tiết cho mọi thao tác
- Log lỗi với context đầy đủ
- Xử lý timeout và network errors

### Modular Design:
- Tách riêng từng service
- Dễ dàng bảo trì và mở rộng
- Code reusability cao

### Auto-Cleanup:
- Tự động xóa file thống kê cũ
- Quản lý bộ nhớ hiệu quả

## 📝 Logs và Debug

### Console Output:
- Icons và màu sắc rõ ràng
- Thông báo tiếng Việt
- Progress tracking chi tiết

### File Logs:
- Lưu trong `ketquathongke/`
- Format dễ đọc
- Thống kê đầy đủ

## 🔧 Troubleshooting

### Lỗi Thường Gặp:

1. **Connection Error:**
   ```
   ❌ ECONNREFUSED localhost:5000
   ```
   **Giải pháp:** Đảm bảo server API đang chạy

2. **Login Failed:**
   ```
   ❌ Đăng nhập thất bại
   ```
   **Giải pháp:** Kiểm tra thông tin `ADMIN_ACCOUNT` trong constants.js

3. **Permission Denied:**
   ```
   ❌ EACCES: permission denied
   ```
   **Giải pháp:** Chạy với quyền admin hoặc thay đổi folder permissions

### Debug Mode:
Mở `apiService.js` và bật debug:
```javascript
const DEBUG = true; // Bật để xem chi tiết request/response
```

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## 📞 Hỗ Trợ

- **Email:** uniplan.support@gmail.com
- **Website:** https://uniplan.vn
- **Issues:** https://github.com/uniplan/test-teams/issues

## 📄 License

MIT License - xem file LICENSE để biết chi tiết.

---

**© 2024 UniPlan Development Team**

🎯 *"Testing made simple, results made clear"*
