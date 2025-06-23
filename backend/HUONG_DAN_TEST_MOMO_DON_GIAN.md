# 🎯 HƯỚNG DẪN TEST THANH TOÁN MOMO ĐƠN GIẢN

## 🚀 CHẠY 1 FILE DUY NHẤT ĐỂ TEST TOÀN BỘ

### ⭐ FILE CHÍNH: `test-momo-payment-url.js`

**Đây là file DUY NHẤT bạn cần chạy để test toàn bộ quy trình thanh toán MoMo!**

```bash
cd D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend
node test-momo-payment-url.js
```

## 🎯 FILE NÀY SẼ TỰ ĐỘNG:

✅ **Kết nối MongoDB**
✅ **Tạo payment request MoMo** 
✅ **Tạo QR code và payment URLs**
✅ **Test xem payment URL có hoạt động không**
✅ **Hiển thị hướng dẫn test trên mobile**
✅ **Tự động monitor payment status** (check mỗi 10 giây)
✅ **Báo kết quả khi thanh toán thành công/thất bại**

## 📱 SAU KHI CHẠY FILE:

### Bước 1: Copy QR Code
Script sẽ hiển thị QR code như này:
```
📱 Mobile QR Code:
00020101021226110007vn.momo38630010A000000727013300069710250119PMC25175000000000050208QRIBFTTA530370454065000005802VN62470515MMTiJ4cRnwH8mQR0824Su dung tat ca tinh nang63041891
```

### Bước 2: Test trên điện thoại
1. **Copy QR code URL** ở trên
2. **Paste vào browser** trên điện thoại  
3. **Trang sẽ tự động mở MoMo app**
4. **Thực hiện thanh toán**

### Bước 3: Theo dõi kết quả
Script sẽ tự động check status và báo kết quả:
```
🔍 Check #1/30 - 00:29:22
📊 Status: pending
⏳ Đang chờ thanh toán...

🔍 Check #2/30 - 00:29:32  
🎉 THANH TOÁN THÀNH CÔNG!
✅ Completed at: 2025-06-24T00:30:15.000Z
```

## 🎯 CÁC FILE KHÁC (TÙY CHỌN):

### 🔧 `test-momo-full-payment-flow.js` - Test chi tiết hơn
- Monitor lâu hơn (5 phút)
- Có thêm simulation và debug info
- Phù hợp để debug chi tiết

```bash
node test-momo-full-payment-flow.js
```

### ⚡ `test-momo-integration.js` - Test cơ bản
- Chỉ tạo payment và hiển thị URLs
- Không monitor status
- Nhanh và đơn giản

```bash  
node test-momo-integration.js
```

## 🔥 KHUYẾN NGHỊ: 

**👉 SỬ DỤNG `test-momo-payment-url.js` - ĐÂY LÀ FILE TỐT NHẤT!**

File này vừa đơn giản, vừa đầy đủ tính năng:
- ✅ Tạo payment
- ✅ Test URL accessibility  
- ✅ Monitor status tự động
- ✅ Hướng dẫn rõ ràng
- ✅ Báo kết quả real-time

## 🎯 QUY TRÌNH ĐƠN GIẢN:

```bash
# Bước 1: Chạy file
node test-momo-payment-url.js

# Bước 2: Copy QR code từ output

# Bước 3: Paste vào browser điện thoại

# Bước 4: Thanh toán bằng MoMo

# Bước 5: Xem kết quả trong console
```

## 🔧 NẾU CÓ LỖI:

### Lỗi: "Schema hasn't been registered for model User"
**✅ ĐÃ FIX:** File đã được cập nhật để import User model

### Lỗi: "Cannot connect to MongoDB"  
```bash
# Đảm bảo MongoDB đang chạy
net start MongoDB
```

### Lỗi: "MoMo configuration error"
```bash
# Kiểm tra file .env có đầy đủ MoMo config
```

## 🎉 KẾT QUẢ MONG ĐỢI:

Khi chạy thành công, bạn sẽ thấy:
```
🚀 KIỂM TRA GIAO DỊCH MOMO
✅ Đã kết nối MongoDB
✅ Payment request đã tạo thành công!
📋 Order ID: MOMOBKUN201805291750699750743
💰 Amount: 500.000 VND
📦 Plan: Gói UniPlan 1 tháng

🔗 PAYMENT URLS:
🌐 Web Payment URL: https://test-payment.momo.vn/...
📱 Mobile QR Code: 00020101021226110007vn.momo...

✅ Payment URL có thể truy cập được

📋 HƯỚNG DẪN TEST THANH TOÁN:
🎯 CÁCH 1: Test trên điện thoại
1. Copy QR Code URL: ...
2. Paste vào browser trên điện thoại
3. Trang sẽ tự động mở MoMo app  
4. Thực hiện thanh toán

⏳ Monitoring payment status...
🔍 Check #1/30 - 00:29:22
⏳ Đang chờ thanh toán...
```

**🎯 Chạy file này và test thanh toán MoMo ngay bây giờ!**
