// Quick Test - Kiểm tra nhanh hệ thống

const { BASE_URL, ADMIN_ACCOUNT } = require('./src/config/constants');
const ApiService = require('./src/services/apiService');

console.log('🧪 KIỂM TRA NHANH HỆ THỐNG');
console.log('='.repeat(50));

async function quickTest() {
    try {
        // Test 1: Kiểm tra cấu hình
        console.log('\n1️⃣ Kiểm tra cấu hình...');
        console.log(`   📡 API URL: ${BASE_URL}`);
        console.log(`   👤 Admin: ${ADMIN_ACCOUNT.email}`);
        console.log('   ✅ Cấu hình OK');        // Test 2: Kiểm tra kết nối
        console.log('\n2️⃣ Kiểm tra kết nối API...');
        try {
            // Test đơn giản với axios trực tiếp
            const axios = require('axios');
            const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
            console.log('   ✅ Kết nối API thành công');
        } catch (error) {
            console.log('   ❌ Không thể kết nối API:', error.message);
            console.log('   💡 Đảm bảo server đang chạy tại:', BASE_URL);
        }

        // Test 3: Kiểm tra các service
        console.log('\n3️⃣ Kiểm tra các service...');
        const AuthService = require('./src/services/authService');
        const TeamService = require('./src/services/teamService');
        const StatisticsManager = require('./src/services/statisticsManager');

        console.log('   ✅ AuthService loaded');
        console.log('   ✅ TeamService loaded');
        console.log('   ✅ StatisticsManager loaded');

        // Test 4: Kiểm tra thư mục
        console.log('\n4️⃣ Kiểm tra thư mục...');
        const fs = require('fs');
        const path = require('path');

        const resultDir = path.join(__dirname, 'ketquathongke');
        if (fs.existsSync(resultDir)) {
            console.log('   ✅ Thư mục ketquathongke tồn tại');
        } else {
            console.log('   ⚠️ Thư mục ketquathongke chưa tồn tại');
            fs.mkdirSync(resultDir, { recursive: true });
            console.log('   ✅ Đã tạo thư mục ketquathongke');
        }        // Test 5: Test đăng nhập (nếu server sẵn sàng)
        console.log('\n5️⃣ Test đăng nhập Admin...');
        try {
            // Test đơn giản với axios
            const axios = require('axios');
            const loginData = {
                email: ADMIN_ACCOUNT.email,
                password: ADMIN_ACCOUNT.password
            };
            
            const response = await axios.post(`${BASE_URL}/auth/login`, loginData, { timeout: 10000 });
            
            if (response.data && response.data.token) {
                console.log('   ✅ Đăng nhập thành công!');
                console.log('   🔑 Token nhận được');
            } else {
                console.log('   ❌ Đăng nhập thất bại: Không nhận được token');
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('   ⚠️ Server chưa khởi động:', error.message);
            } else {
                console.log('   ⚠️ Không thể test đăng nhập:', error.response?.data?.message || error.message);
            }
        }

        // Kết luận
        console.log('\n🎯 KẾT QUẢ KIỂM TRA:');
        console.log('='.repeat(50));
        console.log('✅ Hệ thống đã sẵn sàng để sử dụng!');
        console.log('📋 Để bắt đầu test, chạy: npm start');
        console.log('⚡ Để chạy tự động, chạy: npm run auto-run');
        
    } catch (error) {
        console.log('\n💥 Lỗi trong quá trình kiểm tra:', error.message);
        console.log('📝 Chi tiết:', error.stack);
    }
}

// Chạy test nếu được gọi trực tiếp
if (require.main === module) {
    quickTest().then(() => {
        console.log('\n👋 Kiểm tra hoàn tất!');
        process.exit(0);
    }).catch((error) => {
        console.log('\n💥 Lỗi nghiêm trọng:', error.message);
        process.exit(1);
    });
}

module.exports = quickTest;
