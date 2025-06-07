// test-supabase-url.js
// Script để test trực tiếp URL Supabase
require('dotenv').config();

console.log('🧪 Testing Supabase URL Connection...');
console.log('URL hiện tại:', process.env.SUPABASE_URL);

// Test bằng fetch thông thường
async function testURL() {
    try {
        const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/', {
            headers: {
                'apikey': process.env.SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
            }
        });
        
        console.log('✅ URL có thể truy cập được!');
        console.log('Status:', response.status);
        
    } catch (error) {
        console.log('❌ Lỗi khi test URL:', error.message);
        
        // Gợi ý các URL thường gặp
        console.log('\n🔍 Hãy kiểm tra lại URL trong Supabase Dashboard:');
        console.log('   - Vào Settings > API');
        console.log('   - Copy chính xác "Project URL"');
        console.log('   - Đảm bảo không có ký tự thừa hoặc thiếu');
        
        // Test một vài variation phổ biến
        const possibleUrls = [
            'https://bwdfmrjcxqwthjplopc.supabase.co',
            'https://bwdffmrjcxqwthjplopc.supabase.co', // với 2 chữ f
            'https://bwdfmrjcxqwthjplopc.supabase.io', // với .io
        ];
        
        console.log('\n🧪 Testing các variation phổ biến...');
        for (const url of possibleUrls) {
            try {
                const testResponse = await fetch(url + '/rest/v1/', {
                    headers: {
                        'apikey': process.env.SUPABASE_SERVICE_KEY,
                    }
                });
                console.log(`✅ ${url} - Status: ${testResponse.status}`);
            } catch (err) {
                console.log(`❌ ${url} - Error: ${err.message.split('\n')[0]}`);
            }
        }
    }
}

testURL();
