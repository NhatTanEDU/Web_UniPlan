const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const admin = {
    email: 'Admin1@gmail.com',
    password: '123456'
};

async function testDetailStats() {
    try {
        console.log('🚀 TEAM DETAIL STATS TEST');
        console.log('=========================');
          // 1. Đăng nhập
        console.log('1️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, admin);
        const token = loginResponse.data.token;
        console.log('✅ Đăng nhập thành công');
          // 2. Lấy danh sách teams trước
        console.log('2️⃣ Lấy danh sách teams...');
        const teamsResponse = await axios.get(`${BASE_URL}/teams`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const teams = teamsResponse.data.teams;
        if (!teams || teams.length === 0) {
            console.log('❌ Không có teams nào');
            return;
        }
        
        const firstTeam = teams[0];
        console.log(`📋 Sử dụng team: ${firstTeam.team_name} (ID: ${firstTeam._id})`);
        
        // 3. Test detail stats API
        console.log('3️⃣ Test detail stats API...');
        const detailResponse = await axios.get(
            `${BASE_URL}/teams-enhanced/${firstTeam._id}/stats/detail`, 
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            }
        );
        
        console.log('✅ Detail stats API thành công!');
        console.log('📊 Kết quả:', JSON.stringify(detailResponse.data, null, 2));
        
        // 4. Test comparison stats
        console.log('4️⃣ Test comparison stats API...');
        const comparisonResponse = await axios.get(
            `${BASE_URL}/teams-enhanced/stats/comparison`, 
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            }
        );
        
        console.log('✅ Comparison stats API thành công!');
        console.log('📊 So sánh teams (top 3):', 
            JSON.stringify(comparisonResponse.data.data.rankings.byMembers.slice(0, 3), null, 2)
        );
        
        // 5. Test activity stats
        console.log('5️⃣ Test activity stats API...');
        const activityResponse = await axios.get(
            `${BASE_URL}/teams-enhanced/${firstTeam._id}/stats/activity?period=7`, 
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            }
        );
        
        console.log('✅ Activity stats API thành công!');
        console.log('📊 Hoạt động 7 ngày qua:', 
            JSON.stringify(activityResponse.data.data.summary, null, 2)
        );
        
        console.log('\n🎉 TẤT CẢ TESTS THÀNH CÔNG!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
        console.error('Stack:', error.stack);
    }
}

testDetailStats();
