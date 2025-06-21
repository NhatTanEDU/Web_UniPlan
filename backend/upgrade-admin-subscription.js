// Script nâng cấp gói subscription trực tiếp cho admin (bỏ qua thanh toán)
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/user.model');
const SubscriptionHistory = require('./models/subscriptionHistory.model');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('🔗 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

/**
 * Nâng cấp gói subscription trực tiếp cho user
 */
const upgradeUserSubscription = async (email, planType = 'monthly') => {
    try {
        console.log(`🔍 Finding user with email: ${email}`);
        
        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('✅ User found:');
        console.log(`  - ID: ${user._id}`);
        console.log(`  - Name: ${user.firstName} ${user.lastName}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Current plan: ${user.current_plan_type}`);
        console.log(`  - Trial used: ${user.trial_start_date ? 'Yes' : 'No'}`);
        
        // Backup trạng thái cũ
        const oldPlan = {
            plan_type: user.current_plan_type,
            subscription_start: user.subscription_start_date,
            subscription_end: user.subscription_end_date,
            trial_start: user.trial_start_date,
            trial_end: user.trial_end_date
        };
        
        console.log('\n🔄 Upgrading subscription...');
        
        // Tính ngày bắt đầu và kết thúc
        const now = new Date();
        const subscriptionStart = now;
        let subscriptionEnd;
        
        if (planType === 'monthly') {
            subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
            console.log('📦 Plan: Monthly (30 days)');
        } else if (planType === 'yearly') {
            subscriptionEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 ngày
            console.log('📦 Plan: Yearly (365 days)');
        } else {
            throw new Error('Plan type không hợp lệ. Chỉ chấp nhận: monthly, yearly');
        }
        
        // Cập nhật user
        const updateData = {
            current_plan_type: planType,
            subscription_start_date: subscriptionStart,
            subscription_end_date: subscriptionEnd,
            // Nếu chưa dùng trial thì đánh dấu đã dùng
            trial_start_date: user.trial_start_date || now,
            trial_end_date: user.trial_end_date || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
        
        await User.findByIdAndUpdate(user._id, updateData);
          // Tạo history record
        const historyData = {
            user_id: user._id,
            action: 'upgraded',
            from_plan: oldPlan.plan_type,
            to_plan: planType,
            from_date: oldPlan.subscription_start,
            to_date: subscriptionEnd,
            payment_method: 'admin_manual',
            payment_amount: planType === 'monthly' ? 500000 : 5000000, // VND
            reason: 'Admin manual upgrade - bypass payment',
            performed_by: user._id,
            performed_by_type: 'admin',
            metadata: {
                upgrade_method: 'direct_script',
                script_version: '1.0',
                timestamp: now.toISOString(),
                old_plan_details: oldPlan,
                billing_cycle: planType,
                notes: 'Direct upgrade without payment processing'
            }
        };
        
        const history = new SubscriptionHistory(historyData);
        await history.save();
        
        // Verify cập nhật
        const updatedUser = await User.findById(user._id);
        
        console.log('\n✅ Subscription upgraded successfully!');
        console.log('📊 New subscription details:');
        console.log(`  - Plan: ${updatedUser.current_plan_type}`);
        console.log(`  - Start: ${updatedUser.subscription_start_date}`);
        console.log(`  - End: ${updatedUser.subscription_end_date}`);
        console.log(`  - Duration: ${Math.ceil((updatedUser.subscription_end_date - updatedUser.subscription_start_date) / (1000 * 60 * 60 * 24))} days`);
        
        // Tính số ngày còn lại
        const daysRemaining = Math.ceil((updatedUser.subscription_end_date - now) / (1000 * 60 * 60 * 24));
        console.log(`  - Days remaining: ${daysRemaining}`);
        
        console.log(`\n📝 History record created: ${history._id}`);
        
        return {
            success: true,
            user: updatedUser,
            history: history,
            oldPlan: oldPlan,
            newPlan: {
                plan_type: planType,
                start_date: subscriptionStart,
                end_date: subscriptionEnd,
                days_remaining: daysRemaining
            }
        };
        
    } catch (error) {
        console.error('❌ Error upgrading subscription:', error);
        throw error;
    }
};

/**
 * Script chính
 */
const main = async () => {
    try {
        await connectDB();
        
        // Lấy tham số từ command line
        const email = process.argv[2] || 'admin1@gmail.com';
        const planType = process.argv[3] || 'monthly';
        
        console.log('🚀 Starting subscription upgrade...');
        console.log(`📧 Target email: ${email}`);
        console.log(`📦 Plan type: ${planType}`);
        console.log('⚠️  Note: This will bypass payment process\n');
        
        // Confirm trước khi upgrade
        if (process.argv.includes('--confirm')) {
            const result = await upgradeUserSubscription(email, planType);
            
            if (result.success) {
                console.log('\n🎉 Upgrade completed successfully!');
                console.log('🔄 User can now access premium features');
            }
        } else {
            console.log('⚠️  DRY RUN MODE - Add --confirm to actually upgrade');
            console.log('📝 Command to run upgrade:');
            console.log(`   node upgrade-admin-subscription.js ${email} ${planType} --confirm`);
            
            // Show what would happen
            const user = await User.findOne({ email });
            if (user) {
                console.log('\n📋 Current user status:');
                console.log(`  - Name: ${user.firstName} ${user.lastName}`);
                console.log(`  - Email: ${user.email}`);
                console.log(`  - Current plan: ${user.current_plan_type}`);
                console.log(`  - Subscription end: ${user.subscription_end_date || 'None'}`);
                
                if (planType === 'monthly') {
                    const newEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    console.log(`\n📦 Would upgrade to: ${planType}`);
                    console.log(`📅 New end date: ${newEnd}`);
                    console.log(`⏱️  Duration: 30 days`);
                } else if (planType === 'yearly') {
                    const newEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                    console.log(`\n📦 Would upgrade to: ${planType}`);
                    console.log(`📅 New end date: ${newEnd}`);
                    console.log(`⏱️  Duration: 365 days`);
                }
            } else {
                console.log(`\n❌ User not found: ${email}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { upgradeUserSubscription };
