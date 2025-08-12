# 🧪 TESTING & DEBUGGING COMMANDS

## 📁 Vị trí scripts
Tất cả scripts test đều nằm trong thư mục `backend/` và cần chạy từ đó:
```bash
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"
```

---

## 👤 USER MANAGEMENT TESTS

### 🔍 **Kiểm tra user theo email**
```bash
# Kiểm tra admin1@gmail.com
node find-user-by-email.js admin1@gmail.com

# Kiểm tra thanhtoan@gmail.com  
node find-user-by-email.js thanhtoan@gmail.com

# Kiểm tra user khác (thay email tùy ý)
node find-user-by-email.js user@example.com
```

### 🔍 **Kiểm tra user theo ID**
```bash
# Kiểm tra admin1 (ID có sẵn)
node find-user-by-id.js 6832fb21218f3827624d77c1

# Kiểm tra thanhtoan user (ID có sẵn) 
node find-user-by-id.js 6855ab6eb60e04f6ea7d875e

# Template cho ID khác
node find-user-by-id.js [USER_ID]
```

### ✅ **Kiểm tra user tồn tại**
```bash
# Kiểm tra admin1
node check-user-exists.js admin1@gmail.com

# Kiểm tra thanhtoan
node check-user-exists.js thanhtoan@gmail.com

# Template cho email khác
node check-user-exists.js [EMAIL]
```

### 👥 **Debug tất cả users**
```bash
# Liệt kê tất cả users trong hệ thống
node debug-users.js

# Debug user hiện tại (từ token)
node debug-current-user.js
```

---

## 💳 PAYMENT MANAGEMENT TESTS

### 📊 **Kiểm tra tất cả payments**
```bash
# Xem toàn bộ payment trong hệ thống
node check-all-payments.js

# Xem payment theo status cụ thể
node check-payments.js
```

### 🗑️ **Clear pending payments**
```bash
# Clear pending payment cho admin1
node clear-payments-by-email.js admin1@gmail.com

# Clear pending payment cho thanhtoan
node clear-payments-by-email.js thanhtoan@gmail.com

# Clear pending payment cho user khác
node clear-payments-by-email.js [EMAIL]

# Clear tất cả pending payments
node clear-pending-payments.js
```

### 🔍 **Tìm payment cụ thể**
```bash
# Tìm payment theo order ID
node search-payment-orderid.js

# Kiểm tra payment của user cụ thể
node check-tannhat-payments.js
```

---

## 🚀 SUBSCRIPTION TESTS

### 📈 **Nâng cấp subscription manual**
```bash
# Xem trước upgrade (DRY RUN)
node upgrade-admin-subscription.js admin1@gmail.com monthly
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly

# Thực hiện upgrade thực sự
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm
node upgrade-admin-subscription.js thanhtoan@gmail.com yearly --confirm
```

### 📊 **Kiểm tra subscription status**
```bash
# So sánh subscription giữa các user
node demo-subscription-difference.js

# Test subscription API
node test-subscription-api.js
```

---

## 🔐 AUTHENTICATION TESTS

### 🎫 **Test login & token**
```bash
# Test login cho admin1
node test-login.js

# Tạo token mới
node create-new-token.js

# Debug token hiện tại
node debug-token.js
node debug-frontend-token.js
```

### 👤 **Test user creation**
```bash
# Tạo user test mới
node create-test-user.js

# Debug quá trình tạo user mới
node debug-new-user-creation.js

# Test API tạo user
node test-new-user-api.js
```

---

## 🌐 API TESTING

### 🔌 **Test API endpoints**
```bash
# Test API trực tiếp  
node test-api-direct.js
node debug_api_test.js

# Test backend chính xác
node test-backend-correct.js

# Debug full flow
node debug-full-flow.js
```

### 🔄 **Integration tests**
```bash
# Test team-project-task integration
node test-team-project-task-integration.js

# Test complete integration flow  
node test-complete-integration-flow.js

# Test fixes verification
node test-fixes-verification.js
```

---

## 🗄️ DATABASE OPERATIONS

### 💾 **Database debugging**
```bash
# Debug database connection
node debug_database.js
node debug-database.js

# Debug raw database
node debug-raw-database.js

# Test database search
node debug_personal_search.js
```

### 🔧 **Database maintenance**
```bash
# Setup và test
node setup-and-test.js

# Fix users
node fix-users.js

# Performance monitoring
node performance-monitor.js
```

---

## 🚨 TROUBLESHOOTING COMMANDS

### **Khi gặp lỗi 409 (Conflict Payment):**
```bash
# Bước 1: Xem user hiện tại
node find-user-by-email.js [EMAIL]

# Bước 2: Clear pending payment
node clear-payments-by-email.js [EMAIL]

# Bước 3: Thử lại operation
```

### **Khi gặp lỗi authentication:**
```bash
# Bước 1: Debug token
node debug-token.js

# Bước 2: Tạo token mới
node test-login.js

# Bước 3: Debug user auth
node debug-current-user.js
```

### **Khi gặp lỗi database:**
```bash
# Bước 1: Check connection
node debug_database.js

# Bước 2: Check users
node debug-users.js

# Bước 3: Test operations
node quick_test.js
```

---

## ⚡ QUICK WORKFLOWS

### **🔥 Workflow kiểm tra user đầy đủ:**
```bash
# Copy toàn bộ block này và chạy
node find-user-by-email.js admin1@gmail.com
node check-all-payments.js  
node upgrade-admin-subscription.js admin1@gmail.com monthly
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm
node find-user-by-email.js admin1@gmail.com
```

### **🔥 Workflow debug lỗi payment:**
```bash
# Copy toàn bộ block này khi gặp lỗi 409
node find-user-by-email.js [EMAIL]
node check-all-payments.js
node clear-payments-by-email.js [EMAIL]
node check-all-payments.js
```

### **🔥 Workflow test API end-to-end:**
```bash
# Copy toàn bộ block này để test API
node test-login.js
node test-subscription-api.js
node test-api-direct.js
node debug-full-flow.js
```

---

## 📋 SCRIPT FILES REFERENCE

### **Core Scripts:**
- `find-user-by-email.js` - Tìm user theo email
- `find-user-by-id.js` - Tìm user theo ID  
- `upgrade-admin-subscription.js` - Nâng cấp subscription
- `clear-payments-by-email.js` - Clear pending payments
- `check-all-payments.js` - Xem tất cả payments

### **Debug Scripts:**
- `debug-users.js` - Debug users
- `debug-current-user.js` - Debug user hiện tại
- `debug-token.js` - Debug authentication token
- `debug-database.js` - Debug database connection
- `debug-full-flow.js` - Debug full application flow

### **Test Scripts:**
- `test-login.js` - Test login functionality
- `test-subscription-api.js` - Test subscription APIs
- `test-api-direct.js` - Test APIs trực tiếp
- `test-complete-integration-flow.js` - Test integration
- `create-test-user.js` - Tạo user test

### **Utility Scripts:**
- `check-user-exists.js` - Kiểm tra user tồn tại
- `performance-monitor.js` - Monitor performance
- `setup-and-test.js` - Setup và test hệ thống

---

## 🎯 MOST USED COMMANDS

### **Top 10 lệnh hay dùng nhất:**
```bash
# 1. Kiểm tra user
node find-user-by-email.js admin1@gmail.com

# 2. Nâng cấp subscription  
node upgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# 3. Clear pending payment
node clear-payments-by-email.js admin1@gmail.com

# 4. Xem tất cả payment
node check-all-payments.js

# 5. Test login
node test-login.js

# 6. Debug users
node debug-users.js

# 7. Tạo user test
node create-test-user.js

# 8. Test API
node test-api-direct.js

# 9. Debug database
node debug-database.js

# 10. Performance check
node performance-monitor.js
```

---

**💡 TIP: Bookmark file này để có thể nhanh chóng copy các lệnh cần thiết!**
