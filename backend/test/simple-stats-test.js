const axios = require('axios');

const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function simpleTest() {
    console.log('🚀 SIMPLE STATS TEST');
    console.log('===================');
    
    try {
        // 1. Đăng nhập
        console.log('1️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password
        });
        
        authToken = loginResponse.data.token;
        console.log('✅ Đăng nhập thành công');
        console.log('👤 User ID:', loginResponse.data.user.id);
        
        // 2. Test endpoint với timeout ngắn
        console.log('\n2️⃣ Test stats API với timeout 5s...');
        
        const config = {
            method: 'get',
            url: `${BASE_URL}/teams-enhanced/stats/overview`,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 giây timeout
        };
        
        console.log('🔄 Đang gọi API...');
        const statsResponse = await axios.request(config);
        
        console.log('✅ API thành công!');
        console.log('📊 Kết quả:', JSON.stringify(statsResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Lỗi:', error.code || error.message);
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📋 Data:', error.response.data);
        }
        
        // Kiểm tra log server
        console.log('\n🔍 Kiểm tra log server để xem lỗi chi tiết...');
    }
}

simpleTest();
