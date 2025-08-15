// Simple Railway API Test
const https = require('https');

const BASE_URL = 'web-production-61868.up.railway.app';
let authToken = '';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
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
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
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
    console.error('❌ Register Error:', error.message);
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
    console.error('❌ Login Error:', error.message);
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
    console.error('❌ Create Project Error:', error.message);
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
    console.error('❌ Get Projects Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Railway API Backend Tests...');
  console.log('🌐 Base URL: https://' + BASE_URL);
  
  try {
    // Test Authentication Flow
    console.log('\n' + '='.repeat(50));
    console.log('📋 STEP 1: AUTHENTICATION FLOW');
    console.log('='.repeat(50));
    
    const registerResponse = await testRegister();
    if (!registerResponse || registerResponse.statusCode !== 201) {
      console.log('⚠️ Registration failed, trying with existing user...');
    }
    
    const testEmail = registerResponse?.data?.user?.email || 'test.railway.1734249783116@example.com';
    const loginResponse = await testLogin(testEmail, '123456');
    
    if (!loginResponse || !authToken) {
      console.error('❌ Authentication failed. Cannot proceed with other tests.');
      return;
    }

    // Test Project Management
    console.log('\n' + '='.repeat(50));
    console.log('📋 STEP 2: PROJECT MANAGEMENT');
    console.log('='.repeat(50));
    
    await testCreateProject();
    await testGetProjects();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 TESTS COMPLETED!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runTests();
