// Tạo user mới để test subscription
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniplan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Tạo user mới
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const newUser = new User({
      full_name: 'Test New User',
      email: `test.new.user.${Date.now()}@gmail.com`,
      password: hashedPassword,
      role: 'user',
      isActive: true,
      // Không set current_plan_type -> sẽ là null/undefined -> user mới
    });
    
    await newUser.save();
    
    console.log('🎉 Created new test user:');
    console.log('📧 Email:', newUser.email);
    console.log('🔑 Password: 123456');
    console.log('🆔 User ID:', newUser._id);
    console.log('📦 Plan type:', newUser.current_plan_type || 'null (new user)');
    
    console.log('\n📋 Login info:');
    console.log(`Email: ${newUser.email}`);
    console.log('Password: 123456');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestUser();
