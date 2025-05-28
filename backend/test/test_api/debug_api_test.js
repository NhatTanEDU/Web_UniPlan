const axios = require('axios');

// Cấu hình test
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Tài khoản Admin để test
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456'
};

// Function helper để gọi API
const apiCall = async (method, url, data = null) => {
    try {
        console.log(`🔗 Đang gọi API: ${method} ${BASE_URL}${url}`);
        
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            ...(data && { data }),
            timeout: 10000 // 10 giây timeout
        };

        console.log('📤 Request config:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            data: config.data
        });

        const response = await axios(config);
        
        console.log('✅ Response thành công:', {
            status: response.status,
            statusText: response.statusText,
            dataKeys: Object.keys(response.data || {}),
            dataType: typeof response.data
        });
        
        return { 
            success: true, 
            data: response.data, 
            status: response.status,
            statusText: response.statusText 
        };
    } catch (error) {
        console.log('❌ Lỗi API call:');
        console.log('   - Message:', error.message);
        console.log('   - Code:', error.code);
        
        if (error.response) {
            console.log('   - Response Status:', error.response.status);
            console.log('   - Response Data:', error.response.data);
            console.log('   - Response Headers:', error.response.headers);
        } else if (error.request) {
            console.log('   - Request được gửi nhưng không có response');
            console.log('   - Request:', error.request);
        }
        
        return { 
            success: false, 
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500,
            fullError: error
        };
    }
};

// 1. Test kết nối cơ bản
async function testBasicConnection() {
    console.log('\n🔍 KIỂM TRA KẾT NỐI CƠ BẢN');
    console.log('==============================');
    
    try {
        // Test endpoint auth/login để kiểm tra server (không cần auth)
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@test.com',
            password: 'wrong'
        }, { 
            timeout: 5000,
            validateStatus: function (status) {
                // Chấp nhận cả status 400 (bad request) vì đó cũng là response từ server
                return status < 500;
            }
        });
        console.log('✅ Server đang chạy và phản hồi');
        console.log('   - Status:', response.status);
        console.log('   - Server có thể xử lý requests');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Không thể kết nối tới server');
            console.log('   - Server chưa chạy hoặc không listen trên port 5000');
            console.log('💡 Hãy đảm bảo server đang chạy: npm start hoặc node server.js');
            return false;
        } else {
            console.log('✅ Server đang chạy (nhận được response)');
            console.log('   - Error:', error.message);
            console.log('   - Nhưng server có thể phản hồi, tiếp tục test...');
            return true;
        }
    }
}

// 2. Test đăng nhập
async function testLogin() {
    console.log('\n🔐 KIỂM TRA ĐĂNG NHẬP');
    console.log('======================');
    
    const result = await apiCall('POST', '/auth/login', {
        email: ADMIN_ACCOUNT.email,
        password: ADMIN_ACCOUNT.password
    });

    if (result.success) {
        authToken = result.data.token;
        console.log('✅ Đăng nhập thành công');
        console.log('   - User:', result.data.user?.name || result.data.user?.full_name);
        console.log('   - Email:', result.data.user?.email);
        console.log('   - Token có:', authToken ? 'Có' : 'Không có');
        return true;
    } else {
        console.log('❌ Đăng nhập thất bại');
        console.log('   - Lỗi:', result.error);
        console.log('💡 Kiểm tra tài khoản Admin1@gmail.com có tồn tại không');
        return false;
    }
}

// 3. Test API Users chi tiết
async function testUsersAPI() {
    console.log('\n👥 KIỂM TRA API USERS CHI TIẾT');
    console.log('===============================');
    
    // Test không có auth
    console.log('📝 Test GET /users (không có auth):');
    let result = await apiCall('GET', '/users');
    console.log('   - Kết quả:', result.success ? 'Thành công' : `Lỗi: ${result.error}`);
    
    if (!authToken) {
        console.log('⚠️ Không có token, bỏ qua test có auth');
        return false;
    }
    
    // Test có auth
    console.log('\n📝 Test GET /users (có auth):');
    result = await apiCall('GET', '/users');
    
    if (result.success) {
        console.log('✅ API /users hoạt động tốt');
        console.log('   - Data structure:', typeof result.data);
        console.log('   - Keys:', Object.keys(result.data || {}));
        
        if (result.data.data && result.data.data.users) {
            console.log('   - Số users:', result.data.data.users.length);
            console.log('   - User đầu tiên:', result.data.data.users[0]?.full_name || 'N/A');
        } else if (result.data.users) {
            console.log('   - Số users:', result.data.users.length);
            console.log('   - User đầu tiên:', result.data.users[0]?.full_name || 'N/A');
        } else {
            console.log('   - Cấu trúc data không như mong đợi');
            console.log('   - Full data:', JSON.stringify(result.data, null, 2));
        }
        return true;
    } else {
        console.log('❌ API /users lỗi:', result.error);
        return false;
    }
}

// 4. Test API Personal Members chi tiết
async function testPersonalMembersAPI() {
    console.log('\n👨‍👩‍👧‍👦 KIỂM TRA API PERSONAL MEMBERS CHI TIẾT');
    console.log('==============================================');
    
    if (!authToken) {
        console.log('⚠️ Không có token, bỏ qua test');
        return false;
    }
    
    // Test endpoint cơ bản
    console.log('📝 Test GET /personal-members:');
    let result = await apiCall('GET', '/personal-members');
    
    if (result.success) {
        console.log('✅ API /personal-members hoạt động');
        console.log('   - Data structure:', typeof result.data);
        console.log('   - Keys:', Object.keys(result.data || {}));
        
        if (result.data.members) {
            console.log('   - Số members:', result.data.members.length);
            if (result.data.members.length > 0) {
                console.log('   - Member đầu tiên:', JSON.stringify(result.data.members[0], null, 2));
            }
        } else {
            console.log('   - Không có field "members"');
            console.log('   - Full data:', JSON.stringify(result.data, null, 2));
        }
        return true;
    } else {
        console.log('❌ API /personal-members lỗi:', result.error);
        
        // Test endpoint khác
        console.log('\n📝 Test các endpoint khác:');
        
        // Test search endpoint
        console.log('📝 Test GET /personal-members/search:');
        result = await apiCall('GET', '/personal-members/search');
        console.log('   - Kết quả:', result.success ? 'Thành công' : `Lỗi: ${result.error}`);
        
        return false;
    }
}

// 5. Test các endpoints khác
async function testOtherEndpoints() {
    console.log('\n🔍 KIỂM TRA CÁC ENDPOINTS KHÁC');
    console.log('==============================');
    
    if (!authToken) {
        console.log('⚠️ Không có token, bỏ qua test');
        return;
    }
    
    const endpoints = [
        '/teams',
        '/admin',
        '/notifications'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`📝 Test GET ${endpoint}:`);
        const result = await apiCall('GET', endpoint);
        console.log(`   - Kết quả: ${result.success ? 'Thành công' : `Lỗi: ${result.error}`}`);
    }
}

// 6. Kiểm tra middleware và auth
async function testAuthMiddleware() {
    console.log('\n🛡️ KIỂM TRA MIDDLEWARE AUTH');
    console.log('============================');
    
    // Test với token không hợp lệ
    console.log('📝 Test với token không hợp lệ:');
    const oldToken = authToken;
    authToken = 'invalid-token-123';
    
    let result = await apiCall('GET', '/users');
    console.log(`   - Kết quả: ${result.success ? 'Thành công (lỗi!)' : `Lỗi như mong đợi: ${result.error}`}`);
    
    // Test với token rỗng
    console.log('📝 Test với token rỗng:');
    authToken = '';
    
    result = await apiCall('GET', '/users');
    console.log(`   - Kết quả: ${result.success ? 'Thành công (lỗi!)' : `Lỗi như mong đợi: ${result.error}`}`);
    
    // Khôi phục token
    authToken = oldToken;
    console.log('📝 Test với token hợp lệ sau khi khôi phục:');
    result = await apiCall('GET', '/users');
    console.log(`   - Kết quả: ${result.success ? 'Thành công' : `Lỗi: ${result.error}`}`);
}

// Main function chạy tất cả test
async function runAllDebugTests() {
    console.log('🚀 BẮT ĐẦU DEBUG API TEST');
    console.log('==========================');
    console.log('🎯 Mục tiêu: Tìm nguyên nhân lỗi "undefined" trong APIs');
    console.log('');
    
    try {
        // Bước 1: Kiểm tra server có chạy không
        const serverOK = await testBasicConnection();
        if (!serverOK) {
            console.log('\n🛑 DỪNG TEST: Server không chạy');
            return;
        }
        
        // Bước 2: Test đăng nhập
        const loginOK = await testLogin();
        if (!loginOK) {
            console.log('\n⚠️ TIẾP TỤC TEST mà không có auth');
        }
        
        // Bước 3: Test API Users
        await testUsersAPI();
        
        // Bước 4: Test API Personal Members
        await testPersonalMembersAPI();
        
        // Bước 5: Test middleware auth
        if (loginOK) {
            await testAuthMiddleware();
        }
        
        // Bước 6: Test các endpoints khác
        await testOtherEndpoints();
        
        console.log('\n🎊 HOÀN THÀNH DEBUG TEST');
        console.log('========================');
        console.log('📋 Hãy xem kết quả ở trên để xác định vấn đề');
        
    } catch (error) {
        console.log('\n💥 LỖI NGHIÊM TRỌNG TRONG DEBUG TEST:');
        console.log('====================================');
        console.log('Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

// Menu để chọn test cụ thể
async function showDebugMenu() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    function ask(question) {
        return new Promise(resolve => rl.question(question, resolve));
    }
    
    console.log('\n🛠️ DEBUG MENU - CHỌN TEST CỤ THỂ');
    console.log('===============================');
    console.log('1. Chạy tất cả tests');
    console.log('2. Chỉ test kết nối server');
    console.log('3. Chỉ test đăng nhập');
    console.log('4. Chỉ test API Users');
    console.log('5. Chỉ test API Personal Members');
    console.log('6. Chỉ test Auth Middleware');
    console.log('0. Thoát');
    console.log('');
    
    const choice = await ask('Chọn option (0-6): ');
    
    switch (choice.trim()) {
        case '1':
            await runAllDebugTests();
            break;
        case '2':
            await testBasicConnection();
            break;
        case '3':
            await testLogin();
            break;
        case '4':
            await testLogin();
            await testUsersAPI();
            break;
        case '5':
            await testLogin();
            await testPersonalMembersAPI();
            break;
        case '6':
            await testLogin();
            await testAuthMiddleware();
            break;
        case '0':
            console.log('👋 Tạm biệt!');
            rl.close();
            return;
        default:
            console.log('❌ Lựa chọn không hợp lệ');
    }
    
    console.log('\n🔄 Quay lại menu...');
    rl.close();
    setTimeout(() => showDebugMenu(), 1000);
}

// Chạy ngay lập tức hoặc hiển thị menu
if (process.argv.includes('--auto')) {
    runAllDebugTests();
} else {
    showDebugMenu();
}
