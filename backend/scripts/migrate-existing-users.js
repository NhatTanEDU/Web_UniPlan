// backend/scripts/migrate-existing-users.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
        console.log('✅ Kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Migration function
const migrateExistingUsers = async () => {
    try {
        console.log('🔄 Bắt đầu migration cho user cũ...');
          // Tìm tất cả user chưa có thông tin gói mới
        const usersToMigrate = await User.find({
            $or: [
                { current_plan_type: { $exists: false } },
                { current_plan_type: { $in: ['Free', 'Basic', 'Premium', 'Trial'] } }, // Thêm Trial
                { trial_start_date: { $exists: false } }
            ]
        });
        
        console.log(`📊 Tìm thấy ${usersToMigrate.length} user cần migration`);
        
        let migratedCount = 0;
        let errorCount = 0;
        
        for (const user of usersToMigrate) {
            try {
                // Cập nhật thông tin gói mới
                const updateData = {
                    current_plan_type: 'free_trial',
                    trial_start_date: user.createdAt || new Date(),
                    trial_end_date: new Date((user.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000),
                    payment_status: 'none',
                    subscription_start_date: null,
                    subscription_end_date: null,
                    last_payment_date: null,
                    next_billing_date: null
                };
                
                // Nếu user đã tồn tại hơn 7 ngày và không có gói trả phí
                const daysSinceCreated = Math.floor((new Date() - (user.createdAt || new Date())) / (1000 * 60 * 60 * 24));
                if (daysSinceCreated > 7) {
                    updateData.current_plan_type = 'expired';
                    updateData.trial_end_date = new Date((user.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);
                }
                
                await User.findByIdAndUpdate(user._id, updateData, { new: true });
                
                migratedCount++;
                console.log(`✅ Migrated user: ${user.email} - Plan: ${updateData.current_plan_type}`);
                
            } catch (userError) {
                errorCount++;
                console.error(`❌ Lỗi migration user ${user.email}:`, userError.message);
            }
        }
        
        console.log('\n🎉 Migration hoàn thành!');
        console.log(`✅ Thành công: ${migratedCount} users`);
        console.log(`❌ Lỗi: ${errorCount} users`);
        
        return { success: migratedCount, errors: errorCount };
        
    } catch (error) {
        console.error('❌ Lỗi migration:', error.message);
        throw error;
    }
};

// Chạy migration
const runMigration = async () => {
    try {
        await connectDB();
        await migrateExistingUsers();
        
        console.log('\n🔒 Đóng kết nối database...');
        await mongoose.connection.close();
        console.log('✅ Migration hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi chạy migration:', error);
        process.exit(1);
    }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    runMigration();
}

module.exports = { migrateExistingUsers, connectDB };
