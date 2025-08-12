const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';

// Thông tin tài khoản admin
const ADMIN_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

// Thông tin tài khoản mới sẽ tạo
const NEW_USER_DATA = {
    full_name: `Test User ${Date.now()}`,
    email: `testuser${Date.now()}@gmail.com`,
    password: '123456'
};

// Dữ liệu test team
const TEST_TEAM_DATA = {
    team_name: `Team Test ${new Date().toLocaleString('vi-VN')}`,
    description: 'Team test được tạo tự động để kiểm tra API',
    type: 'project' // hoặc 'department'
};

class TeamTestSuite {
    constructor() {
        this.adminToken = null;
        this.newUserToken = null;
        this.adminUser = null;
        this.newUser = null;
        this.createdTeam = null;
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

    // Bước 1: Đăng nhập admin
    async loginAdmin() {
        try {
            this.log('🔐 Đăng nhập với tài khoản admin...', ADMIN_CREDENTIALS);
            
            const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
            
            this.adminToken = response.data.token;
            this.adminUser = response.data.user;
            
            this.log('✅ Đăng nhập admin thành công!', {
                user: this.adminUser,
                token: this.adminToken ? 'Token đã được tạo' : 'Không có token'
            });
            
            return true;
        } catch (error) {
            this.logError('Đăng nhập admin thất bại', error);
            return false;
        }
    }

    // Bước 2: Tạo tài khoản user mới
    async registerNewUser() {
        try {
            this.log('👤 Tạo tài khoản user mới...', NEW_USER_DATA);
            
            const response = await axios.post(`${API_BASE}/auth/register`, NEW_USER_DATA);
            
            this.log('✅ Tạo user mới thành công!', response.data);
            
            return true;
        } catch (error) {
            this.logError('Tạo user mới thất bại', error);
            return false;
        }
    }

    // Bước 3: Đăng nhập với user mới để lấy token
    async loginNewUser() {
        try {
            this.log('🔐 Đăng nhập với user mới...', {
                email: NEW_USER_DATA.email,
                password: '******'
            });
            
            const response = await axios.post(`${API_BASE}/auth/login`, {
                email: NEW_USER_DATA.email,
                password: NEW_USER_DATA.password
            });
            
            this.newUserToken = response.data.token;
            this.newUser = response.data.user;
            
            this.log('✅ Đăng nhập user mới thành công!', {
                user: this.newUser,
                token: this.newUserToken ? 'Token đã được tạo' : 'Không có token'
            });
            
            return true;
        } catch (error) {
            this.logError('Đăng nhập user mới thất bại', error);
            return false;
        }
    }

    // Bước 4: Tạo team mới (bằng admin)
    async createTeam() {
        if (!this.adminToken) {
            console.error('❌ Không có admin token. Vui lòng đăng nhập admin trước.');
            return false;
        }

        try {
            this.log('👥 Tạo team mới với admin...', TEST_TEAM_DATA);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await axios.post(`${API_BASE}/teams`, TEST_TEAM_DATA, config);
            
            this.createdTeam = response.data.team;
            
            this.log('✅ Tạo team thành công!', {
                team_id: this.createdTeam._id,
                team_name: this.createdTeam.team_name,
                description: this.createdTeam.description,
                type: this.createdTeam.type,
                created_by: this.createdTeam.created_by?.full_name || 'Unknown'
            });
            
            return true;
        } catch (error) {
            this.logError('Tạo team thất bại', error);
            return false;
        }
    }

    // Bước 5: Thêm user mới vào team (bằng admin)
    async addUserToTeam() {
        if (!this.adminToken || !this.createdTeam || !this.newUser) {
            console.error('❌ Thiếu thông tin cần thiết. Cần có admin token, team và user mới.');
            return false;
        }

        try {
            this.log(`👥 Thêm user ${this.newUser.name} vào team ${this.createdTeam.team_name}...`);
            
            const memberData = {
                user_id: this.newUser.id,
                role: 'Member' // có thể là 'Admin', 'Editor', 'Member'
            };
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await axios.post(
                `${API_BASE}/teams/${this.createdTeam._id}/members`, 
                memberData, 
                config
            );
            
            this.log('✅ Thêm user vào team thành công!', {
                member_id: response.data.member?._id,
                user_name: response.data.member?.user_id?.full_name || this.newUser.name,
                role: response.data.member?.role,
                team_name: this.createdTeam.team_name
            });
            
            return true;
        } catch (error) {
            this.logError('Thêm user vào team thất bại', error);
            return false;
        }
    }

    // Bước 6: Lấy danh sách thành viên team để xác nhận
    async getTeamMembers() {
        if (!this.adminToken || !this.createdTeam) {
            console.error('❌ Không có admin token hoặc team.');
            return false;
        }

        try {
            this.log(`📋 Lấy danh sách thành viên team ${this.createdTeam.team_name}...`);
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`
                }
            };
            
            const response = await axios.get(
                `${API_BASE}/teams/${this.createdTeam._id}/members`, 
                config
            );
            
            const members = response.data;
            
            this.log('✅ Lấy danh sách thành viên thành công!', {
                total_members: members.length,
                members: members.map(m => ({
                    id: m._id,
                    name: m.user_id?.full_name || 'Unknown',
                    email: m.user_id?.email || 'Unknown',
                    role: m.role,
                    joined_at: m.joined_at
                }))
            });
            
            // Kiểm tra xem user mới có trong danh sách không
            const newUserInTeam = members.find(m => m.user_id?.email === NEW_USER_DATA.email);
            if (newUserInTeam) {
                console.log('✅ User mới đã được thêm vào team thành công!');
            } else {
                console.log('⚠️ User mới chưa xuất hiện trong danh sách thành viên');
            }
            
            return true;
        } catch (error) {
            this.logError('Lấy danh sách thành viên thất bại', error);
            return false;
        }
    }

    // Bước 7: Lấy danh sách teams của user mới để xác nhận
    async getNewUserTeams() {
        if (!this.newUserToken) {
            console.error('❌ Không có token của user mới.');
            return false;
        }

        try {
            this.log('📋 Lấy danh sách teams của user mới...');
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.newUserToken}`
                }
            };
            
            const response = await axios.get(`${API_BASE}/teams`, config);
            
            const teams = response.data.teams || response.data;
            
            this.log('✅ Lấy danh sách teams của user mới thành công!', {
                total_teams: teams.length,
                teams: teams.map(t => ({
                    id: t._id,
                    name: t.team_name,
                    role: t.myRole || 'Unknown',
                    type: t.type
                }))
            });
            
            // Kiểm tra team vừa tạo có trong danh sách không
            const createdTeamInList = teams.find(t => t._id === this.createdTeam._id);
            if (createdTeamInList) {
                console.log('✅ Team vừa tạo đã xuất hiện trong danh sách teams của user mới!');
            } else {
                console.log('⚠️ Team vừa tạo chưa xuất hiện trong danh sách teams của user mới');
            }
            
            return true;
        } catch (error) {
            this.logError('Lấy danh sách teams của user mới thất bại', error);
            return false;
        }
    }

    // Chạy toàn bộ test suite
    async runFullTest() {
        console.log('🚀 Bắt đầu chạy test suite cho Team Management...\n');

        const steps = [
            { name: 'Đăng nhập admin', method: 'loginAdmin' },
            { name: 'Tạo user mới', method: 'registerNewUser' },
            { name: 'Đăng nhập user mới', method: 'loginNewUser' },
            { name: 'Tạo team mới', method: 'createTeam' },
            { name: 'Thêm user mới vào team', method: 'addUserToTeam' },
            { name: 'Lấy danh sách thành viên team', method: 'getTeamMembers' },
            { name: 'Lấy danh sách teams của user mới', method: 'getNewUserTeams' }
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
            console.log('🎉 Tất cả test đều PASS! Chức năng Team Management hoạt động tốt.');
            console.log(`\n📊 Tóm tắt:`);
            console.log(`   👤 Admin: ${this.adminUser?.name || 'Unknown'}`);
            console.log(`   👤 User mới: ${this.newUser?.name || 'Unknown'}`);
            console.log(`   👥 Team: ${this.createdTeam?.team_name || 'Unknown'}`);
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
    const testSuite = new TeamTestSuite();

    // Kiểm tra arguments từ command line
    const args = process.argv.slice(2);
    
    try {
        if (args.includes('--health-only')) {
            await testSuite.testServerHealth();
        } else if (args.includes('--admin-login-only')) {
            await testSuite.loginAdmin();
        } else if (args.includes('--create-user-only')) {
            await testSuite.registerNewUser();
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

module.exports = TeamTestSuite;
