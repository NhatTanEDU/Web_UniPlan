// Script fix user plan info để giải quyết vấn đề "unknown" plan
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('🔗 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const fixUserPlanInfo = async (email) => {
    try {
        console.log(`🔍 Finding user with email: ${email}`);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('✅ User found:');
        console.log(`  - ID: ${user._id}`);
        console.log(`  - Name: ${user.firstName} ${user.lastName}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Current plan: ${user.current_plan_type}`);
        console.log(`  - Trial start: ${user.trial_start_date}`);
        console.log(`  - Trial end: ${user.trial_end_date}`);
        console.log(`  - Subscription start: ${user.subscription_start_date}`);
        console.log(`  - Subscription end: ${user.subscription_end_date}`);
        
        // Get current plan info before fix
        let currentPlanInfo;
        try {
            currentPlanInfo = user.getPlanDisplayInfo();
            console.log('\n🔍 Current plan info:');
            console.log(`  - Name: ${currentPlanInfo.name}`);
            console.log(`  - Type: ${currentPlanInfo.type}`);
            console.log(`  - Days left: ${currentPlanInfo.daysLeft}`);
            console.log(`  - Is expired: ${currentPlanInfo.isExpired}`);
        } catch (error) {
            console.log('\n❌ Error getting plan info:', error.message);
            currentPlanInfo = { type: 'error' };
        }
        
        const now = new Date();
        let updateData = {};
        let fixReason = '';
        
        // Analyze and fix based on current state
        if (user.current_plan_type === 'free') {
            // User is on free plan - clear all subscription/trial dates for clean state
            updateData = {
                current_plan_type: 'free',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: null,
                subscription_end_date: null
            };
            fixReason = 'Set to clean free plan (removed trial dates to avoid confusion)';
            
        } else if (user.current_plan_type === 'free_trial') {
            // Ensure trial dates are properly set
            if (!user.trial_start_date || !user.trial_end_date) {
                updateData = {
                    trial_start_date: user.trial_start_date || user.createdAt || now,
                    trial_end_date: user.trial_end_date || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                };
                fixReason = 'Fixed missing trial dates for free_trial plan';
            } else if (user.trial_end_date <= now) {
                // Trial expired, convert to expired
                updateData = {
                    current_plan_type: 'expired'
                };
                fixReason = 'Trial expired, converted to expired plan';
            } else {
                fixReason = 'Free trial plan looks correct, no fix needed';
            }
            
        } else if (user.current_plan_type === 'monthly' || user.current_plan_type === 'yearly') {
            // Check subscription validity
            if (!user.subscription_end_date || user.subscription_end_date <= now) {
                updateData = {
                    current_plan_type: 'expired',
                    subscription_start_date: user.subscription_start_date, // Keep history
                    subscription_end_date: user.subscription_end_date // Keep history
                };
                fixReason = 'Subscription expired, converted to expired plan';
            } else {
                fixReason = 'Subscription plan looks correct, no fix needed';
            }
            
        } else if (user.current_plan_type === 'expired') {
            // Check if user should be on trial instead
            if (user.trial_end_date && user.trial_end_date > now) {
                updateData = {
                    current_plan_type: 'free_trial'
                };
                fixReason = 'Trial still active, converted back to free_trial';
            } else {
                fixReason = 'Expired plan looks correct, no fix needed';
            }
            
        } else {
            // Unknown plan type - set to appropriate default
            if (user.subscription_end_date && user.subscription_end_date > now) {
                // Has active subscription
                const duration = user.subscription_end_date - (user.subscription_start_date || now);
                const durationDays = duration / (1000 * 60 * 60 * 24);
                
                if (durationDays > 100) {
                    updateData = { current_plan_type: 'yearly' };
                    fixReason = 'Long subscription detected, set to yearly';
                } else {
                    updateData = { current_plan_type: 'monthly' };
                    fixReason = 'Short subscription detected, set to monthly';
                }
            } else if (user.trial_end_date && user.trial_end_date > now) {
                updateData = { current_plan_type: 'free_trial' };
                fixReason = 'Active trial detected, set to free_trial';
            } else {
                updateData = { current_plan_type: 'free' };
                fixReason = 'No active subscription or trial, set to free';
            }
        }
        
        console.log(`\n🔧 Fix analysis: ${fixReason}`);
        
        if (Object.keys(updateData).length > 0) {
            console.log('\n🔄 Applying fixes...');
            console.log('📝 Update data:', updateData);
            
            await User.findByIdAndUpdate(user._id, updateData);
            console.log('✅ User plan info updated successfully');
            
            // Verify the fix
            const updatedUser = await User.findById(user._id);
            
            console.log('\n📊 Updated user state:');
            console.log(`  - Current plan: ${updatedUser.current_plan_type}`);
            console.log(`  - Trial start: ${updatedUser.trial_start_date}`);
            console.log(`  - Trial end: ${updatedUser.trial_end_date}`);
            console.log(`  - Subscription start: ${updatedUser.subscription_start_date}`);
            console.log(`  - Subscription end: ${updatedUser.subscription_end_date}`);
            
            try {
                const newPlanInfo = updatedUser.getPlanDisplayInfo();
                console.log('\n✅ Fixed plan info:');
                console.log(`  - Name: ${newPlanInfo.name}`);
                console.log(`  - Type: ${newPlanInfo.type}`);
                console.log(`  - Days left: ${newPlanInfo.daysLeft}`);
                console.log(`  - Is expired: ${newPlanInfo.isExpired}`);
                
                // Compare before and after
                if (currentPlanInfo.type === 'unknown' || currentPlanInfo.type === 'error') {
                    console.log('\n🎉 Successfully fixed "unknown" plan issue!');
                } else {
                    console.log(`\n📈 Plan updated: ${currentPlanInfo.type} → ${newPlanInfo.type}`);
                }
                
            } catch (error) {
                console.log('\n❌ Error getting updated plan info:', error.message);
            }
            
        } else {
            console.log('\nℹ️  No fixes needed - user plan state looks correct');
        }
        
        return {
            success: true,
            fixApplied: Object.keys(updateData).length > 0,
            fixReason: fixReason,
            updateData: updateData
        };
        
    } catch (error) {
        console.error('❌ Error fixing user plan info:', error);
        throw error;
    }
};

/**
 * Fix multiple users at once
 */
const fixAllUsers = async () => {
    try {
        console.log('🔍 Finding all users with potential plan issues...');
        
        const users = await User.find({}).select('email current_plan_type trial_end_date subscription_end_date');
        console.log(`📋 Found ${users.length} users to check`);
        
        let fixedCount = 0;
        let checkedCount = 0;
        
        for (const user of users) {
            try {
                console.log(`\n--- Checking user ${checkedCount + 1}/${users.length}: ${user.email} ---`);
                const result = await fixUserPlanInfo(user.email);
                
                if (result.fixApplied) {
                    fixedCount++;
                }
                checkedCount++;
                
            } catch (error) {
                console.error(`❌ Error checking user ${user.email}:`, error.message);
                checkedCount++;
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`  - Users checked: ${checkedCount}`);
        console.log(`  - Users fixed: ${fixedCount}`);
        console.log(`  - No issues: ${checkedCount - fixedCount}`);
        
    } catch (error) {
        console.error('❌ Error in fixAllUsers:', error);
    }
};

/**
 * Script chính
 */
const main = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2];
        const mode = process.argv[3];
        
        if (mode === '--all') {
            console.log('🚀 Starting plan info fix for ALL users...');
            await fixAllUsers();
            
        } else if (email) {
            console.log('🚀 Starting plan info fix for specific user...');
            console.log(`📧 Target email: ${email}\n`);
            
            const result = await fixUserPlanInfo(email);
            
            if (result.success) {
                console.log('\n🎉 Fix completed successfully!');
                if (result.fixApplied) {
                    console.log('🔄 User plan state has been corrected');
                } else {
                    console.log('✅ User plan state was already correct');
                }
            }
            
        } else {
            console.log('❌ Please provide user email or --all flag');
            console.log('📝 Usage:');
            console.log('   node fix-user-plan-info.js <email>');
            console.log('   node fix-user-plan-info.js admin1@gmail.com');
            console.log('   node fix-user-plan-info.js --all');
        }
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { fixUserPlanInfo, fixAllUsers };
