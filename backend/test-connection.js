const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
    console.log('🔍 QUICK CONNECTION TEST');
    console.log('========================');
    
    try {
        // Test login
        console.log('Testing login...');
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'Admin1@gmail.com',
            password: '123456'
        });
        
        console.log('✅ Login successful!');
        console.log('Token:', response.data.token ? 'Generated' : 'Missing');
        
        // Test getting members
        console.log('\nTesting get members...');
        const token = response.data.token;
        const membersResponse = await axios.get(`${BASE_URL}/personal-members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Members retrieved successfully!');
        console.log('Total members:', membersResponse.data.total);
        
        return true;
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        return false;
    }
}

quickTest().then(success => {
    if (success) {
        console.log('\n🎉 Connection OK! Ready for advanced tests.');
        // Now run the advanced tests
        require('./test-advanced-features.js');
    } else {
        console.log('\n❌ Connection failed. Check server.');
    }
}).catch(console.error);
