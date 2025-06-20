// backend/test-payment-query.js
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

const testPaymentQuery = async () => {
    try {
        console.log('🧪 Testing payment query for thanhtoan@gmail.com');
        
        // Tìm user
        const user = await User.findOne({ email: 'thanhtoan@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log(`✅ User found: ${user._id}`);
        
        // Test query CHÍNH XÁC như trong paymentController
        const existingPayment = await Payment.findOne({
            user_id: user._id,
            payment_status: 'pending',
            expired_at: { $gt: new Date() }
        });
        
        console.log('🔍 Query result:', existingPayment);
        
        if (existingPayment) {
            console.log('🚨 Found pending payment:');
            console.log('  - Order ID:', existingPayment.momo_order_id);
            console.log('  - Status:', existingPayment.payment_status);
            console.log('  - Expired at:', existingPayment.expired_at);
            console.log('  - Is expired:', new Date() > existingPayment.expired_at);
            
            // Xóa payment này
            console.log('\n🗑️ Deleting this payment...');
            await Payment.findByIdAndDelete(existingPayment._id);
            console.log('✅ Payment deleted');
        } else {
            console.log('✅ No pending payment found');
        }
        
        // Test tất cả queries có thể
        console.log('\n🔍 Testing all possible queries:');
        
        const allPayments = await Payment.find({ user_id: user._id });
        console.log(`1. All payments: ${allPayments.length}`);
        
        const pendingPayments = await Payment.find({ 
            user_id: user._id, 
            payment_status: 'pending' 
        });
        console.log(`2. Pending payments: ${pendingPayments.length}`);
        
        const statusPayments = await Payment.find({ 
            user_id: user._id, 
            status: 'pending' 
        });
        console.log(`3. Status=pending: ${statusPayments.length}`);
        
        const expiredPayments = await Payment.find({ 
            user_id: user._id,
            expired_at: { $gt: new Date() }
        });
        console.log(`4. Not expired: ${expiredPayments.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        await testPaymentQuery();
        await mongoose.connection.close();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

if (require.main === module) {
    main();
}
