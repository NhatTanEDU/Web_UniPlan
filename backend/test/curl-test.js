// Curl test for team detail stats
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function curlTest() {
    try {
        // 1. Login
        console.log('🔍 Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'Admin1@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token length:', token.length);
        
        // 2. Test with curl equivalent
        console.log('🔍 Testing team detail with simple request...');
        
        const teamId = '6836e26f05f8ce7aef718d83';
        const url = `${BASE_URL}/teams-enhanced/${teamId}/stats/detail`;
        
        console.log('📍 URL:', url);
        console.log('📍 Headers:', { Authorization: `Bearer ${token.substring(0, 20)}...` });
        
        // Simple GET request với timeout rất ngắn
        const response = await axios.get(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 3000,
            validateStatus: () => true // Accept any status code
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', response.headers['content-type']);
        console.log('📊 Response data (first 200 chars):', 
            JSON.stringify(response.data).substring(0, 200) + '...');
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ TIMEOUT after 3 seconds');
        } else if (error.response) {
            console.error('❌ HTTP Error:', error.response.status);
            console.error('❌ Response:', error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

curlTest();
