// backend/test-subscription-api.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Tạo JWT token cho user thanhtoan@gmail.com
const createToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email: email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const testSubscriptionAPI = async () => {
    try {
        console.log('🧪 Testing Subscription API...');
        
        // Tạo token cho user thanhtoan@gmail.com
        const userId = '6855ab6eb60e04f6ea7d875e';
        const email = 'thanhtoan@gmail.com';
        const token = createToken(userId, email);
        
        console.log('🔑 Generated token for:', email);
        console.log('🔑 Token preview:', token.substring(0, 50) + '...');
        
        // Gọi API
        const response = await axios.get('http://localhost:5000/api/subscription/status', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('✅ API Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('❌ Response Status:', error.response.status);
            console.error('❌ Response Data:', error.response.data);
        }
    }
};

const main = async () => {
    require('dotenv').config();
    await testSubscriptionAPI();
};

if (require.main === module) {
    main();
}
