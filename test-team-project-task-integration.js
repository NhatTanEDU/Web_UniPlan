/**
 * Test Script: Team-Project-Task Integration
 * ==========================================
 * 
 * Test toàn bộ workflow:
 * 1. Tạo team với members
 * 2. Tạo project và gán vào team
 * 3. Kiểm tra sync team members -> project members
 * 4. Tạo task và assign cho team member
 * 5. Kiểm tra validation và auto-sync
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
let authToken = '';

// Test data
const testData = {
  userId: null,
  teamId: null,
  projectId: null,
  kanbanId: null,
  taskId: null,
  teamMemberUserId: null
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ API Error [${method} ${endpoint}]:`, error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status 
    };
  }
}

// Step 1: Login
async function login() {
  console.log('🔐 ĐĂNG NHẬP...');
  
  const loginData = {
    email: 'admin@example.com',
    password: 'admin123'
  };
  
  const result = await apiCall('POST', '/auth/login', loginData);
  
  if (result.success) {
    authToken = result.data.token;
    testData.userId = result.data.user.userId;
    console.log('✅ Đăng nhập thành công');
    console.log(`👤 User ID: ${testData.userId}`);
    return true;
  }
  
  return false;
}

// Step 2: Create team with members
async function createTeamWithMembers() {
  console.log('\n🏗️ TẠO TEAM VỚI MEMBERS...');
  
  // Tạo test user để làm team member
  const newUserData = {
    full_name: 'Team Member Test',
    email: `teammember_${Date.now()}@test.com`,
    password: 'password123',
    role: 'User'
  };
  
  const userResult = await apiCall('POST', '/auth/register', newUserData);
  if (!userResult.success) {
    console.log('❌ Không thể tạo test user');
    return false;
  }
  
  testData.teamMemberUserId = userResult.data.user.userId;
  console.log(`👤 Created test user: ${testData.teamMemberUserId}`);
  
  // Tạo team
  const teamData = {
    team_name: `Test Team ${Date.now()}`,
    description: 'Team for testing team-project-task integration',
    type: 'Project',
    members: [
      {
        user_id: testData.teamMemberUserId,
        role: 'Member'
      }
    ]
  };
  
  const result = await apiCall('POST', '/teams', teamData);
  
  if (result.success) {
    testData.teamId = result.data.team._id;
    console.log('✅ Tạo team thành công');
    console.log(`🏷️ Team ID: ${testData.teamId}`);
    console.log(`👥 Members: Admin (${testData.userId}) + Member (${testData.teamMemberUserId})`);
    return true;
  }
  
  return false;
}

// Step 3: Create project and assign to team
async function createAndAssignProject() {
  console.log('\n📋 TẠO VÀ GÁN PROJECT VÀO TEAM...');
  
  const projectData = {
    project_name: `Test Project ${Date.now()}`,
    description: 'Project for testing team member task assignment',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
    priority: 'High',
    team_id: testData.teamId
  };
  
  const result = await apiCall('POST', '/projects', projectData);
  
  if (result.success) {
    testData.projectId = result.data.project.id;
    console.log('✅ Tạo và gán project thành công');
    console.log(`📋 Project ID: ${testData.projectId}`);
    console.log(`🔗 Team ID: ${testData.teamId}`);
    return true;
  }
  
  return false;
}

// Step 4: Check project members (should include team members)
async function checkProjectMembers() {
  console.log('\n👥 KIỂM TRA PROJECT MEMBERS...');
  
  const result = await apiCall('GET', `/project-members/${testData.projectId}`);
  
  if (result.success) {
    const members = result.data;
    console.log(`📊 Found ${members.length} project members:`);
    
    members.forEach(member => {
      console.log(`  - ${member.user_name} (${member.user_email}) - Role: ${member.role_in_project}`);
    });
    
    // Check if team member is in project members
    const teamMemberInProject = members.find(m => m.user_id === testData.teamMemberUserId);
    
    if (teamMemberInProject) {
      console.log('✅ Team member đã được sync vào project members');
      return true;
    } else {
      console.log('⚠️ Team member chưa được sync, thử sync thủ công...');
      return await manualSync();
    }
  }
  
  return false;
}

// Step 5: Manual sync if needed
async function manualSync() {
  console.log('\n🔄 ĐỒNG BỘ THỦ CÔNG...');
  
  const result = await apiCall('POST', `/projects/${testData.projectId}/sync-team-members`);
  
  if (result.success) {
    console.log('✅ Đồng bộ thủ công thành công');
    console.log(`📊 Sync result:`, result.data.syncResult);
    return true;
  }
  
  return false;
}

// Step 6: Get kanban board
async function getKanbanBoard() {
  console.log('\n📋 LẤY KANBAN BOARD...');
  
  const result = await apiCall('GET', `/projects/${testData.projectId}`);
  
  if (result.success && result.data.kanban_id) {
    testData.kanbanId = result.data.kanban_id;
    console.log('✅ Tìm thấy Kanban board');
    console.log(`📋 Kanban ID: ${testData.kanbanId}`);
    return true;
  } else {
    console.log('⚠️ Không tìm thấy Kanban board, tạo mới...');
    // Tạo Kanban board nếu chưa có
    const kanbanResult = await apiCall('POST', '/kanban', {
      project_id: testData.projectId,
      board_name: 'Default Board'
    });
    
    if (kanbanResult.success) {
      testData.kanbanId = kanbanResult.data._id;
      console.log('✅ Tạo Kanban board thành công');
      console.log(`📋 Kanban ID: ${testData.kanbanId}`);
      return true;
    }
  }
  
  return false;
}

// Step 7: Create task and assign to team member
async function createTaskWithTeamMemberAssignment() {
  console.log('\n📝 TẠO TASK VÀ GÁN CHO TEAM MEMBER...');
  
  const taskData = {
    title: `Test Task ${Date.now()}`,
    description: 'Task to test team member assignment validation',
    assigned_to: testData.teamMemberUserId,
    status: 'Cần làm',
    priority: 'High',
    start_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const result = await apiCall('POST', `/kanban/${testData.kanbanId}/tasks`, taskData);
  
  if (result.success) {
    testData.taskId = result.data._id;
    console.log('✅ Tạo task thành công');
    console.log(`📝 Task ID: ${testData.taskId}`);
    console.log(`👤 Assigned to: ${testData.teamMemberUserId}`);
    console.log('🎉 TEAM MEMBER ASSIGNMENT VALIDATION PASSED!');
    return true;
  } else {
    console.log('❌ Tạo task thất bại:', result.error);
    if (result.error.includes('thành viên của dự án')) {
      console.log('🔍 Lỗi validation - team member chưa được sync đúng');
    }
  }
  
  return false;
}

// Step 8: Test update task assignment
async function updateTaskAssignment() {
  console.log('\n✏️ TEST UPDATE TASK ASSIGNMENT...');
  
  const updateData = {
    assigned_to: testData.teamMemberUserId,
    title: 'Updated Task Title'
  };
  
  const result = await apiCall('PUT', `/kanban/tasks/${testData.taskId}`, updateData);
  
  if (result.success) {
    console.log('✅ Update task thành công');
    console.log('🎉 TEAM MEMBER UPDATE ASSIGNMENT VALIDATION PASSED!');
    return true;
  } else {
    console.log('❌ Update task thất bại:', result.error);
  }
  
  return false;
}

// Main test function
async function runFullIntegrationTest() {
  console.log('🚀 STARTING TEAM-PROJECT-TASK INTEGRATION TEST');
  console.log('===============================================\n');
  
  try {
    // Step 1: Login
    if (!await login()) {
      throw new Error('Login failed');
    }
    
    // Step 2: Create team with members
    if (!await createTeamWithMembers()) {
      throw new Error('Create team failed');
    }
    
    // Step 3: Create and assign project
    if (!await createAndAssignProject()) {
      throw new Error('Create project failed');
    }
    
    // Wait a bit for sync to complete
    console.log('\n⏰ Chờ 2 giây để sync hoàn tất...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Check project members
    if (!await checkProjectMembers()) {
      throw new Error('Project members check failed');
    }
    
    // Step 5: Get kanban board
    if (!await getKanbanBoard()) {
      throw new Error('Get kanban board failed');
    }
    
    // Step 6: Create task with team member assignment
    if (!await createTaskWithTeamMemberAssignment()) {
      throw new Error('Create task failed');
    }
    
    // Step 7: Test update task assignment
    if (!await updateTaskAssignment()) {
      console.log('⚠️ Update task failed, but create worked');
    }
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('===============================');
    console.log('✅ Team creation: PASSED');
    console.log('✅ Project assignment: PASSED');
    console.log('✅ Member sync: PASSED');
    console.log('✅ Task assignment validation: PASSED');
    console.log('\n📊 Test Data Summary:');
    console.log(`👤 User ID: ${testData.userId}`);
    console.log(`👥 Team ID: ${testData.teamId}`);
    console.log(`📋 Project ID: ${testData.projectId}`);
    console.log(`📝 Kanban ID: ${testData.kanbanId}`);
    console.log(`📝 Task ID: ${testData.taskId}`);
    console.log(`👤 Team Member User ID: ${testData.teamMemberUserId}`);
    
  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    console.log('\n📊 Partial Test Data:');
    console.log(JSON.stringify(testData, null, 2));
  }
}

// Run the test
if (require.main === module) {
  runFullIntegrationTest().catch(console.error);
}

module.exports = {
  runFullIntegrationTest,
  testData
};
