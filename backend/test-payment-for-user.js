// Test trực tiếp payment API cho user tandeptrai1@gmail.com
const axios = require('axios');

async function testPaymentForUser() {
    try {
        console.log('🔑 Login with tandeptrai1@gmail.com...');
        
        // Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'tandeptrai1@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('🎫 Token:', token.substring(0, 50) + '...');
        
        // Test payment creation
        console.log('\n💳 Creating payment...');
        
        const paymentResponse = await axios.post('http://localhost:5000/api/payment/create', {
            planType: 'monthly'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Payment created successfully!');
        console.log('💳 Response:', paymentResponse.data);
        
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.statusText);
        console.log('📄 Error data:', error.response?.data);
        console.log('📄 Error message:', error.message);
    }
}

testPaymentForUser();
