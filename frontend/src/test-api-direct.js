/**
 * Direct API Test Script
 * Test team members API with authentication
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEAM_ID = '683a2523ddf616be1a376995';

async function testAPI() {
  try {
    console.log('🔍 Testing Team Members API...');
    console.log('Backend URL:', BASE_URL);
    console.log('Team ID:', TEAM_ID);
    console.log('');    // First, try to login to get a token
    console.log('🔐 Attempting to login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'Admin1@gmail.com',
      password: '123456'
    });

    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('');

    // Now test the team members endpoint
    console.log('👥 Fetching team members...');
    const membersResponse = await axios.get(`${BASE_URL}/teams/${TEAM_ID}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('✅ Team members API response:');
    console.log('Status:', membersResponse.status);
    console.log('Data structure:', JSON.stringify(membersResponse.data, null, 2));
    
    if (membersResponse.data.members && membersResponse.data.members.length > 0) {
      console.log('');
      console.log('👤 First member details:');
      const firstMember = membersResponse.data.members[0];
      console.log('Member structure:', JSON.stringify(firstMember, null, 2));
      
      if (firstMember.user) {
        console.log('User full_name:', firstMember.user.full_name);
        console.log('User email:', firstMember.user.email);
      }
    }

  } catch (error) {
    console.error('❌ API Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testAPI();
