const axios = require('axios');

// Cấu hình
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Debug Team Stats API
async function debugTeamStats() {
    console.log('🔍 DEBUG TEAM STATS API');
    console.log('=' .repeat(40));

    try {
        // 1. Đăng nhập
        console.log('1️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password
        });
        
        authToken = loginResponse.data.token;
        console.log('✅ Đăng nhập thành công');
        console.log('👤 User ID:', loginResponse.data.user.id || loginResponse.data.user._id);

        // 2. Test endpoint cơ bản trước
        console.log('\n2️⃣ Test endpoint teams cơ bản...');
        try {
            const teamsResponse = await axios.get(`${BASE_URL}/teams`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
                timeout: 5000
            });
            console.log('✅ Teams API hoạt động, có', teamsResponse.data.length, 'teams');
        } catch (error) {
            console.log('❌ Teams API lỗi:', error.message);
            return;
        }

        // 3. Test teamStats controller trực tiếp
        console.log('\n3️⃣ Test team stats endpoint...');
        
        // Thử các endpoint khác nhau
        const endpoints = [
            '/teams-enhanced/stats/overview',
            '/team-stats/overview',
            '/teams/stats'
        ];

        for (const endpoint of endpoints) {
            console.log(`\n🔍 Thử endpoint: ${endpoint}`);
            try {
                const response = await Promise.race([
                    axios.get(`${BASE_URL}${endpoint}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout 5s')), 5000)
                    )
                ]);
                
                console.log(`✅ ${endpoint} hoạt động!`);
                console.log('📊 Data:', JSON.stringify(response.data, null, 2));
                break;
            } catch (error) {
                if (error.message === 'Timeout 5s') {
                    console.log(`⏰ ${endpoint} bị timeout`);
                } else if (error.response?.status === 404) {
                    console.log(`❌ ${endpoint} không tồn tại (404)`);
                } else {
                    console.log(`❌ ${endpoint} lỗi:`, error.message);
                }
            }
        }

        // 4. Test direct database query để debug
        console.log('\n4️⃣ Test database trực tiếp...');
        try {
            const testResponse = await axios.post(`${BASE_URL}/test-db-connection`, {}, {
                headers: { 'Authorization': `Bearer ${authToken}` },
                timeout: 3000
            });
            console.log('✅ Database connection OK');
        } catch (error) {
            console.log('❌ Database test không có endpoint hoặc lỗi');
        }

    } catch (error) {
        console.log('💥 Lỗi chính:', error.message);
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📋 Data:', error.response.data);
        }
    }
}

// Chạy debug
debugTeamStats().catch(console.error);
