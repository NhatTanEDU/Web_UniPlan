const fetch = require('node-fetch');

// Mock token - you'll need to replace this with an actual token
const token = 'your_jwt_token_here';

async function testAPI() {
  try {
    console.log('Testing Teams API...');
    
    const response = await fetch('http://localhost:5000/api/teams', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    if (data && data.data) {
      console.log('data.data type:', typeof data.data);
      console.log('data.data is array:', Array.isArray(data.data));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
