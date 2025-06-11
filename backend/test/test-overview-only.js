const axios = require('axios');

async function testOverviewStats() {
    try {
        console.log('🔍 Test overview stats API...');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'Admin1@gmail.com',
            password: '123456'
        }, {
            timeout: 15000
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login thành công');
        
        // Test overview stats directly
        console.log('🔍 Test /teams-enhanced/stats/overview...');
        const statsResponse = await axios.get('http://localhost:5000/api/teams-enhanced/stats/overview', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000
        });
        
        console.log('✅ Overview stats API thành công!');
        console.log('📊 Response:', JSON.stringify(statsResponse.data, null, 2));
        
    } catch (error) {
        if (error.response) {
            console.error('❌ Lỗi:', {
                status: error.response.status,
                data: error.response.data,
                message: error.message
            });
        } else if (error.code === 'ECONNABORTED') {
            console.error('❌ Lỗi:', {
                message: 'Timeout',
                code: error.code
            });
        } else {
            console.error('❌ Lỗi:', {
                message: error.message,
                code: error.code
            });
        }
    }
}

testOverviewStats();
