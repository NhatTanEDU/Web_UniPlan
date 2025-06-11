const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const admin = {
    email: 'Admin1@gmail.com',
    password: '123456'
};

async function testSimpleDetail() {
    try {
        console.log('🔍 SIMPLE DETAIL TEST');
        console.log('===================');
        
        // 1. Login
        console.log('1️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, admin);
        const token = loginResponse.data.token;
        console.log('✅ Đăng nhập thành công');
        
        // 2. Lấy teams
        console.log('2️⃣ Lấy teams...');
        const teamsResponse = await axios.get(`${BASE_URL}/teams`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const teams = teamsResponse.data.teams;
        const firstTeam = teams[0];
        console.log(`📋 Team: ${firstTeam.team_name} (ID: ${firstTeam._id})`);
        
        // 3. Test detail endpoint với timeout ngắn
        console.log('3️⃣ Test detail stats (timeout 5s)...');
        const detailResponse = await axios.get(
            `${BASE_URL}/teams-enhanced/${firstTeam._id}/stats/detail`,
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000  // 5 giây
            }
        );
        
        console.log('✅ Detail stats thành công!');
        console.log('📊 Keys:', Object.keys(detailResponse.data));
        
        if (detailResponse.data.data) {
            console.log('📊 Data keys:', Object.keys(detailResponse.data.data));
        }
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Timeout - API bị treo');
        } else if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

testSimpleDetail();
