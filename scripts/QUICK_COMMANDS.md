# 🚀 QUICK COMMANDS - SUBSCRIPTION MANAGEMENT

## 🌟 ONE-COMMAND SCRIPT (RECOMMENDED)
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"

# All-in-one command - Easiest way!
node one-command.js overview                              # System overview
node one-command.js user admin1@gmail.com               # Check user
node one-command.js upgrade admin1@gmail.com monthly --confirm  # Upgrade
node one-command.js downgrade admin1@gmail.com free --confirm   # Downgrade
node one-command.js fix admin1@gmail.com --confirm      # Fix plan info
node one-command.js clear admin1@gmail.com              # Clear pending
node one-command.js test                                 # Test system
node one-command.js health                               # Health check
```

## 📋 OR Use Individual Scripts

### Điều hướng đến backend
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

## ⚡ LỆNH NHANH - COPY & PASTE

### 🔍 KIỂM TRA USER
```bash
# Admin user
node find-user-by-email.js admin1@gmail.com  # Hiển thị Trial Start/End (fallback về Subscription dates nếu null)

# Thanh toán user  
node find-user-by-email.js thanhtoan@gmail.com

# User khác (thay email)
node find-user-by-email.js user@example.com
```

### � XEM TRƯỚC UPGRADE (DRY RUN)
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

### 📉 XEM TRƯỚC DOWNGRADE (DRY RUN)
```bash
# Admin yearly → monthly
node downgrade-admin-subscription.js admin1@gmail.com monthly

# Admin → free
node downgrade-admin-subscription.js admin1@gmail.com free --confirm

# Thanhtoan monthly → free
node downgrade-admin-subscription.js thanhtoan@gmail.com free
```

### ⬇️ THỰC HIỆN DOWNGRADE
```bash
# Admin từ yearly xuống monthly
node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Admin xuống free
node downgrade-admin-subscription.js admin1@gmail.com free --confirm

# Thanhtoan xuống free
node downgrade-admin-subscription.js thanhtoan@gmail.com free --confirm
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

### 🔧 FIX USER PLAN INFO (nếu hiển thị "unknown")
```bash
# Fix admin1
node fix-user-plan-info.js admin1@gmail.com --confirm

# Fix thanhtoan  
node fix-user-plan-info.js thanhtoan@gmail.com --confirm

# Fix user khác
node fix-user-plan-info.js user@example.com --confirm
```

### 📊 SYSTEM OVERVIEW & TESTING
```bash
# Xem tổng quan toàn bộ hệ thống
node subscription-overview.js

# Test toàn bộ hệ thống subscription
node final-subscription-test.js

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

### 🧪 DEMO UPGRADE CHO MỤC ĐÍCH DEMO
```bash
# Fake nâng cấp user lên pro (bỏ qua MoMo)
node one-command.js upgrade-fake tk7days@gmail.com yearly --confirm

# Ví dụ cụ thể
node one-command.js upgrade-fake testuser@example.com monthly --confirm
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
