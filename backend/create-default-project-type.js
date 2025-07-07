const mongoose = require('mongoose');
const ProjectType = require('./models/projectType.model.js');
const User = require('./models/user.model.js');

async function createDefaultProjectType() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniplan');
    console.log('Đã kết nối MongoDB');
    
    // Tìm user admin để tạo project type hoặc tạo user test
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Không tìm thấy user admin@gmail.com');
      
      // Tìm user bất kỳ trong database
      adminUser = await User.findOne();
      
      if (!adminUser) {
        console.log('❌ Không có user nào trong database, tạo user test...');
        // Tạo user test
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        adminUser = new User({
          email: 'test@gmail.com',
          name: 'Test User',
          full_name: 'Test User',
          password: hashedPassword,
          role: 'User',
          status: 'Offline',
          isActive: true
        });
        await adminUser.save();
        console.log('✅ Đã tạo user test:', adminUser._id);
      } else {
        console.log('✅ Sử dụng user có sẵn:', adminUser._id);
      }
    } else {
      console.log('✅ Tìm thấy admin user:', adminUser._id);
    }
    
    const existing = await ProjectType.findOne({ name: 'Không phân loại', userId: adminUser._id });
    if (!existing) {
      const defaultType = new ProjectType({
        name: 'Không phân loại',
        description: 'Phân loại mặc định cho các dự án',
        userId: adminUser._id
      });
      await defaultType.save();
      console.log('✅ Đã tạo project type mặc định:', defaultType.toObject());
    } else {
      console.log('ℹ️ Project type mặc định đã tồn tại:', existing.toObject());
    }
    
    // Tạo thêm một số project type khác
    const types = [
      { name: 'Web Development', description: 'Các dự án phát triển web' },
      { name: 'Mobile App', description: 'Các dự án ứng dụng di động' },
      { name: 'Marketing', description: 'Các dự án marketing và quảng cáo' },
      { name: 'Research', description: 'Các dự án nghiên cứu' }
    ];
    
    for (const type of types) {
      const existingType = await ProjectType.findOne({ name: type.name, userId: adminUser._id });
      if (!existingType) {
        const newType = new ProjectType({
          ...type,
          userId: adminUser._id
        });
        await newType.save();
        console.log(`✅ Đã tạo project type: ${type.name}`);
      } else {
        console.log(`ℹ️ Project type đã tồn tại: ${type.name}`);
      }
    }
    
    // Hiển thị tất cả project types
    const allTypes = await ProjectType.find();
    console.log('\n📋 Danh sách tất cả project types:');
    allTypes.forEach(type => {
      console.log(`- ${type.name} (ID: ${type._id})`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  }
}

createDefaultProjectType();
