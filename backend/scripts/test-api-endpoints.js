// backend/scripts/test-api-endpoints.js
const axios = require('axios');
require('dotenv').config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
let authToken = '';
let testUser = {
    email: 'admin1@gmail.com',
    password: '123456' // Thay bằng password thực
};

// Test Authentication
const testAuth = async () => {
    console.log('\n🧪 TEST: Authentication');
    console.log('=====================================');
    
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        if (response.data.success) {
            authToken = response.data.token;
            console.log('✅ Login successful');
            console.log(`👤 User: ${response.data.user.email}`);
            console.log(`🔑 Token received`);
            return true;
        } else {
            console.log('❌ Login failed:', response.data.message);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Login error:', error.response?.data?.message || error.message);
        console.log('⚠️ Make sure server is running and credentials are correct');
        return false;
    }
};

// Test Payment Plans
const testPaymentPlans = async () => {
    console.log('\n🧪 TEST: Payment Plans');
    console.log('=====================================');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/payment/plans`);
        
        if (response.data.success) {
            console.log('✅ Payment plans retrieved');
            response.data.data.forEach((plan, index) => {
                console.log(`📦 Plan ${index + 1}: ${plan.name}`);
                console.log(`   💰 Price: ${plan.amount.toLocaleString('vi-VN')} VND`);
                console.log(`   ⏰ Duration: ${plan.duration}`);
                console.log(`   🎯 Features: ${plan.features.length} features`);
            });
            return true;
        } else {
            console.log('❌ Failed to get plans:', response.data.message);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Plans error:', error.response?.data?.message || error.message);
        return false;
    }
};

// Test Create Payment
const testCreatePayment = async () => {
    console.log('\n🧪 TEST: Create Payment');
    console.log('=====================================');
    
    try {
        const response = await axios.post(`${BASE_URL}/api/payment/create`, {
            planType: 'monthly'
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Payment created successfully');
            console.log(`📋 Order ID: ${response.data.data.orderId}`);
            console.log(`💰 Amount: ${response.data.data.amount.toLocaleString('vi-VN')} VND`);
            console.log(`📦 Plan: ${response.data.data.planName}`);
            console.log(`🔗 Pay URL: ${response.data.data.payUrl}`);
            
            return response.data.data.orderId;
        } else {
            console.log('❌ Payment creation failed:', response.data.message);
            return null;
        }
        
    } catch (error) {
        console.log('❌ Payment creation error:', error.response?.data?.message || error.message);
        if (error.response?.status === 409) {
            console.log('ℹ️ User may already have pending payment');
        }
        return null;
    }
};

// Test Payment Status
const testPaymentStatus = async (orderId) => {
    if (!orderId) {
        console.log('\n⚠️ SKIP: Payment Status (no orderId)');
        return false;
    }
    
    console.log('\n🧪 TEST: Payment Status');
    console.log('=====================================');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/payment/status/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ Payment status retrieved');
            console.log(`📋 Order ID: ${response.data.payment.orderId}`);
            console.log(`📊 Status: ${response.data.payment.status}`);
            console.log(`💰 Amount: ${response.data.payment.amount.toLocaleString('vi-VN')} VND`);
            console.log(`📦 Plan: ${response.data.payment.planName}`);
            console.log(`⏰ Expired: ${response.data.payment.isExpired ? 'Yes' : 'No'}`);
            return true;
        } else {
            console.log('❌ Failed to get status:', response.data.message);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Status error:', error.response?.data?.message || error.message);
        return false;
    }
};

// Test Payment History
const testPaymentHistory = async () => {
    console.log('\n🧪 TEST: Payment History');
    console.log('=====================================');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/payment/history`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ Payment history retrieved');
            console.log(`📊 Total payments: ${response.data.data.payments.length}`);
            console.log(`📄 Page: ${response.data.data.pagination.current}/${response.data.data.pagination.pages}`);
            
            response.data.data.payments.forEach((payment, index) => {
                console.log(`   ${index + 1}. ${payment.planName} - ${payment.statusText}`);
                console.log(`      Amount: ${payment.amount} VND`);
                console.log(`      Created: ${payment.createdAt}`);
            });
            
            return true;
        } else {
            console.log('❌ Failed to get history:', response.data.message);
            return false;
        }
        
    } catch (error) {
        console.log('❌ History error:', error.response?.data?.message || error.message);
        return false;
    }
};

// Test Middleware Protection
const testMiddlewareProtection = async () => {
    console.log('\n🧪 TEST: Middleware Protection');
    console.log('=====================================');
    
    try {
        // Test without authentication
        console.log('🔒 Testing endpoint without auth...');
        try {
            await axios.get(`${BASE_URL}/api/payment/history`);
            console.log('❌ Should have been blocked');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly blocked unauthenticated request');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // Test with authentication
        console.log('🔓 Testing endpoint with auth...');
        const response = await axios.get(`${BASE_URL}/api/payment/history`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.status === 200) {
            console.log('✅ Authenticated request successful');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Middleware test error:', error.message);
        return false;
    }
};

// Test Server Health
const testServerHealth = async () => {
    console.log('\n🧪 TEST: Server Health');
    console.log('=====================================');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Server is healthy');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running');
            console.log('🚀 Please start server with: npm start');
        } else {
            console.log('❌ Health check failed:', error.message);
        }
        return false;
    }
};

// Run all tests
const runAllTests = async () => {
    console.log('🚀 BẮT ĐẦU TEST API ENDPOINTS');
    console.log('=====================================');
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`👤 Test User: ${testUser.email}`);
    
    // Test 1: Server Health
    const healthOk = await testServerHealth();
    if (!healthOk) {
        console.log('\n❌ Server not available, stopping tests');
        return;
    }
    
    // Test 2: Authentication
    const authOk = await testAuth();
    if (!authOk) {
        console.log('\n❌ Authentication failed, stopping tests');
        console.log('💡 Update credentials in script or create test user');
        return;
    }
    
    // Test 3: Payment Plans
    const plansOk = await testPaymentPlans();
    
    // Test 4: Create Payment
    const orderId = await testCreatePayment();
    
    // Test 5: Payment Status
    const statusOk = await testPaymentStatus(orderId);
    
    // Test 6: Payment History
    const historyOk = await testPaymentHistory();
    
    // Test 7: Middleware Protection
    const middlewareOk = await testMiddlewareProtection();
    
    // Summary
    console.log('\n🎉 SUMMARY');
    console.log('=====================================');
    console.log(`✅ Server Health: ${healthOk ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Authentication: ${authOk ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Payment Plans: ${plansOk ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Create Payment: ${orderId ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Payment Status: ${statusOk ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Payment History: ${historyOk ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Middleware: ${middlewareOk ? 'PASS' : 'FAIL'}`);
    
    if (orderId) {
        console.log('\n🔗 NEXT STEPS:');
        console.log(`1. Test payment URL: Check MoMo payment`);
        console.log(`2. Test webhook: Complete payment to trigger IPN`);
        console.log(`3. Verify user upgrade after payment`);
    }
};

// CLI handler
const main = async () => {
    const args = process.argv.slice(2);
    
    if (args[0] === 'auth') {
        await testAuth();
    } else if (args[0] === 'plans') {
        await testPaymentPlans();
    } else if (args[0] === 'payment') {
        const authOk = await testAuth();
        if (authOk) {
            await testCreatePayment();
        }
    } else if (args[0] === 'health') {
        await testServerHealth();
    } else {
        await runAllTests();
    }
};

// Install axios if needed
if (require.main === module) {
    try {
        main();
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('axios')) {
            console.log('❌ axios not found. Installing...');
            console.log('📦 Run: npm install axios');
            console.log('Then run the test again');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

module.exports = { runAllTests };
