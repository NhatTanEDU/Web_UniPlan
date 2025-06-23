# 🚀 HƯỚNG DẪN ĐỖN GIẢN - CHỈ CẦN CHẠY 1 FILE

## ⚡ TÓM TẮT CỰC NGẮN

**BẠN CHỈ CẦN CHẠY 1 FILE DUY NHẤT: `setup-ngrok-momo.js`**

## 📋 CÁC BƯỚC (TỔNG CỘNG 3 BƯỚC)

### Bước 1: Mở CMD với quyền Administrator
- Nhấn **Win + R**
- Gõ: `cmd`
- Nhấn **Ctrl + Shift + Enter** (để chạy với quyền Admin)

### Bước 2: Chuyển đến thư mục backend
```bash
cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
```

### Bước 3: Chạy lệnh ma thuật
```bash
node setup-ngrok-momo.js
```

## ✅ KẾT QUẢ

Script sẽ tự động làm **TẤT CẢ**:
- ✅ Dừng processes cũ
- ✅ Khởi động ngrok  
- ✅ Lấy URL mới
- ✅ Cập nhật file .env
- ✅ Khởi động backend server
- ✅ Chạy test MoMo
- ✅ Hiển thị QR code để test

## 📱 TEST TRÊN MOMO

1. Copy QR code URL từ kết quả
2. Mở MoMo UAT app
3. Paste/Scan QR code
4. Thử thanh toán

## 🛑 DỪNG

Nhấn **Ctrl + C** để dừng tất cả

---

## ❌ KHÔNG CẦN CHẠY CÁC FILE KHÁC

- ❌ `update-env-with-ngrok.js` - KHÔNG CẦN
- ❌ `setup-ngrok-momo.bat` - KHÔNG CẦN  
- ❌ Bất kỳ file nào khác - KHÔNG CẦN

**CHỈ CẦN: `node setup-ngrok-momo.js` VÀ XONG!**
