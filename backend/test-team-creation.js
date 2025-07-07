const axios = require('axios');

async function testTeamCreation() {
  try {
    console.log('🔍 Testing team creation with new fix...');
    
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Admin1@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 2. Test team creation with the exact data structure from frontend
    console.log('2. Creating team with frontend data structure...');
    const frontendData = {
      name: `Frontend Test Team ${Date.now()}`,
      description: 'Team created from frontend structure test',
      type: 'Public'
    };
    
    console.log('📤 Sending data:', JSON.stringify(frontendData, null, 2));
    
    const createResponse = await axios.post('http://localhost:5000/api/teams', frontendData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Team creation successful!');
    console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2));
    
    // 3. Verify the team was created correctly
    console.log('3. Verifying team creation...');
    const teamsResponse = await axios.get('http://localhost:5000/api/teams', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const createdTeam = teamsResponse.data.teams.find(t => 
      t.team_name === frontendData.name
    );
    
    if (createdTeam) {
      console.log('✅ Team found in list!');
      console.log(`📋 Team Name: ${createdTeam.team_name}`);
      console.log(`📋 Team ID: ${createdTeam._id}`);
    } else {
      console.log('❌ Team not found in list');
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }
}

testTeamCreation();
