// backend/test-timeout-middleware-enhanced.js
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TIMEOUT_MS = 16000; // Slightly higher than server timeout to see actual timeouts

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function for colored console output
function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Store authentication token
let authToken = null;

// Login function to get authentication token
async function login() {
  try {
    colorLog('\n🔐 Attempting to login for authenticated endpoints...', 'yellow');
    
    // Try to login with test credentials
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com', // Change this to valid test credentials
      password: 'password123'      // Change this to valid test credentials
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (loginResponse.data && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      colorLog('✅ Login successful! Token obtained.', 'green');
      return true;
    } else {
      colorLog('❌ Login failed: No token received', 'red');
      return false;
    }
  } catch (error) {
    colorLog(`❌ Login failed: ${error.response?.data?.message || error.message}`, 'red');
    colorLog('⚠️  Will proceed with public endpoints only', 'yellow');
    return false;
  }
}

// Test function for individual endpoints
async function testEndpoint(name, url, expectedDuration, shouldTimeout = false, requiresAuth = false) {
  const startTime = Date.now();
  
  try {
    colorLog(`\n📍 Testing: ${name}`, 'blue');
    colorLog(`   URL: ${url}`, 'cyan');
    colorLog(`   Expected Duration: ~${expectedDuration}ms`, 'cyan');
    colorLog(`   Should Timeout: ${shouldTimeout ? 'YES' : 'NO'}`, shouldTimeout ? 'red' : 'green');
    colorLog(`   Requires Auth: ${requiresAuth ? 'YES' : 'NO'}`, requiresAuth ? 'yellow' : 'green');
    
    const config = {
      timeout: TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authorization header if required and token is available
    if (requiresAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    } else if (requiresAuth && !authToken) {
      colorLog(`   ⚠️  Skipping authenticated endpoint (no token)`, 'yellow');
      return {
        name,
        status: 'SKIPPED',
        reason: 'No authentication token',
        duration: 0
      };
    }
    
    const response = await axios.get(url, config);
    const duration = Date.now() - startTime;
    
    if (shouldTimeout) {
      colorLog(`   ❌ UNEXPECTED: Request completed (should have timed out)`, 'red');
      colorLog(`   Duration: ${duration}ms`, 'red');
      colorLog(`   Status: ${response.status}`, 'red');
      return {
        name,
        status: 'UNEXPECTED_SUCCESS',
        duration,
        httpStatus: response.status
      };
    } else {
      colorLog(`   ✅ SUCCESS: Request completed normally`, 'green');
      colorLog(`   Duration: ${duration}ms`, 'green');
      colorLog(`   Status: ${response.status}`, 'green');
      return {
        name,
        status: 'SUCCESS',
        duration,
        httpStatus: response.status
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      if (shouldTimeout) {
        colorLog(`   ✅ EXPECTED: Request timed out as expected`, 'green');
        colorLog(`   Duration: ${duration}ms`, 'green');
        return {
          name,
          status: 'EXPECTED_TIMEOUT',
          duration
        };
      } else {
        colorLog(`   ❌ UNEXPECTED: Request timed out (should have completed)`, 'red');
        colorLog(`   Duration: ${duration}ms`, 'red');
        return {
          name,
          status: 'UNEXPECTED_TIMEOUT',
          duration
        };
      }
    } else if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      colorLog(`   ❌ ERROR: Server responded with ${statusCode}`, 'red');
      colorLog(`   Duration: ${duration}ms`, 'red');
      colorLog(`   Error: ${error.response.data?.message || error.message}`, 'red');
      
      if (statusCode === 503 && shouldTimeout) {
        colorLog(`   ✅ EXPECTED: Server timeout (503) as expected`, 'green');
        return {
          name,
          status: 'EXPECTED_SERVER_TIMEOUT',
          duration,
          httpStatus: statusCode
        };
      }
      
      return {
        name,
        status: 'ERROR',
        duration,
        httpStatus: statusCode,
        error: error.response.data?.message || error.message
      };
    } else {
      colorLog(`   ❌ NETWORK ERROR: ${error.message}`, 'red');
      colorLog(`   Duration: ${duration}ms`, 'red');
      return {
        name,
        status: 'NETWORK_ERROR',
        duration,
        error: error.message
      };
    }
  }
}

// Main test function
async function runTimeoutTests() {
  colorLog('🚀 Starting Enhanced Timeout Middleware Test Suite', 'bright');
  colorLog('=' * 60, 'cyan');
  
  const results = [];
  
  // Step 1: Check server connectivity
  colorLog('\n📡 Step 1: Checking server connectivity...', 'bright');
  
  try {
    await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    colorLog('✅ Server is running and accessible', 'green');
  } catch (error) {
    colorLog('❌ Cannot connect to server. Please ensure the backend is running on port 5000.', 'red');
    colorLog(`Error: ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 2: Attempt login
  colorLog('\n🔐 Step 2: Authentication setup...', 'bright');
  const loginSuccess = await login();
  
  // Step 3: Run endpoint tests
  colorLog('\n🧪 Step 3: Running endpoint tests...', 'bright');
  
  const tests = [
    {
      name: 'Health Check (Public)',
      url: `${BASE_URL}/api/health`,
      expectedDuration: 100,
      shouldTimeout: false,
      requiresAuth: false
    },
    {
      name: 'Quick Response',
      url: `${BASE_URL}/api/debug/quick-endpoint`,
      expectedDuration: 100,
      shouldTimeout: false,
      requiresAuth: false
    },
    {
      name: 'Moderate Response (8s)',
      url: `${BASE_URL}/api/debug/moderate-endpoint`,
      expectedDuration: 8000,
      shouldTimeout: false,
      requiresAuth: false
    },
    {
      name: 'Slow Response (20s - Should Timeout)',
      url: `${BASE_URL}/api/debug/slow-endpoint`,
      expectedDuration: 20000,
      shouldTimeout: true,
      requiresAuth: false
    },
    {
      name: 'Hanging Endpoint (Infinite - Should Timeout)',
      url: `${BASE_URL}/api/debug/hang-endpoint`,
      expectedDuration: 999999,
      shouldTimeout: true,
      requiresAuth: false
    },
    {
      name: 'Error Endpoint (3s then error)',
      url: `${BASE_URL}/api/debug/error-endpoint`,
      expectedDuration: 3000,
      shouldTimeout: false,
      requiresAuth: false
    }
  ];

  // Add authenticated tests if login was successful
  if (loginSuccess) {
    tests.push({
      name: 'System Status (Authenticated)',
      url: `${BASE_URL}/api/system/status`,
      expectedDuration: 200,
      shouldTimeout: false,
      requiresAuth: true
    });
  }
  
  for (const test of tests) {
    const result = await testEndpoint(
      test.name,
      test.url,
      test.expectedDuration,
      test.shouldTimeout,
      test.requiresAuth
    );
    results.push(result);
    
    // Wait between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Step 4: Display results summary
  colorLog('\n📊 Step 4: Test Results Summary', 'bright');
  colorLog('=' * 60, 'cyan');
  
  const successful = results.filter(r => 
    r.status === 'SUCCESS' || 
    r.status === 'EXPECTED_TIMEOUT' || 
    r.status === 'EXPECTED_SERVER_TIMEOUT'
  );
  const failed = results.filter(r => 
    r.status === 'UNEXPECTED_SUCCESS' || 
    r.status === 'UNEXPECTED_TIMEOUT' || 
    r.status === 'ERROR' || 
    r.status === 'NETWORK_ERROR'
  );
  const skipped = results.filter(r => r.status === 'SKIPPED');
  
  colorLog(`\n📈 SUMMARY:`, 'bright');
  colorLog(`   Total Tests: ${results.length}`, 'cyan');
  colorLog(`   ✅ Successful: ${successful.length}`, 'green');
  colorLog(`   ❌ Failed: ${failed.length}`, failed.length > 0 ? 'red' : 'green');
  colorLog(`   ⏭️  Skipped: ${skipped.length}`, skipped.length > 0 ? 'yellow' : 'cyan');
  
  colorLog(`\n📋 DETAILED RESULTS:`, 'bright');
  results.forEach((result, index) => {
    const icon = getStatusIcon(result.status);
    const color = getStatusColor(result.status);
    colorLog(`   ${index + 1}. ${icon} ${result.name}`, color);
    colorLog(`      Status: ${result.status}`, color);
    colorLog(`      Duration: ${result.duration}ms`, 'cyan');
    if (result.httpStatus) {
      colorLog(`      HTTP Status: ${result.httpStatus}`, 'cyan');
    }
    if (result.error) {
      colorLog(`      Error: ${result.error}`, 'red');
    }
    if (result.reason) {
      colorLog(`      Reason: ${result.reason}`, 'yellow');
    }
  });
  
  // Step 5: Recommendations
  colorLog('\n💡 Step 5: Recommendations', 'bright');
  colorLog('=' * 60, 'cyan');
  
  if (failed.length === 0) {
    colorLog('🎉 All tests passed! Timeout middleware is working correctly.', 'green');
  } else {
    colorLog('⚠️  Some tests failed. Please check the following:', 'yellow');
    failed.forEach(result => {
      colorLog(`   - ${result.name}: ${result.status}`, 'red');
    });
  }
  
  colorLog('\n✅ Enhanced Timeout Middleware Test Complete!', 'bright');
}

// Helper functions
function getStatusIcon(status) {
  switch (status) {
    case 'SUCCESS': return '✅';
    case 'EXPECTED_TIMEOUT': return '✅';
    case 'EXPECTED_SERVER_TIMEOUT': return '✅';
    case 'UNEXPECTED_SUCCESS': return '❌';
    case 'UNEXPECTED_TIMEOUT': return '❌';
    case 'ERROR': return '❌';
    case 'NETWORK_ERROR': return '🔌';
    case 'SKIPPED': return '⏭️';
    default: return '❓';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'SUCCESS': return 'green';
    case 'EXPECTED_TIMEOUT': return 'green';
    case 'EXPECTED_SERVER_TIMEOUT': return 'green';
    case 'UNEXPECTED_SUCCESS': return 'red';
    case 'UNEXPECTED_TIMEOUT': return 'red';
    case 'ERROR': return 'red';
    case 'NETWORK_ERROR': return 'red';
    case 'SKIPPED': return 'yellow';
    default: return 'cyan';
  }
}

// Run the tests
if (require.main === module) {
  runTimeoutTests().catch(error => {
    colorLog(`\n💥 Test suite crashed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runTimeoutTests, testEndpoint };
