# 🔽 HƯỚNG DẪN HẠ CẤP SUBSCRIPTION MANUAL

## 📋 Mô tả
Script này cho phép hạ cấp subscription trực tiếp cho user mà không cần qua quy trình phức tạp.

## 📁 Vị trí file
```
backend/downgrade-admin-subscription.js
```

## ⚠️ Lưu ý quan trọng
- Script này **HẠ CẤP** subscription ngay lập tức
- Chỉ dành cho **Admin** sử dụng trong trường hợp đặc biệt
- Luôn **kiểm tra trước** khi thực hiện downgrade thực sự
- **Không thể hoàn tác** - hãy cẩn thận khi sử dụng

---

## 🛠️ CÁCH SỬ DỤNG

### 1. **Điều hướng đến thư mục backend**
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

### 2. **Xem tùy chọn hạ cấp có sẵn**
```bash
# Xem tùy chọn cho admin1@gmail.com
node downgrade-admin-subscription.js admin1@gmail.com

# Xem tùy chọn cho user khác
node downgrade-admin-subscription.js thanhtoan@gmail.com
node downgrade-admin-subscription.js user@example.com
```

### 3. **Kiểm tra trước khi hạ cấp (DRY RUN)**
```bash
# Preview hạ cấp yearly → monthly
node downgrade-admin-subscription.js admin1@gmail.com monthly

# Preview hạ cấp yearly → free
node downgrade-admin-subscription.js admin1@gmail.com free

# Preview hạ cấp monthly → free
node downgrade-admin-subscription.js thanhtoan@gmail.com free
```

### 4. **Thực hiện hạ cấp (với --confirm)**
```bash
# Hạ từ yearly → monthly
node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Hạ từ yearly → free
node downgrade-admin-subscription.js admin1@gmail.com free --confirm

# Hạ từ monthly → free
node downgrade-admin-subscription.js thanhtoan@gmail.com free --confirm
```

---

## 📦 CÁC TÙY CHỌN HẠ CẤP

### **Từ YEARLY plan:**
| Hạ xuống | Thời hạn | Mô tả |
|----------|----------|-------|
| monthly  | 30 ngày từ hiện tại | Hạ từ 365 ngày → 30 ngày |
| free     | Kết thúc ngay | Hủy subscription hoàn toàn |

### **Từ MONTHLY plan:**
| Hạ xuống | Thời hạn | Mô tả |
|----------|----------|-------|
| free     | Kết thúc ngay | Hủy subscription hoàn toàn |

### **Từ FREE/EXPIRED plan:**
- ❌ **Không thể hạ cấp thêm** - đã ở mức thấp nhất

---

## 📝 VÍ DỤ THỰC TẾ

### **Scenario 1: User yearly muốn hạ về monthly**
```bash
# Bước 1: Xem tùy chọn hiện tại
node downgrade-admin-subscription.js admin1@gmail.com

# Bước 2: Preview hạ cấp
node downgrade-admin-subscription.js admin1@gmail.com monthly

# Bước 3: Thực hiện hạ cấp
node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Bước 4: Verify kết quả
node find-user-by-email.js admin1@gmail.com
```

### **Scenario 2: User monthly muốn hủy subscription**
```bash
# Bước 1: Xem tùy chọn
node downgrade-admin-subscription.js thanhtoan@gmail.com

# Bước 2: Preview hạ về free
node downgrade-admin-subscription.js thanhtoan@gmail.com free

# Bước 3: Thực hiện hủy
node downgrade-admin-subscription.js thanhtoan@gmail.com free --confirm

# Bước 4: Verify
node find-user-by-email.js thanhtoan@gmail.com
```

### **Scenario 3: Hủy subscription yearly ngay lập tức**
```bash
# Hủy subscription yearly về free ngay
node downgrade-admin-subscription.js admin1@gmail.com free --confirm
```

---

## 📊 OUTPUT MẪU

### **Xem tùy chọn hạ cấp (yearly user)**
```
👤 User Information:
  - Name: System Administrator
  - Email: admin1@gmail.com
  - Current plan: yearly
  - Subscription end: 2026-06-21T13:09:39.000Z

📋 Available downgrade options:

1. MONTHLY
   📦 Monthly Plan
   📝 Hạ từ Yearly → Monthly (30 ngày)
   ⏱️  Duration: 30 days
   💰 Amount: 500,000 VND
   🔧 Command: node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm

2. FREE
   📦 Free Plan
   📝 Hạ từ Yearly → Free (hết subscription ngay)
   ⏱️  Duration: Immediate termination
   💰 Amount: 0 VND
   🔧 Command: node downgrade-admin-subscription.js admin1@gmail.com free --confirm
```

### **Thực hiện hạ cấp thành công**
```
✅ Subscription downgraded successfully!
📊 New subscription details:
  - Plan: monthly
  - Start: Sat Jun 21 2025 14:30:15 GMT+0700
  - End: Mon Jul 21 2025 14:30:15 GMT+0700
  - Days remaining: 30

📝 History record created: 68564ca3d7b1039031233b84
🎉 Downgrade completed successfully!
⚠️  User subscription has been reduced
🔄 User access level has been updated
```

---

## ⚡ LỆNH NHANH (COPY & PASTE)

### **Các lệnh thường dùng nhất:**

```bash
# Xem tùy chọn hạ cấp admin1
node downgrade-admin-subscription.js admin1@gmail.com

# Hạ admin1 từ yearly → monthly
node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Hủy subscription admin1 (yearly/monthly → free)
node downgrade-admin-subscription.js admin1@gmail.com free --confirm

# Xem tùy chọn thanhtoan user
node downgrade-admin-subscription.js thanhtoan@gmail.com

# Hủy subscription thanhtoan (monthly → free)
node downgrade-admin-subscription.js thanhtoan@gmail.com free --confirm

# Template cho user khác
node downgrade-admin-subscription.js user@example.com
node downgrade-admin-subscription.js user@example.com free --confirm
```

---

## 🛡️ TROUBLESHOOTING

### **Lỗi thường gặp:**

#### **1. "No downgrade options available"**
```bash
# User đã ở free/expired plan
# Kiểm tra plan hiện tại
node find-user-by-email.js user@example.com
```

#### **2. "Invalid downgrade option"**
```bash
# Kiểm tra tùy chọn có sẵn trước
node downgrade-admin-subscription.js user@example.com
```

#### **3. MongoDB connection error**
```bash
# Kiểm tra server backend có chạy không
# Đảm bảo file .env có MONGODB_URI đúng
```

#### **4. User not found**
```bash
# Kiểm tra email có đúng không
node find-user-by-email.js <email>
```

---

## 🆚 SO SÁNH UPGRADE vs DOWNGRADE

| Tính năng | Upgrade | Downgrade |
|-----------|---------|-----------|
| **Mục đích** | Nâng cấp lên gói cao hơn | Hạ cấp xuống gói thấp hơn |
| **Thời gian** | Gia hạn thêm | Cắt ngắn hoặc hủy |
| **Chi phí** | Tính phí | Không tính phí |
| **Tùy chọn** | monthly, yearly | monthly, free |
| **Hoàn tác** | Có thể downgrade | Cần upgrade lại |

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:
1. ✅ Kiểm tra plan hiện tại của user
2. ✅ Xem tùy chọn hạ cấp có sẵn
3. ✅ Chạy dry run trước khi confirm
4. ✅ Verify kết quả sau khi hạ cấp
5. ✅ Backup database nếu cần thiết

---

## 📝 CHANGELOG

- **v1.0** (2025-06-21): Tạo script downgrade subscription manual
- Hỗ trợ yearly → monthly, yearly → free, monthly → free
- Tích hợp subscription history logging
- Validation và error handling đầy đủ

---

**⚠️ CẢNH BÁO: Hạ cấp subscription không thể hoàn tác dễ dàng. Hãy cẩn thận khi sử dụng!**

# Hạ admin1 từ monthly → free
node downgrade-admin-subscription.js admin1@gmail.com free --confirm

# Verify kết quả
node find-user-by-email.js admin1@gmail.com

# Test với thanhtoan user
node downgrade-admin-subscription.js thanhtoan@gmail.com