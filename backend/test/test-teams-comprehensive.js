const axios = require('axios');

// Cấu hình tài khoản admin mặc định
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let adminUserId = '';

// Helper function để tạo request config với token
function createAuthConfig(method, endpoint, data = null, params = null) {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) config.data = data;
    if (params) config.params = params;
    
    return config;
}

// Helper function để log kết quả
function logResult(title, success, data = null, error = null) {
    console.log(`\n${success ? '✅' : '❌'} ${title}`);
    if (success && data) {
        console.log('📊 Data:', JSON.stringify(data, null, 2));
    }
    if (!success && error) {
        console.log('🔍 Error:', error);
    }
    console.log('-'.repeat(50));
}

// 1. Đăng nhập Admin
async function loginAdmin() {
    console.log('🔑 BƯỚC 1: ĐĂNG NHẬP TÀI KHOẢN ADMIN');
    console.log('=' .repeat(50));

    try {
        console.log('🔄 Đang đăng nhập...');
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password
        });
        
        authToken = response.data.token;
        const user = response.data.user;
        adminUserId = user.id || user._id;
        
        console.log('✅ Đăng nhập thành công!');
        logResult('ĐĂNG NHẬP ADMIN', true, {
            userId: adminUserId,
            email: user.email,
            name: user.name || user.full_name,
            role: user.role
        });
        
        return true;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ Đăng nhập thất bại:', message);
        logResult('ĐĂNG NHẬP ADMIN', false, null, message);
        return false;
    }
}

// 2. Test Teams Overview Stats API
async function testTeamOverviewStats() {
    console.log('\n📊 BƯỚC 2: KIỂM TRA THỐNG KÊ TỔNG QUAN TEAMS');
    console.log('=' .repeat(50));

    try {
        console.log('🔄 Đang gọi API thống kê tổng quan...');
        
        // Thêm timeout để tránh hang
        const response = await Promise.race([
            axios.request(createAuthConfig('get', '/teams-enhanced/stats/overview')),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('API timeout sau 10 giây')), 10000)
            )
        ]);
        
        console.log('✅ API trả về thành công!');
        logResult('THỐNG KÊ TỔNG QUAN TEAMS', true, response.data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ API thất bại:', message);
        logResult('THỐNG KÊ TỔNG QUAN TEAMS', false, null, message);
        return null;
    }
}

// 3. Test Teams List API
async function testTeamsList() {
    console.log('\n📋 BƯỚC 3: KIỂM TRA DANH SÁCH TEAMS');
    console.log('=' .repeat(50));

    try {
        console.log('🔄 Đang lấy danh sách teams...');
        const response = await Promise.race([
            axios.request(createAuthConfig('get', '/teams')),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('API timeout sau 5 giây')), 5000)
            )
        ]);
        
        const teams = response.data;
        console.log(`✅ Tìm thấy ${teams.length} teams`);
        logResult('DANH SÁCH TEAMS', true, {
            totalTeams: teams.length,
            sampleTeam: teams[0] || 'Không có teams'
        });
        
        return teams;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ Lỗi lấy danh sách teams:', message);
        logResult('DANH SÁCH TEAMS', false, null, message);
        return [];
    }
}

// 4. Test Create Team
async function testCreateTeam() {
    console.log('\n🆕 BƯỚC 4: TEST CREATE TEAM');
    console.log('=' .repeat(40));

    const newTeam = {
        team_name: `Test Team ${Date.now()}`,
        description: `Team được tạo bởi test script - ${new Date().toLocaleString()}`
    };

    try {
        const response = await axios.request(
            createAuthConfig('post', '/teams', newTeam)
        );
        
        const team = response.data;
        logResult('Create Team', true, team);
        return team;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Create Team', false, null, message);
        return null;
    }
}

// 5. Test Team Detail Stats (cần có teamId)
async function testTeamDetailStats(teamId) {
    console.log('\n📈 BƯỚC 5: TEST TEAM DETAIL STATS');
    console.log('=' .repeat(40));

    if (!teamId) {
        logResult('Team Detail Stats', false, null, 'Không có teamId để test');
        return null;
    }

    try {
        const response = await axios.request(
            createAuthConfig('get', `/teams-enhanced/${teamId}/stats/detail`)
        );
        
        logResult('Team Detail Stats', true, response.data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Team Detail Stats', false, null, message);
        return null;
    }
}

// 6. Test Team Search
async function testTeamSearch() {
    console.log('\n🔍 BƯỚC 6: TEST TEAM SEARCH');
    console.log('=' .repeat(40));

    try {
        const response = await axios.request(
            createAuthConfig('get', '/teams-enhanced/search', null, {
                searchTerm: 'test',
                page: 1,
                limit: 5
            })
        );
        
        logResult('Team Search', true, response.data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Team Search', false, null, message);
        return null;
    }
}

// 7. Test Personal Members List
async function testPersonalMembers() {
    console.log('\n👥 BƯỚC 7: TEST PERSONAL MEMBERS');
    console.log('=' .repeat(40));

    try {
        const response = await axios.request(
            createAuthConfig('get', '/personal-members')
        );
        
        const members = response.data;
        logResult('Personal Members', true, {
            totalMembers: members.length,
            sampleMember: members[0] || 'No members found'
        });
        
        return members;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Personal Members', false, null, message);
        return [];
    }
}

// 8. Test Add Team Member (nếu có team và personal members)
async function testAddTeamMember(teamId, personalMembers) {
    console.log('\n➕ BƯỚC 8: TEST ADD TEAM MEMBER');
    console.log('=' .repeat(40));

    if (!teamId || !personalMembers || personalMembers.length === 0) {
        logResult('Add Team Member', false, null, 'Không có team hoặc personal members để test');
        return false;
    }

    const memberToAdd = personalMembers[0];
    const memberId = memberToAdd.member_user_id?._id || memberToAdd.member_user_id;

    try {
        const response = await axios.request(
            createAuthConfig('post', `/teams/${teamId}/members`, {
                user_id: memberId,
                role: 'Member'
            })
        );
        
        logResult('Add Team Member', true, response.data);
        return true;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Add Team Member', false, null, message);
        return false;
    }
}

// 9. Test Team Comparison Stats
async function testTeamComparisonStats() {
    console.log('\n📊 BƯỚC 9: TEST TEAM COMPARISON STATS');
    console.log('=' .repeat(40));

    try {
        const response = await axios.request(
            createAuthConfig('get', '/teams-enhanced/stats/comparison')
        );
        
        logResult('Team Comparison Stats', true, response.data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Team Comparison Stats', false, null, message);
        return null;
    }
}

// 10. Test Team Activity Stats (cần có teamId)
async function testTeamActivityStats(teamId) {
    console.log('\n📈 BƯỚC 10: TEST TEAM ACTIVITY STATS');
    console.log('=' .repeat(40));

    if (!teamId) {
        logResult('Team Activity Stats', false, null, 'Không có teamId để test');
        return null;
    }

    try {
        const response = await axios.request(
            createAuthConfig('get', `/teams-enhanced/${teamId}/stats/activity`, null, {
                period: '30'
            })
        );
        
        logResult('Team Activity Stats', true, response.data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        logResult('Team Activity Stats', false, null, message);
        return null;
    }
}

// Hàm chính để chạy tất cả tests
async function runAllTests() {
    console.log('🚀 BẮT ĐẦU TEST TEAMS API COMPREHENSIVE');
    console.log('=' .repeat(60));
    console.log(`📅 Thời gian: ${new Date().toLocaleString()}`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`👤 Admin Account: ${ADMIN_ACCOUNT.email}`);

    let testResults = {
        login: false,
        teamOverviewStats: false,
        teamsList: false,
        createTeam: false,
        teamDetailStats: false,
        teamSearch: false,
        personalMembers: false,
        addTeamMember: false,
        teamComparisonStats: false,
        teamActivityStats: false
    };

    let createdTeam = null;
    let personalMembers = [];

    try {
        // 1. Login
        testResults.login = await loginAdmin();
        if (!testResults.login) {
            console.log('❌ Đăng nhập thất bại, dừng test');
            return;
        }

        // 2. Team Overview Stats
        const overviewStats = await testTeamOverviewStats();
        testResults.teamOverviewStats = !!overviewStats;

        // 3. Teams List
        const teams = await testTeamsList();
        testResults.teamsList = Array.isArray(teams);

        // 4. Create Team
        createdTeam = await testCreateTeam();
        testResults.createTeam = !!createdTeam;

        // 5. Team Detail Stats (với team đầu tiên hoặc team vừa tạo)
        const teamForStats = createdTeam || (teams.length > 0 ? teams[0] : null);
        if (teamForStats) {
            const detailStats = await testTeamDetailStats(teamForStats._id);
            testResults.teamDetailStats = !!detailStats;
        }

        // 6. Team Search
        const searchResults = await testTeamSearch();
        testResults.teamSearch = !!searchResults;

        // 7. Personal Members
        personalMembers = await testPersonalMembers();
        testResults.personalMembers = Array.isArray(personalMembers);

        // 8. Add Team Member
        if (teamForStats && personalMembers.length > 0) {
            testResults.addTeamMember = await testAddTeamMember(teamForStats._id, personalMembers);
        }

        // 9. Team Comparison Stats
        const comparisonStats = await testTeamComparisonStats();
        testResults.teamComparisonStats = !!comparisonStats;

        // 10. Team Activity Stats
        if (teamForStats) {
            const activityStats = await testTeamActivityStats(teamForStats._id);
            testResults.teamActivityStats = !!activityStats;
        }

    } catch (error) {
        console.log('❌ Lỗi không mong muốn:', error.message);
    }

    // Tổng kết
    console.log('\n🎯 TỔNG KẾT TEST RESULTS');
    console.log('=' .repeat(60));
    
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    Object.entries(testResults).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
    });

    console.log('\n📊 THỐNG KÊ:');
    console.log(`📈 Tỷ lệ thành công: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`🎯 Tests thành công: ${passedTests}`);
    console.log(`❌ Tests thất bại: ${totalTests - passedTests}`);

    if (createdTeam) {
        console.log(`\n🆕 Team được tạo trong test: ${createdTeam.team_name} (ID: ${createdTeam._id})`);
    }

    console.log(`\n⏰ Hoàn thành test lúc: ${new Date().toLocaleString()}`);
    
    if (successRate >= 80) {
        console.log('🎉 TEAMS API HOẠT ĐỘNG TỐT!');
    } else if (successRate >= 50) {
        console.log('⚠️ TEAMS API CÓ MỘT SỐ VẤN ĐỀ');
    } else {
        console.log('🚨 TEAMS API CÓ NHIỀU VẤN ĐỀ CẦN KHẮC PHỤC');
    }
}

// Chạy tests khi file được execute
if (require.main === module) {
    runAllTests().catch(error => {
        console.log('💥 Lỗi fatal:', error.message);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    loginAdmin,
    testTeamOverviewStats,
    testTeamsList,
    testCreateTeam,
    ADMIN_ACCOUNT
};
