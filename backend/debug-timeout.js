const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Admin login to get token
async function loginAdmin() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin1@gmail.com',
            password: '123456'
        });
        
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return null;
    }
}

// Test search teams API with timeout
async function testSearchTeams(token) {
    try {
        console.log('🔍 Testing search teams API...');
        
        const startTime = Date.now();
        const response = await axios.get(`${BASE_URL}/teams-enhanced/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                searchTerm: 'test',
                page: 1,
                limit: 5
            },
            timeout: 5000 // Only 5 seconds to see if it's really slow
        });
        
        const duration = Date.now() - startTime;
        console.log(`✅ Search completed in ${duration}ms`);
        console.log(`Found ${response.data.data?.teams?.length || 0} teams`);
        
    } catch (error) {
        const duration = Date.now() - Date.now();
        if (error.code === 'ECONNABORTED') {
            console.log(`⏰ Search timed out after 5000ms`);
        } else {
            console.error('❌ Search error:', error.response?.data || error.message);
        }
    }
}

// Test bulk add API with timeout
async function testBulkAdd(token, teamId) {
    try {
        console.log('🔍 Testing bulk add API...');
        
        const startTime = Date.now();
        const response = await axios.post(`${BASE_URL}/teams-enhanced/${teamId}/members/bulk/add`, {
            userIds: ['68358b27e31157981e931d83'], // Just 1 user
            role: 'Member'
        }, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000 // Only 5 seconds
        });
        
        const duration = Date.now() - startTime;
        console.log(`✅ Bulk add completed in ${duration}ms`);
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log(`⏰ Bulk add timed out after 5000ms`);
        } else {
            console.error('❌ Bulk add error:', error.response?.data || error.message);
        }
    }
}

// Create a simple test team
async function createTestTeam(token) {
    try {
        const response = await axios.post(`${BASE_URL}/teams`, {
            team_name: 'Debug Test Team',
            description: 'For debugging timeout issues'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data.team._id;
    } catch (error) {
        console.error('Failed to create test team:', error.response?.data || error.message);
        return null;
    }
}

async function main() {
    console.log('🐛 DEBUG: Testing timeout issues...');
    
    // Login
    const token = await loginAdmin();
    if (!token) {
        console.log('❌ Cannot proceed without token');
        return;
    }
    console.log('✅ Login successful');
    
    // Create test team
    const teamId = await createTestTeam(token);
    if (!teamId) {
        console.log('❌ Cannot proceed without team');
        return;
    }
    console.log(`✅ Test team created: ${teamId}`);
    
    // Test search (this should be fast)
    await testSearchTeams(token);
    
    // Test bulk add (this should be fast too)
    await testBulkAdd(token, teamId);
    
    // Cleanup
    try {
        await axios.delete(`${BASE_URL}/teams/${teamId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Test team deleted');
    } catch (error) {
        console.log('⚠️ Failed to delete test team');
    }
}

main().catch(console.error);
