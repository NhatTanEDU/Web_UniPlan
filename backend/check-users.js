// Tạo file kiểm tra: backend/scripts/check-users.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const userModel = require('../models/user.model'); // Đảm bảo đường dẫn đúng
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');
        
        // Đếm tổng số user
        const totalUsers = await User.countDocuments();
        console.log(`📊 Tổng số user: ${totalUsers}`);
        
        // Kiểm tra các loại gói
        const freeTrial = await User.countDocuments({ current_plan_type: 'free_trial' });
        const monthly = await User.countDocuments({ current_plan_type: 'monthly' });
        const yearly = await User.countDocuments({ current_plan_type: 'yearly' });
        const expired = await User.countDocuments({ current_plan_type: 'expired' });
        const nullPlan = await User.countDocuments({ current_plan_type: null });
        const undefinedPlan = await User.countDocuments({ current_plan_type: { $exists: false } });
        
        console.log('\n📈 Phân bố gói hiện tại:');
        console.log(`- Free Trial: ${freeTrial}`);
        console.log(`- Monthly: ${monthly}`);
        console.log(`- Yearly: ${yearly}`);
        console.log(`- Expired: ${expired}`);
        console.log(`- Null: ${nullPlan}`);
        console.log(`- Undefined: ${undefinedPlan}`);
        
        // Hiển thị 3 user đầu tiên để kiểm tra
        const sampleUsers = await User.find({}).limit(3).select('email current_plan_type trial_start_date createdAt');
        console.log('\n👥 Sample users:');
        sampleUsers.forEach(user => {
            console.log(`- ${user.email}: ${user.current_plan_type} (created: ${user.createdAt})`);
        });
        
        await mongoose.connection.close();
        console.log('\n✅ Kiểm tra hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

checkUsers();