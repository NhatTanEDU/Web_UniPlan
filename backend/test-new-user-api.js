// backend/test-new-user-api.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

const testNewUserAPI = async () => {
    try {
        require('dotenv').config();
        
        console.log('🧪 Testing NEW User Subscription API...');
        
        // User mới vừa tạo
        const userId = '6855aef1b92d5fb53e42dca8';
        const email = 'test.new.user.1750445809783@gmail.com';
        
        const token = jwt.sign(
            { id: userId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('🔑 Testing with NEW user:', email);
        
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
        
        // Kiểm tra kết quả
        if (response.data.subscriptionType === 'free_trial' && response.data.isPremium === false) {
            console.log('🎉 SUCCESS: New user correctly has free_trial plan!');
        } else {
            console.log('❌ FAIL: New user has wrong plan type!');
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('❌ Response Status:', error.response.status);
            console.error('❌ Response Data:', error.response.data);
        }
    }
};

if (require.main === module) {
    testNewUserAPI();
}
