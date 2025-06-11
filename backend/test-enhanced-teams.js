// Test file for enhanced team functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test function
async function testEnhancedTeamEndpoints() {
  console.log('🧪 Testing Enhanced Team Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/teams-enhanced/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Team Statistics (without auth for now)
    console.log('2. Testing Team Statistics...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/teams-enhanced/stats/overview`);
      console.log('✅ Stats Overview:', statsResponse.data);
    } catch (error) {
      console.log('⚠️ Stats need authentication:', error.response?.status);
    }
    console.log('');

    // Test 3: Rate Limiting
    console.log('3. Testing Rate Limiting...');
    let rateLimitCount = 0;
    for (let i = 0; i < 5; i++) {
      try {
        await axios.get(`${BASE_URL}/teams-enhanced/health`);
        rateLimitCount++;
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('✅ Rate limiting working after', rateLimitCount, 'requests');
          break;
        }
      }
    }
    console.log('');

    // Test 4: Search endpoint structure
    console.log('4. Testing Search Endpoint Structure...');
    try {
      const searchResponse = await axios.get(`${BASE_URL}/teams-enhanced/search?query=test`);
      console.log('✅ Search endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Search requires authentication (expected)');
      } else {
        console.log('⚠️ Search error:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Export for use in other files
module.exports = { testEnhancedTeamEndpoints };

// Run tests if called directly
if (require.main === module) {
  testEnhancedTeamEndpoints();
}
