// backend/scripts/test-momo-payment.js
const mongoose = require('mongoose');
const momoService = require('../services/momoService');
const User = require('../models/user.model');
require('dotenv').config();

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan');
        console.log('✅ Kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Test tạo thanh toán
const testCreatePayment = async () => {
    try {
        console.log('\n🧪 TEST: Tạo thanh toán MoMo');
        console.log('=====================================');
        
        // Tìm user để test (admin1@gmail.com)
        const user = await User.findOne({ email: 'admin1@gmail.com' });
        if (!user) {
            console.error('❌ Không tìm thấy user admin1@gmail.com');
            return;
        }
        
        console.log(`👤 Testing với user: ${user.email}`);
        console.log(`📦 Gói hiện tại: ${user.current_plan_type}`);
        
        // Test info
        const userInfo = {
            ip: '127.0.0.1',
            userAgent: 'Test Script',
            device: 'test'
        };
        
        // Test tạo thanh toán gói monthly
        console.log('\n🔄 Tạo thanh toán gói Monthly...');
        const paymentResult = await momoService.createPayment(user._id, 'monthly', userInfo);
        
        console.log('✅ Kết quả tạo thanh toán:');
        console.log(`   📋 Order ID: ${paymentResult.orderId}`);
        console.log(`   💰 Amount: ${paymentResult.amount.toLocaleString('vi-VN')} VND`);
        console.log(`   📦 Plan: ${paymentResult.planName}`);
        console.log(`   🔗 Pay URL: ${paymentResult.payUrl}`);
        console.log(`   📱 QR Code: ${paymentResult.qrCodeUrl || 'N/A'}`);
        
        return paymentResult;
        
    } catch (error) {
        console.error('❌ Lỗi test tạo thanh toán:', error.message);
        throw error;
    }
};

// Test kiểm tra trạng thái thanh toán
const testCheckPaymentStatus = async (orderId) => {
    try {
        console.log('\n🧪 TEST: Kiểm tra trạng thái thanh toán');
        console.log('=====================================');
        
        const result = await momoService.checkPaymentStatus(orderId);
        
        if (result.success) {
            console.log('✅ Thông tin thanh toán:');
            console.log(`   📋 Order ID: ${result.payment.orderId}`);
            console.log(`   📊 Status: ${result.payment.status}`);
            console.log(`   💰 Amount: ${result.payment.amount.toLocaleString('vi-VN')} VND`);
            console.log(`   📦 Plan: ${result.payment.planName}`);
            console.log(`   📅 Created: ${result.payment.createdAt}`);
            console.log(`   ✅ Completed: ${result.payment.completedAt || 'N/A'}`);
            console.log(`   👤 User: ${result.payment.userEmail}`);
            console.log(`   ⏰ Expired: ${result.payment.isExpired ? 'Yes' : 'No'}`);
        } else {
            console.log('❌ Không thể kiểm tra trạng thái:', result.message);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi test kiểm tra trạng thái:', error.message);
        throw error;
    }
};

// Test signature verification
const testSignatureVerification = () => {
    console.log('\n🧪 TEST: Xác thực chữ ký');
    console.log('=====================================');
    
    // Test data giả lập
    const testData = 'accessKey=test&amount=500000&orderId=TEST123';
    const signature = momoService.generateSignature(testData);
    
    console.log(`📝 Raw data: ${testData}`);
    console.log(`🔐 Generated signature: ${signature}`);
    
    // Verify signature
    const isValid = momoService.verifySignature(testData, signature);
    console.log(`✅ Signature valid: ${isValid ? 'Yes' : 'No'}`);
    
    // Test với signature sai
    const invalidSignature = signature + 'invalid';
    const isValidWrong = momoService.verifySignature(testData, invalidSignature);
    console.log(`❌ Invalid signature test: ${isValidWrong ? 'FAILED' : 'PASSED'}`);
};

// Main test function
const runTests = async () => {
    try {
        await connectDB();
        
        // Test 1: Signature verification
        testSignatureVerification();
        
        // Test 2: Create payment
        const paymentResult = await testCreatePayment();
        
        if (paymentResult) {
            // Test 3: Check payment status
            await testCheckPaymentStatus(paymentResult.orderId);
            
            console.log('\n🎯 HƯỚNG DẪN TEST THANH TOÁN:');
            console.log('=====================================');
            console.log('1. Truy cập URL thanh toán:');
            console.log(`   ${paymentResult.payUrl}`);
            console.log('');
            console.log('2. Hoặc quét QR code tại:');
            console.log(`   ${paymentResult.qrCodeUrl || 'N/A'}`);
            console.log('');
            console.log('3. Thông tin thanh toán test MoMo:');
            console.log('   - Số điện thoại: 9704 0000 0000 0018');
            console.log('   - OTP: 123456');
            console.log('');
            console.log('4. Sau khi thanh toán, kiểm tra lại:');
            console.log(`   node scripts/test-momo-payment.js check ${paymentResult.orderId}`);
        }
        
        console.log('\n🔒 Đóng kết nối database...');
        await mongoose.connection.close();
        console.log('✅ Test hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi chạy test:', error);
        process.exit(1);
    }
};

// CLI handler
const main = async () => {
    const args = process.argv.slice(2);
    
    if (args[0] === 'check' && args[1]) {
        // Chỉ check status
        await connectDB();
        await testCheckPaymentStatus(args[1]);
        await mongoose.connection.close();
    } else {
        // Chạy full test
        await runTests();
    }
};

// Chạy test
if (require.main === module) {
    main();
}

module.exports = { testCreatePayment, testCheckPaymentStatus, testSignatureVerification };
