const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456'
};

// Global variables
let authToken = '';
let testUserId = '';

// Helper function to create axios config
function createConfig(method, url, data = null, params = null) {
    const config = {
        method,
        url,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) config.data = data;
    if (params) config.params = params;
    
    return config;
}

// Login function
async function login() {
    console.log('\n=== 🔐 ĐĂNG NHẬP ===');
    try {        console.log('🔗 Connecting to:', `${BASE_URL}/auth/login`);
        console.log('📧 Using credentials:', ADMIN_ACCOUNT.email);
        
        const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_ACCOUNT);
        authToken = response.data.token;
        testUserId = response.data.user.id;
        console.log('✅ Đăng nhập thành công!');
        console.log('👤 User ID:', testUserId);
        return true;
    } catch (error) {
        console.log('❌ Đăng nhập thất bại:', error.response?.data?.message || error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }
        console.log('   Full error:', error.code || error.message);
        return false;
    }
}

// Test searching for "New Ghost" specifically
async function testSearchNewGhost() {
    console.log('\n=== 🔍 TESTING NEW GHOST SEARCH ===');
    
    // Test 1: Search for "New Ghost" in team member add search    console.log('\n1. Testing team member search for "New Ghost"...');
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/teams/members/search`, null, { 
                team_id: '683a2523ddf616be1a376995',
                search: 'New Ghost',
                page: 1,
                limit: 10
            })
        );
        
        console.log('✅ Search successful!');
        console.log('📊 Total results:', response.data.pagination?.total || 0);
        console.log('👥 Users found:', response.data.users?.length || 0);
        
        if (response.data.users && response.data.users.length > 0) {
            console.log('\n📋 Found users:');
            response.data.users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.full_name} - ${user.email} (ID: ${user._id})`);
            });
            
            // Check if New Ghost is in the results
            const newGhost = response.data.users.find(u => u.email === 'newghost@gmail.com');
            if (newGhost) {
                console.log('🎉 SUCCESS: New Ghost found in search results!');
                return true;
            } else {
                console.log('❌ New Ghost not found in results');
                return false;
            }
        } else {
            console.log('❌ No users found');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Search failed:', error.response?.data || error.message);
        return false;
    }
}

// Test searching with email directly
async function testSearchByEmail() {    console.log('\n2. Testing search by email "newghost@gmail.com"...');
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/teams/members/search`, null, { 
                team_id: '683a2523ddf616be1a376995',
                search: 'newghost@gmail.com',
                page: 1,
                limit: 10
            })
        );
        
        console.log('✅ Email search successful!');
        console.log('📊 Total results:', response.data.pagination?.total || 0);
        console.log('👥 Users found:', response.data.users?.length || 0);
        
        if (response.data.users && response.data.users.length > 0) {
            console.log('\n📋 Found users:');
            response.data.users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.full_name} - ${user.email} (ID: ${user._id})`);
            });
            return true;
        } else {
            console.log('❌ No users found');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Email search failed:', error.response?.data || error.message);
        return false;
    }
}

// Check database directly for New Ghost user
async function checkNewGhostInDatabase() {
    console.log('\n=== 🗄️ CHECKING NEW GHOST IN DATABASE ===');
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members`, null, { 
                page: 1,
                limit: 100
            })
        );
        
        if (response.data && response.data.data) {
            const allMembers = response.data.data;
            const newGhost = allMembers.find(member => 
                member.email === 'newghost@gmail.com' || 
                (member.member_user_id && member.member_user_id.email === 'newghost@gmail.com')
            );
            
            if (newGhost) {
                console.log('✅ New Ghost found in database:');
                console.log('   ID:', newGhost._id || newGhost.member_user_id?._id);
                console.log('   Name:', newGhost.name || newGhost.member_user_id?.full_name);
                console.log('   Email:', newGhost.email || newGhost.member_user_id?.email);
                console.log('   Is Active:', newGhost.is_active || newGhost.member_user_id?.is_active);
                return true;
            } else {
                console.log('❌ New Ghost not found in personal members list');
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Database check failed:', error.response?.data || error.message);
        return false;
    }
}

// Main test function
async function runTest() {
    console.log('🚀 Starting New Ghost Search Test...');
    
    // Login first
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ Cannot continue without login');
        return;
    }
    
    // Check if New Ghost exists in database
    const dbCheck = await checkNewGhostInDatabase();
    if (!dbCheck) {
        console.log('❌ New Ghost not found in database - cannot proceed with search tests');
        return;
    }
    
    // Test searching by name
    const nameSearchResult = await testSearchNewGhost();
    
    // Test searching by email
    const emailSearchResult = await testSearchByEmail();
    
    // Summary
    console.log('\n=== 📊 TEST SUMMARY ===');
    console.log('Database check:', dbCheck ? '✅ PASS' : '❌ FAIL');
    console.log('Name search:', nameSearchResult ? '✅ PASS' : '❌ FAIL');
    console.log('Email search:', emailSearchResult ? '✅ PASS' : '❌ FAIL');
    
    if (nameSearchResult && emailSearchResult) {
        console.log('\n🎉 ALL TESTS PASSED! New Ghost search is working correctly.');
    } else {
        console.log('\n❌ Some tests failed. New Ghost search needs further investigation.');
    }
}

// Run the test
runTest().catch(console.error);
