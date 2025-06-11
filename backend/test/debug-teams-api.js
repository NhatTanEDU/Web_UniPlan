const axios = require('axios');

async function testTeamsAPI() {
    try {
        console.log('🔍 Test teams API structure...');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'Admin1@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login thành công');
        
        // Test teams API
        const teamsResponse = await axios.get('http://localhost:5000/api/teams', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Teams API thành công!');
        console.log('📊 Response structure:');
        console.log('- Status:', teamsResponse.status);
        console.log('- Data keys:', Object.keys(teamsResponse.data));
        console.log('- Full response:', JSON.stringify(teamsResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Lỗi:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
    }
}

testTeamsAPI();
