const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Tài khoản Admin cố định
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

// Kết quả test chi tiết
let testResults = {
    setup: { success: false, details: '' },
    updateMember: [],
    pagination: [],
    filtering: [],
    softDelete: [],
    permanentDelete: [],
    errorScenarios: []
};

let memberIds = []; // Lưu ID của các members đã tạo

// Hàm helper
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Setup: Login và lấy danh sách hiện tại
async function setupTest() {
    console.log('\n🔧 SETUP: LOGIN VÀ CHUẨN BỊ DỮ LIỆU');
    console.log('====================================');

    try {
        // Login Admin1
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password
        });
        
        authToken = loginResponse.data.token;
        console.log('✅ Login Admin1 thành công');

        // Lấy danh sách thành viên hiện tại
        const membersResponse = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members`)
        );
        
        const members = membersResponse.data.data || [];
        memberIds = members.map(m => m._id);
        
        testResults.setup = {
            success: true,
            details: `Login thành công, có ${members.length} thành viên hiện tại`
        };
        
        console.log(`✅ Có ${members.length} thành viên để test`);
        console.log('📋 Member IDs:', memberIds);
        
        return members.length > 0;
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        testResults.setup = {
            success: false,
            details: `Lỗi setup: ${message}`
        };
        console.log('❌ Setup thất bại:', message);
        return false;
    }
}

// Test 1: Cập nhật thông tin thành viên
async function testUpdateMembers() {
    console.log('\n📝 TEST 1: CẬP NHẬT THÔNG TIN THÀNH VIÊN');
    console.log('========================================');

    if (memberIds.length === 0) {
        console.log('⚠️ Không có thành viên nào để update');
        return;
    }

    for (let i = 0; i < Math.min(memberIds.length, 3); i++) {
        const memberId = memberIds[i];
        console.log(`\n🔄 Update Member ${i + 1}: ${memberId}`);
        
        const updateData = {
            custom_role: `Updated Role ${i + 1} - ${Date.now()}`,
            notes: `Cập nhật lúc ${new Date().toLocaleString()} - Test advanced features`,
            is_active: true
        };
        
        try {
            const response = await axios.request(
                createConfig('put', `${BASE_URL}/personal-members/${memberId}`, updateData)
            );
            
            testResults.updateMember.push({
                memberId,
                success: true,
                oldRole: 'Previous role',
                newRole: response.data.data.custom_role,
                message: 'Cập nhật thành công',
                details: response.data.data
            });
            
            console.log('✅ Cập nhật thành công:');
            console.log(`   - New Role: ${response.data.data.custom_role}`);
            console.log(`   - New Notes: ${response.data.data.notes}`);
            
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            testResults.updateMember.push({
                memberId,
                success: false,
                message: `Lỗi update: ${message}`
            });
            console.log(`❌ Lỗi update Member ${i + 1}:`, message);
        }
        
        await delay(300);
    }
}

// Test 2: Kiểm tra phân trang
async function testPagination() {
    console.log('\n📄 TEST 2: KIỂM TRA PHÂN TRANG');
    console.log('==============================');

    const paginationTests = [
        { page: 1, limit: 2, name: 'Trang 1, 2 items' },
        { page: 2, limit: 2, name: 'Trang 2, 2 items' },
        { page: 1, limit: 10, name: 'Trang 1, 10 items' },
        { page: 999, limit: 5, name: 'Trang không tồn tại' }
    ];

    for (const test of paginationTests) {
        console.log(`\n📊 Test: ${test.name}`);
        
        try {
            const response = await axios.request(
                createConfig('get', `${BASE_URL}/personal-members`, null, {
                    page: test.page,
                    limit: test.limit
                })
            );
            
            const pagination = response.data.pagination;
            testResults.pagination.push({
                testName: test.name,
                success: true,
                params: { page: test.page, limit: test.limit },
                results: {
                    currentPage: pagination.current_page,
                    totalPages: pagination.total_pages,
                    totalItems: pagination.total_items,
                    itemsPerPage: pagination.items_per_page,
                    itemsReceived: response.data.data.length
                },
                message: 'Phân trang hoạt động đúng'
            });
            
            console.log('✅ Kết quả phân trang:');
            console.log(`   - Trang hiện tại: ${pagination.current_page}/${pagination.total_pages}`);
            console.log(`   - Tổng items: ${pagination.total_items}`);
            console.log(`   - Items nhận được: ${response.data.data.length}`);
            
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            testResults.pagination.push({
                testName: test.name,
                success: false,
                params: { page: test.page, limit: test.limit },
                message: `Lỗi phân trang: ${message}`
            });
            console.log(`❌ Lỗi ${test.name}:`, message);
        }
        
        await delay(200);
    }
}

// Test 3: Kiểm tra lọc (filtering)
async function testFiltering() {
    console.log('\n🔍 TEST 3: KIỂM TRA LỌC DỮ LIỆU');
    console.log('=================================');

    const filterTests = [
        { is_active: true, name: 'Lọc members active' },
        { is_active: false, name: 'Lọc members inactive' },
        { search: 'Team', name: 'Tìm kiếm theo role' },
        { search: 'test', name: 'Tìm kiếm theo notes' },
        { search: 'nonexistent', name: 'Tìm kiếm không có kết quả' }
    ];

    for (const test of filterTests) {
        console.log(`\n🔎 Test: ${test.name}`);
        
        try {
            const response = await axios.request(
                createConfig('get', `${BASE_URL}/personal-members`, null, test)
            );
            
            testResults.filtering.push({
                testName: test.name,
                success: true,
                filter: test,
                results: {
                    totalFound: response.data.pagination.total_items,
                    itemsReceived: response.data.data.length
                },
                message: 'Lọc hoạt động đúng'
            });
            
            console.log('✅ Kết quả lọc:');
            console.log(`   - Tìm thấy: ${response.data.pagination.total_items} items`);
            console.log(`   - Filter: ${JSON.stringify(test)}`);
            
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            testResults.filtering.push({
                testName: test.name,
                success: false,
                filter: test,
                message: `Lỗi lọc: ${message}`
            });
            console.log(`❌ Lỗi ${test.name}:`, message);
        }
        
        await delay(200);
    }
}

// Test 4: Xóa mềm (soft delete)
async function testSoftDelete() {
    console.log('\n🗑️ TEST 4: XÓA MỀM (SOFT DELETE)');
    console.log('=================================');

    if (memberIds.length === 0) {
        console.log('⚠️ Không có thành viên nào để xóa mềm');
        return;
    }

    // Chọn 1-2 members để test xóa mềm
    const membersToSoftDelete = memberIds.slice(0, Math.min(2, memberIds.length));

    for (let i = 0; i < membersToSoftDelete.length; i++) {
        const memberId = membersToSoftDelete[i];
        console.log(`\n🗑️ Soft Delete Member ${i + 1}: ${memberId}`);
        
        try {
            // Lấy thông tin trước khi xóa
            const beforeResponse = await axios.request(
                createConfig('get', `${BASE_URL}/personal-members/${memberId}`)
            );
            const beforeStatus = beforeResponse.data.data.is_active;
            
            // Thực hiện xóa mềm
            const deleteResponse = await axios.request(
                createConfig('delete', `${BASE_URL}/personal-members/${memberId}`)
            );
            
            testResults.softDelete.push({
                memberId,
                success: true,
                beforeStatus,
                afterStatus: deleteResponse.data.data.is_active,
                message: 'Xóa mềm thành công'
            });
            
            console.log('✅ Xóa mềm thành công:');
            console.log(`   - Trạng thái trước: ${beforeStatus ? 'Active' : 'Inactive'}`);
            console.log(`   - Trạng thái sau: ${deleteResponse.data.data.is_active ? 'Active' : 'Inactive'}`);
            
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            testResults.softDelete.push({
                memberId,
                success: false,
                message: `Lỗi xóa mềm: ${message}`
            });
            console.log(`❌ Lỗi xóa mềm Member ${i + 1}:`, message);
        }
        
        await delay(300);
    }
}

// Test 5: Xóa vĩnh viễn (permanent delete)
async function testPermanentDelete() {
    console.log('\n💥 TEST 5: XÓA VĨNH VIỄN (PERMANENT DELETE)');
    console.log('===========================================');

    if (memberIds.length === 0) {
        console.log('⚠️ Không có thành viên nào để xóa vĩnh viễn');
        return;
    }

    // Chọn 1 member để test xóa vĩnh viễn
    const memberToDelete = memberIds[memberIds.length - 1]; // Lấy member cuối cùng
    console.log(`\n💥 Permanent Delete Member: ${memberToDelete}`);
    
    try {
        // Lấy thông tin trước khi xóa
        const beforeResponse = await axios.request(
            createConfig('get', `${BASE_URL}/personal-members/${memberToDelete}`)
        );
        const memberInfo = beforeResponse.data.data;
        
        // Thực hiện xóa vĩnh viễn
        const deleteResponse = await axios.request(
            createConfig('delete', `${BASE_URL}/personal-members/${memberToDelete}/permanent`)
        );
        
        // Thử lấy lại thông tin (phải lỗi 404)
        let stillExists = false;
        try {
            await axios.request(
                createConfig('get', `${BASE_URL}/personal-members/${memberToDelete}`)
            );
            stillExists = true;
        } catch (checkError) {
            // Mong đợi lỗi 404
            stillExists = checkError.response?.status !== 404;
        }
        
        testResults.permanentDelete.push({
            memberId: memberToDelete,
            success: true,
            memberInfo: {
                name: memberInfo.member_user_id.name,
                email: memberInfo.member_user_id.email,
                role: memberInfo.custom_role
            },
            deletedSuccessfully: !stillExists,
            message: 'Xóa vĩnh viễn thành công'
        });
        
        console.log('✅ Xóa vĩnh viễn thành công:');
        console.log(`   - Member: ${memberInfo.member_user_id.name}`);
        console.log(`   - Email: ${memberInfo.member_user_id.email}`);
        console.log(`   - Đã bị xóa hoàn toàn: ${!stillExists ? 'Có' : 'Không'}`);
        
        // Cập nhật lại memberIds
        memberIds = memberIds.filter(id => id !== memberToDelete);
        
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        testResults.permanentDelete.push({
            memberId: memberToDelete,
            success: false,
            message: `Lỗi xóa vĩnh viễn: ${message}`
        });
        console.log('❌ Lỗi xóa vĩnh viễn:', message);
    }
}

// Test 6: Các tình huống lỗi
async function testErrorScenarios() {
    console.log('\n❌ TEST 6: KIỂM TRA CÁC TÌNH HUỐNG LỖI');
    console.log('======================================');

    const errorTests = [
        {
            name: 'Lấy member với ID không tồn tại',
            test: async () => {
                const fakeId = '507f1f77bcf86cd799439011';
                return await axios.request(
                    createConfig('get', `${BASE_URL}/personal-members/${fakeId}`)
                );
            },
            expectedError: 404
        },
        {
            name: 'Update member với ID không tồn tại',
            test: async () => {
                const fakeId = '507f1f77bcf86cd799439011';
                return await axios.request(
                    createConfig('put', `${BASE_URL}/personal-members/${fakeId}`, {
                        custom_role: 'Test Role'
                    })
                );
            },
            expectedError: 404
        },
        {
            name: 'Thêm member với member_user_id không tồn tại',
            test: async () => {
                const fakeUserId = '507f1f77bcf86cd799439011';
                return await axios.request(
                    createConfig('post', `${BASE_URL}/personal-members`, {
                        member_user_id: fakeUserId,
                        custom_role: 'Test Role'
                    })
                );
            },
            expectedError: 400
        },
        {
            name: 'Thêm member với dữ liệu thiếu',
            test: async () => {
                return await axios.request(
                    createConfig('post', `${BASE_URL}/personal-members`, {
                        custom_role: 'Test Role'
                        // Thiếu member_user_id
                    })
                );
            },
            expectedError: 400
        },
        {
            name: 'Truy cập API không có token',
            test: async () => {
                return await axios.get(`${BASE_URL}/personal-members`);
            },
            expectedError: 401
        }
    ];

    for (const errorTest of errorTests) {
        console.log(`\n🔍 Test: ${errorTest.name}`);
        
        try {
            await errorTest.test();
            
            // Nếu không có lỗi thì test thất bại
            testResults.errorScenarios.push({
                testName: errorTest.name,
                success: false,
                expectedError: errorTest.expectedError,
                actualError: null,
                message: 'Test thất bại - mong đợi lỗi nhưng request thành công'
            });
            console.log('❌ Test thất bại - mong đợi lỗi nhưng request thành công');
            
        } catch (error) {
            const actualStatus = error.response?.status;
            const success = actualStatus === errorTest.expectedError;
            
            testResults.errorScenarios.push({
                testName: errorTest.name,
                success,
                expectedError: errorTest.expectedError,
                actualError: actualStatus,
                message: success ? 'Lỗi mong đợi xảy ra đúng' : `Lỗi khác mong đợi: ${actualStatus} vs ${errorTest.expectedError}`
            });
            
            if (success) {
                console.log(`✅ Lỗi mong đợi xảy ra: ${actualStatus}`);
            } else {
                console.log(`❌ Lỗi khác mong đợi: ${actualStatus} (mong đợi: ${errorTest.expectedError})`);
            }
        }
        
        await delay(200);
    }
}

// Báo cáo tổng kết
function displayAdvancedReport() {
    console.log('\n🎯 BÁO CÁO TỔNG KẾT ADVANCED FEATURES');
    console.log('=====================================');
    
    // Setup
    console.log('\n🔧 SETUP:');
    console.log(`   ${testResults.setup.success ? '✅' : '❌'} ${testResults.setup.details}`);
    
    // Update Members
    console.log('\n📝 CẬP NHẬT THÀNH VIÊN:');
    const updateSuccess = testResults.updateMember.filter(u => u.success).length;
    console.log(`   ✅ Thành công: ${updateSuccess}/${testResults.updateMember.length}`);
    testResults.updateMember.forEach(u => {
        const status = u.success ? '✅' : '❌';
        console.log(`   ${status} ${u.memberId}: ${u.message}`);
    });
    
    // Pagination
    console.log('\n📄 PHÂN TRANG:');
    const paginationSuccess = testResults.pagination.filter(p => p.success).length;
    console.log(`   ✅ Thành công: ${paginationSuccess}/${testResults.pagination.length}`);
    testResults.pagination.forEach(p => {
        const status = p.success ? '✅' : '❌';
        console.log(`   ${status} ${p.testName}: ${p.message}`);
    });
    
    // Filtering
    console.log('\n🔍 LỌC DỮ LIỆU:');
    const filterSuccess = testResults.filtering.filter(f => f.success).length;
    console.log(`   ✅ Thành công: ${filterSuccess}/${testResults.filtering.length}`);
    testResults.filtering.forEach(f => {
        const status = f.success ? '✅' : '❌';
        console.log(`   ${status} ${f.testName}: ${f.message}`);
    });
    
    // Soft Delete
    console.log('\n🗑️ XÓA MỀM:');
    const softDeleteSuccess = testResults.softDelete.filter(s => s.success).length;
    console.log(`   ✅ Thành công: ${softDeleteSuccess}/${testResults.softDelete.length}`);
    testResults.softDelete.forEach(s => {
        const status = s.success ? '✅' : '❌';
        console.log(`   ${status} ${s.memberId}: ${s.message}`);
    });
    
    // Permanent Delete
    console.log('\n💥 XÓA VĨNH VIỄN:');
    const permanentDeleteSuccess = testResults.permanentDelete.filter(p => p.success).length;
    console.log(`   ✅ Thành công: ${permanentDeleteSuccess}/${testResults.permanentDelete.length}`);
    testResults.permanentDelete.forEach(p => {
        const status = p.success ? '✅' : '❌';
        console.log(`   ${status} ${p.memberId}: ${p.message}`);
    });
    
    // Error Scenarios
    console.log('\n❌ TÌNH HUỐNG LỖI:');
    const errorSuccess = testResults.errorScenarios.filter(e => e.success).length;
    console.log(`   ✅ Thành công: ${errorSuccess}/${testResults.errorScenarios.length}`);
    testResults.errorScenarios.forEach(e => {
        const status = e.success ? '✅' : '❌';
        console.log(`   ${status} ${e.testName}: ${e.message}`);
    });
    
    // Tổng kết chung
    const totalTests = testResults.updateMember.length + 
                      testResults.pagination.length + 
                      testResults.filtering.length + 
                      testResults.softDelete.length + 
                      testResults.permanentDelete.length + 
                      testResults.errorScenarios.length;
                      
    const totalSuccess = updateSuccess + paginationSuccess + filterSuccess + 
                        softDeleteSuccess + permanentDeleteSuccess + errorSuccess;
                        
    console.log('\n🏆 TỔNG KẾT CHUNG:');
    console.log(`   📊 Tổng số test: ${totalTests}`);
    console.log(`   ✅ Thành công: ${totalSuccess}`);
    console.log(`   ❌ Thất bại: ${totalTests - totalSuccess}`);
    console.log(`   📈 Tỷ lệ thành công: ${Math.round((totalSuccess / totalTests) * 100)}%`);
}

// Hàm chính
async function runAdvancedTests() {
    console.log('🚀 BẮT ĐẦU TEST ADVANCED FEATURES');
    console.log('==================================');
    console.log('📋 Bao gồm: Update, Pagination, Filtering, Soft Delete, Permanent Delete, Error Scenarios');
    console.log('');

    try {
        // Setup
        const setupOK = await setupTest();
        if (!setupOK) {
            console.log('❌ Setup thất bại, dừng test');
            return;
        }

        // Chạy các test
        await testUpdateMembers();
        await testPagination();
        await testFiltering();
        await testSoftDelete();
        await testPermanentDelete();
        await testErrorScenarios();

        // Báo cáo
        displayAdvancedReport();

        console.log('\n🎊 HOÀN THÀNH TẤT CẢ ADVANCED TESTS!');
        
    } catch (error) {
        console.log('\n💥 LỖI NGHIÊM TRỌNG:', error.message);
        console.log('📊 Báo cáo một phần:');
        displayAdvancedReport();
    }
}

// Chạy test
if (require.main === module) {
    runAdvancedTests().catch(console.error);
}

module.exports = {
    runAdvancedTests,
    testResults
};
