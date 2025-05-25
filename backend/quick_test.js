const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testPersonalMembers() {
    try {
        console.log('🔑 Đăng nhập Admin1...');
        
        // Login Admin1
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'Admin1@gmail.com',
            password: '123456'
        });
        
        const token = loginResponse.data.token;        console.log('✅ Login thành công, token có được:', !!token);
        
        // Giải mã token để xem user ID
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.decode(token);
            console.log('🔍 User từ token:', {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name
            });
        } catch (error) {
            console.log('❌ Không thể giải mã token:', error.message);
        }
        
        // Lấy danh sách personal members
        console.log('\n📋 Kiểm tra danh sách personal members...');
        const listResponse = await axios.get(`${BASE_URL}/personal-members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Kết quả API:');
        console.log('- Status:', listResponse.status);
        console.log('- Total members:', listResponse.data.total);
        console.log('- Data length:', listResponse.data.data?.length || 0);
        
        if (listResponse.data.data && listResponse.data.data.length > 0) {
            console.log('\n👥 Danh sách members:');
            listResponse.data.data.forEach((member, index) => {
                console.log(`${index + 1}. ${member.member_user_id?.name || 'Unknown'} (${member.member_user_id?.email || 'No email'})`);
                console.log(`   - Role: ${member.custom_role}`);
                console.log(`   - Active: ${member.is_active}`);
                console.log(`   - Added: ${new Date(member.added_at).toLocaleString()}`);
            });
        } else {
            console.log('❌ Không có members nào trong danh sách');
        }
        
    } catch (error) {
        console.log('❌ Lỗi:', error.response?.data?.message || error.message);
        if (error.response?.status) {
            console.log('Status:', error.response.status);
        }
    }
}

testPersonalMembers();
