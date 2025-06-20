// Check all payments for tannhat user
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

const checkAllPayments = async () => {
    try {
        const email = 'tannhat180803@gmail.com';
        console.log(`🔍 Finding user with email: ${email}`);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log(`✅ User found: ${user.full_name} (${user._id})`);
        console.log(`📊 Current plan: ${user.current_plan_type}`);
        console.log(`📅 Subscription: ${user.subscription_start ? new Date(user.subscription_start) : 'null'} - ${user.subscription_end ? new Date(user.subscription_end) : 'null'}`);
        
        // Check all payment schemas
        const allPayments = await Payment.find({ user_id: user._id }).sort({ createdAt: -1 });
        console.log(`\n📋 Found ${allPayments.length} total payments:`);
        
        for (const payment of allPayments) {
            console.log(`  - Order ID: ${payment.momo_order_id}`);
            console.log(`    Status: ${payment.payment_status}`);
            console.log(`    Amount: ${payment.amount} VND`);
            console.log(`    Plan: ${payment.plan_type}`);
            console.log(`    Created: ${payment.createdAt}`);
            console.log(`    Expires: ${payment.expired_at}`);
            console.log(`    ---`);
        }
        
        // Also check with different field names (just in case)
        const allPaymentsAlt = await Payment.find({ userId: user._id }).sort({ createdAt: -1 });
        if (allPaymentsAlt.length > 0) {
            console.log(`\n🔄 Found ${allPaymentsAlt.length} payments with userId field:`);
            for (const payment of allPaymentsAlt) {
                console.log(`  - Order ID: ${payment.orderId || payment.momo_order_id}`);
                console.log(`    Status: ${payment.payment_status}`);
                console.log(`    Amount: ${payment.amount} VND`);
                console.log(`    Created: ${payment.createdAt}`);
                console.log(`    Expires: ${payment.expiresAt || payment.expires_at}`);
                console.log(`    ---`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        await checkAllPayments();
        await mongoose.connection.close();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

main();
