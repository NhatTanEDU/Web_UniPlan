/**
 * Test script để kiểm tra việc sửa lỗi project_type_id
 * Kiểm tra xem project_type_id có được truyền đúng từ frontend đến backend không
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testData = {
  userId: null,
  teamId: null,
  projectTypeId: null,
  createdProjectId: null
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null, includeAuth = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: includeAuth && authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

// Step 1: Login
async function login() {
  console.log('\n🔐 ĐĂNG NHẬP...');
  const loginData = {
    email: 'hieuha2003@gmail.com',
    password: '123456'
  };
  
  const result = await apiCall('POST', '/auth/login', loginData, false);
  if (result.success) {
    authToken = result.data.token;
    testData.userId = result.data.user.userId;
    console.log('✅ Đăng nhập thành công');
    console.log(`👤 User ID: ${testData.userId}`);
    return true;
  } else {
    console.log('❌ Đăng nhập thất bại:', result.error);
    return false;
  }
}

// Step 2: Get project types
async function getProjectTypes() {
  console.log('\n📋 LẤY DANH SÁCH PROJECT TYPES...');
  const result = await apiCall('GET', '/project-types');
  
  if (result.success) {
    const projectTypes = result.data;
    console.log(`✅ Tìm thấy ${projectTypes.length} project types`);
    
    // Tìm project type khác "Không phân loại"
    const marketingType = projectTypes.find(pt => pt.name.toLowerCase().includes('marketing'));
    const nonDefaultType = projectTypes.find(pt => pt.name !== 'Không phân loại');
    
    testData.projectTypeId = marketingType?._id || nonDefaultType?._id || projectTypes[0]?._id;
    
    if (testData.projectTypeId) {
      const selectedType = projectTypes.find(pt => pt._id === testData.projectTypeId);
      console.log(`🎯 Sử dụng project type: "${selectedType.name}" (ID: ${testData.projectTypeId})`);
      return true;
    } else {
      console.log('❌ Không tìm thấy project type phù hợp');
      return false;
    }
  } else {
    console.log('❌ Lỗi lấy project types:', result.error);
    return false;
  }
}

// Step 3: Create or get a team
async function createOrGetTeam() {
  console.log('\n👥 TẠO HOẶC LẤY TEAM...');
  
  // Thử lấy team có sẵn trước
  const getTeamsResult = await apiCall('GET', '/teams?limit=1');
  if (getTeamsResult.success && getTeamsResult.data.teams && getTeamsResult.data.teams.length > 0) {
    testData.teamId = getTeamsResult.data.teams[0]._id;
    console.log(`✅ Sử dụng team có sẵn: "${getTeamsResult.data.teams[0].team_name}" (ID: ${testData.teamId})`);
    return true;
  }
  
  // Nếu không có team, tạo mới
  const teamData = {
    team_name: `Test Team Project Type Fix ${Date.now()}`,
    description: 'Team để test việc sửa lỗi project_type_id',
    type: 'Project',
    members: []
  };
  
  const result = await apiCall('POST', '/teams', teamData);
  if (result.success) {
    testData.teamId = result.data.team._id;
    console.log(`✅ Tạo team mới thành công: "${result.data.team.team_name}" (ID: ${testData.teamId})`);
    return true;
  } else {
    console.log('❌ Lỗi tạo team:', result.error);
    return false;
  }
}

// Step 4: Test tạo project với project_type_id thông qua team API
async function testCreateProjectWithTypeId() {
  console.log('\n🆕 TEST TẠO PROJECT VỚI PROJECT_TYPE_ID...');
  
  const projectData = {
    project_name: `Test Project Type Fix ${Date.now()}`,
    description: 'Test project để kiểm tra việc truyền project_type_id từ frontend đến backend',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'Active',
    priority: 'High',
    project_type_id: testData.projectTypeId, // 🎯 ĐIỀU QUAN TRỌNG: Truyền project_type_id
    team_id: testData.teamId
  };
  
  console.log('📝 Project data gửi lên backend:');
  console.log(JSON.stringify(projectData, null, 2));
  
  // Test tạo project trực tiếp qua project API
  const result = await apiCall('POST', '/projects', projectData);
  
  if (result.success) {
    const createdProject = result.data.project;
    testData.createdProjectId = createdProject._id;
    
    console.log('✅ Tạo project thành công!');
    console.log(`📋 Project Name: ${createdProject.project_name}`);
    console.log(`🆔 Project ID: ${createdProject._id}`);
    console.log(`🏷️ Project Type ID trong response: ${createdProject.project_type_id}`);
    
    // Kiểm tra xem project_type_id có được lưu đúng không
    if (createdProject.project_type_id === testData.projectTypeId) {
      console.log('🎉 SUCCESS: project_type_id được truyền và lưu đúng!');
      return true;
    } else {
      console.log('⚠️ WARNING: project_type_id không khớp!');
      console.log(`   Expected: ${testData.projectTypeId}`);
      console.log(`   Actual: ${createdProject.project_type_id}`);
      return false;
    }
  } else {
    console.log('❌ Lỗi tạo project:', result.error);
    return false;
  }
}

// Step 5: Verify project trong database
async function verifyProjectInDatabase() {
  console.log('\n🔍 KIỂM TRA PROJECT TRONG DATABASE...');
  
  const result = await apiCall('GET', `/projects/${testData.createdProjectId}`);
  
  if (result.success) {
    const project = result.data;
    console.log('✅ Lấy project từ database thành công');
    console.log(`📋 Project Name: ${project.project_name}`);
    console.log(`🏷️ Project Type ID: ${project.project_type_id?._id || project.project_type_id}`);
    console.log(`🏷️ Project Type Name: ${project.project_type_id?.name || 'N/A'}`);
    
    // Kiểm tra project type
    const actualTypeId = project.project_type_id?._id || project.project_type_id;
    if (actualTypeId === testData.projectTypeId) {
      console.log('🎉 SUCCESS: project_type_id được lưu đúng trong database!');
      return true;
    } else {
      console.log('❌ FAILED: project_type_id không đúng trong database');
      console.log(`   Expected: ${testData.projectTypeId}`);
      console.log(`   Actual: ${actualTypeId}`);
      return false;
    }
  } else {
    console.log('❌ Lỗi lấy project từ database:', result.error);
    return false;
  }
}

// Step 6: Test team projects API
async function testTeamProjectsAPI() {
  console.log('\n👥 TEST TEAM PROJECTS API...');
  
  const result = await apiCall('GET', `/teams/${testData.teamId}/projects`);
  
  if (result.success) {
    const teamProjects = result.data.projects;
    console.log(`✅ Lấy team projects thành công: ${teamProjects.length} projects`);
    
    const testProject = teamProjects.find(p => p._id === testData.createdProjectId);
    if (testProject) {
      console.log('✅ Tìm thấy test project trong team');
      console.log(`🏷️ Project Type ID: ${testProject.project_type_id?._id || testProject.project_type_id}`);
      console.log(`🏷️ Project Type Name: ${testProject.project_type_id?.name || 'N/A'}`);
      
      const actualTypeId = testProject.project_type_id?._id || testProject.project_type_id;
      if (actualTypeId === testData.projectTypeId) {
        console.log('🎉 SUCCESS: project_type_id đúng trong team projects API!');
        return true;
      } else {
        console.log('❌ FAILED: project_type_id không đúng trong team projects API');
        return false;
      }
    } else {
      console.log('❌ Không tìm thấy test project trong team');
      return false;
    }
  } else {
    console.log('❌ Lỗi lấy team projects:', result.error);
    return false;
  }
}

// Main test function
async function runTest() {
  console.log('🧪 BẮT ĐẦU TEST PROJECT_TYPE_ID FIX');
  console.log('=' .repeat(60));
  
  try {
    // Chạy các bước test
    const loginSuccess = await login();
    if (!loginSuccess) return;
    
    const typesSuccess = await getProjectTypes();
    if (!typesSuccess) return;
    
    const teamSuccess = await createOrGetTeam();
    if (!teamSuccess) return;
    
    const createSuccess = await testCreateProjectWithTypeId();
    if (!createSuccess) return;
    
    const verifySuccess = await verifyProjectInDatabase();
    if (!verifySuccess) return;
    
    const teamAPISuccess = await testTeamProjectsAPI();
    
    console.log('\n' + '=' .repeat(60));
    if (createSuccess && verifySuccess && teamAPISuccess) {
      console.log('🎉 TẤT CẢ TEST CASE THÀNH CÔNG!');
      console.log('✅ Lỗi project_type_id đã được sửa hoàn toàn');
    } else {
      console.log('❌ MỘT SỐ TEST CASE THẤT BẠI');
      console.log('⚠️ Cần kiểm tra lại code');
    }
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  runTest();
}

module.exports = { runTest };
