const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';
const USER_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

// ID cố định từ test trước đó
const KANBAN_ID = '68700d62598889d1be8f6742';
const PROJECT_ID = '68700d62598889d1be8f673e';

async function quickKanbanTaskTest() {
    try {
        console.log('🚀 Bắt đầu test tạo task trong Kanban...\n');
        console.log(`📌 Sử dụng Kanban ID: ${KANBAN_ID}`);
        console.log(`📌 Sử dụng Project ID: ${PROJECT_ID}\n`);

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

        // 3. Kiểm tra thông tin Kanban
        console.log('\n3️⃣ Kiểm tra thông tin Kanban...');
        const kanbanResponse = await axios.get(`${API_BASE}/kanban/${KANBAN_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const kanbanInfo = kanbanResponse.data;
        console.log('✅ Kanban tồn tại:', kanbanInfo.kanban.name);
        console.log('   Project:', kanbanInfo.project_name);
        console.log('   Số tasks hiện tại:', kanbanInfo.tasks.length);

        // 4. Tạo task mới
        console.log('\n4️⃣ Tạo task mới...');
        const taskData = {
            kanban_id: KANBAN_ID,
            title: `Task Test Nhanh ${new Date().toLocaleString('vi-VN')}`,
            description: 'Task test được tạo tự động',
            status: 'Cần làm',
            priority: 'Cao',
            start_date: new Date().toISOString().slice(0, 10),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            color: '#ff6b6b',
            is_pinned: false
        };

        const createTaskResponse = await axios.post(`${API_BASE}/kanban/tasks`, taskData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const newTask = createTaskResponse.data;
        console.log('✅ Tạo task thành công:', newTask.title);
        console.log('   ID:', newTask._id);
        console.log('   Status:', newTask.status);
        console.log('   Priority:', newTask.priority);
        console.log('   Order:', newTask.order);
        if (newTask.riskLevel) {
            console.log('   Risk Level:', newTask.riskLevel);
            console.log('   Risk Class:', newTask.riskClass);
        }

        // 5. Lấy danh sách tasks để xác nhận
        console.log('\n5️⃣ Lấy danh sách tasks...');
        const tasksResponse = await axios.get(`${API_BASE}/kanban-tasks/${KANBAN_ID}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tasks = tasksResponse.data;
        console.log(`✅ Có ${tasks.length} tasks trong Kanban`);
        
        // Hiển thị phân bố tasks theo status
        const tasksByStatus = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});
        console.log('   Phân bố theo trạng thái:', tasksByStatus);

        // Kiểm tra task vừa tạo
        const foundTask = tasks.find(t => t._id === newTask._id);
        if (foundTask) {
            console.log('✅ Task vừa tạo đã xuất hiện trong danh sách');
        } else {
            console.log('⚠️ Task vừa tạo chưa xuất hiện trong danh sách');
        }

        // 6. Cập nhật task (optional)
        console.log('\n6️⃣ Cập nhật task...');
        const updateData = {
            title: newTask.title + ' [UPDATED]',
            status: 'Đang làm',
            priority: 'Trung bình'
        };

        const updateResponse = await axios.put(`${API_BASE}/kanban/tasks/${newTask._id}`, updateData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Cập nhật task thành công');
        console.log('   Tiêu đề mới:', updateResponse.data.title);
        console.log('   Trạng thái mới:', updateResponse.data.status);
        console.log('   Độ ưu tiên mới:', updateResponse.data.priority);

        console.log('\n🎉 Tất cả test Kanban Task đều PASS! API hoạt động tốt.');

    } catch (error) {
        console.error('\n❌ Test thất bại:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data.message || error.response.data);
            if (error.response.data.error) {
                console.error('   Error Detail:', error.response.data.error);
            }
        } else {
            console.error('   Error:', error.message);
        }
    }
}

// Chạy test
if (require.main === module) {
    quickKanbanTaskTest();
}

module.exports = quickKanbanTaskTest;
