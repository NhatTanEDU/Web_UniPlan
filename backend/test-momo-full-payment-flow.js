require('dotenv').config();
const mongoose = require('mongoose');
const momoService = require('./services/momoService');
const https = require('https');
const { URL } = require('url');

class MoMoPaymentTester {
    constructor() {
        this.paymentResult = null;
        this.orderId = null;
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
    }

    async connectDB() {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.log('✅ Connected to MongoDB');
    }

    async createPayment() {
        this.log('🔄 Bước 1: Tạo payment request...');
        
        // Test user info
        const userId = new mongoose.Types.ObjectId();
        const planType = 'monthly';
        const userInfo = {
            ip: '127.0.0.1',
            userAgent: 'MoMo-Test-Agent/1.0',
            device: 'Desktop'
        };

        // Create payment
        const result = await momoService.createPayment(userId, planType, userInfo);
        
        this.paymentResult = result;
        this.orderId = result.orderId;
        
        this.log('✅ Payment request đã được tạo thành công!');
        this.log(`📋 Chi tiết payment:`);
        this.log(`   - Order ID: ${result.orderId}`);
        this.log(`   - Amount: ${result.amount.toLocaleString()} VND`);
        this.log(`   - Plan: ${result.planName}`);
        this.log(`   - Expires: ${result.expiresAt}`);
        
        return result;
    }

    async simulatePaymentFlow() {
        this.log('🔄 Bước 2: Simulate payment flow...');
        
        const payUrl = this.paymentResult.payUrl;
        const qrCodeUrl = this.paymentResult.qrCodeUrl;
        
        this.log(`🌐 Pay URL: ${payUrl}`);
        this.log(`📱 QR Code: ${qrCodeUrl}`);
        
        // Test accessing payment URL
        await this.testPaymentUrl(payUrl);
        
        // Show QR for manual testing
        this.log('\n📱 QR CODE ĐỂ TEST TRÊN MOMO UAT APP:');
        this.log('=' .repeat(60));
        this.log(qrCodeUrl);
        this.log('=' .repeat(60));
        
        return true;
    }

    async testPaymentUrl(payUrl) {
        return new Promise((resolve) => {
            this.log('🔍 Đang test payment URL...');
            
            try {
                const url = new URL(payUrl);
                
                const options = {
                    hostname: url.hostname,
                    port: 443,
                    path: url.pathname + url.search,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                };
                
                const req = https.request(options, (res) => {
                    this.log(`✅ Payment URL response: ${res.statusCode}`);
                    
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            this.log('✅ Payment URL accessible - MoMo có thể xử lý payment');
                        } else {
                            this.log(`⚠️ Payment URL response: ${res.statusCode}`);
                        }
                        resolve(true);
                    });
                });
                
                req.on('error', (error) => {
                    this.log(`❌ Error testing payment URL: ${error.message}`);
                    resolve(false);
                });
                
                req.setTimeout(10000, () => {
                    req.destroy();
                    this.log('⏰ Timeout testing payment URL');
                    resolve(false);
                });
                
                req.end();
                
            } catch (error) {
                this.log(`❌ Invalid payment URL: ${error.message}`);
                resolve(false);
            }
        });
    }

    async checkPaymentStatus() {
        this.log('🔄 Bước 3: Kiểm tra payment status...');
        
        try {
            const status = await momoService.checkPaymentStatus(this.orderId);
            
            this.log('📊 Payment Status Report:');
            this.log(`   - Success: ${status.success}`);
            
            if (status.success && status.payment) {
                const payment = status.payment;
                this.log(`   - Order ID: ${payment.orderId}`);
                this.log(`   - Status: ${payment.status}`);
                this.log(`   - Amount: ${payment.amount?.toLocaleString()} VND`);
                this.log(`   - Plan: ${payment.planName}`);
                this.log(`   - Created: ${payment.createdAt}`);
                this.log(`   - User: ${payment.userEmail || 'N/A'}`);
                this.log(`   - Expired: ${payment.isExpired ? 'Yes' : 'No'}`);
                
                if (payment.completedAt) {
                    this.log(`   - Completed: ${payment.completedAt}`);
                    this.log('🎉 PAYMENT COMPLETED SUCCESSFULLY!');
                } else if (payment.status === 'pending') {
                    this.log('⏳ Payment đang chờ xử lý...');
                } else {
                    this.log(`❌ Payment status: ${payment.status}`);
                }
            } else {
                this.log(`❌ Không thể lấy payment status: ${status.message}`);
            }
            
            return status;
            
        } catch (error) {
            this.log(`❌ Error checking payment status: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async simulateSuccessfulPayment() {
        this.log('🔄 Bước 4: Simulate successful payment (for testing)...');
        
        // This simulates what happens when MoMo calls our IPN endpoint
        const mockIpnData = {
            partnerCode: "MOMO",
            orderId: this.orderId,
            requestId: this.orderId,
            amount: this.paymentResult.amount,
            orderInfo: `Thanh toán ${this.paymentResult.planName}`,
            orderType: "momo_wallet",
            transId: Date.now(),
            resultCode: 0,
            message: "Thành công.",
            payType: "qr",
            responseTime: Date.now(),
            extraData: "",
            signature: "mock_signature_for_testing"
        };
        
        try {
            // Note: In real scenario, this would be called by MoMo
            this.log('📝 Mock IPN data:');
            this.log(JSON.stringify(mockIpnData, null, 2));
            
            // For testing, we can manually call the IPN handler
            // const ipnResult = await momoService.handleIPN(mockIpnData);
            // this.log('✅ IPN processed successfully');
            
            this.log('💡 Trong thực tế, MoMo sẽ gọi IPN endpoint khi thanh toán thành công');
            
        } catch (error) {
            this.log(`❌ Error simulating payment: ${error.message}`);
        }
    }

    async waitForPayment(timeoutMinutes = 5) {
        this.log(`⏳ Đợi payment completion (${timeoutMinutes} phút)...`);
        this.log('💡 Trong thời gian này, bạn có thể test trên MoMo UAT app');
        
        const checkInterval = 10000; // 10 seconds
        const maxChecks = (timeoutMinutes * 60 * 1000) / checkInterval;
        let checks = 0;
        
        return new Promise((resolve) => {
            const interval = setInterval(async () => {
                checks++;
                this.log(`🔍 Check #${checks}/${maxChecks} - Kiểm tra payment status...`);
                
                const status = await this.checkPaymentStatus();
                
                if (status.success && status.payment) {
                    if (status.payment.status === 'completed') {
                        this.log('🎉 PAYMENT COMPLETED! Dừng monitoring...');
                        clearInterval(interval);
                        resolve(true);
                        return;
                    } else if (status.payment.status === 'failed') {
                        this.log('❌ PAYMENT FAILED! Dừng monitoring...');
                        clearInterval(interval);
                        resolve(false);
                        return;
                    }
                }
                
                if (checks >= maxChecks) {
                    this.log('⏰ Timeout - Dừng monitoring payment');
                    clearInterval(interval);
                    resolve(false);
                }
            }, checkInterval);
        });
    }

    async runFullTest() {
        try {
            this.log('🚀 BẮT ĐẦU FULL MOMO PAYMENT TEST');
            this.log('=' .repeat(60));
            
            // Connect to database
            await this.connectDB();
            
            // Step 1: Create payment
            await this.createPayment();
            
            // Step 2: Simulate payment flow
            await this.simulatePaymentFlow();
            
            // Step 3: Check initial status
            await this.checkPaymentStatus();
            
            // Step 4: Show instructions for manual testing
            this.log('\n📋 HƯỚNG DẪN TEST MANUAL:');
            this.log('1. Copy QR code URL ở trên');
            this.log('2. Mở MoMo UAT app trên điện thoại');
            this.log('3. Paste URL vào browser trên điện thoại');
            this.log('4. Hoặc scan QR code bằng MoMo app');
            this.log('5. Thực hiện thanh toán');
            this.log('6. Script sẽ tự động check status');
            
            // Step 5: Wait for payment
            const paymentCompleted = await this.waitForPayment(5);
            
            if (paymentCompleted) {
                this.log('🎉 TEST THÀNH CÔNG! Payment đã hoàn thành');
            } else {
                this.log('⏰ TEST TIMEOUT hoặc FAILED');
                this.log('💡 Bạn vẫn có thể test manual với QR code ở trên');
            }
            
            // Final status check
            this.log('\n🔍 FINAL STATUS CHECK:');
            await this.checkPaymentStatus();
            
        } catch (error) {
            this.log(`❌ TEST ERROR: ${error.message}`);
            console.error('Full error:', error);
        } finally {
            await mongoose.disconnect();
            this.log('✅ Disconnected from MongoDB');
            this.log('🏁 TEST COMPLETED');
        }
    }
}

// Run the full test
if (require.main === module) {
    const tester = new MoMoPaymentTester();
    tester.runFullTest();
}

module.exports = MoMoPaymentTester;
