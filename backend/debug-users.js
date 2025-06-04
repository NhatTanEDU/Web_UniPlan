// Kiểm tra dữ liệu users trong database
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkUserData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniplan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Kiểm tra các user cụ thể từ debug log
    const userIds = [
      '6832fb21218f3827624d77c1', // System Administrator - OK
      '68358b27e31157981e931d89', // Unknown User 1  
      '68358b27e31157981e931d86'  // Unknown User 2
    ];
    
    console.log('\n🔍 Checking user data:');
    for (let userId of userIds) {
      const user = await User.findById(userId).select('full_name email avatar_url role isActive');
      console.log(`\nUser ID: ${userId}`);
      if (user) {
        console.log('✅ User found:', {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role,
          isActive: user.isActive
        });
      } else {
        console.log('❌ User not found!');
      }
    }
    
    // Thống kê tổng quát
    const totalUsers = await User.countDocuments();
    const usersWithoutName = await User.countDocuments({ 
      $or: [
        { full_name: { $exists: false } },
        { full_name: null },
        { full_name: '' },
        { full_name: { $regex: /^\s*$/ } }
      ]
    });
    
    console.log('\n📊 User Statistics:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users without proper full_name: ${usersWithoutName}`);
    
    if (usersWithoutName > 0) {
      console.log('\n❌ Users with missing full_name:');
      const badUsers = await User.find({ 
        $or: [
          { full_name: { $exists: false } },
          { full_name: null },
          { full_name: '' },
          { full_name: { $regex: /^\s*$/ } }
        ]
      }).select('_id email full_name');
      badUsers.forEach(user => {
        console.log(`- ID: ${user._id}, Email: ${user.email}, full_name: "${user.full_name}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserData();
