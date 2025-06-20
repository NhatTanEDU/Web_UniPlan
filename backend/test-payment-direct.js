// Test trực tiếp API payment với đúng user ID
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testPaymentDirect() {
  try {
    // Tạo token mới với đúng user ID
    const userId = '6855a3a7736a993ccfbfa9d1';
    const token = jwt.sign(
      { 
        id: userId, 
        email: 'tandeptrai1@gmail.com' 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    console.log('🎫 Created fresh token for user:', userId);
    console.log('🎫 Token:', token.substring(0, 50) + '...');
    
    // Test payment API
    console.log('\n💳 Testing payment API...');
    
    const response = await axios.post('http://localhost:5000/api/payment/create', {
      planType: 'monthly'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment created successfully!');
    console.log('📄 Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.statusText);
    console.log('📄 Error data:');
    console.log(JSON.stringify(error.response?.data, null, 2));
  }
}

testPaymentDirect();
