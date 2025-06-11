const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

async function checkAdminRole() {
    try {        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tìm admin user
        const adminUser = await User.findOne({ email: 'admin1@gmail.com' });
        
        if (adminUser) {
            console.log('🔍 Current admin user data:');
            console.log({
                _id: adminUser._id,
                full_name: adminUser.full_name,
                email: adminUser.email,
                role: adminUser.role,
                current_plan_type: adminUser.current_plan_type,
                online_status: adminUser.online_status,
                isActive: adminUser.isActive
            });            // Fix admin data if needed
            let needUpdate = false;
            
            if (adminUser.role !== 'Admin') {
                console.log('🔧 Fixing admin role...');
                adminUser.role = 'Admin';
                needUpdate = true;
            }
            
            if (!adminUser.full_name) {
                console.log('🔧 Adding full_name...');
                adminUser.full_name = 'System Administrator';
                needUpdate = true;
            }
            
            if (needUpdate) {
                await adminUser.save();
                console.log('✅ Admin data fixed!');
                
                // Show updated data
                const updatedUser = await User.findOne({ email: 'admin1@gmail.com' });
                console.log('🔍 Updated admin user data:');
                console.log({
                    _id: updatedUser._id,
                    full_name: updatedUser.full_name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    current_plan_type: updatedUser.current_plan_type,
                    online_status: updatedUser.online_status,
                    isActive: updatedUser.isActive
                });
            } else {
                console.log('✅ Admin data is correct');
            }

        } else {
            console.log('❌ Admin user not found');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.disconnect();
    }
}

checkAdminRole();
