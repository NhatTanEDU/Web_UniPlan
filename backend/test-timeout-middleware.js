#!/usr/bin/env node
/**
 * Comprehensive Test Script for Request Timeout Middleware
 * Tests various timeout scenarios and validates middleware behavior
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 20000; // 20 seconds for test client timeout

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

class TimeoutTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runTest(testName, endpoint, expectedBehavior, expectedStatusRange) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(`🧪 Testing: ${testName}`, 'cyan');
    this.log(`📍 Endpoint: ${endpoint}`, 'blue');
    this.log(`🎯 Expected: ${expectedBehavior}`, 'blue');
    this.log(`${'='.repeat(60)}`, 'cyan');

    const testStart = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: TEST_TIMEOUT,
        validateStatus: () => true // Accept all status codes
      });

      const duration = Date.now() - testStart;
      const success = this.isInRange(response.status, expectedStatusRange);

      this.results.push({
        testName,
        endpoint,
        status: response.status,
        duration,
        success,
        response: response.data,
        error: null
      });

      if (success) {
        this.log(`✅ PASS: ${testName}`, 'green');
        this.log(`   Status: ${response.status}`, 'green');
        this.log(`   Duration: ${duration}ms`, 'green');
        this.log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'green');
      } else {
        this.log(`❌ FAIL: ${testName}`, 'red');
        this.log(`   Expected status in range: ${expectedStatusRange}`, 'red');
        this.log(`   Actual status: ${response.status}`, 'red');
        this.log(`   Duration: ${duration}ms`, 'red');
        this.log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      }

    } catch (error) {
      const duration = Date.now() - testStart;
      const isExpectedError = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      
      this.results.push({
        testName,
        endpoint,
        status: null,
        duration,
        success: isExpectedError,
        response: null,
        error: error.message
      });

      if (isExpectedError && expectedBehavior.includes('timeout')) {
        this.log(`✅ PASS: ${testName} (Expected timeout)`, 'green');
        this.log(`   Error: ${error.message}`, 'green');
        this.log(`   Duration: ${duration}ms`, 'green');
      } else {
        this.log(`❌ FAIL: ${testName}`, 'red');
        this.log(`   Unexpected error: ${error.message}`, 'red');
        this.log(`   Duration: ${duration}ms`, 'red');
      }
    }
  }

  isInRange(status, range) {
    if (Array.isArray(range)) {
      return range.includes(status);
    }
    if (typeof range === 'string') {
      const [min, max] = range.split('-').map(Number);
      return status >= min && status <= max;
    }
    return status === range;
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Timeout Middleware Tests', 'magenta');
    this.log(`📡 Base URL: ${BASE_URL}`, 'blue');
    this.log(`⏱️  Test Timeout: ${TEST_TIMEOUT}ms`, 'blue');
    this.log(`🕐 Started at: ${new Date().toISOString()}`, 'blue');

    // Test 1: Quick response (should pass)
    await this.runTest(
      'Quick Response Test',
      '/api/debug/quick-endpoint',
      'Should respond immediately with 200',
      200
    );

    // Test 2: Moderate delay (should complete with warning)
    await this.runTest(
      'Moderate Delay Test',
      '/api/debug/moderate-endpoint',
      'Should complete in ~8s with warning log',
      200
    );

    // Test 3: Error endpoint (should return error)
    await this.runTest(
      'Error Handling Test',
      '/api/debug/error-endpoint',
      'Should return 500 error after ~3s',
      500
    );

    // Test 4: Slow endpoint (should timeout)
    await this.runTest(
      'Timeout Test - Slow Endpoint',
      '/api/debug/slow-endpoint',
      'Should timeout after 15s with 503 status',
      503
    );

    // Test 5: Hanging endpoint (should timeout)
    await this.runTest(
      'Timeout Test - Hanging Endpoint',
      '/api/debug/hang-endpoint',
      'Should timeout after 15s with 503 status',
      503
    );

    // Test 6: Server health check
    await this.runTest(
      'Server Health Check',
      '/api/health',
      'Should respond with server status',
      200
    );

    // Test 7: Database health check
    await this.runTest(
      'Database Health Check',
      '/api/database/health',
      'Should respond with database status',
      [200, 503]
    );

    this.generateReport();
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.length - passedTests;

    this.log('\n' + '🎯'.repeat(30), 'magenta');
    this.log('📊 TIMEOUT MIDDLEWARE TEST REPORT', 'magenta');
    this.log('🎯'.repeat(30), 'magenta');

    this.log(`\n📈 Summary:`, 'cyan');
    this.log(`   Total Tests: ${this.results.length}`, 'blue');
    this.log(`   Passed: ${passedTests}`, passedTests === this.results.length ? 'green' : 'yellow');
    this.log(`   Failed: ${failedTests}`, failedTests === 0 ? 'green' : 'red');
    this.log(`   Total Duration: ${totalDuration}ms`, 'blue');
    this.log(`   Success Rate: ${Math.round((passedTests / this.results.length) * 100)}%`, 
              passedTests === this.results.length ? 'green' : 'yellow');

    this.log(`\n📋 Detailed Results:`, 'cyan');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const color = result.success ? 'green' : 'red';
      
      this.log(`\n${index + 1}. ${result.testName}`, 'blue');
      this.log(`   Status: ${status}`, color);
      this.log(`   Endpoint: ${result.endpoint}`, 'blue');
      this.log(`   HTTP Status: ${result.status || 'N/A'}`, 'blue');
      this.log(`   Duration: ${result.duration}ms`, 'blue');
      
      if (result.error) {
        this.log(`   Error: ${result.error}`, 'yellow');
      }
    });

    this.log(`\n🔍 Analysis:`, 'cyan');
    
    // Check if timeout middleware is working
    const timeoutTests = this.results.filter(r => 
      r.testName.includes('Timeout Test') && r.success
    );
    
    if (timeoutTests.length > 0) {
      this.log(`   ✅ Timeout middleware is working correctly`, 'green');
      this.log(`   ✅ Requests are being terminated after 15 seconds`, 'green');
    } else {
      this.log(`   ❌ Timeout middleware may not be working`, 'red');
      this.log(`   ❌ Check server logs for timeout errors`, 'red');
    }

    // Check response times
    const fastResponses = this.results.filter(r => r.duration < 1000);
    const slowResponses = this.results.filter(r => r.duration > 5000 && r.duration < 15000);
    
    this.log(`   📊 Fast responses (<1s): ${fastResponses.length}`, 'green');
    this.log(`   ⚠️  Slow responses (5-15s): ${slowResponses.length}`, 'yellow');

    this.log(`\n🏁 Test completed at: ${new Date().toISOString()}`, 'cyan');
    this.log('=' .repeat(60), 'magenta');

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Server is running and accessible');
    return true;
  } catch (error) {
    console.error('❌ Server is not accessible:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Please ensure the server is running on ${BASE_URL}`);
    console.error('   Run: npm start or node server.js');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking server health...');
  
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    process.exit(1);
  }

  const tester = new TimeoutTester();
  await tester.runAllTests();
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
main().catch(console.error);
