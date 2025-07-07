// Test utility cho logout functionality
// File: frontend/src/utils/logoutTest.js

/**
 * Test logout functionality - Kiểm tra việc xóa dữ liệu
 * Chạy trong browser console để test
 */

// Setup test data trước khi test logout
const setupTestData = () => {
  console.log('🔧 [LogoutTest] Setting up test data...');
  
  // Thêm test data vào localStorage
  const testData = {
    token: 'test_token_123456789',
    user: JSON.stringify({
      id: 'test_user_id',
      email: 'test@example.com',
      name: 'Test User'
    }),
    subscriptionStatus: JSON.stringify({
      subscriptionType: 'monthly',
      daysRemaining: 30
    }),
    notifications: JSON.stringify([
      { id: 1, message: 'Test notification' }
    ]),
    preferences: JSON.stringify({
      theme: 'dark',
      language: 'vi'
    }),
    lastActivity: new Date().toISOString()
  };
  
  Object.entries(testData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  // Thêm test data vào sessionStorage
  sessionStorage.setItem('tempData', 'test_session_data');
  sessionStorage.setItem('workInProgress', 'true');
  
  // Thêm test cookies
  document.cookie = 'token=test_cookie_token; path=/';
  document.cookie = 'session=test_session; path=/';
  
  console.log('✅ [LogoutTest] Test data setup completed');
  console.log('📊 localStorage items:', localStorage.length);
  console.log('📊 sessionStorage items:', sessionStorage.length);
  console.log('🍪 Cookies:', document.cookie);
};

// Kiểm tra dữ liệu trước logout
const checkDataBeforeLogout = () => {
  console.log('\n🔍 [LogoutTest] BEFORE LOGOUT - Data Check:');
  console.log('='.repeat(50));
  
  // Check localStorage
  console.log('📦 localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
  }
  
  // Check sessionStorage
  console.log('\n📦 sessionStorage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    console.log(`  - ${key}: ${sessionStorage.getItem(key)}`);
  }
  
  // Check cookies
  console.log('\n🍪 Cookies:');
  console.log(`  - ${document.cookie || 'No cookies found'}`);
  
  console.log('\n📊 Summary:');
  console.log(`  - localStorage items: ${localStorage.length}`);
  console.log(`  - sessionStorage items: ${sessionStorage.length}`);
  console.log(`  - Cookies: ${document.cookie.split(';').length}`);
};

// Kiểm tra dữ liệu sau logout
const checkDataAfterLogout = () => {
  console.log('\n🔍 [LogoutTest] AFTER LOGOUT - Data Check:');
  console.log('='.repeat(50));
  
  // Check localStorage
  console.log('📦 localStorage:');
  if (localStorage.length === 0) {
    console.log('  ✅ localStorage is empty');
  } else {
    console.log('  ❌ localStorage still has data:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`    - ${key}: ${localStorage.getItem(key)}`);
    }
  }
  
  // Check sessionStorage
  console.log('\n📦 sessionStorage:');
  if (sessionStorage.length === 0) {
    console.log('  ✅ sessionStorage is empty');
  } else {
    console.log('  ❌ sessionStorage still has data:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      console.log(`    - ${key}: ${sessionStorage.getItem(key)}`);
    }
  }
  
  // Check cookies
  console.log('\n🍪 Cookies:');
  const cookies = document.cookie.trim();
  if (!cookies) {
    console.log('  ✅ No cookies found');
  } else {
    console.log('  ⚠️ Some cookies may still exist:');
    console.log(`    - ${cookies}`);
    console.log('  (Note: Some cookies like httpOnly cannot be accessed via JS)');
  }
  
  console.log('\n📊 Summary:');
  console.log(`  - localStorage items: ${localStorage.length}`);
  console.log(`  - sessionStorage items: ${sessionStorage.length}`);
  
  // Test result
  const isSuccess = localStorage.length === 0 && sessionStorage.length === 0;
  console.log(`\n🎯 Logout Test Result: ${isSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  return isSuccess;
};

// Simulate logout process (for testing without actual logout button)
const simulateLogout = () => {
  console.log('\n🧪 [LogoutTest] Simulating logout process...');
  
  try {
    // 1. Clear localStorage keys
    const keysToRemove = [
      'token', 'user', 'userInfo', 'auth_token', 'access_token', 'refresh_token',
      'subscriptionStatus', 'notifications', 'preferences', 'settings', 
      'lastActivity', 'rememberMe'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from localStorage`);
      }
    });
    
    // 2. Clear sessionStorage
    sessionStorage.clear();
    console.log('🗑️ Cleared sessionStorage');
    
    // 3. Clear cookies
    const cookiesToClear = ['token', 'auth', 'session', 'user', 'authToken', 'accessToken'];
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });
    console.log('🍪 Cleared cookies');
    
    console.log('✅ Logout simulation completed');
    
  } catch (error) {
    console.error('❌ Error during logout simulation:', error);
  }
};

// Main test function
const runLogoutTest = () => {
  console.log('🚀 [LogoutTest] Starting Logout Functionality Test');
  console.log('='.repeat(60));
  
  // Step 1: Setup test data
  setupTestData();
  
  // Step 2: Check data before logout
  checkDataBeforeLogout();
  
  // Step 3: Simulate logout
  simulateLogout();
  
  // Step 4: Check data after logout
  const success = checkDataAfterLogout();
  
  // Final result
  console.log('\n🏁 [LogoutTest] TEST COMPLETED');
  console.log('='.repeat(60));
  if (success) {
    console.log('🎉 All tests PASSED! Logout functionality is working correctly.');
  } else {
    console.log('💥 Some tests FAILED! Check the data cleanup process.');
  }
  
  return success;
};

// Manual cleanup function
const emergencyCleanup = () => {
  console.log('🆘 [LogoutTest] Running emergency cleanup...');
  
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear common cookie names
    const cookieNames = ['token', 'auth', 'session', 'user', 'authToken', 'accessToken', 'refreshToken'];
    cookieNames.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname.replace('www.', '')};`;
    });
    
    console.log('✅ Emergency cleanup completed');
    checkDataAfterLogout();
  } catch (error) {
    console.error('💥 Emergency cleanup failed:', error);
  }
};

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.logoutTest = {
    run: runLogoutTest,
    setup: setupTestData,
    checkBefore: checkDataBeforeLogout,
    checkAfter: checkDataAfterLogout,
    simulate: simulateLogout,
    cleanup: emergencyCleanup
  };
  
  console.log('🔧 Logout Test Utilities loaded!');
  console.log('💡 Available commands:');
  console.log('  - logoutTest.run()         - Run full test');
  console.log('  - logoutTest.setup()       - Setup test data');
  console.log('  - logoutTest.checkBefore() - Check data before logout');
  console.log('  - logoutTest.checkAfter()  - Check data after logout');
  console.log('  - logoutTest.simulate()    - Simulate logout process');
  console.log('  - logoutTest.cleanup()     - Emergency cleanup');
}

export {
  runLogoutTest,
  setupTestData,
  checkDataBeforeLogout,
  checkDataAfterLogout,
  simulateLogout,
  emergencyCleanup
};
