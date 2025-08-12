require('dotenv').config();
const mongoose = require('mongoose');
const momoService = require('./services/momoService');
const https = require('https');

// Import User model to fix schema error
require('./models/user.model');

async function testMoMoPaymentURL() {
    try {
        console.log('🚀 KIỂM TRA GIAO DỊCH MOMO');
        console.log('=' .repeat(50));
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Đã kết nối MongoDB');
        
        // Tạo payment request
        console.log('\n🔄 Đang tạo payment request...');
        const userId = new mongoose.Types.ObjectId();
        const result = await momoService.createPayment(userId, 'monthly', {
            ip: '127.0.0.1',
            userAgent: 'Test-Agent/1.0',
            device: 'Desktop'
        });
        
        console.log('✅ Payment request đã tạo thành công!');
        console.log(`📋 Order ID: ${result.orderId}`);
        console.log(`💰 Amount: ${result.amount.toLocaleString()} VND`);
        console.log(`📦 Plan: ${result.planName}`);
        
        // Hiển thị URLs để test
        console.log('\n🔗 PAYMENT URLS:');
        console.log('=' .repeat(50));
        console.log('🌐 Web Payment URL:');
        console.log(result.payUrl);
        console.log('\n📱 Mobile QR Code:');
        console.log(result.qrCodeUrl);
        console.log('\n🔗 Deeplink:');
        console.log(result.deeplink);
        
        // Test payment URL accessibility
        console.log('\n🔍 Đang test payment URL...');
        const urlAccessible = await testURL(result.payUrl);
        
        if (urlAccessible) {
            console.log('✅ Payment URL có thể truy cập được');
        } else {
            console.log('❌ Payment URL không thể truy cập');
        }
        
        // Hiển thị hướng dẫn test
        console.log('\n📋 HƯỚNG DẪN TEST THANH TOÁN:');
        console.log('=' .repeat(50));
        console.log('🎯 CÁCH 1: Test trên điện thoại');
        console.log('1. Copy QR Code URL:');
        console.log(`   ${result.qrCodeUrl}`);
        console.log('2. Paste vào browser trên điện thoại');
        console.log('3. Trang sẽ tự động mở MoMo app');
        console.log('4. Thực hiện thanh toán');
        
        console.log('\n🎯 CÁCH 2: Test trên máy tính');
        console.log('1. Copy Web Payment URL:');
        console.log(`   ${result.payUrl}`);
        console.log('2. Mở trong browser');
        console.log('3. Scan QR code bằng MoMo app');
        console.log('4. Thực hiện thanh toán');
        
        // Monitor payment status
        console.log('\n⏳ Monitoring payment status...');
        console.log('(Nhấn Ctrl+C để dừng monitoring)');
        
        let checkCount = 0;
        const maxChecks = 30; // 5 minutes
        
        const monitorInterval = setInterval(async () => {
            checkCount++;
            console.log(`\n🔍 Check #${checkCount}/${maxChecks} - ${new Date().toLocaleTimeString()}`);
            
            try {
                const status = await momoService.checkPaymentStatus(result.orderId);
                
                if (status.success && status.payment) {
                    const payment = status.payment;
                    console.log(`📊 Status: ${payment.status}`);
                    console.log(`⏰ Created: ${payment.createdAt}`);
                    console.log(`❓ Expired: ${payment.isExpired ? 'Yes' : 'No'}`);
                    
                    if (payment.status === 'completed') {
                        console.log('\n🎉 THANH TOÁN THÀNH CÔNG!');
                        console.log(`✅ Completed at: ${payment.completedAt}`);
                        console.log(`👤 User: ${payment.userEmail || 'Test User'}`);
                        clearInterval(monitorInterval);
                        process.exit(0);
                        
                    } else if (payment.status === 'failed') {
                        console.log('\n❌ THANH TOÁN THẤT BẠI!');
                        clearInterval(monitorInterval);
                        process.exit(1);
                        
                    } else {
                        console.log('⏳ Đang chờ thanh toán...');
                    }
                } else {
                    console.log(`❌ Không thể kiểm tra status: ${status.message}`);
                }
                
            } catch (error) {
                console.log(`❌ Lỗi check status: ${error.message}`);
            }
            
            if (checkCount >= maxChecks) {
                console.log('\n⏰ TIMEOUT - Dừng monitoring');
                console.log('💡 Payment có thể vẫn đang chờ xử lý');
                clearInterval(monitorInterval);
                process.exit(0);
            }
        }, 10000); // Check every 10 seconds
        
        // Cleanup on exit
        process.on('SIGINT', () => {
            console.log('\n🛑 Dừng monitoring...');
            clearInterval(monitorInterval);
            mongoose.disconnect();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

async function testURL(url) {
    return new Promise((resolve) => {
        try {
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                timeout: 5000
            };
            
            const req = https.request(options, (res) => {
                console.log(`   Response: ${res.statusCode} ${res.statusMessage}`);
                resolve(res.statusCode === 200);
            });
            
            req.on('error', (error) => {
                console.log(`   Error: ${error.message}`);
                resolve(false);
            });
            
            req.on('timeout', () => {
                console.log('   Timeout');
                req.destroy();
                resolve(false);
            });
            
            req.end();
            
        } catch (error) {
            console.log(`   Invalid URL: ${error.message}`);
            resolve(false);
        }
    });
}

// Run the test
testMoMoPaymentURL();
