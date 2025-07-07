// Test login để lấy token mới
const axios = require('axios');

async function testLogin() {
    try {        console.log('🔑 Testing login API...\n');
          const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin1@gmail.com',
            password: '123456' // Password đúng
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('🎫 New Token:', response.data.token);
        console.log('👤 User Info:', response.data.user);
        
        return response.data.token;
        
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
        
        // Thử password khác
        const passwords = ['123456', 'password', 'admin', '12345678'];
        
        for (const pwd of passwords) {
            try {
                console.log(`🔄 Trying password: ${pwd}`);                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email: 'admin1@gmail.com',
                    password: pwd
                });
                
                console.log('✅ Login successful with password:', pwd);
                console.log('🎫 New Token:', response.data.token);
                return response.data.token;
                
            } catch (err) {
                console.log(`❌ Failed with ${pwd}: ${err.response?.data?.message || err.message}`);
            }
        }
        
        return null;
    }
}

// Test payment API với token mới
async function testPaymentAPI(token) {
    if (!token) {
        console.log('❌ No token available for payment test');
        return;
    }
      try {
        console.log('\n🧪 Testing payment test route (no rate limit)...');
        console.log('🔑 Token preview:', token.substring(0, 50) + '...');
        
        const response = await axios.post('http://localhost:5000/api/payment/test-no-limit', {
            test: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Payment test route works!');
        console.log('🧪 Response:', response.data);
        
        // Now test the actual create route
        console.log('\n💳 Testing actual payment/create route...');
        const createResponse = await axios.post('http://localhost:5000/api/payment/create', {
            amount: 10000,
            planType: 'monthly'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Payment create route works!');
        console.log('💳 Create Response:', createResponse.data);
        
    } catch (error) {
        console.log('❌ Payment API failed:', error.response?.status, error.response?.data || error.message);
    }
}

async function main() {
    const token = await testLogin();
    await testPaymentAPI(token);
}

main().catch(console.error);