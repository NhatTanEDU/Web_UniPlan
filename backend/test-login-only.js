// Test login API
const axios = require('axios');

async function testLoginAPI() {
  try {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🔑 Testing login...');
    console.log('🌐 URL:', `${baseURL}/auth/login`);
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin1@gmail.com',
      password: '123456'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful:', {
      status: loginResponse.status,
      token: loginResponse.data.token ? 'Token received' : 'No token',
      userId: loginResponse.data.user?.id,
      userName: loginResponse.data.user?.full_name,
      email: loginResponse.data.user?.email
    });
    
  } catch (error) {
    console.error('❌ Login failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      code: error.code,
      url: error.config?.url
    });
  }
}

testLoginAPI();
