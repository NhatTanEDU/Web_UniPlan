// Script để sửa dữ liệu users có full_name = "undefined"
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function fixUserData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniplan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Tìm tất cả users có full_name bị lỗi
    const badUsers = await User.find({ 
      $or: [
        { full_name: "undefined" },
        { full_name: { $exists: false } },
        { full_name: null },
        { full_name: '' },
        { full_name: { $regex: /^\s*$/ } }
      ]
    }).select('_id email full_name');
    
    console.log(`\n🔍 Found ${badUsers.length} users with bad full_name`);
    
    // Sửa từng user một
    let fixedCount = 0;
    for (let user of badUsers) {
      // Tạo tên từ email
      const emailPart = user.email.split('@')[0];
      let newName;
      
      // Tạo tên dựa trên email
      if (emailPart.includes('admin')) {
        newName = 'System Administrator';
      } else if (emailPart.includes('user1')) {
        newName = 'Test User 1';
      } else if (emailPart.includes('user2')) {
        newName = 'Test User 2';
      } else if (emailPart.includes('user3')) {
        newName = 'Test User 3';
      } else if (emailPart.includes('user4')) {
        newName = 'Test User 4';
      } else if (emailPart.includes('tan')) {
        newName = 'Tan Nguyen';
      } else if (emailPart.includes('ghost')) {
        newName = 'Ghost User';
      } else {
        // Tạo tên từ phần đầu của email
        newName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1).replace(/[0-9_]/g, ' ').trim();
        if (newName.length < 3) {
          newName = 'User ' + emailPart;
        }
      }
      
      // Update user
      await User.findByIdAndUpdate(user._id, { full_name: newName });
      console.log(`✅ Fixed user ${user._id}: "${user.full_name}" -> "${newName}"`);
      fixedCount++;
    }
    
    console.log(`\n🎉 Successfully fixed ${fixedCount} users`);
    
    // Kiểm tra lại
    const remainingBadUsers = await User.countDocuments({ 
      $or: [
        { full_name: "undefined" },
        { full_name: { $exists: false } },
        { full_name: null },
        { full_name: '' },
        { full_name: { $regex: /^\s*$/ } }
      ]
    });
    
    console.log(`\n📊 Remaining users with bad full_name: ${remainingBadUsers}`);
    
    // Hiển thị 5 users đã sửa để kiểm tra
    console.log('\n🔍 Sample of fixed users:');
    const sampleUsers = await User.find({}).select('_id email full_name').limit(5);
    sampleUsers.forEach(user => {
      console.log(`- ${user.email} -> ${user.full_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

fixUserData();
