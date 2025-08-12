// 🚀 TEST SCRIPT - Kiểm tra performance API projects sau optimization
const axios = require('axios');

// Cấu hình
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'admin1@gmail.com',
  password: '123456'
};

async function loginUser() {
  console.log('🔐 Đang đăng nhập...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER, {
      timeout: 10000
    });
    
    console.log('✅ Đăng nhập thành công');
    return response.data.token;
  } catch (error) {
    console.error('❌ Đăng nhập thất bại:', error.response?.data || error.message);
    throw error;
  }
}

async function testProjectsAPI(token) {
  console.log('\n🧪 Testing /api/projects with pagination...');
  
  const tests = [
    { page: 1, limit: 10, description: 'First 10 projects' },
    { page: 1, limit: 20, description: 'First 20 projects (default)' },
    { page: 2, limit: 10, description: 'Second page (10 items)' }
  ];

  for (const test of tests) {
    const testId = `PROJECTS-TEST-${Date.now()}`;
    console.log(`\n📋 ${test.description}:`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/projects`, {
        params: {
          page: test.page,
          limit: test.limit
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 giây timeout
      });
      
      const duration = Date.now() - startTime;
      const data = response.data;
      
      console.log(`✅ SUCCESS! Response time: ${duration}ms`);
      console.log(`📊 Projects returned: ${data.projects?.length || 0}`);
      console.log(`📄 Pagination:`, data.pagination);
      console.log(`📝 Response size: ~${JSON.stringify(data).length / 1024}KB`);
      
      // Kiểm tra performance
      if (duration < 1000) {
        console.log('🚀 EXCELLENT performance (< 1s)');
      } else if (duration < 3000) {
        console.log('✅ GOOD performance (< 3s)');
      } else if (duration < 10000) {
        console.log('⚠️ ACCEPTABLE performance (< 10s)');
      } else {
        console.log('❌ POOR performance (> 10s)');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ FAILED after ${duration}ms:`, error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        console.log('🚫 Rate limited - this is expected behavior for concurrent requests');
      }
    }
    
    // Đợi 1 giây giữa các tests để tránh rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testConcurrentRequests(token) {
  console.log('\n🔄 Testing concurrent requests (should be blocked by rate limiting)...');
  
  const promises = [];
  for (let i = 0; i < 3; i++) {
    promises.push(
      axios.get(`${BASE_URL}/projects`, {
        params: { page: 1, limit: 5 },
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      }).catch(error => ({
        error: true,
        status: error.response?.status,
        message: error.response?.data?.error || error.message
      }))
    );
  }
  
  const results = await Promise.all(promises);
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  results.forEach((result, index) => {
    if (result.error) {
      if (result.status === 429) {
        rateLimitedCount++;
        console.log(`🚫 Request ${index + 1}: Rate limited (expected)`);
      } else {
        console.log(`❌ Request ${index + 1}: Error - ${result.message}`);
      }
    } else {
      successCount++;
      console.log(`✅ Request ${index + 1}: Success`);
    }
  });
  
  console.log(`\n📊 Results: ${successCount} successful, ${rateLimitedCount} rate-limited`);
  
  if (successCount === 1 && rateLimitedCount >= 1) {
    console.log('🎯 PERFECT! Rate limiting is working correctly');
  } else if (successCount > 1) {
    console.log('⚠️ Multiple requests succeeded - rate limiting may be too lenient');
  }
}

async function runTests() {
  try {
    console.log('🧪 UniPlan Projects API Performance Test');
    console.log('=========================================');
    
    const token = await loginUser();
    
    await testProjectsAPI(token);
    await testConcurrentRequests(token);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
}

// Run tests
runTests();
