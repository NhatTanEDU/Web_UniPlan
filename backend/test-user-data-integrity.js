require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function testUserDataIntegrity() {
    try {
        console.log('🔄 Testing User Data Integrity...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Test cases with different plan types
        const testCases = [
            {
                email: 'free-user@test.com',
                full_name: 'Free User Test',
                current_plan_type: 'free',
                payment_status: 'pending',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: null,
                subscription_end_date: null
            },
            {
                email: 'trial-user@test.com', 
                full_name: 'Trial User Test',
                current_plan_type: 'free_trial',
                payment_status: 'pending',
                trial_start_date: new Date(),
                trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                subscription_start_date: null,
                subscription_end_date: null
            },
            {
                email: 'monthly-user@test.com',
                full_name: 'Monthly User Test', 
                current_plan_type: 'monthly',
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: new Date(),
                subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                email: 'yearly-user@test.com',
                full_name: 'Yearly User Test',
                current_plan_type: 'yearly', 
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: new Date(),
                subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
        ];

        console.log('\n🧪 Creating test users with proper data...');
        
        // Clear existing test users
        await User.deleteMany({ email: { $in: testCases.map(tc => tc.email) } });
        
        // Create test users
        for (const testCase of testCases) {
            const user = new User({
                ...testCase,
                password: 'password123', // Required field
                role: 'User'
            });
            
            await user.save();
            console.log(`✅ Created ${testCase.current_plan_type} user: ${testCase.email}`);
        }

        console.log('\n📊 Testing data integrity for each user type...');
        
        for (const testCase of testCases) {
            const user = await User.findOne({ email: testCase.email });
            
            console.log(`\n👤 ${testCase.current_plan_type.toUpperCase()} USER - ${user.email}:`);
            console.log(`  - Plan Type: ${user.current_plan_type}`);
            console.log(`  - Payment Status: ${user.payment_status}`);
            console.log(`  - Trial Start: ${user.trial_start_date || 'null'}`);
            console.log(`  - Trial End: ${user.trial_end_date || 'null'}`);
            console.log(`  - Subscription Start: ${user.subscription_start_date || 'null'}`);
            console.log(`  - Subscription End: ${user.subscription_end_date || 'null'}`);
            
            // Validate data integrity
            const isValid = validateUserData(user);
            console.log(`  - Data Integrity: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        }

        console.log('\n🔍 Checking existing admin1@gmail.com...');
        const admin1 = await User.findOne({ email: 'admin1@gmail.com' });
        if (admin1) {
            console.log(`\n👤 ADMIN1 USER - ${admin1.email}:`);
            console.log(`  - Plan Type: ${admin1.current_plan_type}`);
            console.log(`  - Payment Status: ${admin1.payment_status}`);
            console.log(`  - Trial Start: ${admin1.trial_start_date || 'null'}`);
            console.log(`  - Trial End: ${admin1.trial_end_date || 'null'}`);
            console.log(`  - Subscription Start: ${admin1.subscription_start_date || 'null'}`);
            console.log(`  - Subscription End: ${admin1.subscription_end_date || 'null'}`);
            
            const isValid = validateUserData(admin1);
            console.log(`  - Data Integrity: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
            
            if (!isValid) {
                console.log('\n🔧 PROPOSED FIX for admin1@gmail.com:');
                const fixedData = proposeUserDataFix(admin1);
                console.log(JSON.stringify(fixedData, null, 2));
            }
        }

    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        console.error('📝 Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

function validateUserData(user) {
    const planType = user.current_plan_type;
    const paymentStatus = user.payment_status;
    
    switch (planType) {
        case 'free':
            // Free users should have pending payment and no dates
            return paymentStatus === 'pending' && 
                   !user.subscription_start_date && 
                   !user.subscription_end_date;
                   
        case 'free_trial':
            // Trial users should have pending payment and trial dates
            return paymentStatus === 'pending' && 
                   user.trial_start_date && 
                   user.trial_end_date &&
                   !user.subscription_start_date && 
                   !user.subscription_end_date;
                   
        case 'monthly':
        case 'yearly':
            // Paid users should have completed payment and subscription dates
            return paymentStatus === 'completed' && 
                   user.subscription_start_date && 
                   user.subscription_end_date &&
                   !user.trial_start_date && 
                   !user.trial_end_date;
                   
        case 'expired':
            // Expired users should have completed payment but past end date
            return paymentStatus === 'completed' && 
                   user.subscription_end_date && 
                   new Date(user.subscription_end_date) < new Date();
                   
        default:
            return false;
    }
}

function proposeUserDataFix(user) {
    const planType = user.current_plan_type;
    
    switch (planType) {
        case 'free':
            return {
                current_plan_type: 'free',
                payment_status: 'pending',
                trial_start_date: null,
                trial_end_date: null, 
                subscription_start_date: null,
                subscription_end_date: null
            };
            
        case 'free_trial':
            const now = new Date();
            return {
                current_plan_type: 'free_trial',
                payment_status: 'pending',
                trial_start_date: now,
                trial_end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                subscription_start_date: null,
                subscription_end_date: null
            };
            
        case 'monthly':
            const monthlyStart = new Date();
            return {
                current_plan_type: 'monthly',
                payment_status: 'completed',
                trial_start_date: null,
                trial_end_date: null,
                subscription_start_date: monthlyStart,
                subscription_end_date: new Date(monthlyStart.getTime() + 30 * 24 * 60 * 60 * 1000)
            };
            
        case 'yearly':
            const yearlyStart = new Date();
            return {
                current_plan_type: 'yearly',
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

// Run the test
testUserDataIntegrity();
