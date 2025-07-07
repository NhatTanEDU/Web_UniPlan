const axios = require('axios');

async function testLogin() {
    try {
        console.log('🔍 Test route auth/login...');
        
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'Admin1@gmail.com',
            password: '123456'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        console.log('✅ Login thành công!');
        console.log('Response:', loginResponse.data);
        
    } catch (error) {
        console.error('❌ Lỗi:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            code: error.code
        });
    }
}


testLogin();
