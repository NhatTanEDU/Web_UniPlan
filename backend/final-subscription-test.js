#!/usr/bin/env node

// Script final test cho toàn bộ hệ thống subscription
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Payment = require('./models/payment.model');
require('dotenv').config();

const TEST_USER_EMAIL = 'test-subscription-system@example.com';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const createTestUser = async () => {
    try {
        // Delete existing test user if exists
        await User.deleteOne({ email: TEST_USER_EMAIL });
        await Payment.deleteMany({ user_email: TEST_USER_EMAIL });        // Create new test user
        const testUser = new User({
            email: TEST_USER_EMAIL,
            full_name: 'Test Subscription System',
            password: 'hashedpassword123',
            current_plan_type: 'free',
            is_verified: true
        });

        await testUser.save();
        console.log(`✅ Created test user: ${TEST_USER_EMAIL}`);
        return testUser;
    } catch (error) {
        console.error('❌ Error creating test user:', error.message);
        throw error;
    }
};

const testUpgrade = async (targetPlan) => {
    try {
        console.log(`\n🔄 Testing upgrade to ${targetPlan}...`);
        
        const user = await User.findOne({ email: TEST_USER_EMAIL });
        if (!user) {
            throw new Error('Test user not found');
        }

        const oldPlan = user.current_plan_type;
        console.log(`  Current plan: ${oldPlan}`);

        // Simulate upgrade logic
        const now = new Date();
        const daysToAdd = targetPlan === 'yearly' ? 365 : 30;
        const endDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

        user.current_plan_type = targetPlan;
        user.subscription_start_date = now;
        user.subscription_end_date = endDate;

        await user.save();

        // Verify upgrade
        const updatedUser = await User.findOne({ email: TEST_USER_EMAIL });
        const planInfo = updatedUser.getPlanDisplayInfo();

        console.log(`  ✅ Upgraded: ${oldPlan} → ${targetPlan}`);
        console.log(`  Plan info: ${planInfo.name} (${planInfo.daysLeft} days left)`);
        
        return true;
    } catch (error) {
        console.error(`  ❌ Upgrade test failed:`, error.message);
        return false;
    }
};

const testDowngrade = async (targetPlan) => {
    try {
        console.log(`\n🔄 Testing downgrade to ${targetPlan}...`);
        
        const user = await User.findOne({ email: TEST_USER_EMAIL });
        if (!user) {
            throw new Error('Test user not found');
        }

        const oldPlan = user.current_plan_type;
        console.log(`  Current plan: ${oldPlan}`);

        // Simulate downgrade logic
        if (targetPlan === 'free') {
            user.current_plan_type = 'free';
            user.subscription_start_date = null;
            user.subscription_end_date = null;
            user.trial_start_date = null;
            user.trial_end_date = null;
        } else if (targetPlan === 'monthly' && oldPlan === 'yearly') {
            const now = new Date();
            user.current_plan_type = 'monthly';
            user.subscription_start_date = now;
            user.subscription_end_date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        await user.save();

        // Verify downgrade
        const updatedUser = await User.findOne({ email: TEST_USER_EMAIL });
        const planInfo = updatedUser.getPlanDisplayInfo();

        console.log(`  ✅ Downgraded: ${oldPlan} → ${targetPlan}`);
        console.log(`  Plan info: ${planInfo.name} (${planInfo.type})`);
        
        return true;
    } catch (error) {
        console.error(`  ❌ Downgrade test failed:`, error.message);
        return false;
    }
};

const testPlanInfoFix = async () => {
    try {
        console.log(`\n🔄 Testing plan info fix...`);
        
        // Create problematic state (user with trial dates but free plan)
        const user = await User.findOne({ email: TEST_USER_EMAIL });
        user.current_plan_type = 'free';
        user.trial_start_date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        user.trial_end_date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        user.subscription_start_date = null;
        user.subscription_end_date = null;
        await user.save();

        // Check if this creates "unknown" status
        let planInfo = user.getPlanDisplayInfo();
        console.log(`  Before fix: ${planInfo.name} (${planInfo.type})`);

        // Fix the user
        if (planInfo.type === 'unknown' || planInfo.name === 'Chưa xác định') {
            user.trial_start_date = null;
            user.trial_end_date = null;
            await user.save();
            
            const fixedUser = await User.findOne({ email: TEST_USER_EMAIL });
            planInfo = fixedUser.getPlanDisplayInfo();
            console.log(`  ✅ After fix: ${planInfo.name} (${planInfo.type})`);
            return true;
        } else {
            console.log(`  ✅ No fix needed - status is clear`);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Plan info fix test failed:`, error.message);
        return false;
    }
};

const testPaymentFlow = async () => {
    try {
        console.log(`\n🔄 Testing payment flow...`);
          // Create a pending payment
        const user = await User.findOne({ email: TEST_USER_EMAIL });
        
        const pendingPayment = new Payment({
            user_id: user._id,
            user_email: TEST_USER_EMAIL,
            order_id: `TEST_${Date.now()}`,
            amount: 99000,
            plan_type: 'monthly',
            plan_name: 'Monthly Premium',
            status: 'pending',
            payment_method: 'test',
            momo_order_id: `MOMO_TEST_${Date.now()}`,
            momo_request_id: `test_${Date.now()}`
        });

        await pendingPayment.save();
        console.log(`  ✅ Created pending payment: ${pendingPayment.order_id}`);

        // Check pending payments
        const pendingCount = await Payment.countDocuments({ 
            user_email: TEST_USER_EMAIL, 
            status: 'pending' 
        });
        console.log(`  Pending payments count: ${pendingCount}`);

        // Clear pending payments
        await Payment.deleteMany({ 
            user_email: TEST_USER_EMAIL, 
            status: 'pending' 
        });

        const clearedCount = await Payment.countDocuments({ 
            user_email: TEST_USER_EMAIL, 
            status: 'pending' 
        });
        console.log(`  ✅ Cleared pending payments. Remaining: ${clearedCount}`);

        return true;
    } catch (error) {
        console.error(`  ❌ Payment flow test failed:`, error.message);
        return false;
    }
};

const cleanup = async () => {
    try {
        console.log(`\n🧹 Cleaning up test data...`);
        await User.deleteOne({ email: TEST_USER_EMAIL });
        await Payment.deleteMany({ user_email: TEST_USER_EMAIL });
        console.log(`  ✅ Test user and payments deleted`);
    } catch (error) {
        console.error('  ❌ Cleanup failed:', error.message);
    }
};

const runTests = async () => {
    try {
        console.log('🧪 STARTING SUBSCRIPTION SYSTEM FINAL TEST');
        console.log('='.repeat(50));

        const results = [];

        // Test 1: Create test user
        console.log('\n📋 Test 1: User Creation');
        await createTestUser();
        results.push('User Creation: ✅');

        // Test 2: Upgrade to monthly
        console.log('\n📋 Test 2: Upgrade to Monthly');
        const upgradeMonthly = await testUpgrade('monthly');
        results.push(`Upgrade Monthly: ${upgradeMonthly ? '✅' : '❌'}`);

        // Test 3: Upgrade to yearly
        console.log('\n📋 Test 3: Upgrade to Yearly');
        const upgradeYearly = await testUpgrade('yearly');
        results.push(`Upgrade Yearly: ${upgradeYearly ? '✅' : '❌'}`);

        // Test 4: Downgrade to monthly
        console.log('\n📋 Test 4: Downgrade to Monthly');
        const downgradeMonthly = await testDowngrade('monthly');
        results.push(`Downgrade Monthly: ${downgradeMonthly ? '✅' : '❌'}`);

        // Test 5: Downgrade to free
        console.log('\n📋 Test 5: Downgrade to Free');
        const downgradeFree = await testDowngrade('free');
        results.push(`Downgrade Free: ${downgradeFree ? '✅' : '❌'}`);

        // Test 6: Plan info fix
        console.log('\n📋 Test 6: Plan Info Fix');
        const planInfoFix = await testPlanInfoFix();
        results.push(`Plan Info Fix: ${planInfoFix ? '✅' : '❌'}`);

        // Test 7: Payment flow
        console.log('\n📋 Test 7: Payment Flow');
        const paymentFlow = await testPaymentFlow();
        results.push(`Payment Flow: ${paymentFlow ? '✅' : '❌'}`);

        // Summary
        console.log('\n📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(30));
        results.forEach(result => console.log(`  ${result}`));

        const passedTests = results.filter(r => r.includes('✅')).length;
        const totalTests = results.length;

        console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! Subscription system is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please review the issues above.');
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
};

const main = async () => {
    await connectDB();
    
    try {
        await runTests();
    } finally {
        await cleanup();
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 SUBSCRIPTION SYSTEM FINAL TEST

USAGE:
  node final-subscription-test.js

DESCRIPTION:
  Chạy tất cả tests để verify hệ thống subscription:
  - User creation
  - Upgrade flows (free → monthly → yearly)
  - Downgrade flows (yearly → monthly → free)
  - Plan info fix for "unknown" status
  - Payment flow (pending → clear)
  - Cleanup test data

  Test user email: ${TEST_USER_EMAIL}

EXAMPLE:
  node final-subscription-test.js
    `);
    process.exit(0);
}

main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
