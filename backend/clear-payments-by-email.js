// backend/clear-payments-by-email.js
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

const clearPaymentsByEmail = async (email) => {
    try {
        console.log(`🔍 Finding user with email: ${email}`);
        
        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log(`✅ User found: ${user.full_name} (${user._id})`);
          // Tìm payments của user - sử dụng payment_status thay vì status
        const payments = await Payment.find({ 
            user_id: user._id,
            payment_status: { $in: ['pending', 'processing'] }
        });
        
        console.log(`🔍 Found ${payments.length} pending/processing payments:`);
        
        if (payments.length === 0) {
            console.log('✅ No pending payments found');
            return;
        }
        
        for (const payment of payments) {
            console.log(`📋 Payment: ${payment.momo_order_id}`);
            console.log(`   - Amount: ${payment.amount} VND`);
            console.log(`   - Plan: ${payment.plan_type}`);
            console.log(`   - Status: ${payment.payment_status}`);
            console.log(`   - Created: ${payment.createdAt}`);
        }
          // Xóa pending payments - sử dụng payment_status thay vì status
        const deleteResult = await Payment.deleteMany({ 
            user_id: user._id,
            payment_status: { $in: ['pending', 'processing'] }
        });
        
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} pending payments`);
        console.log('✅ User can now create new payment');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2] || 'thanhtoan@gmail.com';
        await clearPaymentsByEmail(email);
        
        await mongoose.connection.close();
        console.log('✅ Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

if (require.main === module) {
    main();
}
