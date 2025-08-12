# 📉 DOWNGRADE SUBSCRIPTION GUIDE

## 🎯 Mục đích
Hướng dẫn chi tiết về cách hạ cấp subscription cho user bằng script admin.

## ⚡ Quick Commands

### **🔥 Các lệnh cơ bản nhất:**
```bash
# Di chuyển đến backend
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"

# 1. Kiểm tra user hiện tại
node find-user-by-email.js user@example.com

# 2. Hạ cấp subscription (DRY RUN - xem trước)
node downgrade-admin-subscription.js user@example.com free

# 3. Hạ cấp thực tế (với confirm)
node downgrade-admin-subscription.js  admin1@gmail.com free --confirm
node find-user-by-email.js admin1@gmail.com
# 4. Verify kết quả
node find-user-by-email.js user@example.com
```
# 5. clear thanh toán
node clear-pending-payments-admin1.js

#6. uodate gói
node manual-confirm-payment.js
---

## 📋 Downgrade Matrix

### **Các trường hợp hạ cấp hợp lệ:**

| Từ | Đến | Mô tả |
|:--:|:--:|-------|
| `yearly` | `monthly` | Từ yearly xuống monthly (vẫn có premium) |
| `yearly` | `free` | Từ yearly xuống free (mất hết premium) |
| `monthly` | `free` | Từ monthly xuống free (mất premium) |
| `free_trial` | `free` | Từ trial xuống free (kết thúc trial) |

### **❌ Không thể hạ cấp:**
- `free` → bất kỳ đâu (đã là thấp nhất)
- `monthly` → `yearly` (đây là nâng cấp, không phải hạ cấp)

---

## 🛠️ Chi tiết script downgrade-admin-subscription.js

### **Syntax:**
```bash
node downgrade-admin-subscription.js <email> <target_plan> [--confirm]
```

### **Parameters:**
- `<email>`: Email của user cần hạ cấp
- `<target_plan>`: Gói đích (`monthly`, `free`)  
- `[--confirm]`: Flag xác nhận thực hiện (bỏ qua = dry run)

### **Target Plans:**
- `monthly`: Hạ xuống monthly subscription
- `free`: Hạ xuống free (mất tất cả premium)

---

## 📝 Examples

### **Example 1: Hạ từ yearly → monthly**
```bash
# Check user hiện tại
node find-user-by-email.js admin1@gmail.com

# Preview (dry run)
node downgrade-admin-subscription.js admin1@gmail.com monthly

# Thực hiện
node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm

# Verify
node find-user-by-email.js admin1@gmail.com
```

### **Example 2: Hạ từ yearly → free**
```bash
# Check user
node find-user-by-email.js premium_user@gmail.com

# Preview  
node downgrade-admin-subscription.js premium_user@gmail.com free

# Execute
node downgrade-admin-subscription.js premium_user@gmail.com free --confirm

# Verify
node find-user-by-email.js premium_user@gmail.com
```

### **Example 3: Hạ từ monthly → free**
```bash
# Check user
node find-user-by-email.js monthly_user@gmail.com

# Preview
node downgrade-admin-subscription.js monthly_user@gmail.com free

# Execute  
node downgrade-admin-subscription.js monthly_user@gmail.com free --confirm

# Verify
node find-user-by-email.js monthly_user@gmail.com
```

---

## 🔍 Expected Output

### **Dry Run Output:**
```
🔍 Finding user with email: user@example.com
✅ User found: John Doe (ID: 507f1f77bcf86cd799439011)

📊 Current subscription status:
  - Plan: yearly
  - Status: Active
  - Start: 2024-01-01T00:00:00.000Z
  - End: 2025-01-01T00:00:00.000Z
  - Days remaining: 156

📉 Downgrade preview:
  - From: yearly → monthly
  - New end date: 2024-02-01T00:00:00.000Z
  - Days in new plan: 31

⚠️  DRY RUN - No changes made. Use --confirm to apply changes.
```

### **Confirmed Execution Output:**
```
🔍 Finding user with email: user@example.com
✅ User found: John Doe (ID: 507f1f77bcf86cd799439011)

📊 Current subscription status:
  - Plan: yearly
  - Status: Active
  - Start: 2024-01-01T00:00:00.000Z
  - End: 2025-01-01T00:00:00.000Z

📉 Applying downgrade: yearly → monthly
✅ Subscription downgraded successfully!

📊 New subscription status:
  - Plan: monthly
  - Status: Active  
  - Start: 2024-01-01T00:00:00.000Z
  - End: 2024-02-01T00:00:00.000Z

📝 Subscription history logged
🎯 Downgrade completed successfully!
```

---

## ⚠️ Important Notes

### **🚨 Cảnh báo quan trọng:**
1. **Không thể hoàn tác:** Hạ cấp không thể tự động hoàn tác
2. **Mất dữ liệu:** Hạ về free có thể mất access đến premium features
3. **Ngày hết hạn:** Được tính toán tự động dựa trên ngày hiện tại
4. **History:** Tất cả thay đổi được ghi vào subscription history

### **🔒 Safety Features:**
- **Dry run mặc định:** Không có --confirm = chỉ preview
- **Validation:** Kiểm tra user tồn tại và plan hợp lệ
- **Error handling:** Xử lý các lỗi edge cases
- **Logging:** Ghi lại toàn bộ quá trình

---

## 🆘 Troubleshooting

### **❌ User not found**
```bash
# Kiểm tra email đúng chính tả
node find-user-by-email.js user@example.com

# Hoặc tìm theo pattern
node check-all-payments.js | grep -i "user"
```

### **❌ Invalid downgrade path**
```bash
# Ví dụ: Không thể hạ từ free
Error: Cannot downgrade from free plan

# Solution: Kiểm tra current plan trước
node find-user-by-email.js user@example.com
```

### **❌ User already on target plan**
```bash
# Ví dụ: User đã là monthly rồi
Error: User is already on monthly plan

# Solution: Chọn target plan khác hoặc verify current plan
```

### **❌ Database connection issues**
```bash
# Kiểm tra MongoDB running
# Kiểm tra .env file có MONGO_URI
# Restart Node.js process
```

---

## 🔗 Related Commands

### **Sau khi downgrade:**
```bash
# 1. Verify user plan
node find-user-by-email.js user@example.com

# 2. Check subscription history  
node check-all-payments.js

# 3. Clear pending payments nếu cần
node clear-payments-by-email.js user@example.com

# 4. Fix plan info nếu hiển thị "unknown"
node fix-user-plan-info.js user@example.com --confirm
```

### **Testing trên frontend:**
```bash
# 1. Login với user đã downgrade
# 2. Check subscription status trên profile
# 3. Verify premium features bị restrict
# 4. Check UI hiển thị đúng plan name
```

---

## 🏁 Complete Workflow

### **Full downgrade workflow:**
```bash
# Step 1: Navigate to backend
cd "d:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend"

# Step 2: Check current user status  
node find-user-by-email.js user@example.com

# Step 3: Clear any pending payments
node clear-payments-by-email.js user@example.com

# Step 4: Preview downgrade
node downgrade-admin-subscription.js user@example.com free

# Step 5: Execute downgrade
node downgrade-admin-subscription.js user@example.com free --confirm

# Step 6: Verify result
node find-user-by-email.js user@example.com

# Step 7: Fix plan info if needed
node fix-user-plan-info.js user@example.com --confirm

# Step 8: Final verification
node find-user-by-email.js user@example.com
```

---

**⚠️ CẢNH BÁO: Hạ cấp subscription ảnh hưởng trực tiếp đến user experience. Hãy cẩn thận và luôn verify kết quả!**
