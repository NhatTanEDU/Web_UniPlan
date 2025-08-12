const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';
const USER_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

// ID cố định từ test trước đó
const FIXED_IDS = {
    PROJECT_ID: '68700d62598889d1be8f673e',
    KANBAN_ID: '68700d62598889d1be8f6742'
};

// Dữ liệu test task
const TEST_TASK_DATA = {
    kanban_id: FIXED_IDS.KANBAN_ID,
    title: `Task Test ${new Date().toLocaleString('vi-VN')}`,
    description: 'Đây là task test được tạo tự động để kiểm tra API Kanban',
    status: 'Cần làm',
    priority: 'Cao',
    start_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 7 ngày sau
    color: '#ff6b6b',
    is_pinned: false
};

class KanbanTaskTestSuite {
    constructor() {
        this.authToken = null;
        this.user = null;
        this.createdTask = null;
        this.kanbanInfo = null;
    }

    // Hàm helper để log kết quả
    log(message, data = null) {
        console.log(`[${new Date().toISOString()}] ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
        console.log('-------------------');
    }

    // Hàm helper để log lỗi
    logError(message, error) {
        console.error(`❌ [${new Date().toISOString()}] ${message}`);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
        console.log('-------------------');
    }

    // Bước 1: Đăng nhập để lấy token
    async login() {
        try {
            this.log('🔐 Bắt đầu đăng nhập...', USER_CREDENTIALS);
            
            const response = await axios.post(`${API_BASE}/auth/login`, USER_CREDENTIALS);
            
            this.authToken = response.data.token;
            this.user = response.data.user;
            
            this.log('✅ Đăng nhập thành công!', {
                user: this.user,
                token: this.authToken ? 'Token đã được tạo' : 'Không có token'
            });
            
            return true;
        } catch (error) {
            this.logError('Đăng nhập thất bại', error);
            return false;
        }
    }

    // Bước 2: Kiểm tra thông tin Kanban
    async getKanbanInfo() {
        if (!this.authToken) {
            console.error('❌ Không có token. Vui lòng đăng nhập trước.');
            return false;
        }

        try {
            this.log(`🔍 Kiểm tra thông tin Kanban ID: ${FIXED_IDS.KANBAN_ID}...`);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            };
            
            const response = await axios.get(`${API_BASE}/kanban/${FIXED_IDS.KANBAN_ID}`, config);
            
            this.kanbanInfo = response.data;
            
            this.log('✅ Lấy thông tin Kanban thành công!', {
                kanban_name: this.kanbanInfo.kanban.name,
                project_name: this.kanbanInfo.project_name,
                total_tasks: this.kanbanInfo.tasks.length,
                task_statuses: this.kanbanInfo.tasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {})
            });
            
            return true;
        } catch (error) {
            this.logError('Lấy thông tin Kanban thất bại', error);
            return false;
        }
    }

    // Bước 3: Tạo task mới trong Kanban
    async createTask() {
        if (!this.authToken) {
            console.error('❌ Không có token. Vui lòng đăng nhập trước.');
            return false;
        }

        try {
            this.log('📝 Bắt đầu tạo task trong Kanban...', TEST_TASK_DATA);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await axios.post(`${API_BASE}/kanban/tasks`, TEST_TASK_DATA, config);
            
            this.createdTask = response.data;
            
            this.log('✅ Tạo task thành công!', {
                task_id: this.createdTask._id,
                title: this.createdTask.title,
                status: this.createdTask.status,
                priority: this.createdTask.priority,
                created_by: this.createdTask.created_by?.name || 'Unknown',
                assigned_to: this.createdTask.assigned_to?.name || 'Chưa gán',
                order: this.createdTask.order,
                riskLevel: this.createdTask.riskLevel,
                riskClass: this.createdTask.riskClass
            });
            
            return true;
        } catch (error) {
            this.logError('Tạo task thất bại', error);
            return false;
        }
    }

    // Bước 4: Lấy danh sách tasks trong Kanban để xác nhận
    async getKanbanTasks() {
        if (!this.authToken) {
            console.error('❌ Không có token. Vui lòng đăng nhập trước.');
            return false;
        }

        try {
            this.log(`📋 Lấy danh sách tasks trong Kanban...`);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            };
            
            // Sử dụng endpoint kanban task để lấy tasks
            const response = await axios.get(`${API_BASE}/kanban-tasks/${FIXED_IDS.KANBAN_ID}/tasks`, config);
            
            const tasks = response.data;
            
            this.log('✅ Lấy danh sách tasks thành công!', {
                total_tasks: tasks.length,
                task_by_status: tasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {}),
                recent_tasks: tasks.slice(0, 3).map(t => ({
                    id: t._id,
                    title: t.title,
                    status: t.status,
                    priority: t.priority
                }))
            });
            
            // Kiểm tra xem task vừa tạo có trong danh sách không
            if (this.createdTask) {
                const foundTask = tasks.find(t => t._id === this.createdTask._id);
                if (foundTask) {
                    console.log('✅ Task vừa tạo đã xuất hiện trong danh sách!');
                } else {
                    console.log('⚠️ Task vừa tạo chưa xuất hiện trong danh sách');
                }
            }
            
            return true;
        } catch (error) {
            this.logError('Lấy danh sách tasks thất bại', error);
            return false;
        }
    }

    // Bước 5: Cập nhật task vừa tạo (test update)
    async updateTask() {
        if (!this.authToken || !this.createdTask) {
            console.error('❌ Không có token hoặc chưa tạo task.');
            return false;
        }

        try {
            this.log(`🔄 Cập nhật task ID: ${this.createdTask._id}...`);
            
            const updateData = {
                title: this.createdTask.title + ' [UPDATED]',
                status: 'Đang làm',
                priority: 'Trung bình',
                description: this.createdTask.description + '\n\n[Cập nhật từ test suite]'
            };
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await axios.put(`${API_BASE}/kanban/tasks/${this.createdTask._id}`, updateData, config);
            
            this.log('✅ Cập nhật task thành công!', {
                task_id: response.data._id,
                old_title: this.createdTask.title,
                new_title: response.data.title,
                old_status: this.createdTask.status,
                new_status: response.data.status,
                old_priority: this.createdTask.priority,
                new_priority: response.data.priority
            });
            
            return true;
        } catch (error) {
            this.logError('Cập nhật task thất bại', error);
            return false;
        }
    }

    // Chạy toàn bộ test suite
    async runFullTest() {
        console.log('🚀 Bắt đầu chạy test suite cho Kanban Task...\n');
        console.log(`📌 Sử dụng Project ID: ${FIXED_IDS.PROJECT_ID}`);
        console.log(`📌 Sử dụng Kanban ID: ${FIXED_IDS.KANBAN_ID}\n`);

        const steps = [
            { name: 'Đăng nhập', method: 'login' },
            { name: 'Kiểm tra thông tin Kanban', method: 'getKanbanInfo' },
            { name: 'Tạo task mới', method: 'createTask' },
            { name: 'Lấy danh sách tasks', method: 'getKanbanTasks' },
            { name: 'Cập nhật task', method: 'updateTask' }
        ];

        let successCount = 0;
        const totalSteps = steps.length;

        for (const step of steps) {
            console.log(`\n📍 Bước ${successCount + 1}/${totalSteps}: ${step.name}`);
            const success = await this[step.method]();
            
            if (success) {
                successCount++;
                console.log(`✅ Hoàn thành bước: ${step.name}`);
            } else {
                console.log(`❌ Thất bại ở bước: ${step.name}`);
                break;
            }
            
            // Chờ 1 giây giữa các bước
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n🏁 Kết quả test: ${successCount}/${totalSteps} bước thành công`);
        
        if (successCount === totalSteps) {
            console.log('🎉 Tất cả test đều PASS! Chức năng Kanban Task hoạt động tốt.');
        } else {
            console.log('⚠️ Có lỗi xảy ra trong quá trình test.');
        }

        return successCount === totalSteps;
    }

    // Test server health
    async testServerHealth() {
        try {
            console.log('🏥 Kiểm tra sức khỏe server...');
            const response = await axios.get(`${API_BASE}/health`);
            
            this.log('✅ Server đang hoạt động tốt!', response.data);
            return true;
        } catch (error) {
            this.logError('Server không phản hồi', error);
            return false;
        }
    }
}

// Hàm main để chạy test
async function main() {
    const testSuite = new KanbanTaskTestSuite();

    // Kiểm tra arguments từ command line
    const args = process.argv.slice(2);
    
    try {
        if (args.includes('--health-only')) {
            await testSuite.testServerHealth();
        } else if (args.includes('--login-only')) {
            await testSuite.login();
        } else if (args.includes('--kanban-info-only')) {
            await testSuite.login();
            await testSuite.getKanbanInfo();
        } else {
            // Chạy test đầy đủ
            await testSuite.testServerHealth();
            console.log('\n' + '='.repeat(50));
            await testSuite.runFullTest();
        }
    } catch (error) {
        console.error('❌ Lỗi không mong đợi:', error.message);
        process.exit(1);
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Lỗi nghiêm trọng:', error);
        process.exit(1);
    });
}

module.exports = KanbanTaskTestSuite;
