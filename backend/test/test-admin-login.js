const axios = require('axios');

// Import admin account config
let ADMIN_ACCOUNT, TEST_CONFIG;
try {
    const adminConfig = require('./admin-account');
    ADMIN_ACCOUNT = adminConfig.ADMIN_ACCOUNT;
    TEST_CONFIG = adminConfig.TEST_CONFIG;
    console.log('✅ Admin config loaded successfully');
} catch (error) {
    console.log('❌ Error loading admin config:', error.message);
    // Fallback config
    ADMIN_ACCOUNT = {
        email: 'Admin1@gmail.com',
        password: '123456',
        name: 'Admin1'
    };
    TEST_CONFIG = {
        BASE_URL: 'http://localhost:5000/api',
        ENDPOINTS: {
            login: '/auth/login',
            register: '/auth/register',
            teams: '/teams',
            teamStats: '/team-stats',
            personalMembers: '/personal-members'
        }
    };
    console.log('✅ Using fallback config');
}

let authToken = '';

// Hàm helper để tạo config request với token
function createAuthConfig(method, endpoint, data = null, params = null) {
    const config = {
        method,
        url: `${TEST_CONFIG.BASE_URL}${endpoint}`,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) config.data = data;
    if (params) config.params = params;
    
    return config;
}

// Bước 1: Đăng nhập Admin
async function loginAdmin() {
    console.log('🔑 ĐĂNG NHẬP ADMIN');
    console.log('==================');
    console.log(`📧 Email: ${ADMIN_ACCOUNT.email}`);
    console.log(`👤 Name: ${ADMIN_ACCOUNT.name}`);

    try {
        const response = await axios.post(`${TEST_CONFIG.BASE_URL}${TEST_CONFIG.ENDPOINTS.login}`, {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password
        });
        
        authToken = response.data.token;
        const user = response.data.user;
        
        console.log('✅ Đăng nhập thành công!');
        console.log('👤 User Info:', {
            id: user.id || user._id,
            name: user.name || user.full_name,
            email: user.email,
            role: user.role
        });
        console.log('🔐 Token:', authToken ? 'Có' : 'Không');
        
        return { success: true, user, token: authToken };
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ Đăng nhập thất bại:', message);
        console.log('📊 Status Code:', error.response?.status);
        console.log('📋 Response Data:', error.response?.data);
        
        return { success: false, error: message };
    }
}

// Bước 2: Test Teams Overview Stats API
async function testTeamOverviewStats() {
    console.log('\n📊 TEST TEAM OVERVIEW STATS API');
    console.log('================================');

    if (!authToken) {
        console.log('❌ Chưa có token, cần đăng nhập trước');
        return false;
    }

    try {
        const response = await axios.request(
            createAuthConfig('get', TEST_CONFIG.ENDPOINTS.teamStats)
        );
        
        console.log('✅ API Team Stats thành công!');
        console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
        
        return { success: true, data: response.data };
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ API Team Stats thất bại:', message);
        console.log('📊 Status Code:', error.response?.status);
        console.log('📋 Error Details:', error.response?.data);
        console.log('🔍 Stack Trace:', error.stack);
        
        return { success: false, error: message, details: error.response?.data };
    }
}

// Bước 3: Test Teams List API
async function testTeamsList() {
    console.log('\n📋 TEST TEAMS LIST API');
    console.log('=======================');

    if (!authToken) {
        console.log('❌ Chưa có token, cần đăng nhập trước');
        return false;
    }

    try {
        const response = await axios.request(
            createAuthConfig('get', TEST_CONFIG.ENDPOINTS.teams)
        );
        
        console.log('✅ API Teams List thành công!');
        const teams = response.data.data || response.data.teams || [];
        console.log(`📊 Tìm thấy ${teams.length} teams`);
        
        if (teams.length > 0) {
            console.log('🔍 Sample Team:', JSON.stringify(teams[0], null, 2));
        }
        
        return { success: true, data: response.data, count: teams.length };
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ API Teams List thất bại:', message);
        console.log('📊 Status Code:', error.response?.status);
        console.log('📋 Error Details:', error.response?.data);
        
        return { success: false, error: message, details: error.response?.data };
    }
}

// Bước 4: Test Personal Members API
async function testPersonalMembers() {
    console.log('\n👥 TEST PERSONAL MEMBERS API');
    console.log('=============================');

    if (!authToken) {
        console.log('❌ Chưa có token, cần đăng nhập trước');
        return false;
    }

    try {
        const response = await axios.request(
            createAuthConfig('get', TEST_CONFIG.ENDPOINTS.personalMembers)
        );
        
        console.log('✅ API Personal Members thành công!');
        const members = response.data.data || [];
        console.log(`📊 Tìm thấy ${members.length} personal members`);
        
        if (members.length > 0) {
            console.log('🔍 Sample Member:', JSON.stringify(members[0], null, 2));
        }
        
        return { success: true, data: response.data, count: members.length };
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        console.log('❌ API Personal Members thất bại:', message);
        console.log('📊 Status Code:', error.response?.status);
        console.log('📋 Error Details:', error.response?.data);
        
        return { success: false, error: message, details: error.response?.data };
    }
}

// Hàm chính - chạy tất cả test
async function runAllTests() {
    console.log('🚀 BẮT ĐẦU TEST ADMIN LOGIN VÀ TEAMS API');
    console.log('=========================================');
    console.log(`🌐 Base URL: ${TEST_CONFIG.BASE_URL}`);
    console.log(`📅 Thời gian: ${new Date().toLocaleString()}`);
    console.log('');

    const results = {
        login: null,
        teamStats: null,
        teamsList: null,
        personalMembers: null
    };

    try {
        // Bước 1: Đăng nhập
        results.login = await loginAdmin();
        if (!results.login.success) {
            console.log('\n❌ Không thể đăng nhập, dừng test');
            return results;
        }

        // Delay nhỏ giữa các request
        await new Promise(resolve => setTimeout(resolve, 500));

        // Bước 2: Test Team Stats API
        results.teamStats = await testTeamOverviewStats();

        await new Promise(resolve => setTimeout(resolve, 500));

        // Bước 3: Test Teams List API
        results.teamsList = await testTeamsList();

        await new Promise(resolve => setTimeout(resolve, 500));

        // Bước 4: Test Personal Members API
        results.personalMembers = await testPersonalMembers();

        // Tổng kết
        console.log('\n🎯 TỔNG KẾT TEST');
        console.log('================');
        console.log(`✅ Login: ${results.login.success ? 'Thành công' : 'Thất bại'}`);
        console.log(`📊 Team Stats: ${results.teamStats?.success ? 'Thành công' : 'Thất bại'}`);
        console.log(`📋 Teams List: ${results.teamsList?.success ? 'Thành công' : 'Thất bại'}`);
        console.log(`👥 Personal Members: ${results.personalMembers?.success ? 'Thành công' : 'Thất bại'}`);

        const successCount = [
            results.login.success,
            results.teamStats?.success,
            results.teamsList?.success,
            results.personalMembers?.success
        ].filter(Boolean).length;

        console.log(`\n🏆 Tỷ lệ thành công: ${successCount}/4 (${Math.round(successCount/4*100)}%)`);

        if (results.teamStats?.success) {
            console.log('\n🎉 Teams API hoạt động bình thường!');
        } else {
            console.log('\n⚠️ Teams API có vấn đề, cần kiểm tra backend');
        }

        return results;

    } catch (error) {
        console.log('\n💥 LỖI NGHIÊM TRỌNG:', error.message);
        return results;
    }
}

// Xuất module
module.exports = {
    loginAdmin,
    testTeamOverviewStats,
    testTeamsList,
    testPersonalMembers,
    runAllTests,
    createAuthConfig
};

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
    runAllTests().catch(console.error);
}
