// Script hạ cấp gói subscription trực tiếp cho admin
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
 * Kiểm tra các tùy chọn hạ cấp có thể
 */
const getDowngradeOptions = (currentPlan) => {
    const options = {};
    
    switch (currentPlan) {
        case 'yearly':
            options['monthly'] = {
                name: 'Monthly Plan',
                duration: 30,
                description: 'Hạ từ Yearly → Monthly (30 ngày)',
                amount: 500000
            };
            options['free'] = {
                name: 'Free Plan',
                duration: 0,
                description: 'Hạ từ Yearly → Free (hết subscription ngay)',
                amount: 0
            };
            break;
            
        case 'monthly':
            options['free'] = {
                name: 'Free Plan',
                duration: 0,
                description: 'Hạ từ Monthly → Free (hết subscription ngay)',
                amount: 0
            };
            break;
            
        case 'free_trial':
        case 'expired':
        case 'free':
            console.log('ℹ️  User đã ở mức thấp nhất, không thể hạ cấp thêm');
            return {};
            
        default:
            console.log('⚠️  Gói không xác định:', currentPlan);
            return {};
    }
    
    return options;
};

/**
 * Hạ cấp gói subscription
 */
const downgradeUserSubscription = async (email, targetPlan) => {
    try {
        console.log(`🔍 Finding user with email: ${email}`);
        
        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return { success: false, message: 'User not found' };
        }
        
        console.log('✅ User found:');
        console.log(`  - ID: ${user._id}`);
        console.log(`  - Name: ${user.firstName} ${user.lastName}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Current plan: ${user.current_plan_type}`);
        console.log(`  - Subscription end: ${user.subscription_end_date || 'None'}`);
        
        // Kiểm tra tùy chọn hạ cấp
        const downgradeOptions = getDowngradeOptions(user.current_plan_type);
        
        if (Object.keys(downgradeOptions).length === 0) {
            return { success: false, message: 'Không có tùy chọn hạ cấp' };
        }
        
        if (!downgradeOptions[targetPlan]) {
            console.log('❌ Tùy chọn hạ cấp không hợp lệ');
            console.log('📋 Các tùy chọn có sẵn:');
            Object.keys(downgradeOptions).forEach(plan => {
                console.log(`  - ${plan}: ${downgradeOptions[plan].description}`);
            });
            return { success: false, message: 'Invalid downgrade option' };
        }
        
        // Backup trạng thái cũ
        const oldPlan = {
            plan_type: user.current_plan_type,
            subscription_start: user.subscription_start_date,
            subscription_end: user.subscription_end_date,
            trial_start: user.trial_start_date,
            trial_end: user.trial_end_date
        };
        
        console.log('\n🔽 Downgrading subscription...');
        console.log(`📦 From: ${user.current_plan_type} → To: ${targetPlan}`);
        
        const now = new Date();
        let updateData = {};
        
        if (targetPlan === 'free') {
            // Hạ về free - kết thúc subscription ngay
            updateData = {
                current_plan_type: 'free',
                subscription_start_date: null,
                subscription_end_date: null
            };
            console.log('📦 Plan: Free (subscription ends immediately)');
            
        } else if (targetPlan === 'monthly') {
            // Hạ từ yearly về monthly - tính lại thời gian
            const subscriptionStart = now;
            const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
            
            updateData = {
                current_plan_type: 'monthly',
                subscription_start_date: subscriptionStart,
                subscription_end_date: subscriptionEnd
            };
            console.log('📦 Plan: Monthly (30 days from now)');
            console.log(`📅 New end date: ${subscriptionEnd}`);
        }
        
        // Cập nhật user
        await User.findByIdAndUpdate(user._id, updateData);
        
        // Tạo history record với schema đúng
        const historyData = {
            user_id: user._id,
            action: 'downgraded',
            from_plan: oldPlan.plan_type,
            to_plan: targetPlan,
            from_date: oldPlan.subscription_start,
            to_date: updateData.subscription_end_date,
            amount: 0, // Hạ cấp không tính phí
            reason: `Admin manual downgrade: ${oldPlan.plan_type} → ${targetPlan}`,
            triggered_by: {
                user_id: user._id,
                user_type: 'admin',
                ip_address: null
            },
            metadata: {
                duration_days: targetPlan === 'free' ? 0 : 30,
                billing_cycle: targetPlan === 'free' ? null : targetPlan,
                notes: `Downgrade method: direct_script, version: 1.0, old_plan: ${oldPlan.plan_type}`
            }
        };
        
        const history = new SubscriptionHistory(historyData);
        await history.save();
        
        // Verify cập nhật
        const updatedUser = await User.findById(user._id);
        
        console.log('\n✅ Subscription downgraded successfully!');
        console.log('📊 New subscription details:');
        console.log(`  - Plan: ${updatedUser.current_plan_type}`);
        console.log(`  - Start: ${updatedUser.subscription_start_date || 'None'}`);
        console.log(`  - End: ${updatedUser.subscription_end_date || 'None'}`);
        
        if (updatedUser.subscription_end_date) {
            const daysRemaining = Math.ceil((updatedUser.subscription_end_date - now) / (1000 * 60 * 60 * 24));
            console.log(`  - Days remaining: ${Math.max(0, daysRemaining)}`);
        } else {
            console.log(`  - Days remaining: N/A (Free plan)`);
        }
        
        console.log(`\n📝 History record created: ${history._id}`);
        
        return {
            success: true,
            user: updatedUser,
            history: history,
            oldPlan: oldPlan,
            newPlan: {
                plan_type: targetPlan,
                start_date: updateData.subscription_start_date,
                end_date: updateData.subscription_end_date
            }
        };
        
    } catch (error) {
        console.error('❌ Error downgrading subscription:', error);
        throw error;
    }
};

/**
 * Hiển thị tùy chọn hạ cấp
 */
const showDowngradeOptions = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('👤 User Information:');
        console.log(`  - Name: ${user.firstName} ${user.lastName}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Current plan: ${user.current_plan_type}`);
        console.log(`  - Subscription end: ${user.subscription_end_date || 'None'}`);
        
        const options = getDowngradeOptions(user.current_plan_type);
        
        if (Object.keys(options).length === 0) {
            console.log('\n📋 No downgrade options available');
            console.log('ℹ️  User is already at the lowest plan level');
            return;
        }
        
        console.log('\n📋 Available downgrade options:');
        Object.entries(options).forEach(([plan, details], index) => {
            console.log(`\n${index + 1}. ${plan.toUpperCase()}`);
            console.log(`   📦 ${details.name}`);
            console.log(`   📝 ${details.description}`);
            console.log(`   ⏱️  Duration: ${details.duration > 0 ? details.duration + ' days' : 'Immediate termination'}`);
            console.log(`   💰 Amount: ${details.amount.toLocaleString()} VND`);
            console.log(`   🔧 Command: node downgrade-admin-subscription.js ${email} ${plan} --confirm`);
        });
        
    } catch (error) {
        console.error('❌ Error showing options:', error);
    }
};

/**
 * Script chính
 */
const main = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2];
        const targetPlan = process.argv[3];
        const confirm = process.argv.includes('--confirm');
        
        if (!email) {
            console.log('❌ Please provide user email');
            console.log('📝 Usage: node downgrade-admin-subscription.js <email> [target_plan] [--confirm]');
            console.log('📝 Example: node downgrade-admin-subscription.js admin1@gmail.com monthly --confirm');
            return;
        }
        
        console.log('🔽 Starting subscription downgrade...');
        console.log(`📧 Target email: ${email}`);
        
        if (!targetPlan) {
            // Chỉ hiển thị tùy chọn
            await showDowngradeOptions(email);
            return;
        }
        
        console.log(`📦 Target plan: ${targetPlan}`);
        
        if (!confirm) {
            console.log('⚠️  DRY RUN MODE - Add --confirm to actually downgrade');
            console.log('📝 Command to run downgrade:');
            console.log(`   node downgrade-admin-subscription.js ${email} ${targetPlan} --confirm`);
            
            // Show what would happen
            await showDowngradeOptions(email);
            return;
        }
        
        console.log('⚠️  CONFIRM MODE - Performing actual downgrade\n');
        
        const result = await downgradeUserSubscription(email, targetPlan);
        
        if (result.success) {
            console.log('\n🎉 Downgrade completed successfully!');
            console.log('⚠️  User subscription has been reduced');
            console.log('🔄 User access level has been updated');
        } else {
            console.log(`\n❌ Downgrade failed: ${result.message}`);
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

module.exports = { downgradeUserSubscription, getDowngradeOptions, showDowngradeOptions };
