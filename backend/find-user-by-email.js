// backend/find-user-by-email.js
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const findUserByEmail = async (email) => {
    try {
        console.log(`🔍 Searching for user with email: ${email}`);
        
        const user = await User.findOne({ email: email });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('✅ User found:');
        console.log('  - ID:', user._id);
        console.log('  - Full Name:', user.full_name);
        console.log('  - Email:', user.email);
        console.log('  - Role:', user.role);
        console.log('  - Current Plan Type:', user.current_plan_type);
        console.log('  - Trial Start:', user.trial_start_date);
        console.log('  - Trial End:', user.trial_end_date);
        console.log('  - Subscription Start:', user.subscription_start_date);
        console.log('  - Subscription End:', user.subscription_end_date);
        console.log('  - Payment Status:', user.payment_status);
        console.log('  - Created At:', user.createdAt);
        console.log('  - Updated At:', user.updatedAt);
        
        // Test methods
        const planInfo = user.getPlanDisplayInfo();
        console.log('  - Plan Info:', planInfo);
        console.log('  - Can Access Service:', user.canAccessService());
        console.log('  - Is Trial Expired:', user.isTrialExpired());
        console.log('  - Is Subscription Active:', user.isSubscriptionActive());
        
    } catch (error) {
        console.error('❌ Error finding user:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2] || 'thanhtoan@gmail.com';
        await findUserByEmail(email);
        
        console.log('✅ Disconnected from MongoDB');
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

if (require.main === module) {
    main();
}
