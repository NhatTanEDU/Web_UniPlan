// Test individual add member API
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'admin1@gmail.com';
const PASSWORD = '123456';
const TEAM_ID = '683f3c43403cc6904ca1a395';

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

async function testIndividualAdd(token) {
  const userId = '68334e4c74b4826aec61963e';
  const role = 'Member';
  
  console.log('Testing individual add...');
  console.log(`URL: ${BASE_URL}/teams/${TEAM_ID}/members`);
  console.log('Payload:', { user_id: userId, role });
  
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId, role })
  });
  
  console.log('Response status:', res.status);
  const data = await res.text();
  console.log('Response body:', data);
  
  return res.status >= 200 && res.status < 300;
}

(async () => {
  try {
    const token = await loginAndGetToken();
    console.log('Login successful!');
    
    const success = await testIndividualAdd(token);
    console.log('Individual add success:', success);
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
