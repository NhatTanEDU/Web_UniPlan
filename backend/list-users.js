const mongoose = require('mongoose');
const User = require('./models/user.model.js');

async function listUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/UniPlan');
    console.log('Đã kết nối MongoDB');
    
    const users = await User.find({}, 'email name _id').limit(10);
    console.log('📋 Danh sách users:');
    if (users.length === 0) {
      console.log('❌ Không có user nào trong database');
    } else {
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - ID: ${user._id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  }
}

listUsers();
