// 🧪 QUICK TEST - Verify API response structure
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = { email: 'admin1@gmail.com', password: '123456' };

async function quickTest() {
  console.log('🚀 Quick API Structure Test');
  console.log('==========================');
  
  try {
    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginRes.data.token;
    
    // Test API
    const response = await axios.get(`${BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = response.data;
    
    console.log('📊 API Response Analysis:');
    console.log(`   Type: ${typeof data}`);
    console.log(`   Is Array: ${Array.isArray(data)}`);
    console.log(`   Length: ${Array.isArray(data) ? data.length : 'N/A'}`);
    console.log(`   Can use .map(): ${Array.isArray(data) ? '✅ YES' : '❌ NO'}`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   First project: ${data[0].project_name || 'No name'}`);
      console.log(`   Sample keys: ${Object.keys(data[0]).slice(0, 5).join(', ')}`);
    }
    
    console.log('\n🎯 Result: API returns', Array.isArray(data) ? 'ARRAY ✅' : 'OBJECT ❌');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

quickTest();
