const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';
const USER_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

async function quickTest() {
    try {
        console.log('🚀 Bắt đầu test nhanh...\n');

        // 1. Kiểm tra server
        console.log('1️⃣ Kiểm tra server...');
        try {
            const healthResponse = await axios.get(`${API_BASE}/health`);
            console.log('✅ Server đang hoạt động:', healthResponse.data.status);
        } catch (error) {
            console.log('❌ Server không phản hồi. Đảm bảo server đang chạy trên port 5000');
            return;
        }

        // 2. Đăng nhập
        console.log('\n2️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, USER_CREDENTIALS);
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Đăng nhập thành công. User:', user.name);

        // 3. Tạo dự án
        console.log('\n3️⃣ Tạo dự án mới...');
        const projectData = {
            project_name: `Test Project ${new Date().toLocaleString('vi-VN')}`,
            description: 'Dự án test tự động',
            start_date: new Date().toISOString().slice(0, 10),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            status: 'Planning',
            priority: 'Medium'
        };

        const createResponse = await axios.post(`${API_BASE}/projects`, projectData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const newProject = createResponse.data.project;
        console.log('✅ Tạo dự án thành công:', newProject.project_name);
        console.log('   ID:', newProject._id);
        console.log('   Kanban ID:', createResponse.data.kanban?._id || 'Không có');

        // 4. Lấy danh sách dự án
        console.log('\n4️⃣ Lấy danh sách dự án...');
        const projectsResponse = await axios.get(`${API_BASE}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`✅ Có ${projectsResponse.data.length} dự án`);
        if (projectsResponse.data.length > 0) {
            console.log('   Dự án mới nhất:', projectsResponse.data[0].project_name);
        }

        console.log('\n🎉 Tất cả test đều PASS! API hoạt động tốt.');

    } catch (error) {
        console.error('\n❌ Test thất bại:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data.message || error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
    }
}

// Chạy test
if (require.main === module) {
    quickTest();
}

module.exports = quickTest;
