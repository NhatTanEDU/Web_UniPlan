// Test API để kiểm tra team members
const axios = require('axios');

async function testTeamMembersAPI() {
  try {
    const baseURL = 'http://localhost:5000/api';
    
    // Login để lấy token
    console.log('🔑 Logging in...');    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin1@gmail.com',
      password: '123456'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
      // Test API get team members
    const teamId = '683a2523ddf616be1a376995'; // Từ server logs mới nhất
    console.log(`\n🔍 Testing GET /api/teams/${teamId}/members`);
    const response = await axios.get(`${baseURL}/teams/${teamId}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });    console.log('✅ API Response:', {
      status: response.status,
      memberCount: response.data.members.length,
      rawData: JSON.stringify(response.data.members, null, 2)
    });
      } catch (error) {
    console.error('❌ API Test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      code: error.code,
      url: error.config?.url
    });
  }
}

testTeamMembersAPI();
