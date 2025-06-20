// backend/scripts/admin-upgrade-user.js
//node scripts/admin-upgrade-user.js admin1@gmail.com yearly
//
//node scripts/admin-upgrade-user.js 6846ffc96b1914ede2f998cd monthly
// kiểm tra gói
//node scripts/admin-upgrade-user.js search admin
//Nâng cấp admin_test@example.com lên gói tháng bằng ID
//node scripts/admin-upgrade-user.js 6846ffc96b1914ede2f998cd monthly
//node scripts/admin-upgrade-user.js 6855a3a7736a993ccfbfa9d1 monthly
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

// Function nâng cấp user
const upgradeUser = async (identifier, planType) => {
    try {
        console.log(`🔄 Đang tìm kiếm user: ${identifier}`);
        
        // Tìm user theo email hoặc ID
        let user;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            user = await User.findById(identifier);
        } else {
            user = await User.findOne({ email: identifier });
        }
        
        if (!user) {
            console.error(`❌ Không tìm thấy user với identifier: ${identifier}`);
            return false;
        }
        
        console.log(`👤 Tìm thấy user: ${user.email}`);
        console.log(`📦 Gói hiện tại: ${user.current_plan_type}`);
        
        // Lưu thông tin cũ để log
        const oldPlan = user.getPlanDisplayInfo();
        
        // Nâng cấp gói
        user.upgradeToSubscription(planType);
        
        // Lưu thay đổi
        await user.save();
        
        // Lấy thông tin gói mới
        const newPlan = user.getPlanDisplayInfo();
        
        console.log('✅ Nâng cấp thành công!');
        console.log(`📊 Thông tin cập nhật:`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Gói cũ: ${oldPlan.name}`);
        console.log(`   - Gói mới: ${newPlan.name}`);
        console.log(`   - Ngày bắt đầu: ${user.subscription_start_date.toLocaleString('vi-VN')}`);
        console.log(`   - Ngày hết hạn: ${user.subscription_end_date.toLocaleString('vi-VN')}`);
        console.log(`   - Trạng thái thanh toán: ${user.payment_status}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Lỗi nâng cấp user:', error.message);
        return false;
    }
};

// Function hiển thị menu lựa chọn
const showMenu = () => {
    console.log('\n🎯 ADMIN - NÂNG CẤP GÓI USER');
    console.log('=====================================');
    console.log('Cách sử dụng:');
    console.log('node scripts/admin-upgrade-user.js <email_hoặc_id> <gói>');
    console.log('');
    console.log('Các gói có sẵn:');
    console.log('- monthly: Gói 1 tháng (500,000 VND)');
    console.log('- yearly: Gói 1 năm (3,000,000 VND)');
    console.log('');
    console.log('Ví dụ:');
    console.log('node scripts/admin-upgrade-user.js admin1@gmail.com yearly');
    console.log('node scripts/admin-upgrade-user.js 507f1f77bcf86cd799439011 monthly');
    console.log('=====================================\n');
};

// Function tìm và hiển thị user
const findAndShowUsers = async (searchTerm = '') => {
    try {
        let users;
        if (searchTerm) {
            // Tìm theo email chứa từ khóa
            users = await User.find({ 
                email: { $regex: searchTerm, $options: 'i' } 
            }).limit(10).select('email current_plan_type trial_start_date subscription_end_date createdAt');
        } else {
            // Hiển thị 10 user đầu tiên
            users = await User.find({}).limit(10).select('email current_plan_type trial_start_date subscription_end_date createdAt');
        }
        
        console.log(`\n👥 Tìm thấy ${users.length} user${searchTerm ? ` chứa "${searchTerm}"` : ''}:`);
        console.log('=====================================');
        users.forEach((user, index) => {
            const planInfo = user.getPlanDisplayInfo();
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   - ID: ${user._id}`);
            console.log(`   - Gói: ${planInfo.name}`);
            console.log(`   - Tạo lúc: ${user.createdAt.toLocaleString('vi-VN')}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Lỗi tìm kiếm user:', error.message);
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        
        const args = process.argv.slice(2);
        
        // Nếu không có tham số, hiển thị menu
        if (args.length === 0) {
            showMenu();
            
            // Hiển thị một số user mẫu
            console.log('📋 Một số user trong hệ thống:');
            await findAndShowUsers();
            
            console.log('💡 Tip: Bạn có thể tìm kiếm user bằng:');
            console.log('node scripts/admin-upgrade-user.js search <từ_khóa>');
            
        } else if (args[0] === 'search') {
            // Tìm kiếm user
            const searchTerm = args[1] || '';
            await findAndShowUsers(searchTerm);
            
        } else if (args.length === 2) {
            // Nâng cấp user
            const [identifier, planType] = args;
            
            // Validate plan type
            if (!['monthly', 'yearly'].includes(planType)) {
                console.error('❌ Gói không hợp lệ! Chỉ chấp nhận: monthly, yearly');
                process.exit(1);
            }
            
            const success = await upgradeUser(identifier, planType);
            
            if (success) {
                console.log('🎉 Hoàn thành nâng cấp!');
            } else {
                console.log('💥 Nâng cấp thất bại!');
                process.exit(1);
            }
            
        } else {
            console.error('❌ Tham số không hợp lệ!');
            showMenu();
            process.exit(1);
        }
        
        console.log('\n🔒 Đóng kết nối database...');
        await mongoose.connection.close();
        console.log('✅ Hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { upgradeUser, connectDB };
