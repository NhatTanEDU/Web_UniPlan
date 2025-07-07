// Find user by ID
const mongoose = require('mongoose');
const User = require('./models/user.model');
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

const findUser = async () => {
    try {
        const userId = '6832fb21218f3827624d77c1';
        console.log(`🔍 Finding user with ID: ${userId}`);
        
        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log(`✅ User found:`);
        console.log(`  - Name: ${user.full_name}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - ID: ${user._id}`);
        console.log(`  - Current plan: ${user.current_plan_type}`);
        console.log(`  - Subscription: ${user.subscription_start ? new Date(user.subscription_start) : 'null'} - ${user.subscription_end ? new Date(user.subscription_end) : 'null'}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

const main = async () => {
    try {
        await connectDB();
        await findUser();
        await mongoose.connection.close();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

main();
