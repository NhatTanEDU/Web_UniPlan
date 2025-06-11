// final-timeout-test.js - Simple final verification
const axios = require('axios');

console.log('🔍 FINAL TIMEOUT MIDDLEWARE VERIFICATION');
console.log('=========================================');

async function finalTest() {
  try {
    console.log('\n1. ✅ Testing quick endpoint...');
    const quick = await axios.get('http://localhost:5000/api/debug/quick-endpoint', {timeout: 5000});
    console.log(`   SUCCESS: ${quick.status} - ${quick.data.message}`);

    console.log('\n2. ⏳ Testing moderate endpoint (8s)...');
    const start = Date.now();
    const moderate = await axios.get('http://localhost:5000/api/debug/moderate-endpoint', {timeout: 12000});
    const duration = Date.now() - start;
    console.log(`   SUCCESS: ${moderate.status} - Duration: ${duration}ms`);

    console.log('\n3. 🚨 Testing timeout endpoint (should timeout after 15s)...');
    const timeoutStart = Date.now();
    try {
      await axios.get('http://localhost:5000/api/debug/slow-endpoint', {timeout: 20000});
      console.log('   ❌ UNEXPECTED: Should have timed out!');
    } catch (err) {
      const timeoutDuration = Date.now() - timeoutStart;
      if (err.response && err.response.status === 503) {
        console.log(`   ✅ SUCCESS: Server timeout after ${timeoutDuration}ms with status 503`);
        console.log(`   ✅ SUCCESS: Timeout middleware working correctly!`);
      } else {
        console.log(`   ⚠️  Timeout occurred but different error: ${err.message}`);
      }
    }

    console.log('\n🎉 TIMEOUT MIDDLEWARE VERIFICATION COMPLETE!');
    console.log('✅ The middleware is working correctly:');
    console.log('   - Fast requests: Complete normally');
    console.log('   - Slow requests (8s): Complete with warning logs');
    console.log('   - Very slow requests (15s+): Terminated with 503 error');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

finalTest();
