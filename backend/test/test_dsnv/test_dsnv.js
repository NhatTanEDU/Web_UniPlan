const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Tài khoản Admin cố định
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

// Danh sách 3 tài khoản random
let registeredUsers = [];
let testResults = {
    registration: [],
    login: false,
    search: [],
    addToList: [],
    finalList: null
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

// Hàm tạo thông tin user random
function generateRandomUser(index) {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    return {
        email: `user${index}_${timestamp}_${randomSuffix}@testmail.com`,
        password: '123456',
        name: `Test User ${index} - ${randomSuffix}`
    };
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Bước 1: Đăng ký 4 tài khoản (1 Admin cố định + 3 random)
async function registerAllAccounts() {
    console.log('\n🔥 BƯỚC 1: ĐĂNG KÝ 4 TÀI KHOẢN');
    console.log('=====================================');

    // 1.1 Đăng ký Admin1
    console.log('\n📝 Đăng ký Admin1...');
    try {
        const adminResponse = await axios.post(`${BASE_URL}/auth/register`, ADMIN_ACCOUNT);
        testResults.registration.push({
            account: 'Admin1',
            email: ADMIN_ACCOUNT.email,
            success: true,
            userId: adminResponse.data.user?.id || adminResponse.data.user?._id,
            message: 'Đăng ký Admin thành công'
        });
        console.log('✅ Admin1 đăng ký thành công:', ADMIN_ACCOUNT.email);
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        testResults.registration.push({
            account: 'Admin1',
            email: ADMIN_ACCOUNT.email,
            success: message.includes('đã tồn tại') || message.includes('already exists'),
            userId: null,
            message: message.includes('đã tồn tại') ? 'Admin1 đã tồn tại (OK)' : `Lỗi: ${message}`
        });
        
        if (message.includes('đã tồn tại') || message.includes('already exists')) {
            console.log('✅ Admin1 đã tồn tại, bỏ qua...');
        } else {
            console.log('❌ Lỗi đăng ký Admin1:', message);
        }
    }

    // 1.2 Đăng ký 3 user random
    for (let i = 1; i <= 3; i++) {
        await delay(100); // Tránh conflict timestamp
        const userInfo = generateRandomUser(i);
        console.log(`\n📝 Đăng ký User ${i}...`);
        
        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, userInfo);
            registeredUsers.push({
                ...userInfo,
                userId: response.data.user?.id || response.data.user?._id
            });
            
            testResults.registration.push({
                account: `User ${i}`,
                email: userInfo.email,
                success: true,
                userId: response.data.user?.id || response.data.user?._id,
                message: 'Đăng ký thành công'
            });
            console.log(`✅ User ${i} đăng ký thành công:`, userInfo.email);
            
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            testResults.registration.push({
                account: `User ${i}`,
                email: userInfo.email,
                success: false,
                userId: null,
                message: `Lỗi: ${message}`
            });
            console.log(`❌ Lỗi đăng ký User ${i}:`, message);
        }
    }

    // Tóm tắt kết quả đăng ký
    console.log('\n📊 KẾT QUẢ ĐĂNG KÝ:');
    console.log('==================');
    testResults.registration.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.account}: ${result.email} - ${result.message}`);
    });
    
    const successCount = testResults.registration.filter(r => r.success).length;
    console.log(`\n🎯 Tổng kết: ${successCount}/${testResults.registration.length} tài khoản sẵn sàng`);
    
    return successCount >= 2; // Cần ít nhất Admin + 1 user
}

// Bước 2: Login Admin1
async function loginAdmin() {
    console.log('\n🔑 BƯỚC 2: LOGIN ADMIN1');
    console.log('=======================');

    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password
        });
        
        authToken = response.data.token;
        testResults.login = true;
        
        console.log('✅ Admin1 login thành công');
        console.log('👤 User info:', {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email
        });
        console.log('🔐 Token có được:', authToken ? 'Có' : 'Không');
        
        return true;
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        testResults.login = false;
        console.log('❌ Login Admin1 thất bại:', message);
        return false;
    }
}

// Bước 3: Tìm kiếm và thêm 3 user vào danh sách
async function searchAndAddUsers() {
    console.log('\n🔍 BƯỚC 3: TÌM KIẾM VÀ THÊM USERS');
    console.log('===================================');

    for (let i = 0; i < registeredUsers.length; i++) {
        const user = registeredUsers[i];
        console.log(`\n🔎 Tìm kiếm User ${i + 1}: ${user.email}`);
        
        try {
            // Tìm kiếm user theo email
            const searchResponse = await axios.request(
                createConfig('get', `${BASE_URL}/personal-members/search`, null, { 
                    query: user.email.split('@')[0] // Tìm theo phần đầu email
                })
            );
            
            const foundUsers = searchResponse.data.data || [];
            const targetUser = foundUsers.find(u => u.email === user.email);
            
            if (targetUser) {
                testResults.search.push({
                    userIndex: i + 1,
                    email: user.email,
                    found: true,
                    userId: targetUser._id,
                    message: 'Tìm thấy user'
                });
                console.log(`✅ Tìm thấy User ${i + 1}:`, targetUser.name);
                
                // Thêm vào personal list
                console.log(`➕ Thêm User ${i + 1} vào danh sách...`);
                try {
                    const addResponse = await axios.request(
                        createConfig('post', `${BASE_URL}/personal-members`, {
                            member_user_id: targetUser._id,
                            custom_role: `Team Member ${i + 1}`,
                            notes: `User ${i + 1} được thêm bởi script test - ${new Date().toLocaleString()}`
                        })
                    );
                    
                    testResults.addToList.push({
                        userIndex: i + 1,
                        email: user.email,
                        name: targetUser.name,
                        success: true,
                        memberId: addResponse.data.data._id,
                        role: `Team Member ${i + 1}`,
                        message: 'Thêm vào danh sách thành công'
                    });
                    console.log(`✅ Đã thêm User ${i + 1} vào danh sách personal members`);
                    
                } catch (addError) {
                    const addMessage = addError.response?.data?.message || addError.message;
                    testResults.addToList.push({
                        userIndex: i + 1,
                        email: user.email,
                        name: targetUser.name,
                        success: false,
                        memberId: null,
                        role: null,
                        message: `Lỗi thêm vào list: ${addMessage}`
                    });
                    console.log(`❌ Lỗi thêm User ${i + 1}:`, addMessage);
                }
                
            } else {
                testResults.search.push({
                    userIndex: i + 1,
                    email: user.email,
                    found: false,
                    userId: null,
                    message: 'Không tìm thấy user'
                });
                console.log(`❌ Không tìm thấy User ${i + 1} trong kết quả tìm kiếm`);
            }
            
        } catch (searchError) {
            const searchMessage = searchError.response?.data?.message || searchError.message;
            testResults.search.push({
                userIndex: i + 1,
                email: user.email,
                found: false,
                userId: null,
                message: `Lỗi tìm kiếm: ${searchMessage}`
            });
            console.log(`❌ Lỗi tìm kiếm User ${i + 1}:`, searchMessage);
        }
        
        await delay(500); // Delay giữa các request
    }
}

// Bước 4: Kiểm tra danh sách cuối cùng
async function checkFinalList() {
    console.log('\n📋 BƯỚC 4: KIỂM TRA DANH SÁCH CUỐI CÙNG');
    console.log('======================================');

    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members`)
        );
        
        testResults.finalList = response.data;
        const members = response.data.data || [];
        
        console.log(`✅ Danh sách hiện tại có ${members.length} thành viên:`);
        
        members.forEach((member, index) => {
            console.log(`${index + 1}. ${member.member_user_id.name} (${member.member_user_id.email})`);
            console.log(`   - Role: ${member.custom_role}`);
            console.log(`   - Notes: ${member.notes}`);
            console.log(`   - Status: ${member.is_active ? 'Active' : 'Inactive'}`);
            console.log(`   - Added: ${new Date(member.added_at).toLocaleString()}`);
            console.log('');
        });
        
        return true;
        
    } catch (error) {
        console.log('❌ Lỗi kiểm tra danh sách:', error.response?.data?.message || error.message);
        return false;
    }
}

// Bước 5: Hiển thị báo cáo tổng kết
function displaySummaryReport() {
    console.log('\n🎯 BÁO CÁO TỔNG KẾT');
    console.log('===================');
    
    // Báo cáo đăng ký
    console.log('\n1️⃣ ĐĂNG KÝ TÀI KHOẢN:');
    const regSuccess = testResults.registration.filter(r => r.success).length;
    console.log(`   ✅ Thành công: ${regSuccess}/${testResults.registration.length}`);
    testResults.registration.forEach(r => {
        const status = r.success ? '✅' : '❌';
        console.log(`   ${status} ${r.account}: ${r.message}`);
    });
    
    // Báo cáo login
    console.log('\n2️⃣ LOGIN ADMIN1:');
    console.log(`   ${testResults.login ? '✅' : '❌'} ${testResults.login ? 'Thành công' : 'Thất bại'}`);
    
    // Báo cáo tìm kiếm
    console.log('\n3️⃣ TÌM KIẾM USERS:');
    const searchSuccess = testResults.search.filter(s => s.found).length;
    console.log(`   ✅ Tìm thấy: ${searchSuccess}/${testResults.search.length}`);
    testResults.search.forEach(s => {
        const status = s.found ? '✅' : '❌';
        console.log(`   ${status} User ${s.userIndex}: ${s.message}`);
    });
    
    // Báo cáo thêm vào danh sách
    console.log('\n4️⃣ THÊM VÀO DANH SÁCH:');
    const addSuccess = testResults.addToList.filter(a => a.success).length;
    console.log(`   ✅ Thành công: ${addSuccess}/${testResults.addToList.length}`);
    testResults.addToList.forEach(a => {
        const status = a.success ? '✅' : '❌';
        console.log(`   ${status} ${a.name}: ${a.message}`);
    });
    
    // Báo cáo danh sách cuối cùng
    console.log('\n5️⃣ DANH SÁCH CUỐI CÙNG:');
    if (testResults.finalList) {
        const totalMembers = testResults.finalList.total || 0;
        console.log(`   📊 Tổng số thành viên trong danh sách: ${totalMembers}`);
        console.log(`   📋 Chi tiết đã hiển thị ở trên`);
    } else {
        console.log('   ❌ Không thể lấy danh sách cuối cùng');
    }

    // Báo cáo cập nhật vai trò
    if (testResults.updateRole) {
        console.log('\n6️⃣ SỬA VAI TRÒ THÀNH VIÊN:');
        const r = testResults.updateRole;
        const status = r.success ? '✅' : '❌';
        console.log(`   ${status} MemberId: ${r.memberId} | Old: ${r.oldRole} -> New: ${r.newRole} | ${r.message}`);
    }
    // Báo cáo xóa thành viên
    if (testResults.deleteMember) {
        console.log('\n7️⃣ XÓA THÀNH VIÊN:');
        const r = testResults.deleteMember;
        const status = r.success ? '✅' : '❌';
        console.log(`   ${status} MemberId: ${r.memberId} | ${r.name} | ${r.message}`);
    }
    // Báo cáo danh sách sau khi xóa
    if (testResults.finalListAfterDelete) {
        const total = testResults.finalListAfterDelete.total || 0;
        console.log(`\n8️⃣ DANH SÁCH SAU KHI XÓA: Còn lại ${total} thành viên.`);
    }
    
    // Tổng kết chung
    console.log('\n🏆 TỔNG KẾT CHUNG:');
    const overallSuccess = testResults.login && (addSuccess > 0);
    console.log(`   ${overallSuccess ? '🎉' : '⚠️'} Kịch bản test: ${overallSuccess ? 'THÀNH CÔNG' : 'CÓ VẤN ĐỀ'}`);
    console.log(`   📈 Tỷ lệ thành công: ${Math.round((regSuccess + (testResults.login ? 1 : 0) + addSuccess) / (testResults.registration.length + 1 + testResults.search.length) * 100)}%`);
}

// Hàm chính chạy toàn bộ kịch bản
async function runFullScenario() {
    console.log('🚀 BẮT ĐẦU KỊCH BẢN TEST 4 TÀI KHOẢN');
    console.log('===================================');
    console.log('📋 Kịch bản: 1 Admin1 cố định + 3 Users random');
    console.log('🎯 Mục tiêu: Admin1 login và thêm 3 users vào danh sách cá nhân');
    console.log('');

    try {
        // Bước 1: Đăng ký 4 tài khoản
        const registrationOK = await registerAllAccounts();
        if (!registrationOK) {
            console.log('❌ Không đủ tài khoản để tiếp tục test');
            return;
        }

        // Bước 2: Login Admin1
        const loginOK = await loginAdmin();
        if (!loginOK) {
            console.log('❌ Không thể login Admin1, dừng test');
            return;
        }

        // Bước 3: Tìm kiếm và thêm users
        await searchAndAddUsers();

        // Bước 4: Kiểm tra kết quả cuối cùng
        await checkFinalList();

        // Bước 6: Sửa vai trò thành viên random
        await updateRandomMemberRole();

        // Bước 7: Xóa random thành viên
        await deleteRandomMember();

        // Bước 8: Kiểm tra lại danh sách sau khi xóa
        await checkListAfterDelete();

        // Bước 5: Báo cáo tổng kết
        displaySummaryReport();

        console.log('\n🎊 HOÀN THÀNH KỊCH BẢN TEST!');
        
    } catch (error) {
        console.log('\n💥 LỖI NGHIÊM TRỌNG:', error.message);
        console.log('📊 Báo cáo một phần:');
        displaySummaryReport();
    }
}

// Menu CLI cho phép chọn từng tính năng
async function menu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    function ask(question) {
        return new Promise(resolve => rl.question(question, resolve));
    }
    let running = true;
    let registrationOK = false;
    let loginOK = false;
    while (running) {
        console.log('\n================ MENU ================');
        console.log('1. Đăng ký & Đăng nhập');
        console.log('2. Sửa vai trò thành viên');
        console.log('3. Xóa thành viên');
        console.log('4. Xuất báo cáo tổng kết');
        console.log('5. Thoát');
        console.log('6. Xóa toàn bộ thành viên (nguy hiểm, cần xác nhận)');
        const choice = await ask('Chọn chức năng (1-6): ');
        switch (choice.trim()) {
            case '1':
                // Đăng ký & Đăng nhập & Thêm users
                registrationOK = await registerAllAccounts();
                if (!registrationOK) {
                    console.log('❌ Không đủ tài khoản để tiếp tục test');
                    break;
                }
                loginOK = await loginAdmin();
                if (!loginOK) {
                    console.log('❌ Không thể login Admin1, dừng test');
                    break;
                }
                await searchAndAddUsers();
                await checkFinalList();
                console.log('✅ Đã hoàn thành Đăng ký, Đăng nhập, Thêm users và kiểm tra danh sách!');
                break;
            case '2':
                await updateRandomMemberRole();
                await checkFinalList();
                console.log('✅ Đã sửa vai trò thành viên và kiểm tra lại danh sách!');
                break;
            case '3':
                await deleteRandomMember();
                await checkListAfterDelete();
                console.log('✅ Đã xóa thành viên và kiểm tra lại danh sách!');
                break;
            case '4':
                displaySummaryReport();
                break;
            case '5':
                running = false;
                break;
            case '6':
                await deleteAllMembersWithConfirm(rl);
                break;
            default:
                console.log('Vui lòng chọn số từ 1 đến 6!');
        }
    }
    rl.close();
}

// Chạy kịch bản
if (require.main === module) {
    menu().catch(console.error);
}

// Đảm bảo export các hàm mới nếu cần dùng bên ngoài
module.exports = {
    runFullScenario,
    ADMIN_ACCOUNT,
    generateRandomUser,
    testResults,
    updateRandomMemberRole,
    deleteRandomMember,
    checkListAfterDelete
};

// Bước 6: Sửa vai trò thành viên random
async function updateRandomMemberRole() {
    console.log('\n✏️ BƯỚC 6: SỬA VAI TRÒ THÀNH VIÊN RANDOM');
    console.log('========================================');
    if (!testResults.finalList || !Array.isArray(testResults.finalList.data) || testResults.finalList.data.length === 0) {
        console.log('❌ Không có thành viên nào để sửa vai trò!');
        testResults.updateRole = { success: false, message: 'Không có thành viên để sửa' };
        return false;
    }
    const members = testResults.finalList.data;
    const randomIndex = Math.floor(Math.random() * members.length);
    const member = members[randomIndex];
    const newRole = `Updated Role ${Math.floor(Math.random() * 1000)}`;
    try {
        const response = await axios.request(
            createConfig('put', `${BASE_URL}/personal-members/${member._id}`,
                { custom_role: newRole })
        );
        testResults.updateRole = {
            success: true,
            memberId: member._id,
            oldRole: member.custom_role,
            newRole,
            message: 'Cập nhật vai trò thành công'
        };
        console.log(`✅ Đã cập nhật vai trò thành viên: ${member.member_user_id.name} -> ${newRole}`);
        return true;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        testResults.updateRole = {
            success: false,
            memberId: member._id,
            oldRole: member.custom_role,
            newRole,
            message: `Lỗi cập nhật vai trò: ${message}`
        };
        console.log('❌ Lỗi cập nhật vai trò:', message);
        return false;
    }
}

// Bước 7: Xóa random thành viên (hard delete, luôn làm mới danh sách trước khi xóa)
async function deleteRandomMember() {
    console.log('\n🗑️ BƯỚC 7: XÓA RANDOM THÀNH VIÊN (HARD DELETE)');
    console.log('=================================');
    // Làm mới danh sách trước khi xóa
    const refreshed = await checkFinalList();
    if (!refreshed || !testResults.finalList || !Array.isArray(testResults.finalList.data) || testResults.finalList.data.length === 0) {
        if (!authToken) {
            console.log('❌ Không có token truy cập. Vui lòng đăng nhập lại (chọn menu 1)!');
        } else {
            console.log('❌ Không có thành viên nào để xóa!');
        }
        testResults.deleteMember = { success: false, message: 'Không có thành viên để xóa hoặc chưa đăng nhập' };
        return false;
    }
    const members = testResults.finalList.data;
    const randomIndex = Math.floor(Math.random() * members.length);
    const member = members[randomIndex];
    try {
        await axios.request(
            createConfig('delete', `${BASE_URL}/personal-members/${member._id}/permanent`)
        );
        testResults.deleteMember = {
            success: true,
            memberId: member._id,
            name: member.member_user_id.name,
            message: 'Xóa thành viên (hard delete) thành công'
        };
        console.log(`✅ Đã xóa thành viên (hard delete): ${member.member_user_id.name}`);
        return true;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        testResults.deleteMember = {
            success: false,
            memberId: member._id,
            name: member.member_user_id.name,
            message: `Lỗi xóa thành viên: ${message}`
        };
        if (message.toLowerCase().includes('token')) {
            console.log('❌ Lỗi xóa thành viên: Không có token truy cập. Vui lòng đăng nhập lại (chọn menu 1)!');
        } else {
            console.log('❌ Lỗi xóa thành viên:', message);
        }
        return false;
    }
}

// Bước 8: Kiểm tra lại danh sách sau khi xóa
async function checkListAfterDelete() {
    console.log('\n🔄 BƯỚC 8: KIỂM TRA LẠI DANH SÁCH SAU KHI XÓA');
    console.log('==============================================');
    try {
        const response = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members`)
        );
        testResults.finalListAfterDelete = response.data;
        const members = response.data.data || [];
        console.log(`✅ Danh sách sau khi xóa còn ${members.length} thành viên:`);
        members.forEach((member, index) => {
            console.log(`${index + 1}. ${member.member_user_id.name} (${member.member_user_id.email})`);
        });
        return true;
    } catch (error) {
        console.log('❌ Lỗi kiểm tra lại danh sách:', error.response?.data?.message || error.message);
        return false;
    }
}

// Xóa toàn bộ thành viên (hard delete, có xác nhận, dùng rl từ menu)
async function deleteAllMembersWithConfirm(rl) {
    function ask(question) {
        return new Promise(resolve => rl.question(question, resolve));
    }
    await checkFinalList();
    if (!testResults.finalList || !Array.isArray(testResults.finalList.data) || testResults.finalList.data.length === 0) {
        console.log('❌ Không có thành viên nào để xóa!');
        return;
    }
    console.log(`\n⚠️  Bạn sắp xóa toàn bộ ${testResults.finalList.data.length} thành viên khỏi danh sách!`);
    console.log('Nhấn 1 để xác nhận xóa toàn bộ, nhấn 0 để hủy và quay lại menu.');
    const confirm = await ask('Lựa chọn của bạn (1: Xóa hết, 0: Thoát): ');
    if (confirm.trim() !== '1') {
        console.log('⏪ Đã hủy thao tác xóa toàn bộ. Quay lại menu chính.');
        return;
    }
    let errorCount = 0;
    for (const member of testResults.finalList.data) {
        try {
            await axios.request(
                createConfig('delete', `${BASE_URL}/personal-members/${member._id}/permanent`)
            );
            console.log(`✅ Đã xóa: ${member.member_user_id.name} (${member.member_user_id.email})`);
        } catch (error) {
            errorCount++;
            const message = error.response?.data?.message || error.message;
            console.log(`❌ Lỗi xóa ${member.member_user_id.name}: ${message}`);
        }
    }
    await checkFinalList();
    if (errorCount === 0) {
        console.log('🎉 Đã xóa toàn bộ thành viên thành công!');
    } else {
        console.log(`⚠️  Có ${errorCount} lỗi khi xóa thành viên.`);
    }
}
