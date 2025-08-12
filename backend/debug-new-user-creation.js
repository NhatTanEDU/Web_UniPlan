// backend/debug-new-user-creation.js
// Script để debug việc tạo user mới và kiểm tra default values

const mongoose = require('mongoose');
const User = require('./models/user.model');
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

// Test tạo user mới
const testCreateUser = async () => {
    try {
        console.log('🧪 Testing user creation...');
        
        // Tạo một user test với thông tin tối thiểu
        const testEmail = `debug_test_${Date.now()}@example.com`;
        
        console.log(`📝 Tạo user test: ${testEmail}`);
        
        const testUser = new User({
            full_name: 'Debug Test User',
            email: testEmail,
            password: 'test123456'
        });
        
        console.log('📋 User data before save:');
        console.log('  - full_name:', testUser.full_name);
        console.log('  - email:', testUser.email);
        console.log('  - current_plan_type:', testUser.current_plan_type);
        console.log('  - trial_start_date:', testUser.trial_start_date);
        console.log('  - trial_end_date:', testUser.trial_end_date);
        console.log('  - subscription_start_date:', testUser.subscription_start_date);
        console.log('  - subscription_end_date:', testUser.subscription_end_date);
        
        // Lưu user
        await testUser.save();
        
        console.log('✅ User saved successfully!');
        console.log('📋 User data after save:');
        console.log('  - _id:', testUser._id);
        console.log('  - full_name:', testUser.full_name);
        console.log('  - email:', testUser.email);
        console.log('  - current_plan_type:', testUser.current_plan_type);
        console.log('  - trial_start_date:', testUser.trial_start_date);
        console.log('  - trial_end_date:', testUser.trial_end_date);
        console.log('  - subscription_start_date:', testUser.subscription_start_date);
        console.log('  - subscription_end_date:', testUser.subscription_end_date);
        console.log('  - createdAt:', testUser.createdAt);
        console.log('  - updatedAt:', testUser.updatedAt);
        
        // Kiểm tra methods
        console.log('🔍 Testing user methods:');
        console.log('  - isTrialExpired():', testUser.isTrialExpired());
        console.log('  - isSubscriptionActive():', testUser.isSubscriptionActive());
        console.log('  - canAccessService():', testUser.canAccessService());
        
        const planInfo = testUser.getPlanDisplayInfo();
        console.log('  - getPlanDisplayInfo():', planInfo);
        
        // Lấy lại user từ database để đảm bảo
        const userFromDB = await User.findById(testUser._id);
        console.log('📋 User from database:');
        console.log('  - current_plan_type:', userFromDB.current_plan_type);
        console.log('  - trial_start_date:', userFromDB.trial_start_date);
        console.log('  - trial_end_date:', userFromDB.trial_end_date);
        
        // Cleanup - xóa user test
        await User.findByIdAndDelete(testUser._id);
        console.log('🗑️ Test user deleted');
        
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        console.error('Error details:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
};

// Test schema defaults
const testSchemaDefaults = async () => {
    try {
        console.log('\n🔍 Testing schema defaults...');
        
        // Tạo user với data rỗng nhất có thể
        const minimalUser = new User();
        
        console.log('📋 Minimal user defaults:');
        console.log('  - current_plan_type:', minimalUser.current_plan_type);
        console.log('  - role:', minimalUser.role);
        console.log('  - payment_status:', minimalUser.payment_status);
        console.log('  - online_status:', minimalUser.online_status);
        console.log('  - isActive:', minimalUser.isActive);
        console.log('  - trial_start_date:', minimalUser.trial_start_date);
        console.log('  - trial_end_date:', minimalUser.trial_end_date);
        
    } catch (error) {
        console.error('❌ Error testing schema defaults:', error);
    }
};

// Kiểm tra user hiện tại trong database
const checkExistingUsers = async () => {
    try {
        console.log('\n📊 Checking existing users...');
        
        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('email current_plan_type trial_start_date trial_end_date subscription_start_date subscription_end_date createdAt');
        
        console.log(`Found ${recentUsers.length} recent users:`);
        
        recentUsers.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.email}`);
            console.log(`   - current_plan_type: ${user.current_plan_type}`);
            console.log(`   - trial_start_date: ${user.trial_start_date}`);
            console.log(`   - trial_end_date: ${user.trial_end_date}`);
            console.log(`   - subscription_start_date: ${user.subscription_start_date}`);
            console.log(`   - subscription_end_date: ${user.subscription_end_date}`);
            console.log(`   - createdAt: ${user.createdAt}`);
        });
        
    } catch (error) {
        console.error('❌ Error checking existing users:', error);
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        
        await testSchemaDefaults();
        await testCreateUser();
        await checkExistingUsers();
        
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
};

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { testCreateUser, testSchemaDefaults, checkExistingUsers };
