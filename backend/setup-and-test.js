// Script để tạo test user và chạy integration tests
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  const testUser = {
    name: 'Test User Enhanced Teams',
    email: 'test.enhanced@uniplan.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  };

  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ Test user created successfully!');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      return testUser;
    } else {
      console.log('⚠️ User creation response not successful');
      return null;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('đã tồn tại')) {
      console.log('ℹ️ Test user already exists');
      return testUser; // Return user data for login
    } else {
      console.log('❌ Failed to create test user:', error.response?.data?.message || error.message);
      return null;
    }
  }
}

async function runCompleteTest() {
  console.log('🔧 SETUP & INTEGRATION TEST\n');
  console.log('===============================\n');

  // Step 1: Create test user
  const testUser = await createTestUser();
  if (!testUser) {
    console.log('❌ Cannot proceed without test user');
    return;
  }

  console.log('\n⏳ Waiting 2 seconds for user registration to complete...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Run integration tests
  console.log('\n🧪 Starting integration tests...\n');
  
  const EnhancedTeamTester = require('./test-integration');
  const tester = new EnhancedTeamTester();
  
  // Override login method to use our test user
  const originalLogin = tester.login.bind(tester);
  tester.login = () => originalLogin(testUser.email, testUser.password);
  
  await tester.runAllTests();
}

// Export function
module.exports = { createTestUser, runCompleteTest };

// Run if called directly
if (require.main === module) {
  runCompleteTest().catch(console.error);
}
