// Kiểm tra user có tồn tại trong database không
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkUserExists() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    const userId = '6832fb21218f3827624d77c1';
    console.log('🔍 Checking user with ID:', userId);
    
    const user = await User.findById(userId);
    
    if (user) {
      console.log('✅ User found:');
      console.log('  - ID:', user._id);
      console.log('  - Name:', user.full_name);
      console.log('  - Email:', user.email);
      console.log('  - Role:', user.role);
      console.log('  - Plan Type:', user.current_plan_type);
      console.log('  - Is Active:', user.isActive);
      console.log('  - Created:', user.createdAt);
    } else {
      console.log('❌ User not found in database!');
      
      // List all users to see what's available
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({}).select('_id full_name email role current_plan_type');
      allUsers.forEach(u => {
        console.log(`  - ${u._id} | ${u.full_name} | ${u.email} | ${u.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkUserExists();