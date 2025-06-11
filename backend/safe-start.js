#!/usr/bin/env node

/**
 * Safe Startup Script for UniPlan Backend
 * This script checks feature toggles and starts the server safely
 */

const { spawn } = require('child_process');
const { getEnabledFeatures, getDisabledFeatures, isFeatureEnabled } = require('./config/featureToggles');

console.log('🚀 UNIPLAN SAFE STARTUP');
console.log('========================');

// Display feature status
console.log('\n✅ ENABLED FEATURES:');
const enabledFeatures = getEnabledFeatures();
enabledFeatures.forEach(feature => {
  console.log(`   ✓ ${feature}`);
});

console.log('\n❌ DISABLED FEATURES:');
const disabledFeatures = getDisabledFeatures();
disabledFeatures.forEach(feature => {
  console.log(`   ✗ ${feature}`);
});

console.log(`\n📊 SUMMARY: ${enabledFeatures.length} enabled, ${disabledFeatures.length} disabled`);

// Check if critical features are properly configured
console.log('\n🔍 CHECKING CRITICAL CONFIGURATIONS...');

if (!isFeatureEnabled('SIMPLE_SEARCH')) {
  console.error('❌ ERROR: SIMPLE_SEARCH must be enabled for basic functionality');
  process.exit(1);
}

if (!isFeatureEnabled('BASIC_AUTH')) {
  console.error('❌ ERROR: BASIC_AUTH must be enabled for authentication');
  process.exit(1);
}

if (!isFeatureEnabled('BASIC_API')) {
  console.error('❌ ERROR: BASIC_API must be enabled for core functionality');
  process.exit(1);
}

console.log('✅ Critical features are properly configured');

// Warn about disabled complex features
const importantDisabledFeatures = disabledFeatures.filter(feature => 
  ['ENHANCED_TEAMS', 'WEBSOCKETS', 'SOCKET_IO', 'REAL_TIME_NOTIFICATIONS'].includes(feature)
);

if (importantDisabledFeatures.length > 0) {
  console.log('\n⚠️  IMPORTANT FEATURES DISABLED:');
  importantDisabledFeatures.forEach(feature => {
    console.log(`   ⚠️  ${feature} - This may affect some functionality`);
  });
  console.log('   This is normal for safe mode operation.');
}

console.log('\n🎯 STARTING SERVER IN SAFE MODE...');
console.log('===================================');

// Start the server
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'safe_mode' }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Server stopped gracefully');
  } else {
    console.error(`❌ Server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating server...');
  serverProcess.kill('SIGTERM');
});
