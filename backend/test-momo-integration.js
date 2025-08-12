require('dotenv').config();
const mongoose = require('mongoose');
const momoService = require('./services/momoService');

async function testMoMoIntegration() {
    try {
        console.log('🔄 Starting MoMo Integration Test...');
          // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });        console.log('✅ Connected to MongoDB');        // Test user info - Use a valid 24-character ObjectId
        const userId = new mongoose.Types.ObjectId(); // Generate a new valid ObjectId for testing
        const planType = 'monthly'; // Test with monthly plan
        const userInfo = {
            ip: '127.0.0.1',
            userAgent: 'Test-Agent/1.0',
            device: 'Desktop'
        };
        
        console.log(`🧪 Testing payment creation for user ${userId}, plan: ${planType}`);
        
        // Create payment
        const result = await momoService.createPayment(userId, planType, userInfo);
        
        console.log('🎉 SUCCESS! Payment created successfully:');
        console.log('📋 Payment Details:');
        console.log(`  - Order ID: ${result.orderId}`);
        console.log(`  - Request ID: ${result.requestId}`);
        console.log(`  - Amount: ${result.amount} VND`);
        console.log(`  - Plan: ${result.planName}`);
        console.log(`  - Pay URL: ${result.payUrl}`);
        console.log(`  - QR Code URL: ${result.qrCodeUrl}`);
        console.log(`  - Deeplink: ${result.deeplink}`);
        console.log(`  - Expires At: ${result.expiresAt}`);
        
        console.log('\n🔗 QR Code Payment URL (for mobile testing):');
        console.log(result.qrCodeUrl);
        
        console.log('\n🔗 Web Payment URL (for desktop testing):');
        console.log(result.payUrl);
        
    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        console.error('📝 Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run the test
testMoMoIntegration();
