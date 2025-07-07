// Manual confirm payment và upgrade user subscription
// File: backend/manual-confirm-payment.js

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan';

async function manualConfirmPayment() {
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        
        const db = client.db();
        const paymentsCollection = db.collection('payments');
        const usersCollection = db.collection('users');

        // 1. Tìm user admin1@gmail.com
        console.log('🔍 Finding admin1@gmail.com user...');
        const user = await usersCollection.findOne({ email: 'admin1@gmail.com' });
        
        if (!user) {
            console.error('❌ User admin1@gmail.com not found');
            return;
        }

        console.log('✅ Found user:', user.email, 'ID:', user._id);
        console.log('📦 Current plan:', user.current_plan_type);

        // 2. Tìm pending payment gần nhất
        console.log('🔍 Finding recent pending payment...');
        const pendingPayment = await paymentsCollection.findOne({
            user_id: user._id,
            payment_status: 'pending'
        }, {
            sort: { created_at: -1 }
        });

        if (!pendingPayment) {
            console.log('ℹ️ No pending payments found');
            return;
        }

        console.log('📋 Found pending payment:');
        console.log(`  - Order ID: ${pendingPayment.momo_order_id}`);
        console.log(`  - Amount: ${pendingPayment.amount}`);
        console.log(`  - Plan: ${pendingPayment.plan_type}`);
        console.log(`  - Created: ${pendingPayment.created_at}`);

        // 3. Confirm payment
        console.log('✅ Confirming payment...');
        const now = new Date();
        
        await paymentsCollection.updateOne(
            { _id: pendingPayment._id },
            {
                $set: {
                    payment_status: 'completed',
                    completed_at: now,
                    momo_transaction_id: 'MANUAL_CONFIRM_' + Date.now(),
                    momo_response: {
                        resultCode: 0,
                        message: 'Manual confirmation for testing',
                        confirmedAt: now
                    },
                    updatedAt: now
                }
            }
        );

        console.log('✅ Payment confirmed successfully');

        // 4. Upgrade user subscription
        console.log('🔄 Upgrading user subscription...');
        
        let subscriptionEndDate = new Date();
        if (pendingPayment.plan_type === 'monthly') {
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        } else if (pendingPayment.plan_type === 'yearly') {
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        }

        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    current_plan_type: pendingPayment.plan_type,
                    subscription_start_date: now,
                    subscription_end_date: subscriptionEndDate,
                    updatedAt: now
                }
            }
        );

        console.log('✅ User subscription upgraded successfully');
        console.log(`📦 New plan: ${pendingPayment.plan_type}`);
        console.log(`📅 Valid until: ${subscriptionEndDate.toLocaleString()}`);

        // 5. Verify update
        const updatedUser = await usersCollection.findOne({ _id: user._id });
        console.log('🔍 Verification:');
        console.log(`  - Current plan: ${updatedUser.current_plan_type}`);
        console.log(`  - Start date: ${updatedUser.subscription_start_date}`);
        console.log(`  - End date: ${updatedUser.subscription_end_date}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Chạy script
if (require.main === module) {
    manualConfirmPayment();
}

module.exports = { manualConfirmPayment };
