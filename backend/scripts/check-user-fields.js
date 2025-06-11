// Script kiểm tra cấu trúc field của user trong database
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserFields() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
    console.log('Đã kết nối database');

    // Lấy collection users
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).limit(5).toArray();
    
    console.log('Sample user records:');
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('Name:', user.full_name || user.name);
      console.log('Email:', user.email);
      console.log('isActive field:', user.isActive);
      console.log('is_active field:', user.is_active);
      console.log('All fields:', Object.keys(user));
    });

    // Đếm số user có field nào
    const withIsActive = await db.collection('users').countDocuments({ isActive: { $exists: true } });
    const withIs_active = await db.collection('users').countDocuments({ is_active: { $exists: true } });
    
    console.log('\n--- Field Statistics ---');
    console.log('Users with isActive field:', withIsActive);
    console.log('Users with is_active field:', withIs_active);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserFields();
