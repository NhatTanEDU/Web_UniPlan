#!/usr/bin/env node

// Script kiểm tra tổng quan hệ thống subscription
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Payment = require('./models/payment.model');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log(`🔗 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const getSubscriptionOverview = async () => {
    try {
        console.log('\n📊 SUBSCRIPTION SYSTEM OVERVIEW');
        console.log('='.repeat(50));

        // 1. Total users
        const totalUsers = await User.countDocuments();
        console.log(`\n👥 Total Users: ${totalUsers}`);

        // 2. Users by plan type
        const planStats = await User.aggregate([
            { 
                $group: { 
                    _id: '$current_plan_type', 
                    count: { $sum: 1 },
                    users: { $push: { email: '$email', name: { $concat: ['$firstName', ' ', '$lastName'] } } }
                } 
            },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📋 Users by Plan Type:');
        for (const plan of planStats) {
            console.log(`  ${plan._id || 'undefined'}: ${plan.count} users`);
            if (plan.count <= 5) {
                plan.users.forEach(user => {
                    console.log(`    - ${user.email} (${user.name})`);
                });
            }
        }

        // 3. Active subscriptions (not expired)
        const activeSubscriptions = await User.find({
            $and: [
                { current_plan_type: { $in: ['monthly', 'yearly'] } },
                { 
                    $or: [
                        { subscription_end_date: { $gt: new Date() } },
                        { subscription_end_date: null }
                    ]
                }
            ]
        }).select('email firstName lastName current_plan_type subscription_end_date');

        console.log(`\n✅ Active Premium Subscriptions: ${activeSubscriptions.length}`);
        for (const user of activeSubscriptions) {
            const daysLeft = user.subscription_end_date ? 
                Math.ceil((user.subscription_end_date - new Date()) / (1000 * 60 * 60 * 24)) : 
                'No end date';
            console.log(`  - ${user.email} (${user.current_plan_type}) - ${daysLeft} days left`);
        }

        // 4. Expired subscriptions
        const expiredSubscriptions = await User.find({
            $and: [
                { current_plan_type: { $in: ['monthly', 'yearly'] } },
                { subscription_end_date: { $lt: new Date() } }
            ]
        }).select('email firstName lastName current_plan_type subscription_end_date');

        console.log(`\n⚠️ Expired Premium Subscriptions: ${expiredSubscriptions.length}`);
        for (const user of expiredSubscriptions) {
            const daysExpired = Math.ceil((new Date() - user.subscription_end_date) / (1000 * 60 * 60 * 24));
            console.log(`  - ${user.email} (${user.current_plan_type}) - Expired ${daysExpired} days ago`);
        }

        // 5. Trial users
        const trialUsers = await User.find({
            current_plan_type: 'free_trial'
        }).select('email firstName lastName trial_end_date');

        console.log(`\n🆓 Trial Users: ${trialUsers.length}`);
        for (const user of trialUsers) {
            if (user.trial_end_date) {
                const daysLeft = Math.ceil((user.trial_end_date - new Date()) / (1000 * 60 * 60 * 24));
                console.log(`  - ${user.email} - ${daysLeft} days left`);
            } else {
                console.log(`  - ${user.email} - No trial end date`);
            }
        }

        // 6. Free users
        const freeUsers = await User.find({
            $or: [
                { current_plan_type: 'free' },
                { current_plan_type: null },
                { current_plan_type: { $exists: false } }
            ]
        }).select('email firstName lastName');

        console.log(`\n🆓 Free Users: ${freeUsers.length}`);
        if (freeUsers.length <= 10) {
            for (const user of freeUsers) {
                console.log(`  - ${user.email}`);
            }
        } else {
            console.log(`  (Too many to list - showing first 5)`);
            for (let i = 0; i < 5; i++) {
                console.log(`  - ${freeUsers[i].email}`);
            }
        }

        // 7. Pending payments
        const pendingPayments = await Payment.find({
            status: 'pending'
        }).select('user_email order_id amount created_at');

        console.log(`\n💳 Pending Payments: ${pendingPayments.length}`);
        for (const payment of pendingPayments) {
            console.log(`  - ${payment.user_email}: ${payment.amount}đ (${payment.order_id})`);
        }

        // 8. Recent successful payments (last 7 days)
        const recentPayments = await Payment.find({
            status: 'success',
            created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).select('user_email amount plan_type created_at').sort({ created_at: -1 });

        console.log(`\n💰 Recent Successful Payments (Last 7 days): ${recentPayments.length}`);
        for (const payment of recentPayments) {
            console.log(`  - ${payment.user_email}: ${payment.amount}đ (${payment.plan_type}) - ${payment.created_at.toLocaleDateString()}`);
        }

        // 9. Problem users (inconsistent states)
        console.log('\n🚨 POTENTIAL ISSUES:');
        
        // Users with premium plan but no subscription dates
        const premiumWithoutDates = await User.find({
            $and: [
                { current_plan_type: { $in: ['monthly', 'yearly'] } },
                { 
                    $or: [
                        { subscription_start_date: null },
                        { subscription_end_date: null }
                    ]
                }
            ]
        }).select('email current_plan_type subscription_start_date subscription_end_date');

        if (premiumWithoutDates.length > 0) {
            console.log(`\n⚠️ Premium users without proper dates: ${premiumWithoutDates.length}`);
            for (const user of premiumWithoutDates) {
                console.log(`  - ${user.email} (${user.current_plan_type}) - Missing subscription dates`);
            }
        }

        // Users with trial but no trial dates
        const trialWithoutDates = await User.find({
            $and: [
                { current_plan_type: 'free_trial' },
                { 
                    $or: [
                        { trial_start_date: null },
                        { trial_end_date: null }
                    ]
                }
            ]
        }).select('email trial_start_date trial_end_date');

        if (trialWithoutDates.length > 0) {
            console.log(`\n⚠️ Trial users without proper dates: ${trialWithoutDates.length}`);
            for (const user of trialWithoutDates) {
                console.log(`  - ${user.email} - Missing trial dates`);
            }
        }

        // Users with unknown plan status
        const unknownPlanUsers = [];
        const allUsers = await User.find({}).select('email current_plan_type trial_start_date trial_end_date subscription_start_date subscription_end_date');
        
        for (const user of allUsers) {
            try {
                const planInfo = user.getPlanDisplayInfo();
                if (planInfo.type === 'unknown' || planInfo.name === 'Chưa xác định') {
                    unknownPlanUsers.push(user);
                }
            } catch (error) {
                unknownPlanUsers.push(user);
            }
        }

        if (unknownPlanUsers.length > 0) {
            console.log(`\n⚠️ Users with "unknown" plan status: ${unknownPlanUsers.length}`);
            for (const user of unknownPlanUsers.slice(0, 5)) {
                console.log(`  - ${user.email} - Needs plan info fix`);
            }
            if (unknownPlanUsers.length > 5) {
                console.log(`  ... and ${unknownPlanUsers.length - 5} more`);
            }
        }

        // 10. Revenue summary
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'success',
                    created_at: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        console.log('\n💰 REVENUE SUMMARY:');
        console.log(`  Total Revenue: ${totalRevenue[0]?.total || 0}đ`);
        console.log(`  This Month: ${monthlyRevenue[0]?.total || 0}đ`);

        console.log('\n✅ Overview completed successfully!');
        console.log('\n💡 To fix issues, use:');
        console.log('  - node fix-user-plan-info.js <email> --confirm');
        console.log('  - node clear-payments-by-email.js <email>');
        console.log('  - node upgrade-admin-subscription.js <email> <plan> --confirm');
        console.log('  - node downgrade-admin-subscription.js <email> <plan> --confirm');

    } catch (error) {
        console.error('❌ Error getting subscription overview:', error.message);
    }
};

const main = async () => {
    await connectDB();
    await getSubscriptionOverview();
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 SUBSCRIPTION SYSTEM OVERVIEW TOOL

USAGE:
  node subscription-overview.js

DESCRIPTION:
  Hiển thị tổng quan toàn bộ hệ thống subscription:
  - Thống kê users theo plan type
  - Active/expired subscriptions  
  - Trial users và free users
  - Pending payments
  - Revenue summary
  - Phát hiện các vấn đề tiềm ẩn

EXAMPLE:
  node subscription-overview.js
    `);
    process.exit(0);
}

main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
});
