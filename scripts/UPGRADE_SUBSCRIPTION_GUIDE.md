# 🚀 HƯỚNG DẪN NÂNG CẤP SUBSCRIPTION MANUAL

## 📋 Mô tả
Script này cho phép nâng cấp subscription trực tiếp cho user mà không cần qua quy trình thanh toán MoMo.

## 📁 Vị trí file
```
backend/upgrade-admin-subscription.js
```

## ⚠️ Lưu ý quan trọng
- Script này **BỎ QUA** quy trình thanh toán
- Chỉ dành cho **Admin** sử dụng trong trường hợp đặc biệt
- Luôn **kiểm tra trước** khi thực hiện upgrade thực sự

---

## 🛠️ CÁCH SỬ DỤNG

### 1. **Điều hướng đến thư mục backend**
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

### 2. **Kiểm tra trạng thái hiện tại (DRY RUN)**
```bash
# Xem trạng thái admin1@gmail.com
node upgrade-admin-subscription.js admin1@gmail.com monthly

# Xem trạng thái user khác
node upgrade-admin-subscription.js thanhtoan@gmail.com monthly
node upgrade-admin-subscription.js user@example.com yearly
```

### 3. **Nâng cấp thực sự (với --confirm)**
```bash
# Nâng cấp admin1@gmail.com lên gói monthly (30 ngày)
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Nâng cấp thanhtoan@gmail.com lên gói monthly (30 ngày)
node upgrade-admin-subscription.js thanhtoan@gmail.com monthly --confirm

# Nâng cấp user lên gói yearly (365 ngày)
node upgrade-admin-subscription.js user@example.com yearly --confirm
```

---

## 📦 CÁC GÓI SUBSCRIPTION

| Gói      | Thời hạn | Giá trị (VND) | Mô tả                |
|----------|----------|---------------|----------------------|
| monthly  | 30 ngày  | 500,000       | Gói 1 tháng          |
| yearly   | 365 ngày | 5,000,000     | Gói 1 năm (tiết kiệm) |

---

## 🔍 LỆNH KIỂM TRA THƯỜNG DÙNG

### **Kiểm tra user hiện tại**
```bash
# Kiểm tra user theo email
node find-user-by-email.js admin1@gmail.com
node find-user-by-email.js thanhtoan@gmail.com

# Kiểm tra user theo ID
node find-user-by-id.js 6832fb21218f3827624d77c1
```

### **Kiểm tra payment**
```bash
# Kiểm tra tất cả payment
node check-all-payments.js

# Xóa pending payment (nếu cần)
node clear-payments-by-email.js admin1@gmail.com
node clear-payments-by-email.js thanhtoan@gmail.com
```

---

## 📝 VÍ DỤ THỰC TẾ

### **Scenario 1: Nâng cấp admin1@gmail.com**
```bash
# Bước 1: Kiểm tra trạng thái hiện tại
node upgrade-admin-subscription.js admin1@gmail.com monthly

# Bước 2: Thực hiện nâng cấp
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Bước 3: Verify kết quả
node find-user-by-email.js admin1@gmail.com
```

### **Scenario 2: Nâng cấp user thường lên yearly**
```bash
# Bước 1: Kiểm tra user
node find-user-by-email.js thanhtoan@gmail.com

# Bước 2: Xem preview upgrade
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly

# Bước 3: Thực hiện upgrade
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly --confirm

# Bước 4: Verify
node find-user-by-email.js thanhtoan@gmail.com
```

---

## 📊 OUTPUT MẪU

### **Dry Run (Kiểm tra trước)**
```
✅ Connected to MongoDB
🚀 Starting subscription upgrade...
📧 Target email: admin1@gmail.com
📦 Plan type: monthly
⚠️  DRY RUN MODE - Add --confirm to actually upgrade

📋 Current user status:
  - Name: System Administrator
  - Email: admin1@gmail.com
  - Current plan: free_trial
  - Subscription end: None

📦 Would upgrade to: monthly
📅 New end date: Mon Jul 21 2025 13:07:44 GMT+0700
⏱️  Duration: 30 days
```

### **Thực hiện upgrade thành công**
```
✅ Subscription upgraded successfully!
📊 New subscription details:
  - Plan: monthly
  - Start: Sat Jun 21 2025 13:09:39 GMT+0700
  - End: Mon Jul 21 2025 13:09:39 GMT+0700
  - Duration: 30 days
  - Days remaining: 30

📝 History record created: 68564ca3d7b1039031233b83
🎉 Upgrade completed successfully!
🔄 User can now access premium features
```

---

## ⚡ LỆNH NHANH (COPY & PASTE)

### **Các lệnh thường dùng nhất:**

```bash
# Kiểm tra admin1
node find-user-by-email.js admin1@gmail.com

# Nâng cấp admin1 lên monthly
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Kiểm tra thanhtoan user
node find-user-by-email.js thanhtoan@gmail.com

# Nâng cấp thanhtoan lên monthly
node upgrade-admin-subscription.js thanhtoan@gmail.com monthly --confirm

# Nâng cấp user lên yearly
node upgrade-admin-subscription.js user@example.com yearly --confirm

# Clear pending payment nếu bị lỗi 409
node clear-payments-by-email.js admin1@gmail.com
```

---

## 🛡️ TROUBLESHOOTING

### **Lỗi thường gặp:**

#### **1. MongoDB connection error**
```bash
# Kiểm tra server backend có chạy không
# Đảm bảo file .env có MONGODB_URI đúng
```

#### **2. User not found**
```bash
# Kiểm tra email có đúng không
node find-user-by-email.js <email>
```

#### **3. Lỗi 409 - Conflict payment**
```bash
# Clear pending payment trước
node clear-payments-by-email.js <email>
```

#### **4. Permission denied**
```bash
# Đảm bảo đang chạy trong thư mục backend
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:
1. ✅ Kiểm tra backend server đang chạy
2. ✅ Kiểm tra kết nối MongoDB
3. ✅ Verify email user có tồn tại
4. ✅ Clear pending payment nếu cần
5. ✅ Chạy dry run trước khi confirm

---

## 📝 CHANGELOG

- **v1.0** (2025-06-21): Tạo script upgrade subscription manual
- Hỗ trợ monthly/yearly plans
- Tích hợp subscription history logging
- Validation và error handling

---

**⚠️ LƯU Ý: Luôn backup database trước khi thực hiện các thao tác quan trọng!**
