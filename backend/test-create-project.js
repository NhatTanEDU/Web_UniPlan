const axios = require('axios');

// Cấu hình server
const SERVER_URL = 'http://localhost:5000'; // Điều chỉnh port nếu cần thiết
const API_BASE = `${SERVER_URL}/api`;

// Thông tin đăng nhập
const LOGIN_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

// Dữ liệu test project
const TEST_PROJECT_DATA = {
    project_name: 'Dự án Test ' + new Date().toISOString().slice(0, 19),
    description: 'Đây là dự án test được tạo tự động để kiểm tra API',
    start_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 ngày từ bây giờ
    status: 'Planning',
    priority: 'Medium'
};

class ProjectTestSuite {
    constructor() {
        this.authToken = null;
        this.user = null;
        this.createdProject = null;
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
            this.log('🔐 Bắt đầu đăng nhập...', LOGIN_CREDENTIALS);
            
            const response = await axios.post(`${API_BASE}/auth/login`, LOGIN_CREDENTIALS);
            
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

    // Bước 2: Tạo dự án mới
    async createProject() {
        if (!this.authToken) {
            console.error('❌ Không có token. Vui lòng đăng nhập trước.');
            return false;
        }

        try {
            this.log('📝 Bắt đầu tạo dự án...', TEST_PROJECT_DATA);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await axios.post(`${API_BASE}/projects`, TEST_PROJECT_DATA, config);
            
            this.createdProject = response.data.project;
            
            this.log('✅ Tạo dự án thành công!', {
                project: this.createdProject,
                kanban: response.data.kanban || 'Không có thông tin Kanban'
            });
            
            return true;
        } catch (error) {
            this.logError('Tạo dự án thất bại', error);
            return false;
        }
    }

    // Bước 3: Kiểm tra danh sách dự án của user
    async getMyProjects() {
        if (!this.authToken) {
            console.error('❌ Không có token. Vui lòng đăng nhập trước.');
            return false;
        }

        try {
            this.log('📋 Lấy danh sách dự án của tôi...');
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            };
            
            const response = await axios.get(`${API_BASE}/projects`, config);
            
            this.log('✅ Lấy danh sách dự án thành công!', {
                totalProjects: response.data.length,
                projects: response.data.map(p => ({
                    id: p._id,
                    name: p.project_name,
                    status: p.status,
                    created_at: p.created_at
                }))
            });
            
            return true;
        } catch (error) {
            this.logError('Lấy danh sách dự án thất bại', error);
            return false;
        }
    }

    // Bước 4: Lấy chi tiết dự án vừa tạo
    async getProjectDetails() {
        if (!this.authToken || !this.createdProject) {
            console.error('❌ Không có token hoặc chưa tạo dự án.');
            return false;
        }

        try {
            this.log(`🔍 Lấy chi tiết dự án ID: ${this.createdProject._id}...`);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            };
            
            const response = await axios.get(`${API_BASE}/projects/${this.createdProject._id}`, config);
            
            this.log('✅ Lấy chi tiết dự án thành công!', response.data);
            
            return true;
        } catch (error) {
            this.logError('Lấy chi tiết dự án thất bại', error);
            return false;
        }
    }

    // Chạy toàn bộ test suite
    async runFullTest() {
        console.log('🚀 Bắt đầu chạy test suite cho tạo dự án...\n');

        const steps = [
            { name: 'Đăng nhập', method: 'login' },
            { name: 'Tạo dự án', method: 'createProject' },
            { name: 'Lấy danh sách dự án', method: 'getMyProjects' },
            { name: 'Lấy chi tiết dự án', method: 'getProjectDetails' }
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
                break; // Dừng nếu có lỗi
            }
            
            // Chờ 1 giây giữa các bước
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n🏁 Kết quả test: ${successCount}/${totalSteps} bước thành công`);
        
        if (successCount === totalSteps) {
            console.log('🎉 Tất cả test đều PASS! Chức năng tạo dự án hoạt động tốt.');
        } else {
            console.log('⚠️  Có lỗi xảy ra trong quá trình test.');
        }

        return successCount === totalSteps;
    }

    // Test riêng cho đăng nhập
    async testLoginOnly() {
        console.log('🔐 Test chỉ đăng nhập...\n');
        const success = await this.login();
        
        if (success) {
            console.log('🎉 Test đăng nhập PASS!');
        } else {
            console.log('❌ Test đăng nhập FAIL!');
        }
        
        return success;
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
    const testSuite = new ProjectTestSuite();

    // Kiểm tra arguments từ command line
    const args = process.argv.slice(2);
    
    try {
        if (args.includes('--health-only')) {
            await testSuite.testServerHealth();
        } else if (args.includes('--login-only')) {
            await testSuite.testLoginOnly();
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

module.exports = ProjectTestSuite;
