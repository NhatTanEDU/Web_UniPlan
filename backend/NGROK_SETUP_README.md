# HƯỚNG DẪN SỬ DỤNG NGROK VÀ CẬP NHẬT MOMO

## 🎯 TÓM TẮT NHANH - CHỈ CẦN CHẠY 1 FILE!

**🚀 CÁCH ĐƠN GIẢN NHẤT - CHỈ 3 BƯỚC:**

1. **Mở Command Prompt với quyền Administrator**
2. **Chuyển đến thư mục backend:**
   ```bash
   cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
   ```
3. **Chạy 1 lệnh duy nhất:**
   ```bash
   node setup-ngrok-momo.js
   ```

**✅ XONG! File này sẽ tự động làm TẤT CẢ:**
- Dừng processes cũ
- Khởi động ngrok
- Cập nhật .env  
- Khởi động backend
- Chạy test MoMo
- Hiển thị QR code để test

---

## 📁 CHI TIẾT CÁC FILE (CHỈ ĐỂ THAM KHẢO)

### 1. `setup-ngrok-momo.js` ⭐ **FILE CHÍNH - CHẠY FILE NÀY**
- ✅ Tự động kill processes cũ
- ✅ Khởi động ngrok
- ✅ Lấy URL từ ngrok API
- ✅ Cập nhật .env
- ✅ Khởi động backend server
- ✅ Chạy test MoMo

**Cách sử dụng:**
```bash
cd backend
node setup-ngrok-momo.js
```

### 2. `update-env-with-ngrok.js` (CHỈ CẬP NHẬT .ENV - KHÔNG CẦN DÙNG)
- ❌ **KHÔNG KHUYẾN NGHỊ** - Phức tạp hơn, cần chạy ngrok thủ công trước

**Cách sử dụng:**
```bash
# Bước 1: Khởi động ngrok (thủ công)
D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000

# Bước 2: Cập nhật .env
cd backend
node update-env-with-ngrok.js
```

### 3. `setup-ngrok-momo.bat` (CHO WINDOWS - KHÔNG CẦN DÙNG)
- ❌ **KHÔNG KHUYẾN NGHỊ** - Không ổn định như script .js

---

## 🚀 HƯỚNG DẪN CHI TIẾT - CHỈ CẦN ĐỌC PHẦN NÀY

### ⭐ CÁCH DUY NHẤT BẠN CẦN BIẾT:

**Bước 1:** Mở Command Prompt với quyền Administrator
- Tìm "cmd" trong Start Menu
- Chuột phải chọn "Run as administrator"

**Bước 2:** Chuyển đến thư mục
```bash
cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
```

**Bước 3:** Chạy lệnh ma thuật
```bash
node setup-ngrok-momo.js
```

**Bước 4:** Ngồi xem và đợi kết quả
Script sẽ tự động làm tất cả và hiển thị:
```
🔄 Đang dừng các process cũ...
✅ Đã dừng ngrok cũ
🚀 Đang khởi động ngrok...
✅ Ngrok đã khởi động  
🔍 Đang lấy URL từ ngrok API...
✅ Tìm thấy ngrok URL: https://abc123.ngrok-free.app
📝 Đang cập nhật file .env...
✅ Đã cập nhật .env thành công!
🚀 Đang khởi động backend server...
✅ Backend server đã khởi động!
🧪 Đang chạy test MoMo...
🎉 QR Code để test: momo://app?action=payWithApp...
```

**Bước 5:** Copy QR code và test trên MoMo UAT app

**Bước 6:** Nhấn `Ctrl+C` khi muốn dừng

### ❌ CÁC PHƯƠNG ÁN KHÁC (KHÔNG CẦN ĐỌC)

### Phương án 1: SỬ DỤNG SCRIPT HOÀN CHỈNH (KHUYẾN NGHỊ)

1. Mở Command Prompt với quyền Administrator
2. Chuyển đến thư mục backend:
   ```bash
   cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
   ```
3. Chạy script:
   ```bash
   node setup-ngrok-momo.js
   ```
4. Script sẽ tự động:
   - Dừng ngrok/node processes cũ
   - Khởi động ngrok mới
   - Cập nhật .env với URL mới
   - Khởi động backend server
   - Chạy test MoMo integration
5. Nhấn `Ctrl+C` để dừng tất cả

### Phương án 2: SỬ DỤNG BATCH FILE (ĐƠN GIẢN NHẤT)

1. Double-click file `setup-ngrok-momo.bat`
2. Làm theo hướng dẫn trên màn hình
3. Sau khi hoàn thành, chạy backend và test:
   ```bash
   node server.js
   node test-momo-integration.js
   ```

### Phương án 3: CẬP NHẬT .ENV THỦ CÔNG

1. Khởi động ngrok:
   ```bash
   D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe http 5000
   ```
2. Cập nhật .env:
   ```bash
   cd backend
   node update-env-with-ngrok.js
   ```
3. Restart backend server

## 🔧 XỬ LÝ LỖI

### Lỗi: "Cannot find ngrok.exe"
- Kiểm tra đường dẫn ngrok trong script
- Đảm bảo ngrok đã được download và extract

### Lỗi: "Port 5000 is already in use"
- Dừng tất cả node processes: `taskkill /F /IM node.exe`
- Hoặc thay đổi port trong script

### Lỗi: "Cannot connect to ngrok API"
- Đảm bảo ngrok đang chạy
- Kiểm tra ngrok web interface: http://127.0.0.1:4040

### Lỗi: "Permission denied"
- Chạy Command Prompt với quyền Administrator
- Kiểm tra quyền ghi file .env

## 📋 KIỂM TRA SAU KHI CẬP NHẬT

1. **Kiểm tra .env file:**
   ```
   MOMO_REDIRECT_URL=https://[ngrok-url].ngrok-free.app/api/payment/momo/return
   MOMO_IPN_URL=https://[ngrok-url].ngrok-free.app/api/payment/momo/ipn
   ```

2. **Test MoMo integration:**
   ```bash
   node test-momo-integration.js
   ```

3. **Kiểm tra ngrok status:**
   - Mở browser: http://127.0.0.1:4040
   - Xem danh sách tunnels

## 🎯 BƯỚC TIẾP THEO SAU KHI SETUP

1. **Chạy backend server:**
   ```bash
   node server.js
   ```

2. **Test thanh toán MoMo:**
   ```bash
   node test-momo-integration.js
   ```

3. **Quét QR code trên MoMo UAT app**

4. **Kiểm tra callback logs trong backend**

## 💡 TIPS

- **Backup .env:** Script tự động tạo backup trước khi cập nhật
- **Multiple ngrok sessions:** Đảm bảo chỉ có 1 ngrok instance chạy port 5000
- **Ngrok free plan:** URL sẽ thay đổi mỗi khi restart ngrok
- **Debug:** Kiểm tra ngrok logs tại http://127.0.0.1:4040

## 🔗 LINKS HỮU ÍCH

- Ngrok Web Interface: http://127.0.0.1:4040
- MoMo Docs: https://developers.momo.vn
- Ngrok Download: https://ngrok.com/download
