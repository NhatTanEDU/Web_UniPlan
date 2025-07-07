/**
 * Script để tạo user test cho việc kiểm tra project_type_id fix
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/user.model');

async function createTestUser() {
  try {
    // Kết nối MongoDB
    await mongoose.connect('mongodb://localhost:27017/uni_plan_db');
    console.log('✅ Connected to MongoDB');

    // Kiểm tra user có tồn tại không
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('✅ Test user đã tồn tại:');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Name: ${existingUser.full_name}`);
      console.log(`🆔 ID: ${existingUser._id}`);
      return existingUser;
    }

    // Tạo user mới
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const newUser = new User({
      full_name: 'Test User for Project Type Fix',
      email: 'test@example.com',
      password: hashedPassword,
      avatar_url: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    await newUser.save();
    
    console.log('✅ Tạo test user thành công:');
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`👤 Name: ${newUser.full_name}`);
    console.log(`🆔 ID: ${newUser._id}`);
    console.log('🔑 Password: 123456');

    return newUser;

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  createTestUser().catch(console.error);
}

module.exports = { createTestUser };
