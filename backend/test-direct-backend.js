const axios = require('axios');

async function testDirectBackendCall() {
  try {
    console.log('🔍 Testing direct backend call...');
    
    // 1. Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Admin1@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 2. Test with backend expected structure
    console.log('2. Testing with backend structure (team_name)...');
    const backendData = {
      team_name: `Backend Test Team ${Date.now()}`,
      description: 'Team created with backend structure',
      members: []
    };
    
    console.log('📤 Sending data:', JSON.stringify(backendData, null, 2));
    
    const createResponse = await axios.post('http://localhost:5000/api/teams', backendData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Backend structure test successful!');
    console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2));
    
    // 3. Test with frontend structure (should fail)
    console.log('3. Testing with frontend structure (name)...');
    const frontendData = {
      name: `Frontend Test Team ${Date.now()}`,
      description: 'Team created with frontend structure',
      type: 'Public'
    };
    
    console.log('📤 Sending data:', JSON.stringify(frontendData, null, 2));
    
    try {
      const createResponse2 = await axios.post('http://localhost:5000/api/teams', frontendData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('⚠️ Frontend structure unexpectedly worked!');
    } catch (error) {
      console.log('❌ Frontend structure failed as expected:', error.response?.data?.message);
    }
    
    console.log('🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
  }
}

testDirectBackendCall();
