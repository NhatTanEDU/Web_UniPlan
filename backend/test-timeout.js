// backend/test-timeout.js
// Script để test timeout middleware
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testTimeoutMiddleware() {
  console.log('🧪 Testing timeout middleware...\n');

  // Test 1: Test với endpoint bình thường
  console.log('📍 Test 1: Testing normal endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 20000 // Client timeout 20s
    });
    console.log('✅ Normal endpoint response:', response.status);
  } catch (error) {
    console.error('❌ Normal endpoint error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Test với endpoint có thể gây treo (nếu có team data)
  console.log('📍 Test 2: Testing potentially hanging endpoint...');
  try {
    // Thử gọi endpoint teams với token nếu có
    const response = await axios.get(`${BASE_URL}/api/teams`, {
      headers: {
        'Authorization': 'Bearer your-test-token-here' // Thay bằng token thật
      },
      timeout: 20000 // Client timeout 20s
    });
    console.log('✅ Teams endpoint response:', response.status);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timed out from client side');
    } else if (error.response && error.response.status === 503) {
      console.log('✅ Server timeout middleware worked! Status:', error.response.status);
      console.log('✅ Server response:', error.response.data);
    } else {
      console.error('❌ Other error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Tạo request giả mạo để test timeout
  console.log('📍 Test 3: Testing with simulated slow endpoint...');
  console.log('ℹ️  Note: This test requires a slow endpoint to be implemented');
  console.log('ℹ️  Current timeout is set to 15 seconds');
  
  console.log('\n🎯 Timeout testing completed!');
  console.log('💡 Check your server logs for detailed timeout information');
  console.log('💡 Look for lines starting with 🔥 or ❌ for timeout events');
}

// Helper để tạo fake slow endpoint (chỉ để test)
function createSlowEndpointTest() {
  console.log('\n🛠️  To create a slow endpoint for testing, add this to your routes:');
  console.log(`
// Test route - REMOVE in production
app.get('/api/test-slow', (req, res) => {
  console.log('⏳ Slow endpoint called - will take 20 seconds...');
  setTimeout(() => {
    res.json({ message: 'This should never reach if timeout works' });
  }, 20000); // 20 seconds - longer than 15s timeout
});
`);
  console.log('Then test with: curl http://localhost:5000/api/test-slow');
}

// Chạy test
if (require.main === module) {
  testTimeoutMiddleware();
  createSlowEndpointTest();
}

module.exports = { testTimeoutMiddleware };
