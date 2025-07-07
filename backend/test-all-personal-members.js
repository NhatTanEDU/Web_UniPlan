const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let registeredUsers = []; // Lưu danh sách users đã đăng ký
let testResults = {
    registerStep: { success: false, details: [] },
    loginStep: { success: false, details: '' },
    searchStep: { success: false, details: [] },
    addMembersStep: { success: false, details: [] },
    finalCheckStep: { success: false, details: '' }
};

// Tài khoản Admin cố định
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

// Hàm helper để tạo request config
function createConfig(method, url, data = null, params = null) {
    const config = {
        method,
        url,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) config.data = data;
    if (params) config.params = params;
    
    return config;
}

// Hàm tạo random user data
function generateRandomUser(index) {
    const timestamp = Date.now() + index;
    return {
        email: `user${timestamp}@testmail.com`,
        password: '123456',
        name: `TestUser${timestamp}`
    };
}

// Test đăng ký người dùng mới
async function testRegisterUser() {
    console.log('\n=== 0. TESTING REGISTER USER ===');
    try {
        // Tạo email động để tránh trùng lặp
        const timestamp = Date.now();
        const email = `newuser${timestamp}@example.com`;
        const response = await axios.post(`${BASE_URL}/auth/register`, {
            name: `New User ${timestamp}`,
            email: email,
            password: '12345678'
        });
        console.log('✅ Đăng ký người dùng thành công:', email);
        return email;
    } catch (error) {
        console.log('❌ Đăng ký thất bại:', error.response?.data || error.message);
        return null;
    }
}

// Test login
async function testLogin(email) {
    console.log('\n=== 1. TESTING LOGIN ===');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password: '12345678'
        });
        
        authToken = response.data.token;
        console.log('✅ Login thành công');
        console.log('User:', response.data.user);
        return true;
    } catch (error) {
        console.log('❌ Login thất bại:', error.response?.data || error.message);
        return false;
    }
}

// Test lấy danh sách thành viên hiện tại
async function testGetPersonalMembers() {
    console.log('\n=== 2. TESTING GET PERSONAL MEMBERS ===');
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members`)
        );
        
        console.log('✅ Lấy danh sách thành viên thành công');
        console.log('Số lượng thành viên:', response.data.total);
        console.log('Dữ liệu:', JSON.stringify(response.data, null, 2));
        return response.data.data;
    } catch (error) {
        console.log('❌ Lấy danh sách thất bại:', error.response?.data || error.message);
        return [];
    }
}

// Test tìm kiếm user để thêm
async function testSearchUsers(searchTerm) {
    console.log('\n=== 3. TESTING SEARCH USERS ===');
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members/search`, null, { query: searchTerm })
        );
        
        console.log('✅ Tìm kiếm user thành công');
        console.log('Số kết quả:', response.data.pagination.total_items);
        console.log('Users tìm được:', response.data.data.map(u => ({ id: u._id, name: u.name, email: u.email })));
        
        if (response.data.data.length > 0) {
            testUserId = response.data.data[0]._id;
            console.log('📌 Sẽ sử dụng user này để test:', testUserId);
        }
        
        return response.data.data;
    } catch (error) {
        console.log('❌ Tìm kiếm thất bại:', error.response?.data || error.message);
        return [];
    }
}

// Test thêm thành viên
async function testAddPersonalMember() {
    console.log('\n=== 4. TESTING ADD PERSONAL MEMBER ===');
    
    if (!testUserId) {
        console.log('⚠️ Không có user nào để thêm vào danh sách');
        return null;
    }
    
    try {
        const response = await axios.request(
            createConfig('post', `${BASE_URL}/personal-members`, {
                member_user_id: testUserId,
                custom_role: 'Tester',
                notes: 'Thành viên test được thêm bởi script'
            })
        );
        
        console.log('✅ Thêm thành viên thành công');
        console.log('Thành viên mới:', {
            id: response.data.data._id,
            member: response.data.data.member_user_id.name,
            role: response.data.data.custom_role
        });
        
        return response.data.data;
    } catch (error) {
        console.log('❌ Thêm thành viên thất bại:', error.response?.data || error.message);
        return null;
    }
}

// Test cập nhật thông tin thành viên
async function testUpdatePersonalMember(memberId) {
    console.log('\n=== 5. TESTING UPDATE PERSONAL MEMBER ===');
    
    if (!memberId) {
        console.log('⚠️ Không có member ID để update');
        return;
    }
    
    try {
        const response = await axios.request(
            createConfig('put', `${BASE_URL}/personal-members/${memberId}`, {
                custom_role: 'Senior Tester',
                notes: 'Đã cập nhật role và ghi chú',
                is_active: true
            })
        );
        
        console.log('✅ Cập nhật thành viên thành công');
        console.log('Thông tin mới:', {
            role: response.data.data.custom_role,
            notes: response.data.data.notes
        });
        
    } catch (error) {
        console.log('❌ Cập nhật thất bại:', error.response?.data || error.message);
    }
}

// Test lấy chi tiết thành viên
async function testGetPersonalMemberDetail(memberId) {
    console.log('\n=== 6. TESTING GET PERSONAL MEMBER DETAIL ===');
    
    if (!memberId) {
        console.log('⚠️ Không có member ID để lấy chi tiết');
        return;
    }
    
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members/${memberId}`)
        );
        
        console.log('✅ Lấy chi tiết thành viên thành công');
        console.log('Chi tiết:', {
            member: response.data.data.member_user_id.name,
            email: response.data.data.member_user_id.email,
            role: response.data.data.custom_role,
            added_at: response.data.data.added_at
        });
        
    } catch (error) {
        console.log('❌ Lấy chi tiết thất bại:', error.response?.data || error.message);
    }
}

// Test xóa mềm thành viên
async function testRemovePersonalMember(memberId) {
    console.log('\n=== 7. TESTING REMOVE PERSONAL MEMBER (SOFT DELETE) ===');
    
    if (!memberId) {
        console.log('⚠️ Không có member ID để xóa');
        return;
    }
    
    try {
        const response = await axios.request(
            createConfig('delete', `${BASE_URL}/personal-members/${memberId}`)
        );
        
        console.log('✅ Xóa mềm thành viên thành công');
        console.log('Trạng thái:', response.data.data.is_active ? 'Active' : 'Inactive');
        
    } catch (error) {
        console.log('❌ Xóa mềm thất bại:', error.response?.data || error.message);
    }
}

// Test xóa vĩnh viễn thành viên
async function testPermanentDeletePersonalMember(memberId) {
    console.log('\n=== 8. TESTING PERMANENT DELETE PERSONAL MEMBER ===');
    
    if (!memberId) {
        console.log('⚠️ Không có member ID để xóa vĩnh viễn');
        return;
    }
    
    try {
        const response = await axios.request(
            createConfig('delete', `${BASE_URL}/personal-members/${memberId}/permanent`)
        );
        
        console.log('✅ Xóa vĩnh viễn thành viên thành công');
        console.log('ID đã xóa:', response.data.data.id);
        
    } catch (error) {
        console.log('❌ Xóa vĩnh viễn thất bại:', error.response?.data || error.message);
    }
}

// Chạy tất cả test
async function runAllTests() {
    console.log('🚀 BẮT ĐẦU TEST TOÀN BỘ PERSONAL MEMBER LISTS API');
    console.log('================================================');

    // 0. Đăng ký user mới
    const newUserEmail = await testRegisterUser();
    if (!newUserEmail) {
        console.log('❌ Không thể đăng ký user mới, dừng test');
        return;
    }

    // 1. Login
    const loginSuccess = await testLogin(newUserEmail);
    if (!loginSuccess) {
        console.log('❌ Không thể login, dừng test');
        return;
    }
    
    // 2. Lấy danh sách hiện tại
    const currentMembers = await testGetPersonalMembers();
    
    // 3. Tìm kiếm users (tìm user gốc tanmoi)
    const foundUsers = await testSearchUsers('tanmoi');
    
    // 4. Thêm thành viên mới
    const newMember = await testAddPersonalMember();

    if (newMember) {
        const memberId = newMember._id;
        
        // 5. Cập nhật thông tin
        await testUpdatePersonalMember(memberId);
        
        // 6. Lấy chi tiết
        await testGetPersonalMemberDetail(memberId);
        
        // 7. Lấy lại danh sách để xem thay đổi
        console.log('\n=== KIỂM TRA DANH SÁCH SAU KHI THÊM ===');
        await testGetPersonalMembers();
        
        // 8. Xóa mềm
        await testRemovePersonalMember(memberId);
        
        // 9. Xóa vĩnh viễn
        await testPermanentDeletePersonalMember(memberId);
    }
    
    // 10. Kiểm tra cuối cùng
    console.log('\n=== KIỂM TRA DANH SÁCH CUỐI CÙNG ===');
    await testGetPersonalMembers();
    
    console.log('\n🎉 HOÀN THÀNH TẤT CẢ TEST!');
    console.log('================================================');
}

// Chạy test
runAllTests().catch(console.error);
