// Script test frontend flow nhanh
const axios = require('axios');

async function testFrontendFlow() {
  try {
    console.log('🧪 Testing complete frontend flow...\n');
    
    // Step 1: Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'tandeptrai1@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get subscription status
    console.log('2️⃣ Testing subscription status...');
    const statusResponse = await axios.get('http://localhost:5000/api/subscription/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Subscription status:', statusResponse.data.subscriptionType);
    console.log('📊 Status details:', {
      isPremium: statusResponse.data.isPremium,
      isActive: statusResponse.data.isActive,
      daysRemaining: statusResponse.data.daysRemaining
    });
    
    // Step 3: Test payment creation
    console.log('3️⃣ Testing payment creation...');
    const paymentResponse = await axios.post('http://localhost:5000/api/payment/create', {
      planType: 'monthly'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Payment created successfully!');
    console.log('💳 Payment URL:', paymentResponse.data.data.payUrl);
    console.log('🎫 Order ID:', paymentResponse.data.data.orderId);
    
    console.log('\n🎉 All tests passed! Frontend should work perfectly.');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.status, error.response?.data?.message);
    console.log('📄 Full error:', error.response?.data);
  }
}

testFrontendFlow();
