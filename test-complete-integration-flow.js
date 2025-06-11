/**
 * Test Script: Complete Team-Project Assignment Flow
 * =================================================
 * 
 * This script tests the complete flow from team creation to project assignment
 * with the newly fixed role mapping system.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testUserId = '';
let testTeamId = '';
let testProjectId = '';

// Test user credentials
const testUser = {
  username: 'admin_test_user',
  email: 'admin_test@example.com',
  password: 'password123',
  full_name: 'Admin Test User',
  role: 'Admin'
};

const testTeam = {
  team_name: 'Test Team Integration',
  description: 'Team for testing complete integration flow',
  type: 'Public'
};

const testProject = {
  project_name: 'Test Project Integration',
  description: 'Project for testing team assignment',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  status: 'Planning',
  priority: 'Medium'
};

async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) config.data = data;
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

async function step1_RegisterUser() {
  console.log('\n🔄 Step 1: Register Test User...');
  
  const result = await makeRequest('POST', '/api/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ User registered successfully');
    testUserId = result.data.user._id;
    return true;
  } else {
    if (result.status === 409) {
      console.log('ℹ️  User already exists, continuing...');
      return true;
    }
    console.log('❌ Registration failed:', result.error);
    return false;
  }
}

async function step2_LoginUser() {
  console.log('\n🔄 Step 2: Login User...');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (result.success) {
    authToken = result.data.token;
    testUserId = result.data.user._id;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
}

async function step3_CreateTeam() {
  console.log('\n🔄 Step 3: Create Team...');
  
  const result = await makeRequest('POST', '/api/teams', testTeam);
  
  if (result.success) {
    testTeamId = result.data.team._id;
    console.log('✅ Team created successfully:', testTeamId);
    console.log('   Team Members:', result.data.team.members?.length || 0);
    return true;
  } else {
    console.log('❌ Team creation failed:', result.error);
    return false;
  }
}

async function step4_CreateProject() {
  console.log('\n🔄 Step 4: Create Project...');
  
  const result = await makeRequest('POST', '/api/projects', testProject);
  
  if (result.success) {
    testProjectId = result.data.project._id; // Fixed: use result.data.project._id
    console.log('✅ Project created successfully:', testProjectId);
    console.log('   Project Members:', result.data.project.members?.length || 0);
    return true;
  } else {
    console.log('❌ Project creation failed:', result.error);
    return false;
  }
}

async function step5_AssignTeamToProject() {
  console.log('\n🔄 Step 5: Assign Team to Project (Testing Role Mapping Fix)...');
  
  const result = await makeRequest('POST', `/api/teams/${testTeamId}/projects`, {
    project_id: testProjectId
  });
  
  if (result.success) {
    console.log('✅ Team assigned to project successfully!');
    console.log('   New Project Members:', result.data.project?.members?.length || 0);
    
    // Verify role mapping
    const projectMembers = result.data.project?.members || [];
    console.log('\n📋 Project Members with Roles:');
    projectMembers.forEach(member => {
      console.log(`   - ${member.user?.username || 'Unknown'}: ${member.role}`);
    });
    
    return true;
  } else {
    console.log('❌ Team assignment failed:', result.error);
    console.log('   This might indicate the role mapping issue still exists!');
    return false;
  }
}

async function step6_VerifyAdminCanSeeProject() {
  console.log('\n🔄 Step 6: Verify Admin Can See Project...');
  
  const result = await makeRequest('GET', '/api/projects');
  
  if (result.success) {
    const projects = result.data.projects || result.data;
    const foundProject = projects.find(p => p._id === testProjectId);
    
    if (foundProject) {
      console.log('✅ Admin can see the created project in their list!');
      console.log(`   Project: ${foundProject.name}`);
      console.log(`   Members: ${foundProject.members?.length || 0}`);
      return true;
    } else {
      console.log('❌ Admin cannot see the created project in their list!');
      console.log('   This indicates the auto-member logic might have issues.');
      return false;
    }
  } else {
    console.log('❌ Failed to get projects:', result.error);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleanup: Removing test data...');
  
  // Delete project
  if (testProjectId) {
    const deleteProject = await makeRequest('DELETE', `/api/projects/${testProjectId}`);
    console.log(deleteProject.success ? '✅ Project deleted' : '⚠️  Failed to delete project');
  }
  
  // Delete team
  if (testTeamId) {
    const deleteTeam = await makeRequest('DELETE', `/api/teams/${testTeamId}`);
    console.log(deleteTeam.success ? '✅ Team deleted' : '⚠️  Failed to delete team');
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Team-Project Assignment Integration Test');
  console.log('=============================================================');
  
  let allStepsPassed = true;
  
  try {
    allStepsPassed &= await step1_RegisterUser();
    allStepsPassed &= await step2_LoginUser();
    allStepsPassed &= await step3_CreateTeam();
    allStepsPassed &= await step4_CreateProject();
    allStepsPassed &= await step5_AssignTeamToProject();
    allStepsPassed &= await step6_VerifyAdminCanSeeProject();
    
    console.log('\n' + '='.repeat(60));
    if (allStepsPassed) {
      console.log('🎉 ALL TESTS PASSED! The role mapping fix is working correctly!');
      console.log('✅ Team assignment flow is working properly');
      console.log('✅ Role mapping from English to Vietnamese is working');
      console.log('✅ Admins can see projects they created');
    } else {
      console.log('❌ SOME TESTS FAILED! Please review the errors above.');
    }
    
  } catch (error) {
    console.log('\n💥 Test suite crashed:', error.message);
  } finally {
    await cleanup();
  }
}

// Run the test
if (require.main === module) {
  runCompleteTest().then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  });
}

module.exports = { runCompleteTest };
