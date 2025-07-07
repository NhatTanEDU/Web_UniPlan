const axios = require('axios');

// Test the personal members endpoint
async function testPersonalMembersEndpoint() {
  // Replace this with your actual token from Postman
  const token = 'PASTE_YOUR_TOKEN_HERE';
  
  const config = {
    method: 'get',
    url: 'http://localhost:5000/api/personal-members/search',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: {
      search: 'test'
    }
  };

  try {
    const response = await axios.request(config);
    console.log('✅ Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.status);
      console.log('❌ Error Message:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

// Test login first
async function testLogin() {
  const loginConfig = {
    method: 'post',
    url: 'http://localhost:5000/api/auth/login',
    headers: {
      'Content-Type': 'application/json'
    },    data: {
      email: 'tanmoi@example2.com',
      password: '12345678'
    }
  };

  try {
    const response = await axios.request(loginConfig);
    console.log('✅ Login Success:', response.data);
    
    // Extract token and test the personal members endpoint
    const token = response.data.token;
      const searchConfig = {
      method: 'get',
      url: 'http://localhost:5000/api/personal-members/search',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },      params: {
        query: 'tan'
      }
    };
    
    const searchResponse = await axios.request(searchConfig);
    console.log('✅ Search Success:', searchResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.status);
      console.log('❌ Error Message:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

console.log('Testing login and personal members endpoint...');
testLogin();
