/**
 * Comprehensive Test: Team Type Update Functionality
 * ================================================
 * Tests the complete flow of updating team types from frontend to backend
 * 
 * This test verifies:
 * 1. Creating a team with initial type
 * 2. Updating team type from Public to Private
 * 3. Updating team type from Private to Public
 * 4. Verifying backend properly saves the type field
 * 5. Verifying frontend receives updated data
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testTeamId = '';

// Test configuration
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

const testTeam = {
  name: 'Test Team Type Update',
  description: 'Testing team type update functionality',
  type: 'Public'
};

/**
 * Utility function to make authenticated API calls
 */
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Test 1: Authentication
 */
async function testAuthentication() {
  console.log('\n🔐 Test 1: Authentication');
  console.log('================================');

  // Try to login with test user
  const loginResult = await apiCall('POST', '/auth/login', testUser);
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log('✅ Authentication successful');
    console.log(`📝 Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('⚠️  Login failed, trying to register...');
    
    // Try to register
    const registerResult = await apiCall('POST', '/auth/register', {
      ...testUser,
      username: 'testuser'
    });
    
    if (registerResult.success) {
      console.log('✅ Registration successful, logging in...');
      const loginRetry = await apiCall('POST', '/auth/login', testUser);
      
      if (loginRetry.success && loginRetry.data.token) {
        authToken = loginRetry.data.token;
        console.log('✅ Authentication successful after registration');
        return true;
      }
    }
    
    console.log('❌ Authentication failed');
    console.log('Error:', loginResult.error);
    return false;
  }
}

/**
 * Test 2: Create Team with Initial Type
 */
async function testCreateTeam() {
  console.log('\n📝 Test 2: Create Team with Initial Type');
  console.log('==========================================');

  const result = await apiCall('POST', '/teams', testTeam);
  
  if (result.success && result.data.team) {
    testTeamId = result.data.team._id;
    console.log('✅ Team created successfully');
    console.log(`📝 Team ID: ${testTeamId}`);
    console.log(`📝 Team Name: ${result.data.team.team_name}`);
    console.log(`📝 Team Type: ${result.data.team.type}`);
    console.log(`📝 Team Description: ${result.data.team.description}`);
    
    // Verify initial type
    if (result.data.team.type === testTeam.type) {
      console.log('✅ Initial team type set correctly');
      return true;
    } else {
      console.log(`❌ Initial team type incorrect. Expected: ${testTeam.type}, Got: ${result.data.team.type}`);
      return false;
    }
  } else {
    console.log('❌ Team creation failed');
    console.log('Error:', result.error);
    return false;
  }
}

/**
 * Test 3: Update Team Type from Public to Private
 */
async function testUpdateToPrivate() {
  console.log('\n🔄 Test 3: Update Team Type (Public → Private)');
  console.log('===============================================');

  const updateData = {
    team_name: testTeam.name,
    description: testTeam.description,
    type: 'Private'
  };

  const result = await apiCall('PUT', `/teams/${testTeamId}`, updateData);
  
  if (result.success) {
    console.log('✅ Update API call successful');
    console.log('📝 API Response:', JSON.stringify(result.data, null, 2));
    
    // Verify by fetching the team
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit for DB update
    
    const fetchResult = await apiCall('GET', `/teams/${testTeamId}`);
    if (fetchResult.success && fetchResult.data.team) {
      const updatedTeam = fetchResult.data.team;
      console.log(`📝 Fetched Team Type: ${updatedTeam.type}`);
      
      if (updatedTeam.type === 'Private') {
        console.log('✅ Team type successfully updated to Private');
        return true;
      } else {
        console.log(`❌ Team type not updated. Expected: Private, Got: ${updatedTeam.type}`);
        return false;
      }
    } else {
      console.log('❌ Failed to fetch updated team');
      console.log('Error:', fetchResult.error);
      return false;
    }
  } else {
    console.log('❌ Update API call failed');
    console.log('Error:', result.error);
    return false;
  }
}

/**
 * Test 4: Update Team Type from Private to Public
 */
async function testUpdateToPublic() {
  console.log('\n🔄 Test 4: Update Team Type (Private → Public)');
  console.log('===============================================');

  const updateData = {
    team_name: testTeam.name,
    description: testTeam.description,
    type: 'Public'
  };

  const result = await apiCall('PUT', `/teams/${testTeamId}`, updateData);
  
  if (result.success) {
    console.log('✅ Update API call successful');
    console.log('📝 API Response:', JSON.stringify(result.data, null, 2));
    
    // Verify by fetching the team
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit for DB update
    
    const fetchResult = await apiCall('GET', `/teams/${testTeamId}`);
    if (fetchResult.success && fetchResult.data.team) {
      const updatedTeam = fetchResult.data.team;
      console.log(`📝 Fetched Team Type: ${updatedTeam.type}`);
      
      if (updatedTeam.type === 'Public') {
        console.log('✅ Team type successfully updated to Public');
        return true;
      } else {
        console.log(`❌ Team type not updated. Expected: Public, Got: ${updatedTeam.type}`);
        return false;
      }
    } else {
      console.log('❌ Failed to fetch updated team');
      console.log('Error:', fetchResult.error);
      return false;
    }
  } else {
    console.log('❌ Update API call failed');
    console.log('Error:', result.error);
    return false;
  }
}

/**
 * Test 5: Fetch All Teams and Verify
 */
async function testFetchAllTeams() {
  console.log('\n📋 Test 5: Fetch All Teams and Verify');
  console.log('======================================');

  const result = await apiCall('GET', '/teams');
  
  if (result.success && result.data.teams) {
    console.log(`✅ Fetched ${result.data.teams.length} teams`);
    
    // Find our test team
    const ourTeam = result.data.teams.find(team => team._id === testTeamId);
    if (ourTeam) {
      console.log('✅ Test team found in team list');
      console.log(`📝 Team Name: ${ourTeam.team_name}`);
      console.log(`📝 Team Type: ${ourTeam.type}`);
      console.log(`📝 Team Description: ${ourTeam.description}`);
      return true;
    } else {
      console.log('❌ Test team not found in team list');
      return false;
    }
  } else {
    console.log('❌ Failed to fetch teams');
    console.log('Error:', result.error);
    return false;
  }
}

/**
 * Test 6: Cleanup - Delete Test Team
 */
async function testCleanup() {
  console.log('\n🧹 Test 6: Cleanup - Delete Test Team');
  console.log('======================================');

  const result = await apiCall('DELETE', `/teams/${testTeamId}`);
  
  if (result.success) {
    console.log('✅ Test team deleted successfully');
    return true;
  } else {
    console.log('⚠️  Failed to delete test team');
    console.log('Error:', result.error);
    console.log(`📝 Please manually delete team with ID: ${testTeamId}`);
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('🚀 Starting Team Type Update Tests');
  console.log('===================================');
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);

  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Create Team', fn: testCreateTeam },
    { name: 'Update to Private', fn: testUpdateToPrivate },
    { name: 'Update to Public', fn: testUpdateToPublic },
    { name: 'Fetch All Teams', fn: testFetchAllTeams },
    { name: 'Cleanup', fn: testCleanup }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" threw an error:`, error.message);
      failed++;
    }
  }

  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Team type update functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above for details.');
  }
}

// Handle errors and run tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
