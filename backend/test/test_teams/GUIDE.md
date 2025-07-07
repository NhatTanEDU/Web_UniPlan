# 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG TEST TEAMS

## 📋 Checklist Trước Khi Chạy

### ✅ Yêu cầu hệ thống:
- [x] Node.js >= 14.0.0
- [x] NPM hoặc Yarn  
- [x] Server API UniPlan đang chạy tại `localhost:5000`

### ✅ Chuẩn bị:
1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Khởi động server API UniPlan:**
   ```bash
   # Trong thư mục backend
   cd ../../
   npm start
   # hoặc
   node server.js
   ```

3. **Kiểm tra server hoạt động:**
   - Truy cập: http://localhost:5000/api/health
   - Hoặc chạy: `node quick-test.js`

## 🎮 Cách Khởi Chạy

### Method 1: Script Tự Động (Khuyến nghị)
```bash
# Windows Command Prompt
start.bat

# PowerShell  
.\start.ps1

# Cross-platform
npm start
```

### Method 2: Chạy Trực Tiếp
```bash
node src/mainTestSystem.js
```

### Method 3: Chạy Menu Riêng Lẻ
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

# Chạy tất cả tự động
npm run auto-run

# Xem thống kê
npm run stats
```

## 🎯 Hướng Dẫn Sử Dụng

### Bước 1: Khởi chạy hệ thống
```bash
npm start
```

### Bước 2: Chọn menu từ danh sách
```
┌────────────────────────────────────────────────────────────┐
│                    📋 MENU CHÍNH                           │
├────────────────────────────────────────────────────────────┤
│ Trạng thái: ❌ Chưa đăng nhập                               │  
├────────────────────────────────────────────────────────────┤
│ 1. 🔐 Đăng nhập Admin                                      │
│ 2. 👥 CRUD Teams                                           │
│ 3. 👤 Quản lý thành viên                                   │
│ 4. 🔄 Thay đổi vai trò                                     │
│ 5. 🗑️ Xóa thành viên                                       │
│ 6. 📁 Quản lý dự án                                        │
├────────────────────────────────────────────────────────────┤
│ 7. ⚡ Chạy tất cả (Tự động)                                │
│ 8. 📊 Xem thống kê                                         │
│ 9. ❌ Thoát                                                 │
└────────────────────────────────────────────────────────────┘
```

### Bước 3: Thực hiện test theo menu

#### 🔐 Menu 1: Đăng nhập Admin
- Tự động đăng nhập với tài khoản Admin cố định
- Lưu token để sử dụng cho các menu khác

#### 👥 Menu 2: CRUD Teams  
- Tạo 3 teams mới
- Tìm kiếm teams
- Cập nhật thông tin teams
- Xóa 1 team

#### 👤 Menu 3: Quản lý thành viên
- Xem danh sách thành viên cá nhân
- Thêm thành viên vào teams
- Tìm kiếm thành viên

#### 🔄 Menu 4: Thay đổi vai trò
- Chuyển đổi vai trò Member ↔ Editor
- Kiểm tra kết quả thay đổi

#### 🗑️ Menu 5: Xóa thành viên
- Chọn team có nhiều thành viên
- Xóa thành viên (giữ lại ít nhất 1)

#### 📁 Menu 6: Quản lý dự án
- Tạo nhiều dự án
- Cập nhật dự án
- Lấy chi tiết dự án
- Xóa dự án test

### Bước 4: Chạy Auto-Run (Khuyến nghị)
```bash
# Chọn menu 7 hoặc chạy trực tiếp:
npm run auto-run
```

**Auto-Run sẽ:**
- Chạy tất cả 6 menu tự động
- Lưu thống kê chi tiết vào file .txt
- Hiển thị báo cáo tổng kết
- Tự động dọn dẹp file cũ

## 📊 Thống Kê và Kết Quả

### File thống kê được lưu tại:
```
ketquathongke/
├── test_results_2025-06-02T14-30-15-123Z.txt
├── test_results_2025-06-02T14-25-10-456Z.txt  
└── test_results_2025-06-02T14-20-05-789Z.txt
```

### Nội dung file thống kê:
- 📈 Tổng quan kết quả
- 📋 Kết quả theo menu
- ⚠️ Lỗi và cảnh báo  
- 💡 Khuyến nghị cải thiện

### Xem thống kê:
```bash
# Trong hệ thống: chọn menu 8
# Hoặc chạy trực tiếp:
npm run stats
```

## 🔧 Xử Lý Sự Cố

### ❌ Lỗi: "ECONNREFUSED localhost:5000"
**Nguyên nhân:** Server API chưa khởi động
**Giải pháp:**
```bash
cd ../../  # Về thư mục backend  
npm start  # Khởi động server
```

### ❌ Lỗi: "Đăng nhập thất bại"
**Nguyên nhân:** Sai thông tin Admin hoặc server chưa sẵn sàng
**Giải pháp:**
1. Kiểm tra `src/config/constants.js`
2. Đảm bảo database có tài khoản Admin
3. Kiểm tra server logs

### ❌ Lỗi: "Permission denied"
**Nguyên nhân:** Quyền truy cập file/folder
**Giải pháp:**
```bash
# Windows: Chạy PowerShell với quyền Administrator
# Linux/Mac: Sử dụng sudo hoặc chmod
```

### ❌ Lỗi: "Module not found"
**Nguyên nhân:** Dependencies chưa được cài đặt
**Giải pháp:**
```bash
npm install
# hoặc
npm ci
```

## 🎯 Tips và Best Practices

### 💡 Sử dụng hiệu quả:
1. **Luôn chạy Menu 1 trước** để đăng nhập
2. **Sử dụng Auto-Run** để test toàn diện
3. **Xem thống kê thường xuyên** để theo dõi kết quả
4. **Kiểm tra logs** khi có lỗi

### 🔄 Workflow khuyến nghị:
```
1. Khởi động server API
   ↓
2. Chạy quick-test.js để kiểm tra
   ↓  
3. Chạy npm start
   ↓
4. Chọn Menu 7 (Auto-Run)
   ↓
5. Xem kết quả trong Menu 8
```

### 📝 Ghi chú:
- File thống kê tự động xóa cũ (giữ 3 files)
- Mỗi lần chạy sẽ tạo session riêng
- Có thể chạy từng menu độc lập
- Hỗ trợ timeout và retry tự động

## 📞 Hỗ Trợ

**Gặp vấn đề?**
1. Kiểm tra `quick-test.js` để chẩn đoán
2. Xem file log trong `ketquathongke/`
3. Kiểm tra server API status
4. Liên hệ team phát triển

---

**🎯 Chúc bạn testing thành công!**
