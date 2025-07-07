const axios = require('axios');

async function testBackendDirectly() {
  try {
    console.log('🔍 Testing backend directly with correct structure...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Admin1@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test with correct backend structure
    const correctData = {
      team_name: `Backend Fix Test ${Date.now()}`,
      description: 'Team created with correct team_name field',
      members: []
    };
    
    console.log('📤 Sending correct data:', JSON.stringify(correctData, null, 2));
    
    const createResponse = await axios.post('http://localhost:5000/api/teams', correctData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team creation with correct structure successful!');
    console.log('📊 Created team:', createResponse.data.team.team_name);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
  }
}

testBackendDirectly();
