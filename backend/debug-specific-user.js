// backend/debug-specific-user.js
// Script để debug user cụ thể

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

// Debug user cụ thể
const debugUser = async (email) => {
    try {
        console.log(`🔍 Debugging user: ${email}`);
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('📋 Raw user data from database:');
        console.log(JSON.stringify(user.toObject(), null, 2));
        
        console.log('\n🔍 User subscription details:');
        console.log('  - _id:', user._id);
        console.log('  - email:', user.email);
        console.log('  - current_plan_type:', user.current_plan_type);
        console.log('  - trial_start_date:', user.trial_start_date);
        console.log('  - trial_end_date:', user.trial_end_date);
        console.log('  - subscription_start_date:', user.subscription_start_date);
        console.log('  - subscription_end_date:', user.subscription_end_date);
        console.log('  - payment_status:', user.payment_status);
        console.log('  - createdAt:', user.createdAt);
        console.log('  - updatedAt:', user.updatedAt);
        
        console.log('\n🔍 User methods results:');
        console.log('  - isTrialExpired():', user.isTrialExpired());
        console.log('  - isSubscriptionActive():', user.isSubscriptionActive());
        console.log('  - canAccessService():', user.canAccessService());
        
        const planInfo = user.getPlanDisplayInfo();
        console.log('  - getPlanDisplayInfo():', planInfo);
        
        console.log('\n🔍 Simulating subscription controller logic:');
        
        // Duplicate logic từ subscriptionController
        let subscriptionType = user.current_plan_type;
        if (!subscriptionType || subscriptionType === null || subscriptionType === undefined) {
            subscriptionType = 'free_trial';
            console.log('  - No plan type, defaulting to free_trial');
        }
        
        // Logic xác định isPremium
        const isPremium = ['monthly', 'yearly'].includes(subscriptionType);
        console.log('  - subscriptionType:', subscriptionType);
        console.log('  - isPremium calculation:', {
            subscriptionType,
            isPremium,
            includes: ['monthly', 'yearly'].includes(subscriptionType)
        });
        
        // Calculate remaining days
        const now = new Date();
        let remainingDays = 0;
        
        if (user.current_plan_type === 'free_trial') {
            remainingDays = Math.max(0, Math.ceil((user.trial_end_date - now) / (1000 * 60 * 60 * 24)));
        } else if (user.current_plan_type === 'monthly' || user.current_plan_type === 'yearly') {
            if (user.subscription_end_date) {
                remainingDays = Math.max(0, Math.ceil((user.subscription_end_date - now) / (1000 * 60 * 60 * 24)));
            }
        }
        
        console.log('  - remainingDays:', remainingDays);
        
        // Final response simulation
        const response = {
            subscriptionType: subscriptionType,
            subscriptionStart: user.subscription_start_date,
            subscriptionEnd: user.subscription_end_date,
            daysRemaining: remainingDays,
            isActive: user.canAccessService(),
            isPremium: isPremium,
            trialUsed: user.trial_start_date ? true : false
        };
        
        console.log('\n✅ Final response (what frontend receives):');
        console.log(JSON.stringify(response, null, 2));
        
    } catch (error) {
        console.error('❌ Error debugging user:', error);
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2] || 'thanhtoan@gmail.com';
        
        await debugUser(email);
        
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

module.exports = { debugUser };
