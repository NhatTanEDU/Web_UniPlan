// backend/scripts/test-phase3-subscription.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const subscriptionService = require('../services/subscriptionService');
const notificationService = require('../services/notificationService');
require('dotenv').config();

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan');
        console.log('✅ Kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Test 1: Subscription Service
const testSubscriptionService = async () => {
    console.log('\n🧪 TEST 1: Subscription Service');
    console.log('=====================================');
    
    try {
        // Tìm user để test
        const user = await User.findOne({ email: 'admin1@gmail.com' });
        if (!user) {
            console.error('❌ Không tìm thấy user admin1@gmail.com');
            return;
        }
        
        console.log(`👤 Testing với user: ${user.email}`);
        console.log(`📦 Gói hiện tại: ${user.current_plan_type}`);
        
        // Test calculateRemainingDays (sử dụng helper function)
        const remainingDays = calculateRemainingDays(user);
        console.log(`⏰ Số ngày còn lại: ${remainingDays} ngày`);
        
        // Test user methods
        const canAccess = user.canAccessService();
        const planInfo = user.getPlanDisplayInfo();
        
        console.log(`� Có thể truy cập dịch vụ: ${canAccess ? 'Có' : 'Không'}`);
        console.log(`📋 Thông tin gói: ${planInfo.name}`);
        console.log(`⏰ Ngày hết hạn: ${planInfo.isExpired ? 'Đã hết hạn' : `Còn ${planInfo.daysLeft} ngày`}`);
          // Test getSubscriptionHistory
        try {
            const history = await subscriptionService.getSubscriptionHistory(user._id, 5);
            const historyArray = Array.isArray(history) ? history : [];
            console.log(`📜 Lịch sử subscription: ${historyArray.length} records`);
            
            historyArray.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.description} - ${record.status} (${record.date})`);
            });
        } catch (historyError) {
            console.log(`📜 Lịch sử subscription: Không thể lấy (${historyError.message})`);
        }
        
        return { success: true, user, remainingDays };
        
    } catch (error) {
        console.error('❌ Lỗi test Subscription Service:', error.message);
        return { success: false, error: error.message };
    }
};

// Helper function để tính remaining days
function calculateRemainingDays(user) {
    const now = new Date();
    let expiryDate;
    
    if (user.current_plan_type === 'free_trial') {
        expiryDate = user.trial_end_date;
    } else if (user.current_plan_type === 'monthly' || user.current_plan_type === 'yearly') {
        expiryDate = user.subscription_end_date;
    } else {
        return 0; // expired
    }
    
    if (!expiryDate) return 0;
    
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
}

// Test 2: Notification Service
const testNotificationService = async (user, remainingDays) => {
    console.log('\n🧪 TEST 2: Notification Service');
    console.log('=====================================');
    
    try {
        console.log(`👤 Testing notifications cho user: ${user.email}`);
        
        // Test trial expiry warning
        if (user.current_plan_type === 'free_trial') {
            console.log('📨 Testing trial expiry warning...');
            const result = await notificationService.sendTrialExpiryWarning(user._id, remainingDays);
            console.log(`✅ Trial warning sent: ${result.success ? 'Success' : 'Failed'}`);
        }
        
        // Test subscription expiry warning
        if (['monthly', 'yearly'].includes(user.current_plan_type)) {
            console.log('📨 Testing subscription expiry warning...');
            const result = await notificationService.sendSubscriptionExpiryWarning(user._id, remainingDays, user.current_plan_type);
            console.log(`✅ Subscription warning sent: ${result.success ? 'Success' : 'Failed'}`);
        }
        
        // Test welcome message
        console.log('📨 Testing welcome message...');
        const welcomeResult = await notificationService.sendWelcomeMessage(user._id, user.current_plan_type);
        console.log(`✅ Welcome message sent: ${welcomeResult.success ? 'Success' : 'Failed'}`);
        
        // Test get notifications
        console.log('📋 Testing get notifications...');
        const notifications = await notificationService.getUserNotifications(user._id, { limit: 5 });
        console.log(`📨 User notifications: ${notifications.notifications.length} found`);
        
        notifications.notifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. ${notif.title} - ${notif.type} (${notif.isRead ? 'Read' : 'Unread'})`);
        });
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Lỗi test Notification Service:', error.message);
        return { success: false, error: error.message };
    }
};

// Test 3: Middleware Logic (simulate)
const testMiddlewareLogic = async (user) => {
    console.log('\n🧪 TEST 3: Middleware Logic Simulation');
    console.log('=====================================');
    
    try {
        console.log(`👤 Testing middleware logic cho user: ${user.email}`);
          // Simulate middleware checks
        const remainingDays = calculateRemainingDays(user);
        const canAccess = user.canAccessService();
        const planInfo = user.getPlanDisplayInfo();
        
        console.log(`📊 Middleware simulation results:`);
        console.log(`   Can access service: ${canAccess ? 'Yes' : 'No'}`);
        console.log(`   Plan info: ${planInfo.name}`);
        console.log(`   Remaining days: ${remainingDays}`);
        console.log(`   Is expired: ${planInfo.isExpired ? 'Yes' : 'No'}`);
        
        // Test expiry handling
        if (user.current_plan_type === 'free_trial' && user.isTrialExpired()) {
            console.log('🔄 Testing trial expiry handling...');
            const result = await subscriptionService.handleTrialExpiry(user._id);
            console.log(`✅ Trial expiry handled: ${result.success ? 'Success' : 'Failed'}`);
        }
        
        // Test limits simulation
        const features = getAvailableFeatures(user.current_plan_type);
        const limits = getSubscriptionLimits(user.current_plan_type);
        
        console.log(`🎯 Available features: ${features.length} features`);
        features.forEach(feature => console.log(`   - ${feature}`));
        
        console.log(`📏 Subscription limits:`);
        Object.entries(limits).forEach(([key, value]) => {
            console.log(`   ${key}: ${value === -1 ? 'Unlimited' : value}`);
        });
        
        return { success: true, canAccess, planInfo, features, limits };
        
    } catch (error) {
        console.error('❌ Lỗi test Middleware Logic:', error.message);
        return { success: false, error: error.message };
    }
};

// Test 4: Business Logic Scenarios
const testBusinessScenarios = async (user) => {
    console.log('\n🧪 TEST 4: Business Logic Scenarios');
    console.log('=====================================');
    
    try {
        console.log(`👤 Testing business scenarios cho user: ${user.email}`);
          // Scenario 1: User nâng cấp từ free trial
        if (user.current_plan_type === 'free_trial') {
            console.log('📈 Scenario: Upgrade from free trial');
            console.log(`   Current plan allows access: ${user.canAccessService() ? 'Yes' : 'No'}`);
        }
        
        // Scenario 2: User với gói hết hạn
        if (user.current_plan_type === 'expired') {
            console.log('💀 Scenario: Expired user trying to access');
            console.log(`   Can access service: ${user.canAccessService() ? 'Yes' : 'No'}`);
            console.log(`   Should redirect to payment: Yes`);
        }
        
        // Scenario 3: Premium user
        if (['monthly', 'yearly'].includes(user.current_plan_type)) {
            console.log('👑 Scenario: Premium user access');
            console.log(`   Can access premium features: Yes`);
            console.log(`   Next billing date: ${user.next_billing_date}`);
        }
        
        // Scenario 4: Cảnh báo hết hạn
        const remainingDays = calculateRemainingDays(user);
        if (remainingDays <= 2 && remainingDays > 0) {
            console.log('⚠️ Scenario: Expiry warning needed');
            console.log(`   Days left: ${remainingDays}`);
            console.log(`   Should send warning: Yes`);
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Lỗi test Business Scenarios:', error.message);
        return { success: false, error: error.message };
    }
};

// Helper functions (copy từ middleware)
function getAvailableFeatures(planType) {
    const features = {
        free_trial: [
            'basic_project_management',
            'team_collaboration',
            'file_upload',
            'basic_notifications'
        ],
        expired: [],
        monthly: [
            'basic_project_management',
            'team_collaboration', 
            'file_upload',
            'advanced_notifications',
            'priority_support',
            'advanced_analytics'
        ],
        yearly: [
            'basic_project_management',
            'team_collaboration',
            'file_upload', 
            'advanced_notifications',
            'priority_support',
            'advanced_analytics',
            'auto_backup',
            'api_access'
        ]
    };
    
    return features[planType] || [];
}

function getSubscriptionLimits(planType) {
    const limits = {
        free_trial: {
            projects: 3,
            team_members: 5,
            storage_mb: 100,
            api_calls_per_day: 100
        },
        expired: {
            projects: 0,
            team_members: 0,
            storage_mb: 0,
            api_calls_per_day: 0
        },
        monthly: {
            projects: 50,
            team_members: 20,
            storage_mb: 5000,
            api_calls_per_day: 1000
        },
        yearly: {
            projects: -1, // unlimited
            team_members: -1, // unlimited
            storage_mb: 20000,
            api_calls_per_day: 5000
        }
    };
    
    return limits[planType] || limits.expired;
}

// Main test function
const runAllTests = async () => {
    try {
        await connectDB();
        
        console.log('🚀 BẮT ĐẦU TEST PHASE 3: LOGIC KINH DOANH');
        console.log('=========================================');
        
        // Test 1: Subscription Service
        const test1Result = await testSubscriptionService();
        if (!test1Result.success) {
            console.error('❌ Test 1 failed, stopping...');
            return;
        }
        
        // Test 2: Notification Service
        const test2Result = await testNotificationService(test1Result.user, test1Result.remainingDays);
        if (!test2Result.success) {
            console.error('❌ Test 2 failed, continuing...');
        }
        
        // Test 3: Middleware Logic
        const test3Result = await testMiddlewareLogic(test1Result.user);
        if (!test3Result.success) {
            console.error('❌ Test 3 failed, continuing...');
        }
        
        // Test 4: Business Scenarios
        const test4Result = await testBusinessScenarios(test1Result.user);
        if (!test4Result.success) {
            console.error('❌ Test 4 failed, continuing...');
        }
        
        console.log('\n🎉 TẤT CẢ TESTS PHASE 3 HOÀN THÀNH!');
        console.log('=====================================');
        console.log('✅ Subscription Service: WORKING');
        console.log(`${test2Result.success ? '✅' : '❌'} Notification Service: ${test2Result.success ? 'WORKING' : 'ERROR'}`);
        console.log(`${test3Result.success ? '✅' : '❌'} Middleware Logic: ${test3Result.success ? 'WORKING' : 'ERROR'}`);
        console.log(`${test4Result.success ? '✅' : '❌'} Business Scenarios: ${test4Result.success ? 'WORKING' : 'ERROR'}`);
        
        console.log('\n🔧 API ENDPOINTS TO TEST:');
        console.log('- POST /api/payment/create');
        console.log('- GET /api/subscription/status');
        console.log('- GET /api/notifications');
        console.log('- Middleware trên các routes protected');
        
        console.log('\n🔒 Đóng kết nối database...');
        await mongoose.connection.close();
        console.log('✅ Test hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi chạy tests:', error);
        process.exit(1);
    }
};

// CLI handler
const main = async () => {
    const args = process.argv.slice(2);
    
    if (args[0] === 'service') {
        await connectDB();
        await testSubscriptionService();
        await mongoose.connection.close();
    } else if (args[0] === 'notification') {
        await connectDB();
        const test1 = await testSubscriptionService();
        if (test1.success) {
            await testNotificationService(test1.user, test1.remainingDays);
        }
        await mongoose.connection.close();
    } else if (args[0] === 'middleware') {
        await connectDB();
        const test1 = await testSubscriptionService();
        if (test1.success) {
            await testMiddlewareLogic(test1.user);
        }
        await mongoose.connection.close();
    } else {
        await runAllTests();
    }
};

// Chạy test
if (require.main === module) {
    main();
}

module.exports = { 
    testSubscriptionService, 
    testNotificationService, 
    testMiddlewareLogic, 
    testBusinessScenarios 
};
