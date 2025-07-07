// Test the bulk add members functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'admin1@gmail.com';
const PASSWORD = '123456';
const TEAM_ID = '683f3c43403cc6904ca1a395'; // Team ID from the user's screenshot

async function loginAndGetToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  return data.token;
}

async function testBulkAdd(token) {
  // Test bulk add with enhanced endpoint
  const userIds = ['68334e4c74b4826aec61963e']; // One of the user IDs from earlier
  const role = 'Member';
  
  console.log('Testing bulk add with enhanced endpoint...');
  console.log(`URL: ${BASE_URL}/teams-enhanced/${TEAM_ID}/members/bulk/add`);
  console.log('Payload:', { userIds, role });
  
  const res = await fetch(`${BASE_URL}/teams-enhanced/${TEAM_ID}/members/bulk/add`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userIds, role })
  });
    console.log('Response status:', res.status);
  const data = await res.text();
  console.log('Response body:', data);
  
  if (res.status !== 200) {
    console.log('ERROR: Bulk add failed');
    return false;
  }
  
  return true;
}

async function getTeamMembers(token) {
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.members || [];
}

(async () => {
  console.log('Starting test...');
  try {
    console.log('Attempting login...');
    const token = await loginAndGetToken();
    console.log('Login successful!');
    
    console.log('\n--- Team members before bulk add ---');
    const membersBefore = await getTeamMembers(token);
    console.log(`Total members: ${membersBefore.length}`);
    membersBefore.forEach((m, i) => {
      console.log(`${i + 1}. ${m.user.full_name} - ${m.user.email}`);
    });
    
    const success = await testBulkAdd(token);
    
    if (success) {
      console.log('\n--- Team members after bulk add ---');
      const membersAfter = await getTeamMembers(token);
      console.log(`Total members: ${membersAfter.length}`);
      membersAfter.forEach((m, i) => {
        console.log(`${i + 1}. ${m.user.full_name} - ${m.user.email}`);
      });
    }    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
})();
