// Test ngrok accessibility
const https = require('https');

const testUrls = [
    'https://e42c-2a09-bac1-7ac0-10-00-3d0-4a.ngrok-free.app/api/payment/momo/return',
    'https://e42c-2a09-bac1-7ac0-10-00-3d0-4a.ngrok-free.app/api/payment/momo/ipn'
];

async function testUrl(url) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            console.log(`✅ ${url} - Status: ${res.statusCode}`);
            resolve(true);
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${url} - Error: ${error.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`⏰ ${url} - Timeout`);
            resolve(false);
        });
    });
}

async function testNgrokUrls() {
    console.log('🔍 Testing ngrok URLs accessibility...');
    
    for (const url of testUrls) {
        await testUrl(url);
    }
    
    console.log('\n💡 Nếu URLs không accessible:');
    console.log('1. Kiểm tra ngrok có đang chạy: ngrok http 5000');
    console.log('2. Cập nhật URLs trong .env với ngrok URL mới');
    console.log('3. Restart backend server');
}

testNgrokUrls();
