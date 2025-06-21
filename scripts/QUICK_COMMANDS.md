# 🚀 QUICK COMMANDS - SUBSCRIPTION UPGRADE

## Điều hướng đến backend
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

## ⚡ LỆNH NHANH - COPY & PASTE

### 🔍 KIỂM TRA USER
```bash
# Admin user
node find-user-by-email.js admin1@gmail.com

# Thanhtoan user  
node find-user-by-email.js thanhtoan@gmail.com

# User khác (thay email)
node find-user-by-email.js user@example.com
```

### 👀 XEM TRƯỚC UPGRADE (DRY RUN)
```bash
# Admin - monthly
node upgrade-admin-subscription.js admin1@gmail.com monthly

# Admin - yearly
node upgrade-admin-subscription.js admin1@gmail.com yearly

# Thanhtoan - monthly
node upgrade-admin-subscription.js thanhtoan@gmail.com monthly

# Thanhtoan - yearly
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly
```

### ✅ THỰC HIỆN UPGRADE
```bash
# Admin lên monthly (30 ngày)
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Admin lên yearly (365 ngày)
node upgrade-admin-subscription.js admin1@gmail.com yearly --confirm

# Thanhtoan lên monthly (30 ngày)
node upgrade-admin-subscription.js thanhtoan@gmail.com monthly --confirm

# Thanhtoan lên yearly (365 ngày)
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly --confirm
```

### 🧹 CLEAR PENDING PAYMENT (nếu lỗi 409)
```bash
# Clear admin1
node clear-payments-by-email.js admin1@gmail.com

# Clear thanhtoan
node clear-payments-by-email.js thanhtoan@gmail.com

# Clear user khác
node clear-payments-by-email.js user@example.com
```

### 📊 KIỂM TRA PAYMENT
```bash
# Tất cả payment
node check-all-payments.js

# Payment theo user
node check-user-exists.js admin1@gmail.com
```

---

## 🔥 WORKFLOW HOÀN CHỈNH

### Nâng cấp admin1@gmail.com lên monthly:
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
node find-user-by-email.js admin1@gmail.com
node upgrade-admin-subscription.js admin1@gmail.com monthly
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm
node find-user-by-email.js admin1@gmail.com
```

### Nâng cấp thanhtoan@gmail.com lên yearly:
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
node find-user-by-email.js thanhtoan@gmail.com
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly --confirm
node find-user-by-email.js thanhtoan@gmail.com
```

---

## 🆘 SOS - LỆNH KHẨN CẤP

### Nếu gặp lỗi, chạy theo thứ tự:
```bash
# 1. Clear pending payment
node clear-payments-by-email.js admin1@gmail.com

# 2. Kiểm tra user
node find-user-by-email.js admin1@gmail.com

# 3. Thử lại upgrade
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm
```

---

## 📋 TEMPLATE CHO USER MỚI

### Thay [EMAIL] và [PLAN] theo nhu cầu:
```bash
# Bước 1: Kiểm tra
node find-user-by-email.js [EMAIL]

# Bước 2: Preview
node upgrade-admin-subscription.js [EMAIL] [PLAN]

# Bước 3: Upgrade
node upgrade-admin-subscription.js [EMAIL] [PLAN] --confirm

# Bước 4: Verify
node find-user-by-email.js [EMAIL]
```

### Ví dụ cụ thể:
```bash
# Nâng cấp newuser@gmail.com lên monthly
node find-user-by-email.js newuser@gmail.com
node upgrade-admin-subscription.js newuser@gmail.com monthly
node upgrade-admin-subscription.js newuser@gmail.com monthly --confirm
node find-user-by-email.js newuser@gmail.com
```
