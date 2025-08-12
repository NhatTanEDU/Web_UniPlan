// backend/demo-subscription-difference.js
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const demoSubscriptionDifference = async () => {
    try {
        console.log('📚 DEMO: Sự khác biệt giữa Trial và Premium User\n');
        
        // 1. Tìm user trial
        console.log('🆓 === USER TRIAL (thanhtoan@gmail.com) ===');
        const trialUser = await User.findOne({ email: 'thanhtoan@gmail.com' });
        if (trialUser) {
            console.log('📊 Database values:');
            console.log('  - current_plan_type:', trialUser.current_plan_type);
            console.log('  - trial_start_date:', trialUser.trial_start_date);
            console.log('  - trial_end_date:', trialUser.trial_end_date);
            console.log('  - subscription_start_date:', trialUser.subscription_start_date); // ← NULL
            console.log('  - subscription_end_date:', trialUser.subscription_end_date);     // ← NULL
            console.log('  - payment_status:', trialUser.payment_status);
            
            console.log('\n🔍 API Response sẽ là:');
            console.log('  - subscriptionType:', trialUser.current_plan_type);
            console.log('  - subscriptionStart:', trialUser.subscription_start_date);      // ← NULL
            console.log('  - subscriptionEnd:', trialUser.subscription_end_date);          // ← NULL
            console.log('  - isPremium:', ['monthly', 'yearly'].includes(trialUser.current_plan_type));
            
            console.log('\n💡 TẠI SAO NULL?');
            console.log('  ✅ User chưa thanh toán gói nào');
            console.log('  ✅ Đang dùng trial miễn phí 7 ngày');
            console.log('  ✅ subscription_start/end chỉ có khi THANH TOÁN');
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // 2. Tìm user premium (nếu có)
        console.log('💰 === USER PREMIUM (đã thanh toán) ===');
        const premiumUser = await User.findOne({ 
            current_plan_type: { $in: ['monthly', 'yearly'] },
            subscription_start_date: { $ne: null }
        });
        
        if (premiumUser) {
            console.log('📊 Database values:');
            console.log('  - current_plan_type:', premiumUser.current_plan_type);
            console.log('  - trial_start_date:', premiumUser.trial_start_date);
            console.log('  - trial_end_date:', premiumUser.trial_end_date);
            console.log('  - subscription_start_date:', premiumUser.subscription_start_date); // ← CÓ GIÁ TRỊ
            console.log('  - subscription_end_date:', premiumUser.subscription_end_date);     // ← CÓ GIÁ TRỊ
            console.log('  - payment_status:', premiumUser.payment_status);
            
            console.log('\n🔍 API Response sẽ là:');
            console.log('  - subscriptionType:', premiumUser.current_plan_type);
            console.log('  - subscriptionStart:', premiumUser.subscription_start_date);      // ← CÓ GIÁ TRỊ
            console.log('  - subscriptionEnd:', premiumUser.subscription_end_date);          // ← CÓ GIÁ TRỊ
            console.log('  - isPremium:', ['monthly', 'yearly'].includes(premiumUser.current_plan_type));
            
            console.log('\n💡 TẠI SAO CÓ GIÁ TRỊ?');
            console.log('  ✅ User đã thanh toán gói monthly/yearly');
            console.log('  ✅ subscription_start = ngày thanh toán');
            console.log('  ✅ subscription_end = ngày hết hạn (30/365 ngày sau)');
        } else {
            console.log('❌ Không tìm thấy user premium nào trong database');
            console.log('💡 Muốn test user premium, hãy:');
            console.log('   1. Dùng script admin-upgrade-user.js');
            console.log('   2. Hoặc thanh toán qua MoMo');
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // 3. Giải thích chi tiết
        console.log('📚 === GIẢI THÍCH CHI TIẾT ===');
        console.log('');
        console.log('🔄 Flow hoạt động:');
        console.log('1. User đăng ký → free_trial (7 ngày)');
        console.log('   ├─ current_plan_type = "free_trial"');
        console.log('   ├─ trial_start_date = ngày đăng ký');
        console.log('   ├─ trial_end_date = 7 ngày sau');
        console.log('   ├─ subscription_start_date = NULL ← CHƯA THANH TOÁN');
        console.log('   └─ subscription_end_date = NULL ← CHƯA THANH TOÁN');
        console.log('');
        console.log('2. User thanh toán → monthly/yearly');
        console.log('   ├─ current_plan_type = "monthly"/"yearly"');
        console.log('   ├─ subscription_start_date = ngày thanh toán ← CÓ GIÁ TRỊ');
        console.log('   ├─ subscription_end_date = ngày hết hạn ← CÓ GIÁ TRỊ');
        console.log('   └─ trial dates vẫn giữ nguyên (lịch sử)');
        console.log('');
        console.log('💡 KẾT LUẬN:');
        console.log('✅ NULL là BÌNH THƯỜNG cho user chưa thanh toán');
        console.log('✅ Frontend dựa vào isPremium để hiển thị UI');
        console.log('✅ subscriptionStart/End chỉ quan trọng khi isPremium = true');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        await demoSubscriptionDifference();
        await mongoose.connection.close();
        console.log('\n✅ Demo completed!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

if (require.main === module) {
    main();
}
