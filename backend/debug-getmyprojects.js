/**
 * 🔍 DEBUG SCRIPT: Kiểm tra chi tiết lỗi API getMyProjects
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const debugGetMyProjects = async () => {
  try {
    console.log('🔐 Bước 1: Đăng nhập...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'Admin1@gmail.com',
      password: '123456'
    });
    
    console.log('✅ Đăng nhập thành công');
    console.log('User ID:', loginResponse.data.user?.id);
    console.log('Token preview:', loginResponse.data.token?.substring(0, 50) + '...');
    
    const token = loginResponse.data.token;
    
    console.log('\n📋 Bước 2: Gọi API getMyProjects...');
    
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API getMyProjects thành công');
    console.log('Số dự án tìm thấy:', projectsResponse.data.length);
    
    if (projectsResponse.data.length > 0) {
      console.log('\nDanh sách dự án:');
      projectsResponse.data.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.project_name} (ID: ${project._id})`);
      });
    } else {
      console.log('👤 Người dùng không có dự án nào.');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('Request details:', error.request._currentUrl);
    }
  }
};

debugGetMyProjects();
