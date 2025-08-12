# 📁 SCRIPTS DIRECTORY OVERVIEW

## 📋 Danh sách tất cả files trong thư mục scripts/

### 📖 **Documentation Files (.md)**
| File | Mô tả | Cách dùng |
|------|-------|-----------|
| `UPGRADE_SUBSCRIPTION_GUIDE.md` | Hướng dẫn chi tiết nâng cấp subscription | Đọc để hiểu cách upgrade |
| `DOWNGRADE_SUBSCRIPTION_GUIDE.md` | ⭐ Hướng dẫn chi tiết hạ cấp subscription | Đọc để hiểu cách downgrade |
| `QUICK_COMMANDS.md` | Lệnh nhanh copy & paste | Copy paste các lệnh thường dùng |
| `TESTING_COMMANDS.md` | Tổng hợp tất cả lệnh test | Tham khảo khi debug/test |
| `SCRIPTS_INDEX.md` | File này - danh mục tổng quan | Navigation cho tất cả scripts |

### 🔧 **Script Files (.js) - Located in backend/**
| Script | Chức năng | Usage |
|--------|-----------|-------|
| `one-command.js` | 🌟 **ALL-IN-ONE** subscription tool | `node one-command.js <command> [args]` |
| `upgrade-admin-subscription.js` | ⭐ Nâng cấp subscription manual | `node upgrade-admin-subscription.js email plan --confirm` |
| `downgrade-admin-subscription.js` | ⭐ Hạ cấp subscription manual | `node downgrade-admin-subscription.js email plan --confirm` |
| `fix-user-plan-info.js` | ⭐ Fix trạng thái "unknown" plan | `node fix-user-plan-info.js email --confirm` |
| `subscription-overview.js` | ⭐ Tổng quan hệ thống subscription | `node subscription-overview.js` |
| `final-subscription-test.js` | ⭐ Test toàn bộ hệ thống | `node final-subscription-test.js` |
| `find-user-by-email.js` | ⭐ Tìm user theo email | `node find-user-by-email.js email@example.com` |
| `find-user-by-id.js` | ⭐ Tìm user theo ID | `node find-user-by-id.js user_id` |
| `clear-payments-by-email.js` | ⭐ Clear pending payments | `node clear-payments-by-email.js email@example.com` |
| `check-all-payments.js` | ⭐ Xem tất cả payments | `node check-all-payments.js` |

---

## 🚀 QUICK START GUIDE

### **1. 📖 Đọc documentation trước:**
```bash
# Mở file này để xem overview
scripts/SCRIPTS_INDEX.md

# Đọc hướng dẫn chi tiết
scripts/UPGRADE_SUBSCRIPTION_GUIDE.md  

# Copy lệnh nhanh
scripts/QUICK_COMMANDS.md

# Tham khảo testing
scripts/TESTING_COMMANDS.md
```

### **2. 🏃‍♂️ Chạy scripts:**
```bash
# Điều hướng đến backend
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"

# Chạy script cần thiết
node [script-name].js [parameters]
```

---

## ⭐ TOP PRIORITY SCRIPTS

### **🔥 Must-know scripts (8 scripts quan trọng nhất):**

#### **1. subscription-overview.js**
```bash
# Xem tổng quan toàn bộ hệ thống
node subscription-overview.js
```

#### **2. upgrade-admin-subscription.js**
```bash
# Nâng cấp subscription bỏ qua thanh toán
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm
```

#### **3. downgrade-admin-subscription.js**
```bash
# Hạ cấp subscription
node downgrade-admin-subscription.js admin1@gmail.com free --confirm
```

#### **4. find-user-by-email.js**  
```bash
# Kiểm tra thông tin user
node find-user-by-email.js admin1@gmail.com
```

#### **5. clear-payments-by-email.js**
```bash
# Fix lỗi 409 pending payment
node clear-payments-by-email.js admin1@gmail.com
```

#### **6. fix-user-plan-info.js**
```bash
# Fix trạng thái "unknown" plan
node fix-user-plan-info.js admin1@gmail.com --confirm
```

#### **7. final-subscription-test.js**
```bash
# Test toàn bộ hệ thống subscription
node final-subscription-test.js
```

#### **8. check-all-payments.js**
```bash
# Xem tổng quan payments
node check-all-payments.js
```

#### **5. test-login.js**
```bash
# Test login và lấy token
node test-login.js
```

---

## 📚 CATEGORIES

### 👤 **User Management**
- `find-user-by-email.js` - Tìm user theo email
- `find-user-by-id.js` - Tìm user theo ID
- `check-user-exists.js` - Kiểm tra user tồn tại
- `create-test-user.js` - Tạo user test
- `debug-users.js` - Debug users
- `debug-current-user.js` - Debug user hiện tại

### 💳 **Payment Management**
- `check-all-payments.js` - Xem tất cả payments
- `clear-payments-by-email.js` - Clear pending payments
- `clear-pending-payments.js` - Clear tất cả pending
- `search-payment-orderid.js` - Tìm payment theo order ID
- `check-payments.js` - Kiểm tra payments
- `check-tannhat-payments.js` - Check payments user specific

### 🚀 **Subscription Management**
- `upgrade-admin-subscription.js` - Nâng cấp subscription manual
- `demo-subscription-difference.js` - So sánh subscription
- `test-subscription-api.js` - Test subscription API

### 🔐 **Authentication**
- `test-login.js` - Test login
- `create-new-token.js` - Tạo token mới
- `debug-token.js` - Debug token
- `debug-frontend-token.js` - Debug frontend token

### 🌐 **API Testing**
- `test-api-direct.js` - Test API trực tiếp
- `debug_api_test.js` - Debug API
- `test-backend-correct.js` - Test backend
- `debug-full-flow.js` - Debug full flow

### 🗄️ **Database**
- `debug_database.js` - Debug database
- `debug-database.js` - Debug database connection
- `debug-raw-database.js` - Debug raw database
- `setup-and-test.js` - Setup và test

### 🔧 **Integration & E2E**
- `test-complete-integration-flow.js` - Test integration đầy đủ
- `test-team-project-task-integration.js` - Test team integration
- `test-fixes-verification.js` - Verify fixes
- `performance-monitor.js` - Monitor performance

---

## 🎯 COMMON WORKFLOWS

### **Workflow 1: Kiểm tra user đầy đủ**
```bash
node find-user-by-email.js admin1@gmail.com
node check-all-payments.js
node upgrade-admin-subscription.js admin1@gmail.com monthly
```

### **Workflow 2: Fix lỗi payment 409**
```bash
node find-user-by-email.js [EMAIL]
node clear-payments-by-email.js [EMAIL]
node check-all-payments.js
```

### **Workflow 3: Test authentication**
```bash
node test-login.js
node debug-token.js
node debug-current-user.js
```

### **Workflow 4: Full system test**
```bash
node debug-database.js
node debug-users.js
node test-api-direct.js
node test-complete-integration-flow.js
```

---

## 🛠️ SCRIPT CREATION TEMPLATES

### **Template tạo script user mới:**
```javascript
// Template cho script user management
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

const main = async () => {
    try {
        await connectDB();
        // Your logic here
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
};

main();
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### **Nếu script không chạy:**
1. ✅ Kiểm tra đang ở thư mục backend: `pwd` (Linux/Mac) hoặc `cd` (Windows)
2. ✅ Kiểm tra file tồn tại: `ls script-name.js` hoặc `dir script-name.js`
3. ✅ Kiểm tra MongoDB connection
4. ✅ Kiểm tra .env file

### **Các lỗi thường gặp:**
- **Module not found**: Đảm bảo đang ở thư mục backend
- **MongoDB connection**: Kiểm tra server và .env
- **Permission denied**: Check quyền file và folder
- **User not found**: Verify email/ID có đúng không

---

## 🔄 UPDATE LOG

- **2025-06-21**: Tạo script upgrade subscription manual
- **2025-06-21**: Tổ chức lại structure scripts
- **2025-06-21**: Tạo documentation files
- **2025-06-21**: Chuẩn hóa naming convention

---

**💡 TIP: Đặt bookmark file này để nhanh chóng tìm script cần dùng!**

## 📖 Navigation Quick Links

- 📋 **[UPGRADE_SUBSCRIPTION_GUIDE.md](./UPGRADE_SUBSCRIPTION_GUIDE.md)** - Hướng dẫn nâng cấp subscription chi tiết
- ⚡ **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** - Copy paste commands nhanh
- 🧪 **[TESTING_COMMANDS.md](./TESTING_COMMANDS.md)** - Tổng hợp lệnh test/debug
- 📁 **[SCRIPTS_INDEX.md](./SCRIPTS_INDEX.md)** - File này - tổng quan scripts
