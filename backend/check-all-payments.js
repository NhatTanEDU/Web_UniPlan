// backend/check-all-payments.jsAdd commentMore actions
const mongoose = require('mongoose');
const Payment = require('./models/payment.model');
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

const checkAllPayments = async (email) => {
    try {
        console.log(`🔍 Checking ALL payments for: ${email}`);
        
        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log(`✅ User found: ${user.full_name} (${user._id})`);
        
        // Tìm TẤT CẢ payments của user
        const allPayments = await Payment.find({ user_id: user._id }).sort({ createdAt: -1 });
        
        console.log(`🔍 Found ${allPayments.length} total payments:`);
        
        if (allPayments.length === 0) {
            console.log('✅ No payments found');
            return;
        }
        
        allPayments.forEach((payment, index) => {
            console.log(`\n${index + 1}. Payment: ${payment.momo_order_id}`);
            console.log(`   - Amount: ${payment.amount} VND`);
            console.log(`   - Plan: ${payment.plan_type}`);
            console.log(`   - Status: ${payment.status}`);
            console.log(`   - Created: ${payment.createdAt}`);
            console.log(`   - Updated: ${payment.updatedAt}`);
            if (payment.expires_at) {
                console.log(`   - Expires: ${payment.expires_at}`);
                console.log(`   - Is Expired: ${new Date() > payment.expires_at}`);
            }
        });
        
        // Kiểm tra pending payments cụ thể
        const pendingPayments = allPayments.filter(p => ['pending', 'processing'].includes(p.status));
        console.log(`\n🚨 Pending/Processing payments: ${pendingPayments.length}`);
        
        if (pendingPayments.length > 0) {
            console.log('\n🔧 Cleaning up pending payments...');
            const deleteResult = await Payment.deleteMany({ 
                user_id: user._id,
                status: { $in: ['pending', 'processing'] }
            });
            console.log(`🗑️ Deleted ${deleteResult.deletedCount} pending payments`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2] || 'thanhtoan@gmail.com';
        await checkAllPayments(email);
        
        await mongoose.connection.close();
        console.log('\n✅ Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

if (require.main === module) {
    main();
}