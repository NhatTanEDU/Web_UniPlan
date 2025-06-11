// Test script for Enhanced Teams API - New Features
const http = require('http');
const https = require('https');

// Ignore SSL certificate errors for local testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const baseURL = 'http://localhost:5000';
const authToken = 'your-test-token-here'; // Replace with actual token for authenticated tests

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }
};

// Utility function to make HTTP requests
function makeRequest(method, path, data = null, authenticated = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      method,
      headers: authenticated ? testConfig.headers : { 'Content-Type': 'application/json' },
      timeout: testConfig.timeout
    };

    const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test helper function
async function runTest(testName, testFn) {
  console.log(`\n🧪 ${testName}`);
  console.log('=' + '='.repeat(testName.length + 3));
  
  try {
    const startTime = Date.now();
    const result = await testFn();
    const endTime = Date.now();
    
    console.log(`✅ PASS (${endTime - startTime}ms)`);
    if (result && typeof result === 'object') {
      console.log(`📊 Status: ${result.status}`);
      if (result.data && result.data.status) {
        console.log(`📝 Response: ${result.data.message || 'No message'}`);
      }
    }
    return result;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    return null;
  }
}

// Test functions
async function testHealthEndpoint() {
  const response = await makeRequest('GET', '/api/teams-enhanced/health', null, false);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.status || response.data.status !== 'success') {
    throw new Error('Health check should return success status');
  }
  
  return response;
}

async function testActivityFeed() {
  // Test basic activity feed
  const response = await makeRequest('GET', '/api/teams-enhanced/activity');
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.data || !response.data.data.activities) {
    throw new Error('Activity feed should return activities array');
  }
  
  // Test with filters
  const filteredResponse = await makeRequest('GET', '/api/teams-enhanced/activity?type=team_created&limit=5');
  
  if (filteredResponse.status !== 200) {
    throw new Error(`Filtered request failed with status ${filteredResponse.status}`);
  }
  
  return response;
}

async function testTeamHealthCheck() {
  const teamId = 'test-team-id';
  const response = await makeRequest('GET', `/api/teams-enhanced/health/${teamId}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const healthData = response.data.data;
  if (!healthData.metrics || !healthData.overallScore) {
    throw new Error('Health check should return metrics and overall score');
  }
  
  // Verify required metrics
  const requiredMetrics = ['communication', 'productivity', 'collaboration', 'engagement', 'goalAlignment', 'workloadBalance'];
  for (const metric of requiredMetrics) {
    if (!healthData.metrics[metric]) {
      throw new Error(`Missing required metric: ${metric}`);
    }
  }
  
  return response;
}

async function testRecommendations() {
  // Test basic recommendations
  const response = await makeRequest('GET', '/api/teams-enhanced/recommendations');
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.data || !response.data.data.recommendations) {
    throw new Error('Recommendations should return recommendations array');
  }
  
  // Test with type filter
  const filteredResponse = await makeRequest('GET', '/api/teams-enhanced/recommendations?type=team_formation&limit=3');
  
  if (filteredResponse.status !== 200) {
    throw new Error(`Filtered recommendations failed with status ${filteredResponse.status}`);
  }
  
  // Test recommendation feedback
  const feedbackResponse = await makeRequest('POST', '/api/teams-enhanced/recommendations/1/feedback', {
    helpful: true,
    rating: 4,
    comment: 'Very useful recommendation!'
  });
  
  if (feedbackResponse.status !== 200) {
    throw new Error(`Feedback submission failed with status ${feedbackResponse.status}`);
  }
  
  return response;
}

async function testNotifications() {
  // Test basic notifications
  const response = await makeRequest('GET', '/api/teams-enhanced/notifications');
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.data || !response.data.data.notifications) {
    throw new Error('Notifications should return notifications array');
  }
  
  // Test with filters
  const unreadResponse = await makeRequest('GET', '/api/teams-enhanced/notifications?status=unread');
  if (unreadResponse.status !== 200) {
    throw new Error(`Unread notifications filter failed with status ${unreadResponse.status}`);
  }
  
  // Test mark as read
  const markReadResponse = await makeRequest('PATCH', '/api/teams-enhanced/notifications/read', {
    notificationIds: ['1', '2']
  });
  
  if (markReadResponse.status !== 200) {
    throw new Error(`Mark as read failed with status ${markReadResponse.status}`);
  }
  
  // Test star notification
  const starResponse = await makeRequest('PATCH', '/api/teams-enhanced/notifications/1/star', {
    starred: true
  });
  
  if (starResponse.status !== 200) {
    throw new Error(`Star notification failed with status ${starResponse.status}`);
  }
  
  return response;
}

async function testRateLimiting() {
  console.log('🔄 Testing rate limiting (making multiple rapid requests)...');
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest('GET', '/api/teams-enhanced/health', null, false));
  }
  
  const responses = await Promise.all(promises);
  const statusCodes = responses.map(r => r.status);
  
  console.log(`📊 Status codes: ${statusCodes.join(', ')}`);
  
  return { statusCodes };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Enhanced Teams API - New Features Testing');
  console.log('='.repeat(50));
  console.log(`📅 Test started at: ${new Date().toISOString()}`);
  console.log(`🎯 Base URL: ${baseURL}`);
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Test suite
  const tests = [
    ['Health Check Endpoint', testHealthEndpoint],
    ['Team Activity Feed', testActivityFeed],
    ['Team Health Check', testTeamHealthCheck],
    ['Recommendations System', testRecommendations],
    ['Notifications Management', testNotifications],
    ['Rate Limiting', testRateLimiting]
  ];
  
  for (const [testName, testFn] of tests) {
    results.total++;
    const result = await runTest(testName, testFn);
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Enhanced Teams API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server and endpoints.');
  }
  
  console.log(`\n⏰ Test completed at: ${new Date().toISOString()}`);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testHealthEndpoint,
  testActivityFeed,
  testTeamHealthCheck,
  testRecommendations,
  testNotifications,
  testRateLimiting
};
