/**
 * Simple Team Type Update Test
 * ===========================
 * A basic test to verify team type update functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user (register first if needed)
const testUser = {
  full_name: 'Test User',
  email: 'testuser123@example.com',
  password: 'testpass123'
};

async function simpleTest() {
  console.log('🚀 Simple Team Type Update Test');
  console.log('===============================');
  
  let authToken = '';
  let teamId = '';

  try {
    // Step 1: Register or login
    console.log('\n1. Authentication...');
    
    // Try registration first
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ User registered successfully');
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('ℹ️  User already exists, proceeding to login');
      } else {
        console.log('⚠️  Registration error:', regError.response?.data || regError.message);
      }
    }

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
    } else {
      throw new Error('No token received from login');
    }

    // Headers for authenticated requests
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Create a test team
    console.log('\n2. Creating test team...');
    const teamData = {
      team_name: 'Test Team for Type Update',
      description: 'Testing team type update functionality',
      type: 'Public'
    };

    const createResponse = await axios.post(`${BASE_URL}/teams`, teamData, {
      headers: authHeaders
    });

    if (createResponse.data.team) {
      teamId = createResponse.data.team._id;
      console.log('✅ Team created successfully');
      console.log(`   ID: ${teamId}`);
      console.log(`   Type: ${createResponse.data.team.type}`);
    } else {
      throw new Error('No team data in create response');
    }

    // Step 3: Update team type from Public to Private
    console.log('\n3. Updating team type to Private...');
    const updateData = {
      team_name: teamData.team_name,
      description: teamData.description,
      type: 'Private'
    };

    const updateResponse = await axios.put(`${BASE_URL}/teams/${teamId}`, updateData, {
      headers: authHeaders
    });

    console.log('✅ Update request completed');
    console.log('   Response:', updateResponse.data);

    // Step 4: Verify the update by fetching the team
    console.log('\n4. Verifying update...');
    const fetchResponse = await axios.get(`${BASE_URL}/teams/${teamId}`, {
      headers: authHeaders
    });

    if (fetchResponse.data.team) {
      const updatedTeam = fetchResponse.data.team;
      console.log(`   Fetched type: ${updatedTeam.type}`);
      
      if (updatedTeam.type === 'Private') {
        console.log('✅ Team type successfully updated to Private');
      } else {
        console.log(`❌ Update failed. Expected: Private, Got: ${updatedTeam.type}`);
      }
    }

    // Step 5: Update back to Public
    console.log('\n5. Updating team type back to Public...');
    const updateData2 = {
      team_name: teamData.team_name,
      description: teamData.description,
      type: 'Public'
    };

    await axios.put(`${BASE_URL}/teams/${teamId}`, updateData2, {
      headers: authHeaders
    });

    const fetchResponse2 = await axios.get(`${BASE_URL}/teams/${teamId}`, {
      headers: authHeaders
    });

    if (fetchResponse2.data.team && fetchResponse2.data.team.type === 'Public') {
      console.log('✅ Team type successfully updated back to Public');
    } else {
      console.log(`❌ Second update failed. Expected: Public, Got: ${fetchResponse2.data.team?.type}`);
    }

    // Step 6: Cleanup
    console.log('\n6. Cleaning up...');
    try {
      await axios.delete(`${BASE_URL}/teams/${teamId}`, {
        headers: authHeaders
      });
      console.log('✅ Test team deleted successfully');
    } catch (deleteError) {
      console.log('⚠️  Failed to delete test team:', deleteError.response?.data || deleteError.message);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    // Try to cleanup if we have a team ID
    if (teamId && authToken) {
      try {
        await axios.delete(`${BASE_URL}/teams/${teamId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Cleanup: Test team deleted');
      } catch (cleanupError) {
        console.log('⚠️  Cleanup failed, please delete team manually:', teamId);
      }
    }
  }
}

// Run the test
simpleTest();
