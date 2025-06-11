#!/usr/bin/env node

/**
 * Safe Mode Verification Test
 * Tests that the server is running in safe mode with only essential features
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test configuration
const testConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🧪 SAFE MODE VERIFICATION TEST');
console.log('==============================');

async function testSystemStatus() {
  console.log('\n📊 Testing System Status...');
  try {
    const response = await axios.get(`${API_BASE}/system/status`, testConfig);
    
    if (response.status === 200) {
      console.log('✅ System Status: OK');
      console.log(`   🎯 Features enabled: ${response.data.features.enabled.length}`);
      console.log(`   ⚠️  Features disabled: ${response.data.features.disabled.length}`);
      
      // Check critical features
      const enabled = response.data.features.enabled;
      const disabled = response.data.features.disabled;
      
      if (enabled.includes('SIMPLE_SEARCH')) {
        console.log('   ✅ Simple Search: ENABLED');
      } else {
        console.log('   ❌ Simple Search: DISABLED (This should be enabled!)');
      }
      
      if (disabled.includes('ENHANCED_TEAMS')) {
        console.log('   ✅ Enhanced Teams: SAFELY DISABLED');
      }
      
      if (disabled.includes('SOCKET_IO')) {
        console.log('   ✅ Socket.IO: SAFELY DISABLED');
      }
      
      return true;
    }
  } catch (error) {
    console.log('❌ System Status Failed:', error.message);
    return false;
  }
}

async function testSimpleSearchHealth() {
  console.log('\n🔍 Testing Simple Search Health...');
  try {
    const response = await axios.get(`${API_BASE}/teams-simple/health`, testConfig);
    
    if (response.status === 200) {
      console.log('✅ Simple Search Health: OK');
      console.log(`   📝 Message: ${response.data.message}`);
      console.log(`   🎯 Features: ${response.data.features.length} available`);
      return true;
    }
  } catch (error) {
    console.log('❌ Simple Search Health Failed:', error.message);
    return false;
  }
}

async function testDisabledFeatures() {
  console.log('\n🚫 Testing Disabled Features (Should fail gracefully)...');
  
  const disabledEndpoints = [
    { name: 'Enhanced Teams', url: `${API_BASE}/teams-enhanced/health` },
    { name: 'Notifications', url: `${API_BASE}/notifications` },
    { name: 'Advanced Widgets', url: `${API_BASE}/widgets` }
  ];
  
  let disabledCount = 0;
  
  for (const endpoint of disabledEndpoints) {
    try {
      const response = await axios.get(endpoint.url, testConfig);
      
      if (response.status === 503 && response.data.error === 'FEATURE_DISABLED') {
        console.log(`   ✅ ${endpoint.name}: Properly disabled`);
        disabledCount++;
      } else {
        console.log(`   ⚠️  ${endpoint.name}: Unexpectedly enabled`);
      }
    } catch (error) {
      if (error.response?.status === 503) {
        console.log(`   ✅ ${endpoint.name}: Properly disabled`);
        disabledCount++;
      } else {
        console.log(`   ❓ ${endpoint.name}: ${error.message}`);
      }
    }
  }
  
  return disabledCount > 0;
}

async function testBasicAuthEndpoints() {
  console.log('\n🔐 Testing Basic Auth Endpoints...');
  
  const authEndpoints = [
    `${API_BASE}/auth/register`,
    `${API_BASE}/auth/login`
  ];
  
  let workingCount = 0;
  
  for (const endpoint of authEndpoints) {
    try {
      // Just check if endpoint exists (should return 400 for missing data, not 404)
      await axios.post(endpoint, {}, testConfig);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`   ✅ ${endpoint.split('/').pop()}: Available`);
        workingCount++;
      } else if (error.response?.status === 404) {
        console.log(`   ❌ ${endpoint.split('/').pop()}: Not found`);
      } else {
        console.log(`   ❓ ${endpoint.split('/').pop()}: ${error.message}`);
      }
    }
  }
  
  return workingCount > 0;
}

async function runSafeModeTests() {
  console.log(`\n🔗 Testing server at: ${BASE_URL}`);
  console.log('⏰ Starting tests...\n');
  
  const results = {
    systemStatus: false,
    simpleSearch: false,
    disabledFeatures: false,
    basicAuth: false
  };
  
  try {
    results.systemStatus = await testSystemStatus();
    results.simpleSearch = await testSimpleSearchHealth();
    results.disabledFeatures = await testDisabledFeatures();
    results.basicAuth = await testBasicAuthEndpoints();
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌';
      const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${status} ${testName}`);
    });
    
    console.log(`\n🎯 SUMMARY: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Server is running safely in limited mode.');
      console.log('✅ Your simple search APIs are working correctly.');
      console.log('⚠️  Complex features are safely disabled to prevent errors.');
    } else {
      console.log('⚠️  Some tests failed. Check the configuration.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
  
  console.log(`\n⏰ Test completed at: ${new Date().toISOString()}`);
}

// Check if server is running first
async function checkServerConnection() {
  try {
    await axios.get(BASE_URL, { timeout: 3000 });
    return true;
  } catch (error) {
    console.log('❌ Cannot connect to server at', BASE_URL);
    console.log('   Please make sure the server is running:');
    console.log('   npm start  or  node safe-start.js');
    return false;
  }
}

// Main execution
async function main() {
  const isConnected = await checkServerConnection();
  if (isConnected) {
    await runSafeModeTests();
  }
}

main();
