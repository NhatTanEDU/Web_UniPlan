// Test script cho Railway API backend
const https = require('https');

const BASE_URL = 'https://web-production-61868.up.railway.app';
let authToken = '';

// Helper function để thực hiện HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testRegister() {
  console.log('\n🔐 Testing User Registration...');
  
  const userData = {
    full_name: 'Test User Railway',
    email: `test.railway.${Date.now()}@example.com`,
    password: '123456'
  };

  try {
    const response = await makeRequest('POST', '/api/auth/register', userData);
    console.log('✅ Register Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Register Error:', error);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\n🔑 Testing User Login...');
  
  const loginData = {
    email: email,
    password: password
  };

  try {
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    console.log('✅ Login Response:', JSON.stringify(response, null, 2));
    
    if (response.data && response.data.token) {
      authToken = response.data.token;
      console.log('🎯 JWT Token saved for future requests');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Login Error:', error);
    return null;
  }
}

async function testCreateProject() {
  console.log('\n📁 Testing Create Project...');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return null;
  }

  const projectData = {
    name: 'Test Project Railway',
    description: 'Project created for Railway API testing',
    status: 'Active',
    priority: 'Medium'
  };

  try {
    const response = await makeRequest('POST', '/api/projects', projectData, {
      'Authorization': `Bearer ${authToken}`
    });
    console.log('✅ Create Project Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Create Project Error:', error);
    return null;
  }
}

async function testGetProjects() {
  console.log('\n📋 Testing Get Projects...');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return null;
  }

  try {
    const response = await makeRequest('GET', '/api/projects', null, {
      'Authorization': `Bearer ${authToken}`
    });
    console.log('✅ Get Projects Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Get Projects Error:', error);
    return null;
  }
}

async function testCreateKanban(projectId) {
  console.log('\n📊 Testing Create Kanban...');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return null;
  }

  const kanbanData = {
    project_id: projectId,
    name: 'Test Kanban Board',
    description: 'Kanban board for Railway testing'
  };

  try {
    const response = await makeRequest('POST', '/api/kanban', kanbanData, {
      'Authorization': `Bearer ${authToken}`
    });
    console.log('✅ Create Kanban Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Create Kanban Error:', error);
    return null;
  }
}

async function testGetKanbanByProject(projectId) {
  console.log('\n📊 Testing Get Kanban by Project...');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return null;
  }

  try {
    const response = await makeRequest('GET', `/api/kanban/project/${projectId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    console.log('✅ Get Kanban by Project Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Get Kanban by Project Error:', error);
    return null;
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Railway API Backend Tests...');
  console.log('🌐 Base URL:', BASE_URL);
  
  try {
    // Step 1: Test Authentication Flow
    console.log('\n' + '='.repeat(50));
    console.log('📋 STEP 1: AUTHENTICATION FLOW');
    console.log('='.repeat(50));
    
    const registerResponse = await testRegister();
    if (!registerResponse || registerResponse.statusCode !== 201) {
      console.log('⚠️ Registration failed, trying with existing user...');
    }
    
    // Extract email from register response or use test email
    const testEmail = registerResponse?.data?.user?.email || 'test.railway.1734249783116@example.com';
    const loginResponse = await testLogin(testEmail, '123456');
    
    if (!loginResponse || !authToken) {
      console.error('❌ Authentication failed. Cannot proceed with other tests.');
      return;
    }

    // Step 2: Test Project Management
    console.log('\n' + '='.repeat(50));
    console.log('📋 STEP 2: PROJECT MANAGEMENT');
    console.log('='.repeat(50));
    
    const createProjectResponse = await testCreateProject();
    const getProjectsResponse = await testGetProjects();
    
    // Extract project ID for kanban tests
    let projectId = null;
    if (createProjectResponse?.data?.project?._id) {
      projectId = createProjectResponse.data.project._id;
    } else if (getProjectsResponse?.data?.projects?.length > 0) {
      projectId = getProjectsResponse.data.projects[0]._id;
    }

    // Step 3: Test Kanban Features
    if (projectId) {
      console.log('\n' + '='.repeat(50));
      console.log('📋 STEP 3: KANBAN FEATURES');
      console.log('='.repeat(50));
      
      await testCreateKanban(projectId);
      await testGetKanbanByProject(projectId);
    } else {
      console.log('\n⚠️ No project ID available for Kanban tests');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run tests
runAllTests();
