const axios = require('axios');

// Test script to verify addMemberToTeam function fix
async function testAddMemberToTeam() {
    const baseURL = 'http://localhost:3001';
    
    console.log('🧪 Testing addMemberToTeam function fix...\n');
    
    try {
        // First, let's try to login to get a token
        console.log('1. Attempting to login...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'test@example.com',
            password: 'testpassword'
        }).catch(err => {
            console.log('   ⚠️  Login failed (expected if no test user exists)');
            return null;
        });
        
        let token = null;
        if (loginResponse) {
            token = loginResponse.data.token;
            console.log('   ✅ Login successful');
        }
        
        // Test the addMemberToTeam endpoint with various scenarios
        console.log('\n2. Testing addMemberToTeam endpoint...');
        
        const testCases = [
            {
                name: 'Invalid team ID',
                data: { teamId: 'invalid-id', userId: '123', role: 'member' }
            },
            {
                name: 'Missing required fields', 
                data: { teamId: '123' }
            },
            {
                name: 'Non-existent team',
                data: { teamId: '999999', userId: '123', role: 'member' }
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n   Testing: ${testCase.name}`);
            
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                const response = await axios.post(
                    `${baseURL}/api/teams/add-member`,
                    testCase.data,
                    { headers, timeout: 5000 }
                );
                
                console.log(`   ✅ Response status: ${response.status}`);
                
            } catch (error) {
                if (error.response) {
                    console.log(`   ✅ Expected error response: ${error.response.status}`);
                    console.log(`   📝 Error message: ${error.response.data?.message || 'No message'}`);
                    
                    // Check if response was sent properly (no hanging connections)
                    if (error.response.status && error.response.data) {
                        console.log('   ✅ Response handled properly - no connection leak');
                    }
                } else if (error.code === 'ECONNREFUSED') {
                    console.log('   ⚠️  Server not running');
                    return false;
                } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
                    console.log('   ❌ Connection issue detected - possible pool exhaustion!');
                    return false;
                } else {
                    console.log(`   ⚠️  Network error: ${error.message}`);
                }
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n3. Testing rapid consecutive requests (connection pool stress test)...');
        
        // Fire multiple requests rapidly to test connection pool
        const rapidRequests = [];
        for (let i = 0; i < 10; i++) {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            rapidRequests.push(
                axios.post(
                    `${baseURL}/api/teams/add-member`,
                    { teamId: 'test-' + i, userId: '123', role: 'member' },
                    { headers, timeout: 3000 }
                ).catch(err => ({
                    error: true,
                    status: err.response?.status,
                    message: err.response?.data?.message,
                    code: err.code
                }))
            );
        }
        
        const results = await Promise.all(rapidRequests);
        
        let successCount = 0;
        let errorCount = 0;
        let connectionIssues = 0;
        
        results.forEach((result, index) => {
            if (result.error) {
                if (result.code === 'ECONNRESET' || result.code === 'ETIMEDOUT') {
                    connectionIssues++;
                    console.log(`   ❌ Request ${index + 1}: Connection issue (${result.code})`);
                } else {
                    errorCount++;
                    console.log(`   ✅ Request ${index + 1}: Proper error response (${result.status})`);
                }
            } else {
                successCount++;
                console.log(`   ✅ Request ${index + 1}: Success (${result.status})`);
            }
        });
        
        console.log('\n📊 Rapid request test results:');
        console.log(`   ✅ Proper responses: ${successCount + errorCount}`);
        console.log(`   ❌ Connection issues: ${connectionIssues}`);
        
        if (connectionIssues === 0) {
            console.log('\n🎉 SUCCESS: No connection pool exhaustion detected!');
            console.log('   The addMemberToTeam fix appears to be working correctly.');
            return true;
        } else {
            console.log('\n⚠️  WARNING: Connection pool issues still detected!');
            console.log('   The fix may need additional work.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testAddMemberToTeam().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testAddMemberToTeam };
