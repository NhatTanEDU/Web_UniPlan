// Simple downgrade script - bypass validation issues
// File: backend/simple-downgrade-admin1.js

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan';

async function simpleDowngradeAdmin1() {
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        
        const db = client.db();
        const usersCollection = db.collection('users');

        // 1. Tìm user admin1@gmail.com
        console.log('🔍 Finding admin1@gmail.com user...');
        const user = await usersCollection.findOne({ email: 'admin1@gmail.com' });
        
        if (!user) {
            console.error('❌ User admin1@gmail.com not found');
            return;
        }

        console.log('✅ Found user:', user.email);
        console.log('📦 Current plan:', user.current_plan_type);
        console.log('📅 Current end date:', user.subscription_end_date);

        // 2. Downgrade to free directly
        console.log('🔄 Downgrading to free...');
        const now = new Date();
        
        const result = await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    current_plan_type: 'free',
                    subscription_start_date: null,
                    subscription_end_date: null,
                    trial_start_date: null,
                    trial_end_date: null,
                    updatedAt: now
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ User downgraded successfully!');
            
            // 3. Verify update
            const updatedUser = await usersCollection.findOne({ _id: user._id });
            console.log('🔍 Verification:');
            console.log(`  - New plan: ${updatedUser.current_plan_type}`);
            console.log(`  - Start date: ${updatedUser.subscription_start_date}`);
            console.log(`  - End date: ${updatedUser.subscription_end_date}`);
            console.log(`  - Trial start: ${updatedUser.trial_start_date}`);
            console.log(`  - Trial end: ${updatedUser.trial_end_date}`);
            
            console.log('🎯 Downgrade completed successfully!');
            console.log('💡 User is now on FREE plan');
            
        } else {
            console.error('❌ Failed to update user');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Chạy script
if (require.main === module) {
    simpleDowngradeAdmin1();
}

module.exports = { simpleDowngradeAdmin1 };
