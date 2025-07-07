const axios = require('axios');

async function quickTestTeams() {
  try {
    console.log('🔍 Quick test teams API...');
    
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Admin1@gmail.com',
      password: '123456'
    }, { timeout: 5000 });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 2: Get teams
    console.log('2. Testing get teams...');
    const teamsResponse = await axios.get('http://localhost:5000/api/teams', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    
    console.log('✅ Get teams successful');
    console.log(`📊 Found ${teamsResponse.data.teams?.length || 0} teams`);
    
    // Test 3: Create team
    console.log('3. Testing create team...');
    const teamData = {
      team_name: `Quick Test Team ${Date.now()}`,
      description: 'Test team for debugging',
      members: []
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/teams', teamData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Create team successful');
    console.log('📋 Team ID:', createResponse.data.team._id);
    
    const newTeamId = createResponse.data.team._id;
    
    // Test 4: Delete team (this might be causing the hang)
    console.log('4. Testing delete team...');
    const deleteResponse = await axios.delete(`http://localhost:5000/api/teams/${newTeamId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });
    
    console.log('✅ Delete team successful');
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timeout: error.code === 'ECONNABORTED'
    });
  }
}

quickTestTeams();
