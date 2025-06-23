require('dotenv').config();
const mongoose = require('mongoose');
const momoService = require('./services/momoService');

async function testMoMoWithSimpleCallback() {
    try {
        console.log('🔄 Testing MoMo with simple callback URLs...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
        
        // Test user info - Use a valid ObjectId
        const userId = new mongoose.Types.ObjectId();
        const planType = 'monthly';
        const userInfo = {
            ip: '127.0.0.1',
            userAgent: 'Test-Agent/1.0',
            device: 'Desktop'
        };
        
        // Temporarily override callback URLs to simple ones for testing
        const originalRedirectUrl = process.env.MOMO_REDIRECT_URL;
        const originalIpnUrl = process.env.MOMO_IPN_URL;
        
        process.env.MOMO_REDIRECT_URL = 'https://momo.vn/return';
        process.env.MOMO_IPN_URL = 'https://callback.url/notify';
        
        console.log(`🧪 Testing with simple callback URLs:`);
        console.log(`🔗 Redirect: ${process.env.MOMO_REDIRECT_URL}`);
        console.log(`🔗 IPN: ${process.env.MOMO_IPN_URL}`);
        
        // Create payment
        const result = await momoService.createPayment(userId, planType, userInfo);
        
        console.log('🎉 SUCCESS! Payment created with simple callbacks:');
        console.log('📋 Payment Details:');
        console.log(`  - Order ID: ${result.orderId}`);
        console.log(`  - QR Code URL: ${result.qrCodeUrl}`);
        console.log(`  - Pay URL: ${result.payUrl}`);
        console.log(`  - Deeplink: ${result.deeplink}`);
        
        console.log('\n🔗 QR Code để test trên MoMo UAT:');
        console.log(result.qrCodeUrl);
        
        // Restore original URLs
        process.env.MOMO_REDIRECT_URL = originalRedirectUrl;
        process.env.MOMO_IPN_URL = originalIpnUrl;
        
    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        console.error('📝 Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run the test
testMoMoWithSimpleCallback();
