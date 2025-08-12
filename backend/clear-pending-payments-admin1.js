// Utility script để clear pending payments
// File: backend/clear-pending-payments-admin1.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan';

async function clearPendingPaymentsForAdmin1() {
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        
        const db = client.db();
        const paymentsCollection = db.collection('payments');
        const usersCollection = db.collection('users');

        // Tìm user admin1@gmail.com
        console.log('🔍 Finding admin1@gmail.com user...');
        const user = await usersCollection.findOne({ email: 'admin1@gmail.com' });
        
        if (!user) {
            console.error('❌ User admin1@gmail.com not found');
            return;
        }

        console.log('✅ Found user:', user.email, 'ID:', user._id);

        // Tìm pending payments của user này
        console.log('🔍 Finding pending payments...');
        const pendingPayments = await paymentsCollection.find({
            user_id: user._id,
            payment_status: 'pending'
        }).toArray();

        console.log(`📋 Found ${pendingPayments.length} pending payments:`);
        pendingPayments.forEach(payment => {
            console.log(`  - Order ID: ${payment.momo_order_id}`);
            console.log(`  - Amount: ${payment.amount}`);
            console.log(`  - Created: ${payment.created_at}`);
            console.log(`  - Expires: ${payment.expired_at}`);
            console.log('  ---');
        });

        if (pendingPayments.length > 0) {
            console.log('🗑️ Clearing pending payments...');
            const result = await paymentsCollection.deleteMany({
                user_id: user._id,
                payment_status: 'pending'
            });

            console.log(`✅ Deleted ${result.deletedCount} pending payments`);
        } else {
            console.log('ℹ️ No pending payments to clear');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Chạy script
clearPendingPaymentsForAdmin1();
