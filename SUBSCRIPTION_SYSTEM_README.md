# 🎯 UNIPLAN SUBSCRIPTION SYSTEM

## 📋 Tổng quan

Hệ thống quản lý subscription hoàn chỉnh cho UniPlan, bao gồm:
- ✅ Nâng cấp/hạ cấp subscription manual cho admin
- ✅ Xử lý trạng thái user (free, trial, monthly, yearly)
- ✅ Quản lý pending payments và fix lỗi 409 conflict
- ✅ Fix trạng thái "unknown"/"Chưa xác định" 
- ✅ Tools monitoring và testing system

---

## 🚀 Quick Start

### **1. Điều hướng đến backend:**
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

### **2. Kiểm tra tổng quan hệ thống:**
```bash
node subscription-overview.js
```

### **3. Quản lý user subscription:**
```bash
# 🌟 ONE-COMMAND (RECOMMENDED) - Easiest way!
node one-command.js user admin1@gmail.com                          # Xem user
node one-command.js upgrade admin1@gmail.com monthly --confirm     # Nâng cấp
node one-command.js downgrade admin1@gmail.com free --confirm      # Hạ cấp 
node one-command.js fix admin1@gmail.com --confirm                 # Fix unknown

# OR Individual scripts:
node find-user-by-email.js admin1@gmail.com                        # Xem user
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm  # Nâng cấp
node downgrade-admin-subscription.js admin1@gmail.com free --confirm    # Hạ cấp
node fix-user-plan-info.js admin1@gmail.com --confirm              # Fix unknown
```

---

## 📁 File Structure

```
scripts/                                    # 📖 Documentation
├── SCRIPTS_INDEX.md                        # Danh mục tất cả scripts  
├── UPGRADE_SUBSCRIPTION_GUIDE.md           # Hướng dẫn nâng cấp
├── DOWNGRADE_SUBSCRIPTION_GUIDE.md         # Hướng dẫn hạ cấp
├── QUICK_COMMANDS.md                       # Lệnh nhanh copy/paste
└── TESTING_COMMANDS.md                     # Commands cho testing

backend/                                     # 🔧 Executable Scripts
├── subscription-overview.js                # 📊 Tổng quan hệ thống
├── final-subscription-test.js              # 🧪 Test toàn bộ system
├── upgrade-admin-subscription.js           # ⬆️ Nâng cấp subscription  
├── downgrade-admin-subscription.js         # ⬇️ Hạ cấp subscription
├── fix-user-plan-info.js                   # 🔧 Fix trạng thái unknown
├── find-user-by-email.js                   # 🔍 Tìm user theo email
├── clear-payments-by-email.js              # 🧹 Clear pending payments
└── check-all-payments.js                   # 💳 Xem tất cả payments
```

---

## 🎯 Core Features

### **📈 Subscription Management**
- **Upgrade**: free → monthly/yearly, monthly → yearly
- **Downgrade**: yearly → monthly/free, monthly → free  
- **Plans**: free, free_trial, monthly (30 days), yearly (365 days)
- **Manual Admin Control**: Bỏ qua payment flow, set subscription trực tiếp

### **🔧 Problem Solving**
- **409 Conflict**: Clear pending payments blocking upgrades
- **Unknown Status**: Fix trạng thái "Chưa xác định" trên UI
- **Data Consistency**: Sync subscription dates với plan type
- **Error Recovery**: Tools để khôi phục từ các trạng thái lỗi

### **📊 Monitoring & Testing**
- **System Overview**: Thống kê users, revenue, active subscriptions
- **Automated Testing**: Verify toàn bộ upgrade/downgrade flows
- **Real-time Verification**: Check trạng thái sau mỗi thay đổi

---

## ⭐ Most Used Commands

### **🔥 Top 8 commands you'll use daily:**

```bash
# 1. 📊 System overview (start here)
node subscription-overview.js

# 2. 🔍 Check user info  
node find-user-by-email.js admin1@gmail.com

# 3. ⬆️ Upgrade user
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# 4. ⬇️ Downgrade user
node downgrade-admin-subscription.js admin1@gmail.com free --confirm

# 5. 🧹 Clear pending payment (if 409 error)
node clear-payments-by-email.js admin1@gmail.com

# 6. 🔧 Fix unknown status
node fix-user-plan-info.js admin1@gmail.com --confirm

# 7. 💳 Check all payments
node check-all-payments.js

# 8. 🧪 Test entire system
node final-subscription-test.js
```

---

## 📖 Documentation

### **📚 Read these guides:**

1. **[📁 SCRIPTS_INDEX.md](scripts/SCRIPTS_INDEX.md)** - Complete directory overview
2. **[📈 UPGRADE_SUBSCRIPTION_GUIDE.md](scripts/UPGRADE_SUBSCRIPTION_GUIDE.md)** - Detailed upgrade guide
3. **[📉 DOWNGRADE_SUBSCRIPTION_GUIDE.md](scripts/DOWNGRADE_SUBSCRIPTION_GUIDE.md)** - Detailed downgrade guide  
4. **[⚡ QUICK_COMMANDS.md](scripts/QUICK_COMMANDS.md)** - Copy/paste commands
5. **[🧪 TESTING_COMMANDS.md](scripts/TESTING_COMMANDS.md)** - Testing reference

---

## 🔄 Typical Workflows

### **🆕 New User Setup:**
```bash
# 1. Check if user exists
node find-user-by-email.js newuser@example.com

# 2. If needed, upgrade to premium
node upgrade-admin-subscription.js newuser@example.com monthly --confirm

# 3. Verify result
node find-user-by-email.js newuser@example.com
```

### **🚨 Fix User Issues:**
```bash
# 1. Check current status
node find-user-by-email.js problemuser@example.com

# 2. Clear any pending payments
node clear-payments-by-email.js problemuser@example.com

# 3. Fix plan info if needed
node fix-user-plan-info.js problemuser@example.com --confirm

# 4. Verify fix
node find-user-by-email.js problemuser@example.com
```

### **📊 Daily Monitoring:**
```bash
# 1. System overview
node subscription-overview.js

# 2. Check specific users (admin panel users)
node find-user-by-email.js admin1@gmail.com
node find-user-by-email.js thanhtoan@gmail.com

# 3. Review recent payments
node check-all-payments.js
```

---

## 🚨 Troubleshooting

### **❌ Common Issues & Solutions:**

#### **1. "409 Conflict - Pending payment exists"**
```bash
# Solution: Clear pending payments
node clear-payments-by-email.js user@example.com
```

#### **2. User shows "Chưa xác định" plan**
```bash
# Solution: Fix plan info
node fix-user-plan-info.js user@example.com --confirm
```

#### **3. User not found**
```bash
# Check email spelling
node find-user-by-email.js user@example.com

# Search in overview
node subscription-overview.js
```

#### **4. Database connection issues**
```bash
# Check MongoDB is running
# Verify .env file has correct MONGO_URI
# Restart Node.js process
```

---

## 🏁 Success Indicators

### **✅ System is working correctly when:**
- `subscription-overview.js` shows clear statistics  
- `final-subscription-test.js` passes all tests
- Users can upgrade/downgrade without errors
- No "unknown" plan statuses in frontend
- Pending payments get cleared successfully
- UI shows correct plan names and days remaining

### **🎯 Expected Frontend Behavior:**
- Premium users see correct plan name (Monthly Premium, Yearly Premium)
- Days remaining calculated correctly
- Free users see "Free Plan" 
- No "Chưa xác định" status
- Upgrade/downgrade buttons work without 409 errors

---

## 📞 Support

### **🔧 For technical issues:**
1. Run `node subscription-overview.js` first
2. Check specific user with `node find-user-by-email.js`
3. Use appropriate fix script
4. Verify with `node final-subscription-test.js`

### **📋 For new features:**
- All scripts are modular and well-documented
- Follow existing patterns in upgrade/downgrade scripts
- Add new scripts to SCRIPTS_INDEX.md
- Update QUICK_COMMANDS.md with common usage

---

**⚡ Ready to manage subscriptions like a pro! ⚡**

---

*Last updated: December 2024*  
*System version: v2.0 - Complete Subscription Management*
