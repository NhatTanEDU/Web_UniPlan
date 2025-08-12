// 🧪 Test API response structure để debug frontend issue
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'admin1@gmail.com',
  password: '123456'
};

async function testAPIStructure() {
  console.log('🧪 Testing API Response Structure');
  console.log('=================================');

  try {
    // Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test API without pagination
    console.log('\n📋 Testing WITHOUT pagination:');
    const response1 = await axios.get(`${BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📊 Response type: ${Array.isArray(response1.data) ? 'Array' : 'Object'}`);
    console.log(`📊 Data length: ${response1.data.length || 'N/A'}`);
    console.log(`📊 First item keys:`, Object.keys(response1.data[0] || {}));

    // Test API with pagination  
    console.log('\n📋 Testing WITH pagination (?limit=2):');
    const response2 = await axios.get(`${BASE_URL}/projects?limit=2`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📊 Response type: ${Array.isArray(response2.data) ? 'Array' : 'Object'}`);
    console.log(`📊 Data length: ${response2.data.length || 'N/A'}`);
    console.log(`📊 Headers:`, response2.headers['x-total-projects']);
    
    // Test what frontend expects
    console.log('\n🔧 Testing .map() function:');
    try {
      const mappedResult = response1.data.map(project => project.project_name);
      console.log('✅ .map() works! First 3 names:', mappedResult.slice(0, 3));
    } catch (error) {
      console.log('❌ .map() failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPIStructure();
