// Search for specific payment order ID
const mongoose = require('mongoose');
const Payment = require('./models/payment.model');
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

const searchPayment = async () => {
    try {
        const orderId = 'UNIPLAN_1750446778169_239';
        console.log(`🔍 Searching for payment with orderId: ${orderId}`);
        
        // Search with different field names
        const payment1 = await Payment.findOne({ momo_order_id: orderId });
        const payment2 = await Payment.findOne({ orderId: orderId });
        const payment3 = await Payment.findOne({ order_id: orderId });
        
        console.log('🔍 Search with momo_order_id:', payment1);
        console.log('🔍 Search with orderId:', payment2);
        console.log('🔍 Search with order_id:', payment3);
        
        // Search all payments with similar pattern
        const similarPayments = await Payment.find({
            $or: [
                { momo_order_id: { $regex: 'UNIPLAN_1750446778169' } },
                { orderId: { $regex: 'UNIPLAN_1750446778169' } },
                { order_id: { $regex: 'UNIPLAN_1750446778169' } }
            ]
        });
        
        console.log(`🔍 Found ${similarPayments.length} similar payments:`);
        for (const payment of similarPayments) {
            console.log(`  - ID: ${payment._id}`);
            console.log(`    User: ${payment.user_id || payment.userId}`);
            console.log(`    Order: ${payment.momo_order_id || payment.orderId || payment.order_id}`);
            console.log(`    Status: ${payment.payment_status}`);
            console.log(`    Expires: ${payment.expired_at || payment.expiresAt}`);
            console.log(`    ---`);
        }
        
        // List all collections to see if there are multiple payment collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 All collections in database:');
        for (const collection of collections) {
            console.log(`  - ${collection.name}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        await searchPayment();
        await mongoose.connection.close();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

main();
