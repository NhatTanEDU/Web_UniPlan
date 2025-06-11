const axios = require('axios');

async function createTestTeam() {
    try {
        console.log('🔍 Tạo team test...');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'Admin1@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login thành công');
        
        // Create a test team
        const teamData = {
            team_name: 'Test Team 1',
            description: 'Team để test stats API',
            members: []
        };
        
        console.log('🔍 Tạo team...');
        const createResponse = await axios.post('http://localhost:5000/api/teams', teamData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Tạo team thành công!');
        console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2));
        
        // Now test getting teams
        console.log('🔍 Lấy danh sách teams...');
        const teamsResponse = await axios.get('http://localhost:5000/api/teams', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
        });
        
        console.log('✅ Teams API thành công!');
        console.log('📊 Teams response:', JSON.stringify(teamsResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Lỗi:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
    }
}

createTestTeam();
