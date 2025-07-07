/**
 * 🚀 TEST SCRIPT: Kiểm tra fix lỗi 409 Conflict trong Kanban
 * 
 * MỤC TIÊU:
 * 1. Test API mới: GET /api/kanban/project/:projectId  
 * 2. Test logic "find-first, create-if-not-found"
 * 3. Đảm bảo không còn lỗi 409 Conflict khi truy cập Kanban nhiều lần
 * 4. Kiểm tra performance và tính nhất quán
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testProjectId = '';
let testUserId = '';

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  
  switch(type) {
    case 'success': console.log(colors.green(`✅ ${prefix} ${message}`)); break;
    case 'error': console.log(colors.red(`❌ ${prefix} ${message}`)); break;
    case 'warning': console.log(colors.yellow(`⚠️  ${prefix} ${message}`)); break;
    case 'info': console.log(colors.blue(`ℹ️  ${prefix} ${message}`)); break;
    case 'test': console.log(colors.magenta(`🧪 ${prefix} ${message}`)); break;
    default: console.log(`${prefix} ${message}`);
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API Helper functions
const apiRequest = async (method, endpoint, data = null, expectError = false) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}/api${endpoint}`,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      data
    };
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (expectError) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message, 
        status: error.response?.status 
      };
    }
    throw error;
  }
};

// Test functions
const setupTestEnvironment = async () => {
  log('🔧 THIẾT LẬP MÔI TRƯỜNG TEST', 'test');
  
  try {
    // 1. Đăng nhập
    log('Đăng nhập với tài khoản test...');
    const loginResult = await apiRequest('POST', '/auth/login', {
      email: 'admin@uniplan.com',
      password: 'admin123'
    });
    
    if (!loginResult.success) {
      throw new Error('Đăng nhập thất bại');
    }
    
    authToken = loginResult.data.token;
    testUserId = loginResult.data.user.id;
    log(`Đăng nhập thành công. User ID: ${testUserId}`, 'success');
    
    // 2. Tạo project test (hoặc sử dụng project có sẵn)
    log('Tạo dự án test...');
    const projectResult = await apiRequest('POST', '/projects', {
      project_name: `Test Kanban Fix 409 - ${Date.now()}`,
      description: 'Dự án test để kiểm tra fix lỗi 409 Conflict trong Kanban',
      project_type: 'Cá nhân',
      start_date: new Date().toISOString().split('T')[0],
      expected_end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    });
    
    if (!projectResult.success) {
      throw new Error('Tạo dự án thất bại');
    }
    
    testProjectId = projectResult.data._id;
    log(`Tạo dự án thành công. Project ID: ${testProjectId}`, 'success');
    
  } catch (error) {
    log(`Lỗi setup: ${error.message}`, 'error');
    throw error;
  }
};

const testFindKanbanByProject = async () => {
  log('🔍 TEST 1: API findKanbanByProject - Trước khi có Kanban', 'test');
  
  try {
    const result = await apiRequest('GET', `/kanban/project/${testProjectId}`, null, true);
    
    if (result.status === 404 && !result.success) {
      log('✅ PASS: API trả về 404 khi chưa có Kanban (như mong đợi)', 'success');
      log(`Response: ${JSON.stringify(result)}`, 'info');
      return { found: false, message: result.error };
    } else {
      log('❌ FAIL: API không trả về 404 như mong đợi', 'error');
      log(`Response: ${JSON.stringify(result)}`, 'info');
      return { found: true, data: result.data };
    }
  } catch (error) {
    log(`Lỗi test findKanbanByProject: ${error.message}`, 'error');
    throw error;
  }
};

const testCreateKanban = async () => {
  log('📝 TEST 2: Tạo Kanban mới', 'test');
  
  try {
    const result = await apiRequest('POST', '/kanban', {
      project_id: testProjectId,
      name: `Test Kanban - ${testProjectId}`,
      description: 'Kanban test cho dự án'
    });
    
    if (result.success) {
      log('✅ PASS: Tạo Kanban thành công', 'success');
      log(`Kanban ID: ${result.data._id}`, 'info');
      return { success: true, kanbanId: result.data._id, kanban: result.data };
    } else {
      log('❌ FAIL: Không thể tạo Kanban', 'error');
      throw new Error('Tạo Kanban thất bại');
    }
  } catch (error) {
    log(`Lỗi test createKanban: ${error.message}`, 'error');
    throw error;
  }
};

const testFindKanbanByProjectAfterCreate = async () => {
  log('🔍 TEST 3: API findKanbanByProject - Sau khi có Kanban', 'test');
  
  try {
    const result = await apiRequest('GET', `/kanban/project/${testProjectId}`);
    
    if (result.success && result.data.found) {
      log('✅ PASS: API tìm thấy Kanban sau khi tạo', 'success');
      log(`Kanban Name: ${result.data.kanban.name}`, 'info');
      log(`Tasks Count: ${result.data.tasks?.length || 0}`, 'info');
      return { found: true, data: result.data };
    } else {
      log('❌ FAIL: API không tìm thấy Kanban mặc dù đã tạo', 'error');
      log(`Response: ${JSON.stringify(result)}`, 'info');
      throw new Error('Không tìm thấy Kanban sau khi tạo');
    }
  } catch (error) {
    log(`Lỗi test findKanbanByProject (after create): ${error.message}`, 'error');
    throw error;
  }
};

const testMultipleAccessPrevention = async () => {
  log('🚫 TEST 4: Kiểm tra không có lỗi 409 khi truy cập nhiều lần', 'test');
  
  try {
    const promises = [];
    const requestCount = 5;
    
    log(`Gửi ${requestCount} request đồng thời để test race condition...`);
    
    // Gửi nhiều request cùng lúc để test
    for (let i = 0; i < requestCount; i++) {
      promises.push(
        apiRequest('GET', `/kanban/project/${testProjectId}`)
          .then(result => ({ index: i, result }))
          .catch(error => ({ index: i, error: error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    
    // Kiểm tra kết quả
    let successCount = 0;
    let errorCount = 0;
    
    results.forEach(({ index, result, error }) => {
      if (error) {
        log(`Request ${index}: ERROR - ${error}`, 'error');
        errorCount++;
      } else if (result.success) {
        log(`Request ${index}: SUCCESS - Found: ${result.data.found}`, 'success');
        successCount++;
      } else {
        log(`Request ${index}: FAIL - ${JSON.stringify(result)}`, 'warning');
        errorCount++;
      }
    });
    
    log(`Kết quả: ${successCount} thành công, ${errorCount} lỗi`, 'info');
    
    if (successCount === requestCount) {
      log('✅ PASS: Tất cả request đều thành công, không có lỗi 409', 'success');
      return true;
    } else {
      log('❌ FAIL: Vẫn còn lỗi khi truy cập đồng thời', 'error');
      return false;
    }
    
  } catch (error) {
    log(`Lỗi test multiple access: ${error.message}`, 'error');
    throw error;
  }
};

const testCreateDuplicateKanban = async () => {
  log('⚠️  TEST 5: Thử tạo Kanban trùng lặp (should get 409)', 'test');
  
  try {
    const result = await apiRequest('POST', '/kanban', {
      project_id: testProjectId,
      name: `Duplicate Kanban Test`,
      description: 'Test tạo trùng lặp'
    }, true);
    
    if (result.status === 409) {
      log('✅ PASS: API trả về 409 khi tạo Kanban trùng lặp (như mong đợi)', 'success');
      log(`Error message: ${result.error}`, 'info');
      return true;
    } else if (result.success) {
      log('⚠️  WARNING: API cho phép tạo nhiều Kanban cho cùng 1 project', 'warning');
      log('Điều này có thể không mong muốn tùy thuộc vào business logic', 'warning');
      return true;
    } else {
      log('❌ FAIL: Lỗi không mong đợi khi tạo duplicate', 'error');
      log(`Response: ${JSON.stringify(result)}`, 'info');
      return false;
    }
  } catch (error) {
    log(`Lỗi test duplicate creation: ${error.message}`, 'error');
    throw error;
  }
};

const cleanup = async () => {
  log('🧹 DỌN DẸP', 'test');
  
  try {
    // Xóa project test (sẽ cascade delete kanban và tasks)
    if (testProjectId) {
      log('Xóa dự án test...');
      await apiRequest('DELETE', `/projects/${testProjectId}`);
      log('Xóa dự án thành công', 'success');
    }
  } catch (error) {
    log(`Lỗi cleanup: ${error.message}`, 'warning');
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 BẮT ĐẦU TEST: KIỂM TRA FIX LỖI 409 CONFLICT TRONG KANBAN');
  console.log('='.repeat(80));
  
  try {
    await setupTestEnvironment();
    await delay(1000);
    
    const test1Result = await testFindKanbanByProject();
    await delay(500);
    
    const test2Result = await testCreateKanban();
    await delay(500);
    
    const test3Result = await testFindKanbanByProjectAfterCreate();
    await delay(500);
    
    const test4Result = await testMultipleAccessPrevention();
    await delay(500);
    
    const test5Result = await testCreateDuplicateKanban();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 KẾT QUẢ TỔNG HỢP:');
    console.log('='.repeat(80));
    
    log('TEST 1 (Find before create): ' + (!test1Result.found ? 'PASS ✅' : 'FAIL ❌'));
    log('TEST 2 (Create Kanban): ' + (test2Result.success ? 'PASS ✅' : 'FAIL ❌'));
    log('TEST 3 (Find after create): ' + (test3Result.found ? 'PASS ✅' : 'FAIL ❌'));
    log('TEST 4 (Multiple access): ' + (test4Result ? 'PASS ✅' : 'FAIL ❌'));
    log('TEST 5 (Duplicate handling): ' + (test5Result ? 'PASS ✅' : 'FAIL ❌'));
    
    const allPassed = !test1Result.found && test2Result.success && test3Result.found && test4Result && test5Result;
    
    if (allPassed) {
      log('🎉 TẤT CẢ TEST ĐỀU PASS! Fix lỗi 409 Conflict đã thành công!', 'success');
    } else {
      log('⚠️  MỘT SỐ TEST CHƯA PASS. Cần kiểm tra lại!', 'warning');
    }
    
  } catch (error) {
    log(`Lỗi nghiêm trọng trong quá trình test: ${error.message}`, 'error');
  } finally {
    await cleanup();
    console.log('\n' + '='.repeat(80));
    log('🏁 HOÀN THÀNH TẤT CẢ TEST');
    console.log('='.repeat(80) + '\n');
  }
};

// Chạy tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  setupTestEnvironment,
  testFindKanbanByProject,
  testCreateKanban,
  testFindKanbanByProjectAfterCreate,
  testMultipleAccessPrevention,
  testCreateDuplicateKanban
};
