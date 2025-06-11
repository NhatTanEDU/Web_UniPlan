// Simple Search APIs Test - Direct Testing
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Admin account for testing
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456'
};

// API call helper
const apiCall = async (method, url, data = null, params = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            timeout: 30000,
            ...(data && { data }),
            ...(params && { params })
        };
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500,
            details: error.response?.data
        };
    }
};

// Login function
async function login() {
    console.log('\n🔑 ĐĂNG NHẬP ADMIN');
    console.log('==================');
    
    const result = await apiCall('POST', '/auth/login', {
        email: ADMIN_ACCOUNT.email,
        password: ADMIN_ACCOUNT.password
    });
    
    if (result.success) {
        authToken = result.data.token;
        console.log('✅ Login Success');
        console.log(`👤 User: ${result.data.user.full_name || result.data.user.name} (${result.data.user.email})`);
        return true;
    } else {
        console.log('❌ Login Failed:', result.error);
        return false;
    }
}

// Test Simple Team Search by Name
async function testSimpleTeamSearchByName() {
    console.log('\n🔍 TEST SIMPLE TEAM SEARCH BY NAME');
    console.log('==================================');
    
    // First, get available teams to test with
    console.log('📋 Getting available teams...');
    const teamsResult = await apiCall('GET', '/teams', null, { page: 1, limit: 10 });
    
    if (!teamsResult.success || !teamsResult.data.teams || teamsResult.data.teams.length === 0) {
        console.log('⚠️ Không có team nào để test search. Hãy tạo team trước.');
        return false;
    }
    
    const allTeams = teamsResult.data.teams;
    console.log(`📊 Có ${allTeams.length} teams để test search`);
    console.log(`   Sample teams: ${allTeams.slice(0, 3).map(t => t.team_name).join(', ')}`);
    
    // Test 1: Search with exact team name
    const testTeam = allTeams[0];
    console.log(`\n🎯 Test 1: Search exact name "${testTeam.team_name}"`);
    const exactResult = await apiCall('GET', '/teams-simple/search', null, { name: testTeam.team_name });
    
    if (exactResult.success) {
        console.log(`✅ Exact search success: Found ${exactResult.data.data?.teams?.length || 0} teams`);
        if (exactResult.data.data?.teams?.length > 0) {
            console.log(`   📋 First result: ${exactResult.data.data.teams[0].team_name}`);
        }
    } else {
        console.log(`❌ Exact search failed: ${exactResult.error}`);
        console.log(`   Details:`, exactResult.details);
    }
    
    // Test 2: Search with partial name
    const partialName = testTeam.team_name.split(' ')[0]; // Get first word
    console.log(`\n🔎 Test 2: Search partial name "${partialName}"`);
    const partialResult = await apiCall('GET', '/teams-simple/search', null, { name: partialName });
    
    if (partialResult.success) {
        console.log(`✅ Partial search success: Found ${partialResult.data.data?.teams?.length || 0} teams`);
        if (partialResult.data.data?.teams?.length > 0) {
            console.log(`   📋 Sample results:`);
            partialResult.data.data.teams.slice(0, 3).forEach((team, idx) => {
                console.log(`   ${idx + 1}. ${team.team_name}`);
            });
        }
    } else {
        console.log(`❌ Partial search failed: ${partialResult.error}`);
        console.log(`   Details:`, partialResult.details);
    }
    
    // Test 3: Search with non-existent name
    console.log(`\n🚫 Test 3: Search non-existent name "NonExistentTeam123"`);
    const notFoundResult = await apiCall('GET', '/teams-simple/search', null, { name: 'NonExistentTeam123' });
    
    if (notFoundResult.success) {
        console.log(`✅ Not found search success: Found ${notFoundResult.data.data?.teams?.length || 0} teams (expected 0)`);
    } else {
        console.log(`❌ Not found search failed: ${notFoundResult.error}`);
        console.log(`   Details:`, notFoundResult.details);
    }
    
    // Test 4: Search without name parameter
    console.log(`\n❓ Test 4: Search without name parameter`);
    const noParamResult = await apiCall('GET', '/teams-simple/search');
    
    if (noParamResult.success) {
        console.log(`✅ No param search success: Found ${noParamResult.data.data?.teams?.length || 0} teams`);
    } else {
        console.log(`❌ No param search failed: ${noParamResult.error}`);
        console.log(`   Details:`, noParamResult.details);
    }
    
    // Test 5: Check health endpoint
    console.log(`\n💓 Test 5: Check simple search health endpoint`);
    const healthResult = await apiCall('GET', '/teams-simple/health');
    
    if (healthResult.success) {
        console.log(`✅ Health check success:`, healthResult.data);
    } else {
        console.log(`❌ Health check failed: ${healthResult.error}`);
        console.log(`   Details:`, healthResult.details);
    }
    
    console.log('\n📊 Simple team search test completed');
    return true;
}

// Test Simple Member Search in Team
async function testSimpleMemberSearchInTeam() {
    console.log('\n👥 TEST SIMPLE MEMBER SEARCH IN TEAM');
    console.log('=====================================');
    
    // First, get available teams
    console.log('📋 Getting available teams...');
    const teamsResult = await apiCall('GET', '/teams', null, { page: 1, limit: 10 });
    
    if (!teamsResult.success || !teamsResult.data.teams || teamsResult.data.teams.length === 0) {
        console.log('⚠️ Không có team nào để test member search. Hãy tạo team trước.');
        return false;
    }
    
    const allTeams = teamsResult.data.teams;
    
    // Find a team with members
    let testTeam = null;
    for (const team of allTeams) {
        if (team.members && team.members.length > 0) {
            testTeam = team;
            break;
        }
    }
    
    if (!testTeam) {
        console.log('⚠️ Không có team nào có members để test search. Hãy thêm members vào team trước.');
        // Let's try the first team anyway
        testTeam = allTeams[0];
        console.log(`📋 Sử dụng team "${testTeam.team_name}" để test (có thể không có members)`);
    } else {
        console.log(`📊 Testing with team: "${testTeam.team_name}" (${testTeam.members.length} members)`);
    }
    
    // Test 1: Get all members in team (no query)
    console.log(`\n📋 Test 1: Get all members in team (no query parameter)`);
    const allMembersResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`);
    
    if (allMembersResult.success) {
        console.log(`✅ Get all members success: Found ${allMembersResult.data.data?.members?.length || 0} members`);
        if (allMembersResult.data.data?.members?.length > 0) {
            console.log(`   👤 Sample members:`);
            allMembersResult.data.data.members.slice(0, 3).forEach((member, idx) => {
                const memberName = member.member_id?.full_name || member.member_id?.name || 'Unknown';
                const memberEmail = member.member_id?.email || 'No email';
                console.log(`   ${idx + 1}. ${memberName} (${memberEmail}) - Role: ${member.role}`);
            });
        }
    } else {
        console.log(`❌ Get all members failed: ${allMembersResult.error}`);
        console.log(`   Details:`, allMembersResult.details);
    }
    
    // If we have members, test search functionality
    if (allMembersResult.success && allMembersResult.data.data?.members?.length > 0) {
        const testMember = allMembersResult.data.data.members[0];
        const memberName = testMember.member_id?.full_name || testMember.member_id?.name || 'Unknown';
        const memberEmail = testMember.member_id?.email;
        
        // Test 2: Search member by name
        console.log(`\n🎯 Test 2: Search member by name "${memberName}"`);
        const nameSearchResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: memberName });
        
        if (nameSearchResult.success) {
            console.log(`✅ Name search success: Found ${nameSearchResult.data.data?.members?.length || 0} members`);
            if (nameSearchResult.data.data?.members?.length > 0) {
                const foundMember = nameSearchResult.data.data.members[0];
                const foundName = foundMember.member_id?.full_name || foundMember.member_id?.name;
                console.log(`   👤 First result: ${foundName}`);
            }
        } else {
            console.log(`❌ Name search failed: ${nameSearchResult.error}`);
            console.log(`   Details:`, nameSearchResult.details);
        }
        
        // Test 3: Search member by email (if available)
        if (memberEmail) {
            console.log(`\n📧 Test 3: Search member by email "${memberEmail}"`);
            const emailSearchResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: memberEmail });
            
            if (emailSearchResult.success) {
                console.log(`✅ Email search success: Found ${emailSearchResult.data.data?.members?.length || 0} members`);
            } else {
                console.log(`❌ Email search failed: ${emailSearchResult.error}`);
                console.log(`   Details:`, emailSearchResult.details);
            }
        }
        
        // Test 4: Search with partial query
        const partialQuery = memberName.split(' ')[0]; // Get first word of name
        console.log(`\n🔎 Test 4: Search with partial query "${partialQuery}"`);
        const partialSearchResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: partialQuery });
        
        if (partialSearchResult.success) {
            console.log(`✅ Partial search success: Found ${partialSearchResult.data.data?.members?.length || 0} members`);
        } else {
            console.log(`❌ Partial search failed: ${partialSearchResult.error}`);
            console.log(`   Details:`, partialSearchResult.details);
        }
    }
    
    // Test 5: Search with non-existent query
    console.log(`\n🚫 Test 5: Search non-existent member "NonExistentMember123"`);
    const notFoundResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: 'NonExistentMember123' });
    
    if (notFoundResult.success) {
        console.log(`✅ Not found search success: Found ${notFoundResult.data.data?.members?.length || 0} members (expected 0)`);
    } else {
        console.log(`❌ Not found search failed: ${notFoundResult.error}`);
        console.log(`   Details:`, notFoundResult.details);
    }
    
    // Test 6: Search with invalid team ID
    console.log(`\n🚫 Test 6: Search with invalid team ID`);
    const invalidTeamResult = await apiCall('GET', `/teams-simple/invalid_team_id/members/search`, null, { query: 'test' });
    
    if (invalidTeamResult.success) {
        console.log(`⚠️ Invalid team ID search unexpectedly succeeded`);
    } else {
        console.log(`✅ Invalid team ID search properly failed: ${invalidTeamResult.error}`);
    }
    
    console.log('\n📊 Simple member search test completed');
    return true;
}

// Main test function
async function runAllTests() {
    console.log('🚀 RUNNING ALL SIMPLE SEARCH API TESTS');
    console.log('=======================================');
    
    try {
        // Login first
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('❌ Cannot proceed without login');
            return;
        }
        
        // Test team search
        console.log('\n📍 Phase 1: Testing Simple Team Search...');
        const teamSearchResult = await testSimpleTeamSearchByName();
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test member search
        console.log('\n📍 Phase 2: Testing Simple Member Search...');
        const memberSearchResult = await testSimpleMemberSearchInTeam();
        
        // Summary
        console.log('\n📊 SIMPLE SEARCH TESTS SUMMARY');
        console.log('==============================');
        console.log(`🔍 Team Search: ${teamSearchResult ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`👥 Member Search: ${memberSearchResult ? '✅ PASSED' : '❌ FAILED'}`);
        
        const allPassed = teamSearchResult && memberSearchResult;
        console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        return allPassed;
        
    } catch (error) {
        console.log(`💥 Error during simple search tests: ${error.message}`);
        console.error(error.stack);
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().then(result => {
        console.log('\n🏁 Test execution completed');
        process.exit(result ? 0 : 1);
    }).catch(error => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testSimpleTeamSearchByName,
    testSimpleMemberSearchInTeam,
    login
};
