require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function fixUserData(email, fixType = 'auto') {
    try {
        console.log('🔧 Fixing User Data...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        if (!email) {
            console.log('❌ Please provide email: node fix-user-data.js <email> [fixType]');
            console.log('   Fix types: auto, free, trial, monthly, yearly');
            return;
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return;
        }

        console.log(`\n🔍 Current data for ${email}:`);
        console.log(`  - Plan Type: ${user.current_plan_type}`);
        console.log(`  - Payment Status: ${user.payment_status}`);
        console.log(`  - Trial Start: ${user.trial_start_date || 'null'}`);
        console.log(`  - Trial End: ${user.trial_end_date || 'null'}`);
        console.log(`  - Subscription Start: ${user.subscription_start_date || 'null'}`);
        console.log(`  - Subscription End: ${user.subscription_end_date || 'null'}`);

        let updateData = {};

        if (fixType === 'auto') {
            // Auto-detect and fix based on current plan type
            updateData = getAutoFixData(user);
        } else {
            // Manual fix type
            updateData = getManualFixData(fixType);
        }

        if (!updateData) {
            console.log('❌ Invalid fix type or unable to determine fix');
            return;
        }

        console.log(`\n🔧 Proposed fix (${fixType}):`);
        console.log(JSON.stringify(updateData, null, 2));

        // Apply fix
        const result = await User.findByIdAndUpdate(user._id, updateData, { new: true });

        console.log(`\n✅ User data fixed successfully!`);
        console.log(`\n📊 Updated data for ${email}:`);
        console.log(`  - Plan Type: ${result.current_plan_type}`);
        console.log(`  - Payment Status: ${result.payment_status}`);
        console.log(`  - Trial Start: ${result.trial_start_date || 'null'}`);
        console.log(`  - Trial End: ${result.trial_end_date || 'null'}`);
        console.log(`  - Subscription Start: ${result.subscription_start_date || 'null'}`);
        console.log(`  - Subscription End: ${result.subscription_end_date || 'null'}`);

        // Validate the fix
        const isValid = validateUserData(result);
        console.log(`\n🔍 Data integrity after fix: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    } catch (error) {
        console.error('❌ Fix FAILED:', error.message);
        console.error('📝 Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

function getAutoFixData(user) {
    const planType = user.current_plan_type;
    
    switch (planType) {
        case 'free':
            return {
                payment_status: 'pending',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: null,
                subscription_end_date: null
            };
            
        case 'free_trial':
            const now = new Date();
            return {
                payment_status: 'pending',
                trial_start_date: now,
                trial_end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                subscription_start_date: null,
                subscription_end_date: null
            };
            
        case 'monthly':
            const monthlyStart = new Date();
            return {
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: monthlyStart,
                subscription_end_date: new Date(monthlyStart.getTime() + 30 * 24 * 60 * 60 * 1000)
            };
            
        case 'yearly':
            const yearlyStart = new Date();
            return {
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: yearlyStart,
                subscription_end_date: new Date(yearlyStart.getTime() + 365 * 24 * 60 * 60 * 1000)
            };
            
        default:
            return null;
    }
}

function getManualFixData(fixType) {
    const now = new Date();
    
    switch (fixType) {
        case 'free':
            return {
                current_plan_type: 'free',
                payment_status: 'pending',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: null,
                subscription_end_date: null
            };
            
        case 'trial':
            return {
                current_plan_type: 'free_trial',
                payment_status: 'pending',
                trial_start_date: now,
                trial_end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                subscription_start_date: null,
                subscription_end_date: null
            };
            
        case 'monthly':
            return {
                current_plan_type: 'monthly',
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: now,
                subscription_end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            };
            
        case 'yearly':
            return {
                current_plan_type: 'yearly',
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: now,
                subscription_end_date: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
            };
            
        default:
            return null;
    }
}

function validateUserData(user) {
    const planType = user.current_plan_type;
    const paymentStatus = user.payment_status;
    
    switch (planType) {
        case 'free':
            return paymentStatus === 'pending' && 
                   !user.subscription_start_date && 
                   !user.subscription_end_date;
                   
        case 'free_trial':
            return paymentStatus === 'pending' && 
                   user.trial_start_date && 
                   user.trial_end_date &&
                   !user.subscription_start_date && 
                   !user.subscription_end_date;
                   
        case 'monthly':
        case 'yearly':
            return paymentStatus === 'completed' && 
                   user.subscription_start_date && 
                   user.subscription_end_date;
                   
        default:
            return false;
    }
}

// Get command line arguments
const email = process.argv[2];
const fixType = process.argv[3] || 'auto';

if (!email) {
    console.log('❌ Usage: node fix-user-data.js <email> [fixType]');
    console.log('   Examples:');
    console.log('   node fix-user-data.js admin1@gmail.com auto');
    console.log('   node fix-user-data.js admin1@gmail.com monthly');
    console.log('   node fix-user-data.js admin1@gmail.com yearly');
    console.log('   node fix-user-data.js admin1@gmail.com trial');
    console.log('   node fix-user-data.js admin1@gmail.com free');
    process.exit(1);
}

// Run the fix
fixUserData(email, fixType);
