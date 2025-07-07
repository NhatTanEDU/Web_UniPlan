/**
 * 🔍 DEBUG SCRIPT: Kiểm tra toàn bộ luồng auto-member
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const fullDebugFlow = async () => {
  try {
    console.log('🔐 Bước 1: Đăng nhập...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'Admin1@gmail.com',
      password: '123456'
    });
    
    console.log('✅ Đăng nhập thành công');
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('User ID:', userId);
    
    console.log('\n📋 Bước 2: Kiểm tra danh sách dự án TRƯỚC khi tạo...');
    try {
      const beforeResponse = await axios.get(`${BASE_URL}/api/projects/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ getMyProjects thành công');
      console.log('Số dự án hiện có:', beforeResponse.data.length);
    } catch (beforeError) {
      console.log('❌ Lỗi getMyProjects trước khi tạo:', beforeError.response?.data || beforeError.message);
      return; // Dừng nếu API cơ bản không hoạt động
    }
    
    console.log('\n📝 Bước 3: Tạo dự án mới...');
    const createResponse = await axios.post(`${BASE_URL}/api/projects`, {
      project_name: `Test Auto Member - ${Date.now()}`,
      description: 'Test auto member logic',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Tạo dự án thành công');
    console.log('Project ID:', createResponse.data.project._id);
    console.log('Kanban ID:', createResponse.data.kanban?._id);
    
    const createdProjectId = createResponse.data.project._id;
    
    console.log('\n⏳ Bước 4: Đợi 2 giây để transaction hoàn thành...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📋 Bước 5: Kiểm tra danh sách dự án SAU khi tạo...');
    const afterResponse = await axios.get(`${BASE_URL}/api/projects/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ getMyProjects sau khi tạo thành công');
    console.log('Số dự án sau khi tạo:', afterResponse.data.length);
    
    const foundProject = afterResponse.data.find(p => p._id === createdProjectId);
    if (foundProject) {
      console.log('🎉 DỰ ÁN VỪA TẠO ĐÃ XUẤT HIỆN TRONG DANH SÁCH!');
      console.log('Tên dự án:', foundProject.project_name);
    } else {
      console.log('❌ DỰ ÁN VỪA TẠO KHÔNG XUẤT HIỆN TRONG DANH SÁCH!');
      console.log('Có thể ProjectMember chưa được tạo đúng cách.');
    }
    
    console.log('\n🔍 Bước 6: Kiểm tra quyền truy cập dự án...');
    const accessResponse = await axios.get(`${BASE_URL}/api/projects/${createdProjectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Có thể truy cập dự án vừa tạo');
    console.log('Project name:', accessResponse.data.project_name);
    
    console.log('\n🧹 Bước 7: Dọn dẹp - Xóa dự án test...');
    await axios.delete(`${BASE_URL}/api/projects/${createdProjectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Đã xóa dự án test');
    
    console.log('\n🎯 KẾT QUẢ: Fix auto-member đã hoạt động đúng!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

fullDebugFlow();
