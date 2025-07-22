// Test script để kiểm tra API /api/projects và hiển thị danh sách dự án
const axios = require('axios');
const mongoose = require('mongoose');

// Import models
require('./backend/models/user.model');
require('./backend/models/project.model');
require('./backend/models/projectMember.model');
require('./backend/models/projectType.model');

// Cấu hình
const BASE_URL = 'http://localhost:5000/api';
const MONGO_URI = 'mongodb://localhost:27017/uniplan';

// Test user credentials
const TEST_USER = {
  email: 'admin1@gmail.com',
  password: '123456'
};

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

async function loginUser() {
  console.log('🔐 Logging in user...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER, {
      timeout: 10000
    });
    
    console.log('✅ Login successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testProjectsAPI(token) {
  const testId = `PROJECTS-TEST-${Date.now()}`;
  console.log(`\n🧪 ${testId} Testing /api/projects endpoint...`);
  
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 65000 // 65 giây - lớn hơn server timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${testId} SUCCESS! Response received in ${duration}ms`);
    console.log(`📊 Total projects found: ${response.data.length}`);
    
    // Hiển thị danh sách dự án
    if (response.data.length > 0) {
      console.log('\n📋 DANH SÁCH DỰ ÁN:');
      console.log('=' .repeat(80));
      
      response.data.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.project_name || 'Unnamed Project'}`);
        console.log(`   🆔 ID: ${project._id}`);
        console.log(`   👤 Người tạo: ${project.created_by?.full_name || 'Unknown'} (${project.created_by?.email || 'No email'})`);
        console.log(`   📝 Mô tả: ${project.description || 'Không có mô tả'}`);
        console.log(`   📅 Ngày tạo: ${project.created_at ? new Date(project.created_at).toLocaleString('vi-VN') : 'Unknown'}`);
        console.log(`   🏷️ Loại dự án: ${project.project_type_id?.name || 'Không xác định'}`);
        console.log(`   📊 Trạng thái: ${project.status || 'Unknown'}`);
        console.log(`   🗂️ Bị xóa: ${project.is_deleted ? 'Có' : 'Không'}`);
        console.log(`   ${'─'.repeat(70)}`);
      });
      
      console.log(`\n📈 THỐNG KÊ:`);
      console.log(`   • Tổng số dự án: ${response.data.length}`);
      console.log(`   • Dự án hoạt động: ${response.data.filter(p => !p.is_deleted).length}`);
      console.log(`   • Dự án đã xóa: ${response.data.filter(p => p.is_deleted).length}`);
      
      // Thống kê theo loại dự án
      const typeStats = {};
      response.data.forEach(project => {
        const typeName = project.project_type_id?.name || 'Không xác định';
        typeStats[typeName] = (typeStats[typeName] || 0) + 1;
      });
      
      console.log(`\n📊 PHÂN LOẠI DỰ ÁN:`);
      Object.entries(typeStats).forEach(([type, count]) => {
        console.log(`   • ${type}: ${count} dự án`);
      });
      
    } else {
      console.log('\n📭 Không có dự án nào được tìm thấy');
    }
    
    return { success: true, duration, count: response.data.length, data: response.data };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${testId} FAILED after ${duration}ms:`);
    
    if (error.code === 'ECONNABORTED') {
      console.error(`⏰ TIMEOUT: Request exceeded ${error.timeout}ms`);
    } else if (error.response) {
      console.error(`🔥 HTTP Error ${error.response.status}: ${error.response.data?.message}`);
      console.error(`📝 Error details:`, error.response.data);
    } else if (error.request) {
      console.error(`🌐 Network Error: No response received`);
    } else {
      console.error(`⚠️ General Error: ${error.message}`);
    }
    
    return { success: false, duration, error: error.message };
  }
}

async function getProjectStats() {
  console.log('\n🔍 Getting project statistics from database...');
  
  try {
    const Project = mongoose.model('Project');
    const ProjectMember = mongoose.model('ProjectMember');
    const User = mongoose.model('User');
    
    // Thống kê cơ bản
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ is_deleted: false });
    const deletedProjects = await Project.countDocuments({ is_deleted: true });
    
    console.log(`📊 DATABASE STATS:`);
    console.log(`   • Tổng số dự án trong DB: ${totalProjects}`);
    console.log(`   • Dự án hoạt động: ${activeProjects}`);
    console.log(`   • Dự án đã xóa: ${deletedProjects}`);
    
    // Thống kê user admin1
    const adminUser = await User.findOne({ email: 'admin1@gmail.com' });
    if (adminUser) {
      const adminProjects = await Project.countDocuments({ 
        created_by: adminUser._id, 
        is_deleted: false 
      });
      const adminMemberProjects = await ProjectMember.countDocuments({ 
        user_id: adminUser._id 
      });
      
      console.log(`\n👤 ADMIN1 STATS:`);
      console.log(`   • Dự án đã tạo: ${adminProjects}`);
      console.log(`   • Dự án tham gia: ${adminMemberProjects}`);
    }
    
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting Projects API Test');
  console.log('=' .repeat(50));
  
  try {
    // Connect to database
    await connectDatabase();
    
    // Get database stats
    await getProjectStats();
    
    // Login and get token
    const token = await loginUser();
    
    // Test projects API
    const result = await testProjectsAPI(token);
    
    console.log('\n🏁 TEST COMPLETED');
    console.log('=' .repeat(50));
    
    if (result.success) {
      console.log(`✅ Test PASSED in ${result.duration}ms`);
      console.log(`📊 Found ${result.count} projects`);
    } else {
      console.log(`❌ Test FAILED in ${result.duration}ms`);
      console.log(`💥 Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('💀 Test execution failed:', error.message);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Chạy test
runTest().catch(console.error);
