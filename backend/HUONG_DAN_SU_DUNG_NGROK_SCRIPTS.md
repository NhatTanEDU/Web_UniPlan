# 🚀 HƯỚNG DẪN SỬ DỤNG NGROK VÀ CẬP NHẬT MOMO .ENV

## 📋 TỔNG QUAN

Các script này giúp tự động hóa việc setup ngrok và cập nhật file `.env` cho MoMo payment integration trong dự án UniPlan.

## 📁 CÁC FILE SCRIPT

### 1. 🎯 `setup-ngrok-momo.js` - SCRIPT HOÀN CHỈNH NHẤT
**Chức năng:** Tự động hóa toàn bộ quy trình từ A-Z
- ✅ Dừng tất cả processes cũ (ngrok, node)
- ✅ Khởi động ngrok mới
- ✅ Lấy URL từ ngrok API
- ✅ Cập nhật file .env với URLs mới
- ✅ Khởi động backend server
- ✅ Chạy test MoMo integration tự động
- ✅ Theo dõi và báo cáo tiến trình

### 2. 📝 `update-env-with-ngrok.js` - SCRIPT ĐƠN GIẢN
**Chức năng:** Chỉ cập nhật .env với ngrok URL hiện có
- ✅ Lấy URL từ ngrok API (nếu ngrok đang chạy)
- ✅ Backup file .env trước khi cập nhật
- ✅ Cập nhật MOMO_REDIRECT_URL và MOMO_IPN_URL
- ✅ Hiển thị hướng dẫn bước tiếp theo

### 3. 🖱️ `setup-ngrok-momo.bat` - BATCH FILE WINDOWS
**Chức năng:** Chạy tự động trên Windows
- ✅ Interface thân thiện cho người dùng Windows
- ✅ Tự động khởi động ngrok
- ✅ Gọi script update .env
- ✅ Hiển thị kết quả và hướng dẫn

## 🎯 CÁCH SỬ DỤNG CHI TIẾT

### 🚀 PHƯƠNG ÁN 1: SCRIPT HOÀN CHỈNH (KHUYẾN NGHỊ)

#### Bước 1: Mở Command Prompt với quyền Administrator
```bash
# Cách 1: Tìm "cmd" trong Start Menu, chuột phải -> "Run as administrator"
# Cách 2: Nhấn Win+X, chọn "Windows PowerShell (Admin)"
```

#### Bước 2: Chuyển đến thư mục backend
```bash
cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
```

#### Bước 3: Chạy script hoàn chỉnh
```bash
node setup-ngrok-momo.js
```

#### Bước 4: Theo dõi quá trình tự động
Script sẽ tự động thực hiện:
```
🔄 Đang dừng các process cũ...
✅ Đã dừng ngrok cũ
🚀 Đang khởi động ngrok...
✅ Ngrok đã khởi động
🔍 Đang lấy URL từ ngrok API...
✅ Tìm thấy ngrok URL: https://abc123.ngrok-free.app
📝 Đang cập nhật file .env...
✅ Đã cập nhật file .env thành công!
🚀 Đang khởi động backend server...
✅ Backend server đã khởi động thành công!
🧪 Đang chạy test thanh toán MoMo...
🎉 Test thanh toán hoàn thành!
```

#### Bước 5: Sử dụng QR code để test
Script sẽ hiển thị QR code URL để bạn test trên MoMo UAT app.

#### Bước 6: Dừng services (khi cần)
```bash
# Nhấn Ctrl+C để dừng tất cả services
```

---

### 📝 PHƯƠNG ÁN 2: SCRIPT ĐƠN GIẢN

#### Điều kiện tiên quyết: Ngrok phải đang chạy
```bash
# Mở Command Prompt khác và chạy:
D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
```

#### Bước 1: Chuyển đến thư mục backend
```bash
cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
```

#### Bước 2: Chạy script cập nhật .env
```bash
node update-env-with-ngrok.js
```

#### Bước 3: Theo dõi kết quả
```
🔍 Đang lấy URL từ ngrok API...
✅ Tìm thấy ngrok URL: https://abc123.ngrok-free.app
📝 Đang cập nhật file .env...
💾 Đã backup file .env gốc tại: .env.backup.1750697123456
✅ Đã cập nhật MOMO_REDIRECT_URL
✅ Đã cập nhật MOMO_IPN_URL
🎉 Đã cập nhật file .env thành công!
```

#### Bước 4: Restart backend server thủ công
```bash
node server.js
```

#### Bước 5: Chạy test MoMo
```bash
node test-momo-integration.js
```

---

### 🖱️ PHƯƠNG ÁN 3: BATCH FILE (DỄ NHẤT)

#### Bước 1: Double-click file batch
- Tìm file `setup-ngrok-momo.bat` trong thư mục backend
- Double-click để chạy

#### Bước 2: Làm theo hướng dẫn trên màn hình
Batch file sẽ hiển thị:
```
========================================
     UNIPLAN MOMO NGROK SETUP
========================================

🔄 Dang dung cac process cu...
🚀 Dang khoi dong ngrok...
⏳ Cho ngrok khoi dong (10 giay)...
📝 Dang cap nhat .env voi ngrok URL...
✅ Hoan thanh! Ngrok da chay va .env da duoc cap nhat
```

#### Bước 3: Tiếp tục với backend
```bash
cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
node server.js
node test-momo-integration.js
```

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Cannot find ngrok.exe"
**Nguyên nhân:** Đường dẫn ngrok không đúng

**Cách khắc phục:**
1. Kiểm tra ngrok có tồn tại:
   ```bash
   dir "D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe"
   ```
2. Nếu không có, download ngrok từ: https://ngrok.com/download
3. Extract và đặt đúng thư mục

### ❌ Lỗi: "Port 5000 is already in use"
**Nguyên nhân:** Có process khác đang dùng port 5000

**Cách khắc phục:**
```bash
# Dừng tất cả node processes
taskkill /F /IM node.exe

# Hoặc tìm và kill process cụ thể
netstat -ano | findstr :5000
taskkill /F /PID [PID_NUMBER]
```

### ❌ Lỗi: "Cannot connect to ngrok API"
**Nguyên nhân:** Ngrok chưa khởi động hoặc chưa sẵn sàng

**Cách khắc phục:**
1. Đảm bảo ngrok đang chạy:
   ```bash
   D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
   ```
2. Kiểm tra ngrok web interface: http://127.0.0.1:4040
3. Đợi 5-10 giây cho ngrok khởi động hoàn toàn

### ❌ Lỗi: "Permission denied" hoặc "Access denied"
**Nguyên nhân:** Không có quyền ghi file .env

**Cách khắc phục:**
1. Chạy Command Prompt với quyền Administrator
2. Kiểm tra quyền file .env:
   ```bash
   icacls .env
   ```
3. Đảm bảo không có antivirus chặn

### ❌ Lỗi: "Module not found"
**Nguyên nhân:** Thiếu dependencies

**Cách khắc phục:**
```bash
# Cài đặt dependencies
npm install

# Hoặc chỉ cài packages cần thiết
npm install dotenv mongoose
```

## 📋 KIỂM TRA SAU KHI CẬP NHẬT

### 1. ✅ Kiểm tra file .env
Mở file `.env` và xác nhận:
```properties
MOMO_REDIRECT_URL=https://[ngrok-url].ngrok-free.app/api/payment/momo/return
MOMO_IPN_URL=https://[ngrok-url].ngrok-free.app/api/payment/momo/ipn
```

### 2. ✅ Test ngrok connectivity
```bash
# Kiểm tra ngrok web interface
start http://127.0.0.1:4040

# Test callback URLs
curl https://[ngrok-url].ngrok-free.app/api/payment/momo/return
```

### 3. ✅ Test MoMo integration
```bash
node test-momo-integration.js
```

**Kết quả mong đợi:**
```
🎉 SUCCESS! Payment created successfully:
📋 Payment Details:
  - Order ID: MOMO1750697414851
  - QR Code URL: momo://app?action=payWithApp&isScanQR=true...
```

### 4. ✅ Test QR code trên MoMo UAT app
- Copy QR code URL từ kết quả test
- Mở MoMo UAT app trên điện thoại
- Paste URL hoặc scan QR code

## 🎯 WORKFLOW HOÀN CHỈNH

### Lần đầu setup:
```bash
# Bước 1: Chạy script hoàn chỉnh
node setup-ngrok-momo.js

# Bước 2: Test trên MoMo app với QR code được tạo
```

### Các lần sau (khi ngrok URL thay đổi):
```bash
# Cách 1: Chạy lại script hoàn chỉnh
node setup-ngrok-momo.js

# Cách 2: Chỉ cập nhật .env (nếu ngrok đang chạy)
node update-env-with-ngrok.js
node server.js  # restart backend
```

### Hàng ngày khi phát triển:
```bash
# Bước 1: Khởi động ngrok (nếu chưa có)
ngrok http 5000

# Bước 2: Cập nhật .env nếu URL thay đổi
node update-env-with-ngrok.js

# Bước 3: Chạy backend
node server.js

# Bước 4: Test khi cần
node test-momo-integration.js
```

## 💡 TIPS & BEST PRACTICES

### 🎯 Tối ưu hóa workflow:
1. **Sử dụng ngrok account:** Đăng ký tài khoản ngrok để có fixed subdomain
2. **Multiple terminals:** Mở riêng terminal cho ngrok và backend
3. **Hot reload:** Sử dụng nodemon cho backend development

### 🔍 Debug và monitoring:
1. **Ngrok logs:** Kiểm tra http://127.0.0.1:4040 để xem requests
2. **Backend logs:** Theo dõi console logs khi test MoMo
3. **MoMo UAT logs:** Check response từ MoMo UAT app

### 🛡️ Bảo mật:
1. **Backup .env:** Scripts tự động backup trước khi cập nhật
2. **Environment:** Chỉ sử dụng test credentials cho development
3. **Ngrok auth:** Sử dụng ngrok authtoken cho bảo mật tốt hơn

### ⚡ Performance:
1. **Reuse ngrok:** Giữ ngrok chạy giữa các session
2. **Fast restart:** Chỉ restart backend khi cần thiết
3. **Cache:** Browser cache có thể ảnh hưởng callback URLs

## 🔗 LINKS HỮU ÍCH

- **Ngrok Web Interface:** http://127.0.0.1:4040
- **MoMo Developer Docs:** https://developers.momo.vn
- **Ngrok Download:** https://ngrok.com/download
- **Node.js Download:** https://nodejs.org

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Verify ngrok đang chạy: http://127.0.0.1:4040
3. Test MoMo integration: `node test-momo-integration.js`
4. Restart tất cả: Ctrl+C và chạy lại script

---

**🎉 Chúc bạn setup thành công và test MoMo integration suôn sẻ!**
