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

// Biến lưu trữ dữ liệu test
let testData = {
    userId: '',
    userName: '', // thêm để lưu tên người dùng
    createdTeams: [], // Lưu tất cả teams đã tạo
    personalMemberList: [], // Danh sách nhân viên cá nhân
    createdMembers: [], // Lưu tất cả members đã tạo
    projects: [], // Lưu các dự án đã tìm thấy hoặc tạo
    projectAssignments: [] // Lưu kết quả gán project cho team
};

// Kết quả test (Enhanced with project tracking)
let testResults = {
    login: false,
    teamsCreated: [],
    personalMembersFound: 0,
    membersAdded: [],
    projectsFound: 0,        // Số dự án tìm thấy
    projectsCreated: 0,      // Số dự án tạo mới
    projectsAssigned: [],    // Chi tiết gán dự án cho team
    finalTeamsList: null,
    deleteResults: []
};

// Helper functions
const apiCall = async (method, url, data = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            ...(data && { data })
        };

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500
        };
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Tạo tên team unique để tránh trùng
function generateUniqueTeamName(index) {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `Test Team ${index} - ${timestamp}_${randomSuffix}`;
}

// 1. Đăng nhập Admin1
async function testLogin() {
    console.log('\n🔑 ĐĂNG NHẬP ADMIN1');
    console.log('===================');
    
    const result = await apiCall('POST', '/auth/login', {
        email: ADMIN_ACCOUNT.email,
        password: ADMIN_ACCOUNT.password
    });

    if (result.success) {
        authToken = result.data.token;
        testData.userId = result.data.user.id;
        // Lấy tên hiển thị từ full_name hoặc name
        testData.userName = result.data.user.full_name || result.data.user.name;
        testResults.login = true;
        console.log('✅ Login Success');
        console.log(`👤 User: ${testData.userName} (${result.data.user.email})`);
        return true;
    } else {
        console.log('❌ Login Failed:', result.error);
        return false;
    }
}

// 2. Tạo nhiều nhóm mới (không xóa cũ)
async function createMultipleTeams() {
    console.log('\n📝 TẠO NHIỀU NHÓM MỚI');
    console.log('=====================');
    
    const numberOfTeams = 3; // Tạo 3 teams
    
    for (let i = 1; i <= numberOfTeams; i++) {
        console.log(`\n➕ Tạo Team ${i}...`);
        
        const teamData = {
            team_name: generateUniqueTeamName(i),
            description: `Nhóm test số ${i} - Tạo lúc ${new Date().toLocaleString()}`,
            members: [],
            project_data: null
        };

        const result = await apiCall('POST', '/teams', teamData);
        
        if (result.success) {
            const createdTeam = {
                index: i,
                teamId: result.data.team._id,
                teamName: result.data.team.team_name,
                description: result.data.team.description,
                success: true,
                message: 'Tạo nhóm thành công'
            };
            
            testData.createdTeams.push(createdTeam);
            testResults.teamsCreated.push(createdTeam);
            
            console.log(`✅ Team ${i} tạo thành công: ${result.data.team.team_name}`);
        } else {
            const failedTeam = {
                index: i,
                teamId: null,
                teamName: teamData.team_name,
                description: teamData.description,
                success: false,
                message: `Lỗi: ${result.error}`
            };
            
            testResults.teamsCreated.push(failedTeam);
            console.log(`❌ Team ${i} tạo thất bại: ${result.error}`);
        }
        
        await delay(300); // Delay giữa các request
    }
    
    const successCount = testResults.teamsCreated.filter(t => t.success).length;
    console.log(`\n📊 Kết quả tạo teams: ${successCount}/${numberOfTeams} thành công`);
    return successCount > 0;
}

// 🔄 3. Kiểm tra danh sách nhân viên cá nhân (sử dụng đúng API)
async function checkPersonalMemberList() {
    console.log('\n👥 KIỂM TRA DANH SÁCH NHÂN VIÊN CÁ NHÂN');
    console.log('======================================');
    
    // Sử dụng đúng endpoint theo routes (/personal-members)
    const result = await apiCall('GET', '/personal-members?page=1&limit=50');
    
    // Debug: In ra cấu trúc response để kiểm tra
    console.log('🔍 Debug response structure:');
    console.log('   - Success:', result.success);
    console.log('   - Error:', result.error);
    if (result.success && result.data) {
        console.log('   - Data type:', typeof result.data);
        console.log('   - Data keys:', Object.keys(result.data));
        console.log('   - Has data field:', 'data' in result.data);
        console.log('   - Data field type:', typeof result.data.data);
        if (result.data.data) {
            console.log('   - Data field is array:', Array.isArray(result.data.data));
            console.log('   - Data field length:', result.data.data?.length);
        }
    }
    
    // Sửa lại: Kiểm tra cấu trúc response đúng
    if (result.success && result.data) {
        let membersList = null;
        
        // Trường hợp 1: API trả về { success: true, data: [...] }
        if (Array.isArray(result.data)) {
            membersList = result.data;
        }
        // Trường hợp 2: API trả về { success: true, data: { data: [...] } }
        else if (result.data.data && Array.isArray(result.data.data)) {
            membersList = result.data.data;
        }
        // Trường hợp 3: API trả về { success: true, data: { members: [...] } }
        else if (result.data.members && Array.isArray(result.data.members)) {
            membersList = result.data.members;
        }
        
        if (membersList) {
            testData.personalMemberList = membersList;
            testResults.personalMembersFound = membersList.length;
            
            console.log(`✅ Tìm thấy ${membersList.length} thành viên trong danh sách cá nhân:`);
            console.log('');
            
            if (membersList.length === 0) {
                console.log('📝 Danh sách trống! Bạn cần thêm thành viên vào danh sách trước.');
                console.log('💡 Hướng dẫn: Chạy file test_dsnv.js để thêm thành viên vào danh sách.');
                console.log('   Lệnh: node test/test_dsnv.js');
                console.log('   Chọn chức năng tạo và thêm users vào danh sách.');
                return false;
            }
            
            membersList.forEach((member, index) => {
                // Cấu trúc data thực tế: member.member_user_id
                const user = member.member_user_id;
                if (user) {
                    console.log(`${index + 1}. ${user.name} (${user.email})`);
                    console.log(`   - ID: ${user._id}`);
                    console.log(`   - Role: ${member.custom_role || 'N/A'}`);
                    console.log(`   - Thêm vào danh sách lúc: ${new Date(member.added_at).toLocaleString()}`);
                    console.log('');
                }
            });
            
            return true;
        }
    }
      // Nếu không thành công hoặc không có data
    console.log('❌ Lỗi kiểm tra danh sách nhân viên cá nhân:', result.error || 'Cấu trúc data không đúng');
    console.log('💡 Kiểm tra xem API /personal-members đã hoạt động chưa.');
    
    // Fallback: Thử sử dụng API users
    console.log('\n🔄 Thử fallback với API users...');
    return await fallbackToUsersAPI();
}

// 🆕 Fallback function để sử dụng API users
async function fallbackToUsersAPI() {
    console.log('📝 Sử dụng API users làm fallback...');
    
    const result = await apiCall('GET', '/users?page=1&limit=50');
    
    // Sửa lại cấu trúc data: result.data.data.users
    if (result.success && result.data && result.data.data && result.data.data.users) {
        // Lọc bỏ user hiện tại (Admin1)
        const currentUserEmail = ADMIN_ACCOUNT.email;
        const availableUsers = result.data.data.users.filter(user => 
            user.email !== currentUserEmail
        );
        
        // Chuyển đổi format để tương thích với personalMemberList
        testData.personalMemberList = availableUsers.map(user => ({
            user_id: user,
            member_user_id: user, // Backup field
            added_at: new Date()
        }));
        
        testResults.personalMembersFound = availableUsers.length;
        
        console.log(`✅ Fallback thành công: Tìm thấy ${availableUsers.length} users có thể sử dụng:`);
        console.log('');
        
        if (availableUsers.length === 0) {
            console.log('📝 Không có users nào khác ngoài Admin1!');
            console.log('💡 Hướng dẫn: Chạy file test_dsnv.js để tạo thêm users.');
            return false;
        }
          availableUsers.slice(0, 10).forEach((user, index) => {
            const userName = user.full_name || user.name || 'Unknown User';
            console.log(`${index + 1}. ${userName} (${user.email})`);
            console.log(`   - ID: ${user._id}`);
            console.log(`   - Role: ${user.role || 'User'}`);
            console.log('');
        });
        
        if (availableUsers.length > 10) {
            console.log(`... và ${availableUsers.length - 10} users khác`);
        }
        
        return true;
    } else {
        console.log('❌ Fallback cũng thất bại:', result.error);
        console.log('🔍 Debug: Data structure:', typeof result.data);
        if (result.data) {
            console.log('🔍 Available keys:', Object.keys(result.data));
        }
        return false;
    }
}

// 🔄 4. Thêm members từ danh sách nhân viên vào teams (cập nhật)
async function addPersonalMembersToTeams() {
    console.log('\n➕ THÊM MEMBERS TỪ DANH SÁCH NHÂN VIÊN VÀO TEAMS');
    console.log('===============================================');
    
    const validTeams = testData.createdTeams.filter(t => t.success);
    
    if (validTeams.length === 0) {
        console.log('❌ Không có team hợp lệ để thêm members');
        return false;
    }
    
    if (testData.personalMemberList.length === 0) {
        console.log('❌ Không có thành viên trong danh sách để thêm vào teams');
        console.log('💡 Chạy lệnh: node test/test_dsnv.js để thêm thành viên vào danh sách');
        return false;
    }

    console.log(`📋 Sẽ thêm thành viên từ ${testData.personalMemberList.length} thành viên có sẵn vào ${validTeams.length} teams`);
    
    let memberIndex = 0;
    
    for (const team of validTeams) {
        console.log(`\n📋 Thêm members vào team: ${team.teamName}`);
        
        // Thêm 1 thành viên vào mỗi team
        const memberWrapper = testData.personalMemberList[memberIndex % testData.personalMemberList.length];
        
        // Lấy user từ cấu trúc dữ liệu (có thể là user_id hoặc member_user_id)
        const user = memberWrapper.user_id || memberWrapper.member_user_id || memberWrapper;
        
        if (!user || !user._id) {
            console.log(`⚠️ Dữ liệu user không hợp lệ tại index ${memberIndex}`);
            memberIndex++;
            continue;
        }
        
        // Đa dạng vai trò
        const roles = ['Member', 'Editor', 'Member'];
        const role = roles[memberIndex % roles.length];
        
        console.log(`  ➤ Thêm ${user.full_name || user.name || 'Unknown User'} vào team với vai trò ${role}...`);
        
        const memberData = {
            team_id: team.teamId,
            user_id: user._id,
            role: role
        };

        const result = await apiCall('POST', '/teams/members', memberData);
          const memberResult = {
            teamId: team.teamId,
            teamName: team.teamName,
            userId: user._id,
            userName: user.full_name || user.name || 'Unknown User',
            userEmail: user.email,
            role: memberData.role,
            success: result.success,
            memberId: result.success ? result.data.member?._id : null,
            message: result.success ? 'Thêm thành viên thành công' : result.error
        };
        
        testResults.membersAdded.push(memberResult);
        testData.createdMembers.push(memberResult);
          if (result.success) {
            console.log(`    ✅ Đã thêm ${user.full_name || user.name || 'Unknown User'} với vai trò ${memberData.role}`);
        } else {
            if (result.error && (result.error.includes('đã là thành viên') || result.error.includes('already exists'))) {
                memberResult.success = true;
                memberResult.message = 'User đã là thành viên (OK)';
                console.log(`    ℹ️ ${user.full_name} đã là thành viên - bỏ qua`);
            } else {
                console.log(`    ❌ Lỗi thêm ${user.full_name}: ${result.error}`);
            }
        }
        
        memberIndex++;
        await delay(300);
    }
    
    const successCount = testResults.membersAdded.filter(m => m.success).length;
    console.log(`\n📊 Kết quả thêm members: ${successCount}/${testResults.membersAdded.length} thành công`);
    
    return successCount > 0;
}

// 5. Kiểm tra danh sách teams cuối cùng
async function checkFinalTeamsList() {
    console.log('\n📋 KIỂM TRA DANH SÁCH TEAMS CUỐI CÙNG');
    console.log('====================================');

    const result = await apiCall('GET', '/teams?page=1&limit=20');
    
    if (result.success && result.data.teams) {
        testResults.finalTeamsList = result.data;
        const teams = result.data.teams;
        
        console.log(`✅ Hiện có ${teams.length} teams trong hệ thống:`);
        console.log('');
        
        teams.forEach((team, index) => {
            console.log(`${index + 1}. ${team.team_name}`);
            console.log(`   - ID: ${team._id}`);
            console.log(`   - Mô tả: ${team.description || 'Không có'}`);
            console.log(`   - Số thành viên: ${team.memberCount || 0}`);
            console.log(`   - Vai trò của bạn: ${team.userRole || 'N/A'}`);
            console.log(`   - Tạo lúc: ${new Date(team.created_at).toLocaleString()}`);
            
            if (team.relatedProject) {
                console.log(`   - Dự án liên quan: ${team.relatedProject.project_name} (${team.relatedProject.status})`);
            }
            
            console.log('');
        });
        
        return true;
    } else {
        console.log('❌ Lỗi kiểm tra danh sách teams:', result.error);
        return false;
    }
}

// 6. Xóa tất cả teams (với xác nhận)
async function deleteAllTeamsWithConfirm(rl) {
    function ask(question) {
        return new Promise(resolve => rl.question(question, resolve));
    }
    
    console.log('\n🗑️ XÓA TẤT CẢ TEAMS (NGUY HIỂM!)');
    console.log('================================');
    
    // Làm mới danh sách teams
    await checkFinalTeamsList();
    
    if (!testResults.finalTeamsList || !testResults.finalTeamsList.teams || testResults.finalTeamsList.teams.length === 0) {
        console.log('❌ Không có teams nào để xóa!');
        return;
    }
    
    const teams = testResults.finalTeamsList.teams;
    console.log(`\n⚠️  Bạn sắp xóa toàn bộ ${teams.length} teams khỏi hệ thống!`);
    console.log('⚠️  Thao tác này sẽ xóa luôn tất cả thành viên trong các teams!');
    console.log('⚠️  KHÔNG THỂ HOÀN TÁC sau khi xóa!');
    console.log('');
    
    teams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.team_name} (${team.memberCount || 0} thành viên)`);
    });
    
    console.log('\nNhấn "DELETE" để xác nhận xóa toàn bộ, nhấn bất kỳ phím nào khác để hủy.');
    const confirm = await ask('Lựa chọn của bạn: ');
    
    if (confirm.trim().toUpperCase() !== 'DELETE') {
        console.log('⏪ Đã hủy thao tác xóa toàn bộ teams. Quay lại menu chính.');
        return;
    }
    
    console.log('\n🔥 BẮT ĐẦU XÓA TẤT CẢ TEAMS...');
    console.log('==============================');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const team of teams) {
        try {
            const result = await apiCall('DELETE', `/teams/${team._id}`);
            
            if (result.success) {
                successCount++;
                testResults.deleteResults.push({
                    teamId: team._id,
                    teamName: team.team_name,
                    success: true,
                    message: 'Xóa thành công'
                });
                console.log(`✅ Đã xóa: ${team.team_name}`);
            } else {
                errorCount++;
                testResults.deleteResults.push({
                    teamId: team._id,
                    teamName: team.team_name,
                    success: false,
                    message: result.error
                });
                console.log(`❌ Lỗi xóa ${team.team_name}: ${result.error}`);
            }
        } catch (error) {
            errorCount++;
            console.log(`❌ Lỗi nghiêm trọng khi xóa ${team.team_name}: ${error.message}`);
        }
        
        await delay(300);
    }
    
    console.log('\n📊 KẾT QUẢ XÓA TẤT CẢ TEAMS:');
    console.log(`✅ Xóa thành công: ${successCount}`);
    console.log(`❌ Xóa thất bại: ${errorCount}`);
    
    if (errorCount === 0) {
        console.log('🎉 Đã xóa toàn bộ teams thành công!');
        console.log('🔄 Hệ thống đã được reset về trạng thái ban đầu.');
    } else {
        console.log(`⚠️ Có ${errorCount} lỗi khi xóa teams.`);
    }
    
    console.log('\n🔍 Kiểm tra lại danh sách sau khi xóa...');
    await checkFinalTeamsList();
}

// 7. Báo cáo tổng kết (Cập nhật)
function displaySummaryReport() {
    console.log('\n🎯 BÁO CÁO TỔNG KẾT TEAMS');
    console.log('========================');
    
    // Báo cáo login
    console.log('\n1️⃣ ĐĂNG NHẬP:');
    console.log(`   ${testResults.login ? '✅' : '❌'} ${testResults.login ? 'Thành công' : 'Thất bại'}`);
    if (testResults.login) {
        console.log(`   👤 ${testData.userName}`);
    }
    
    // Báo cáo tạo teams
    console.log('\n2️⃣ TẠO TEAMS:');
    const teamSuccess = testResults.teamsCreated.filter(t => t.success).length;
    console.log(`   ✅ Thành công: ${teamSuccess}/${testResults.teamsCreated.length}`);
    testResults.teamsCreated.forEach(t => {
        const status = t.success ? '✅' : '❌';
        console.log(`   ${status} Team ${t.index}: ${t.teamName.substring(0, 50)}... - ${t.message}`);
    });
    
    // Báo cáo danh sách nhân viên cá nhân
    console.log('\n3️⃣ DANH SÁCH NHÂN VIÊN CÁ NHÂN:');
    console.log(`   📊 Tìm thấy: ${testResults.personalMembersFound} thành viên`);
    if (testResults.personalMembersFound === 0) {
        console.log('   ⚠️ Danh sách trống! Cần chạy test_dsnv.js để thêm thành viên');
        console.log('   💡 Lệnh: node test/test_dsnv.js');
    } else {
        console.log(`   ✅ Đủ thành viên để test (${testResults.personalMembersFound} người)`);
    }
    
    // Báo cáo thêm members
    console.log('\n4️⃣ THÊM MEMBERS VÀO TEAMS:');
    const memberSuccess = testResults.membersAdded.filter(m => m.success).length;
    console.log(`   ✅ Thành công: ${memberSuccess}/${testResults.membersAdded.length}`);
    testResults.membersAdded.forEach(m => {
        const status = m.success ? '✅' : '❌';
        console.log(`   ${status} ${m.userName} -> ${m.teamName.substring(0, 30)}... (${m.role}) - ${m.message}`);
    });    // Báo cáo dự án (Enhanced with null-safety checks)
    console.log('\n5️⃣ DỰ ÁN VÀ LIÊN KẾT:');
    console.log(`   📊 Dự án tìm thấy: ${testResults.projectsFound || 0}`);
    console.log(`   🆕 Dự án tạo mới: ${testResults.projectsCreated || 0}`);
    
    // Safe handling of project assignments
    const projectAssignments = testResults.projectsAssigned || [];
    const assignedSuccess = projectAssignments.filter(p => p && p.success).length;
    const totalAssignments = projectAssignments.length;
    
    if (totalAssignments > 0) {
        console.log(`   ✅ Gán dự án thành công: ${assignedSuccess}/${totalAssignments}`);
        console.log(`   📋 Chi tiết gán dự án:`);
        
        projectAssignments.forEach((p, index) => {
            if (!p) return; // Skip null/undefined entries
            
            const status = p.success ? '✅' : '❌';
            const source = p.isNewProject ? '(Tạo mới)' : '(Có sẵn)';
            const teamName = (p.teamName || 'Unknown team').substring(0, 25);
            const projectName = (p.projectName || 'Unknown project').substring(0, 25);
            
            console.log(`     ${index + 1}. ${status} Team "${teamName}..." ↔ Dự án "${projectName}..." ${source}`);
            
            if (!p.success && p.error) {
                console.log(`        ❌ Lỗi: ${p.error}`);
            } else if (p.success) {
                console.log(`        ✅ Project ID: ${p.projectId || 'N/A'}`);
            }
        });
        
        // Summary statistics
        const newProjectsCount = projectAssignments.filter(p => p && p.isNewProject).length;
        const existingProjectsCount = totalAssignments - newProjectsCount;
        
        console.log(`   📈 Thống kê:`);
        console.log(`     • Sử dụng dự án có sẵn: ${existingProjectsCount}`);
        console.log(`     • Tạo dự án mới: ${newProjectsCount}`);
        console.log(`     • Tỷ lệ thành công: ${totalAssignments > 0 ? Math.round((assignedSuccess / totalAssignments) * 100) : 0}%`);
        
    } else {
        console.log(`   ⚠️ Không có dự án nào được gán cho teams`);
        console.log(`   💡 Có thể do lỗi trong quá trình tạo teams hoặc lấy danh sách dự án`);
    }
    
    // Báo cáo danh sách cuối cùng
    console.log('\n6️⃣ DANH SÁCH TEAMS CUỐI CÙNG:');
    if (testResults.finalTeamsList) {
        const totalTeams = testResults.finalTeamsList.teams?.length || 0;
        console.log(`   📊 Tổng số teams trong hệ thống: ${totalTeams}`);
        const totalMembers = testResults.finalTeamsList.teams?.reduce((sum, team) => sum + (team.memberCount || 0), 0) || 0;
        console.log(`   👥 Tổng số thành viên trong tất cả teams: ${totalMembers}`);
        console.log('   📋 Chi tiết đã hiển thị ở trên');
    } else {
        console.log('   ❌ Không thể lấy danh sách cuối cùng');
    }
    
    // Báo cáo xóa (nếu có)
    if (testResults.deleteResults.length > 0) {
        console.log('\n6️⃣ XÓA TEAMS:');
        const deleteSuccess = testResults.deleteResults.filter(d => d.success).length;
        console.log(`   ✅ Xóa thành công: ${deleteSuccess}/${testResults.deleteResults.length}`);
        testResults.deleteResults.forEach(d => {
            const status = d.success ? '✅' : '❌';
            console.log(`   ${status} ${d.teamName.substring(0, 40)}... - ${d.message}`);
        });
    }    // Tổng kết chung (Enhanced with project success calculation)
    console.log('\n🏆 TỔNG KẾT CHUNG:');
    const hasPersonalMembers = testResults.personalMembersFound > 0;
      // Enhanced: Include project assignment success in overall calculation
    const totalProjectAssignments = testResults.projectsAssigned || [];
    const totalAssignedSuccess = totalProjectAssignments.filter(p => p && p.success).length;
    const projectSuccess = totalAssignedSuccess > 0;
    
    const overallSuccess = testResults.login && 
                          (teamSuccess > 0) && 
                          (memberSuccess > 0) && 
                          hasPersonalMembers &&
                          projectSuccess;
    
    if (overallSuccess) {
        console.log('   🎉 Kịch bản test: THÀNH CÔNG HOÀN TOÀN');
        console.log('   ✅ Tất cả teams đã có thành viên và dự án, sẵn sàng để test giao diện');
        console.log(`   📊 Đã gán ${totalAssignedSuccess} dự án cho các teams`);
    } else if (testResults.login && teamSuccess > 0 && hasPersonalMembers) {
        console.log('   ⚠️ Kịch bản test: THÀNH CÔNG PHẦN LỚN');
        if (!projectSuccess) {
            console.log('   📝 Teams đã được tạo và có thành viên nhưng chưa có dự án');
            console.log('   💡 Hãy kiểm tra API tạo dự án hoặc gán dự án cho teams');
        } else {
            console.log('   📝 Teams đã được tạo, có thành viên và một số đã có dự án');
        }
    } else if (!hasPersonalMembers) {
        console.log('   📋 Kịch bản test: CẦN THÊM DỮ LIỆU');
        console.log('   💡 Hãy chạy test_dsnv.js để thêm thành viên vào danh sách trước');
    } else {
        console.log('   ❌ Kịch bản test: CÓ VẤN ĐỀ');
    }
    
    // Enhanced success rate calculation including projects
    const totalTests = testResults.teamsCreated.length + 
                      testResults.membersAdded.length + 
                      (projectAssignments.length > 0 ? projectAssignments.length : 0) + 
                      1; // +1 for login
                      
    const totalSuccess = teamSuccess + 
                        memberSuccess + 
                        assignedSuccess + 
                        (testResults.login ? 1 : 0);
                        
    const successRate = totalTests > 0 ? Math.round((totalSuccess / totalTests) * 100) : 0;
    console.log(`   📈 Tỷ lệ thành công tổng thể: ${successRate}% (${totalSuccess}/${totalTests})`);
    
    // Additional insights
    if (projectAssignments.length > 0) {
        const projectSuccessRate = Math.round((assignedSuccess / projectAssignments.length) * 100);
        console.log(`   🎯 Tỷ lệ thành công gán dự án: ${projectSuccessRate}%`);
    }
}

// 8. Kịch bản test hoàn chỉnh (Cập nhật)
async function runFullTeamsScenario() {
    console.log('🚀 BẮT ĐẦU KỊCH BẢN TEST TEAMS');
    console.log('=============================');
    console.log('📋 Kịch bản: Admin1 tạo nhiều teams và thêm members từ danh sách cá nhân');
    console.log('🎯 Mục tiêu: Tạo dữ liệu teams đầy đủ để test giao diện');
    console.log('');

    try {
        // Bước 1: Đăng nhập
        const loginOK = await testLogin();
        if (!loginOK) {
            console.log('❌ Không thể login Admin1, dừng test');
            return;
        }

        // Bước 2: Kiểm tra danh sách nhân viên cá nhân
        const hasPersonalMembers = await checkPersonalMemberList();
        if (!hasPersonalMembers) {
            console.log('⏹️ Dừng test do không có thành viên trong danh sách cá nhân');
            return;
        }

        // Bước 3: Tạo nhiều teams
        await createMultipleTeams();

        // Bước 4: Thêm members từ danh sách cá nhân vào teams
        await addPersonalMembersToTeams();        // Bước 5: Lấy danh sách dự án
        console.log('\n🔹 Bước 5/8: Lấy danh sách dự án');
        const projects = await getAvailableProjects();
        testData.projects = projects;
        testResults.projectsFound = projects.length;

        // Bước 6: Gán dự án cho mỗi team
        console.log('\n🔹 Bước 6/8: Gán dự án cho mỗi team');
        for (const [i, team] of testData.createdTeams.entries()) {
            if (!team.success) continue;
            
            let projId = null;
            let projName = '';
            let isNewProject = false;
            
            // Use existing project or create a new one
            if (projects[i]) {
                projId = projects[i]._id;
                projName = projects[i].project_name;
            } else {                projId = await createQuickProject(i + 1);
                if (projId) {
                    projName = `Quick Project ${i+1}_${Date.now()}`;
                    isNewProject = true;
                    // Note: testResults.projectsCreated is incremented in createQuickProject function
                }
            }
            
            if (projId) {
                const assignResult = await assignProjectToTeam(team.teamId, projId);
                
                // Save the assignment result
                const assignmentData = {
                    teamId: team.teamId,
                    teamName: team.teamName,
                    projectId: projId,
                    projectName: projName,
                    success: assignResult,
                    isNewProject: isNewProject
                };
                
                testData.projectAssignments.push(assignmentData);
                testResults.projectsAssigned.push(assignmentData);
            }
            
            await delay(200);
        }

        // Bước 7: Kiểm tra kết quả cuối cùng
        console.log('\n🔹 Bước 7/8: Kiểm tra kết quả cuối cùng');
        await checkFinalTeamsList();

        // Bước 8: Báo cáo tổng kết
        console.log('\n🔹 Bước 8/8: Báo cáo tổng kết');
        displaySummaryReport();

        console.log('\n🎊 HOÀN THÀNH KỊCH BẢN TEST TEAMS!');

    } catch (error) {
        console.log('\n💥 LỖI NGHIÊM TRỌNG:', error.message);
        console.log('📊 Báo cáo một phần:');
        displaySummaryReport();
    }
}

// 🆕 9. Chạy toàn bộ trong 1 lần (AUTO MODE) - Cập nhật
async function runAutoAllInOne() {
    console.log('🤖 AUTO MODE: CHẠY TOÀN BỘ TRONG 1 LẦN');
    console.log('=====================================');
    console.log('🎯 Sẽ thực hiện tất cả các thao tác tự động:');
    console.log('   1️⃣ Đăng nhập Admin1');
    console.log('   2️⃣ Kiểm tra danh sách nhân viên cá nhân');
    console.log('   3️⃣ Tạo 3 teams mới');
    console.log('   4️⃣ Thêm members từ danh sách vào từng team');
    console.log('   5️⃣ Lấy danh sách dự án hiện có');
    console.log('   6️⃣ Tạo dự án mới (nếu cần) và gán cho teams');
    console.log('   7️⃣ Kiểm tra danh sách teams cuối cùng');
    console.log('   8️⃣ Xuất báo cáo tổng kết');
    console.log('');
    console.log('⏱️ Ước tính thời gian: 30-60 giây');
    console.log('🔄 Bắt đầu sau 3 giây...');
    
    // Countdown
    for (let i = 3; i > 0; i--) {
        console.log(`⏳ ${i}...`);
        await delay(1000);
    }
    
    console.log('🚀 BẮT ĐẦU!');
    
    try {        // Reset dữ liệu test (Enhanced with project fields)
        testResults = {
            login: false,
            teamsCreated: [],
            personalMembersFound: 0,
            membersAdded: [],
            projectsFound: 0,        // Reset project counters
            projectsCreated: 0,      // Reset project creation counter
            projectsAssigned: [],    // Reset project assignments
            finalTeamsList: null,
            deleteResults: []
        };
        
        testData = {
            userId: '',
            userName: '', // thêm để lưu tên người dùng
            createdTeams: [],
            personalMemberList: [],
            createdMembers: [],
            projects: [],            // Reset projects array
            projectAssignments: []   // Reset project assignments
        };

        // Thực hiện tất cả các bước tự động
        console.log('\n🔹 Bước 1/8: Đăng nhập...');
        const loginOK = await testLogin();
        if (!loginOK) {
            console.log('❌ Không thể login, dừng AUTO MODE');
            return;
        }

        console.log('\n🔹 Bước 2/8: Kiểm tra danh sách nhân viên...');
        const hasPersonalMembers = await checkPersonalMemberList();
        if (!hasPersonalMembers) {
            console.log('⏹️ Dừng AUTO MODE - Không có thành viên trong danh sách');
            console.log('💡 Hãy chạy: node test/test_dsnv.js để thêm thành viên trước');
            return;
        }

        console.log('\n🔹 Bước 3/8: Tạo teams...');
        await createMultipleTeams();

        console.log('\n🔹 Bước 4/8: Thêm members...');
        await addPersonalMembersToTeams();

        console.log('\n🔹 Bước 5/8: Lấy danh sách dự án...');
        const projects = await getAvailableProjects();        console.log('\n🔹 Bước 6/8: Gán dự án cho các team...');
        for (const [i, team] of testData.createdTeams.entries()) {
            if (!team.success) continue;
            
            let projId = null;
            let projName = '';
            let isNewProject = false;
            
            // Use existing project or create a new one
            if (projects[i]) {
                projId = projects[i]._id;
                projName = projects[i].project_name;
            } else {
                projId = await createQuickProject(i + 1);
                if (projId) {
                    projName = `Quick Project ${i+1}_${Date.now()}`;
                    isNewProject = true;
                }
            }
            
            if (projId) {
                const assignResult = await assignProjectToTeam(team.teamId, projId);
                
                // Save the assignment result with enhanced tracking
                const assignmentData = {
                    teamId: team.teamId,
                    teamName: team.teamName,
                    projectId: projId,
                    projectName: projName,
                    success: assignResult,
                    isNewProject: isNewProject,
                    error: assignResult ? null : 'Assignment failed'
                };
                
                testData.projectAssignments.push(assignmentData);
                testResults.projectsAssigned.push(assignmentData);
            }
            
            await delay(200);
        }

        console.log('\n🔹 Bước 7/8: Kiểm tra danh sách...');
        await checkFinalTeamsList();

        console.log('\n🔹 Bước 8/8: Xuất báo cáo...');
        displaySummaryReport();

        console.log('\n🎉 AUTO MODE HOÀN THÀNH!');
        console.log('✅ Tất cả đã được thực hiện tự động.');
        console.log('📊 Dữ liệu teams đã sẵn sàng để test giao diện.');

    } catch (error) {
        console.log('\n💥 LỖI TRONG AUTO MODE:', error.message);
        console.log('📊 Báo cáo một phần:');
        displaySummaryReport();
    }
}

// 🆕 10. Menu CLI (Cập nhật)
async function menu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    function ask(question) {
        return new Promise(resolve => rl.question(question, resolve));
    }
    
    let running = true;
    
    while (running) {        console.log('\n================ TEAMS TEST MENU ================');
        console.log('🤖 1. AUTO: Chạy toàn bộ trong 1 lần (NHANH!)');
        console.log('📋 2. Chạy kịch bản đầy đủ (có tương tác)');
        console.log('🔑 3. Chỉ đăng nhập Admin1');
        console.log('👥 4. Chỉ kiểm tra danh sách nhân viên cá nhân');
        console.log('📝 5. Chỉ tạo teams mới');
        console.log('➕ 6. Chỉ thêm members vào teams hiện có');
        console.log('📊 7. Kiểm tra danh sách teams hiện tại');
        console.log('📈 8. Xuất báo cáo tổng kết');
        console.log('🗑️ 9. XÓA TẤT CẢ TEAMS (NGUY HIỂM!)');
        console.log('🆕 A. Tạo nhiều dự án mới (5 dự án test)');
        console.log('📂 B. Xem danh sách dự án hiện có');
        console.log('🚪 0. Thoát');
        console.log('================================================');
        console.log('💡 Khuyến nghị: Chọn 1 để chạy nhanh nhất!');
        console.log('📝 Nếu danh sách nhân viên trống: chạy test_dsnv.js trước');
        console.log('🆕 NEW: Chọn A để tạo thêm dự án test');
        console.log('');
        
        const choice = await ask('Chọn chức năng (0-9, A, B): ');
        
        switch (choice.trim()) {
            case '1':
                await runAutoAllInOne();
                break;
            case '2':
                await runFullTeamsScenario();
                break;
            case '3':
                await testLogin();
                break;
            case '4':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }
                await checkPersonalMemberList();
                break;
            case '5':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }
                await createMultipleTeams();
                console.log('✅ Đã tạo xong teams mới!');
                break;
            case '6':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }
                await checkPersonalMemberList();
                await addPersonalMembersToTeams();
                console.log('✅ Đã thêm xong members!');
                break;
            case '7':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }
                await checkFinalTeamsList();
                break;
            case '8':
                displaySummaryReport();
                break;
            case '9':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }                await deleteAllTeamsWithConfirm(rl);
                break;
            case 'A':
            case 'a':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }
                await createMultipleProjects();
                console.log('✅ Đã tạo xong các dự án mới!');
                break;
            case 'B':
            case 'b':
                if (!authToken) {
                    console.log('❌ Vui lòng đăng nhập trước (chọn 3)');
                    break;
                }
                await getAvailableProjects();
                console.log('📋 Danh sách dự án đã hiển thị ở trên!');
                break;
            case '0':
                console.log('\n👋 Cảm ơn bạn đã sử dụng TEAMS TEST!');
                console.log('🎊 Chúc bạn code vui vẻ!');
                running = false;
                break;            default:
                console.log('❌ Vui lòng chọn số từ 0 đến 9, hoặc chữ A, B!');
        }
    }
    
    rl.close();
}

// 🆕 A0. Tạo nhiều dự án để test (NEW FUNCTION) - Fixed with required fields
async function createMultipleProjects() {
    console.log('\n🆕 TẠO NHIỀU DỰ ÁN MỚI');
    console.log('=======================');
    console.log('🎯 Sẽ tạo 5 dự án test với đầy đủ thông tin bắt buộc');
    
    const projectResults = [];
    const projectNames = [
        'Dự án Mobile App UniPlan',
        'Dự án Web Dashboard', 
        'Dự án API Backend',
        'Dự án Testing Framework',
        'Dự án DevOps Pipeline'
    ];
    
    const descriptions = [
        'Phát triển ứng dụng mobile cho hệ thống UniPlan với React Native',
        'Xây dựng dashboard quản lý với React và TypeScript', 
        'Phát triển API backend với Node.js và MongoDB',
        'Thiết lập framework testing tự động cho toàn bộ hệ thống',
        'Xây dựng pipeline CI/CD với GitHub Actions và Docker'
    ];
    
    const priorities = ['High', 'Medium', 'Low', 'High', 'Medium'];
    const statuses = ['Active', 'Active', 'Active', 'Active', 'Active']; // Fixed: Use only valid statuses
    
    // Step 1: Get available project types or let backend create default
    console.log('\n🔍 Kiểm tra phân loại dự án có sẵn...');
    const projectTypesRes = await apiCall('GET', '/project-types');
    let defaultProjectTypeId = null;
    
    if (projectTypesRes.success && projectTypesRes.data && projectTypesRes.data.length > 0) {
        // Use the first available project type
        defaultProjectTypeId = projectTypesRes.data[0]._id;
        console.log(`✅ Sử dụng phân loại: ${projectTypesRes.data[0].name}`);
    } else {
        console.log('⚠️ Không tìm thấy phân loại dự án, backend sẽ tạo mặc định');
    }
    
    for (let i = 0; i < projectNames.length; i++) {
        console.log(`\n➕ Tạo dự án ${i + 1}/5: ${projectNames[i]}`);
        
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (i + 1)); // Các dự án có thời gian khác nhau
        
        // Enhanced payload with all required fields
        const payload = {
            project_name: `${projectNames[i]} - ${Date.now()}`,
            description: descriptions[i],
            start_date: currentDate.toISOString(),
            end_date: endDate.toISOString(),
            status: statuses[i],
            priority: priorities[i]
        };
        
        // Add project_type_id if we have one (otherwise backend will create default)
        if (defaultProjectTypeId) {
            payload.project_type_id = defaultProjectTypeId;
        }
        
        console.log(`   📋 Payload: ${JSON.stringify({
            project_name: payload.project_name,
            status: payload.status,
            priority: payload.priority,
            has_project_type: !!payload.project_type_id
        }, null, 2)}`);
          const res = await apiCall('POST', '/projects', payload);
        
        if (res.success && res.data) {
            const project = res.data.project || res.data;
            if (project && project._id) {
                console.log(`   ✅ Thành công: ${project.project_name}`);
                console.log(`   📅 Thời gian: ${new Date(project.start_date).toLocaleDateString()} → ${new Date(project.end_date).toLocaleDateString()}`);
                console.log(`   🎯 Trạng thái: ${project.status} | Ưu tiên: ${project.priority}`);
                console.log(`   🆔 ID: ${project._id}`);
                
                projectResults.push({
                    success: true,
                    project: project,
                    message: 'Tạo dự án thành công'
                });
                
                // Update global test results
                testResults.projectsCreated++;
            } else {
                console.log(`   ❌ Lỗi: Không nhận được thông tin dự án`);
                console.log(`   🔍 Debug response: ${JSON.stringify(res.data, null, 2)}`);
                projectResults.push({
                    success: false,
                    error: 'Invalid project data',
                    projectName: projectNames[i]
                });
            }
        } else {
            console.log(`   ❌ Lỗi: ${res.error || 'Unknown error'}`);
            console.log(`   🔍 Debug response: Success=${res.success}, Error=${res.error}`);
            console.log(`   🔍 Full response: ${JSON.stringify(res, null, 2)}`);
            projectResults.push({
                success: false,
                error: res.error || 'Unknown error',
                projectName: projectNames[i]
            });
        }
        
        // Delay giữa các request
        await delay(300);
    }
    
    // Báo cáo kết quả
    const successCount = projectResults.filter(p => p.success).length;
    console.log(`\n📊 KẾT QUẢ TẠO DỰ ÁN: ${successCount}/${projectResults.length} thành công`);
    
    if (successCount > 0) {
        console.log('\n✅ CÁC DỰ ÁN ĐÃ TẠO:');
        projectResults.filter(p => p.success).forEach((p, index) => {
            console.log(`   ${index + 1}. ${p.project.project_name}`);
            console.log(`      ID: ${p.project._id}`);
            console.log(`      Trạng thái: ${p.project.status} | Ưu tiên: ${p.project.priority}`);
        });
    }
    
    if (successCount < projectResults.length) {
        console.log('\n❌ CÁC DỰ ÁN LỖI:');
        projectResults.filter(p => !p.success).forEach((p, index) => {
            console.log(`   ${index + 1}. ${p.projectName} - Lỗi: ${p.error}`);
        });
    }
    
    console.log('\n💡 Bây giờ bạn có thể chạy AUTO MODE để gán các dự án này cho teams!');
    
    return projectResults;
}

// 🆕 A. Lấy danh sách dự án có sẵn (Fixed API response handling)
async function getAvailableProjects() {
    console.log('\n📂 LẤY DANH SÁCH DỰ ÁN');
    console.log('=====================');
    const res = await apiCall('GET', '/projects?page=1&limit=10');
      if (res.success) {
        // Fixed: Handle correct API response structure (res.data directly, not res.data.projects)
        const projects = Array.isArray(res.data) ? res.data : [];
        console.log(`✅ Tìm thấy ${projects.length} dự án`);
        
        // Update test results
        testResults.projectsFound = projects.length;
        
        if (projects.length > 0) {
            console.log('📋 Danh sách dự án:');
            projects.forEach((project, index) => {
                console.log(`  ${index + 1}. ${project.project_name || 'Unknown'} (ID: ${project._id})`);
                console.log(`     - Trạng thái: ${project.status || 'N/A'}`);
                console.log(`     - Ưu tiên: ${project.priority || 'N/A'}`);
            });
        }
        
        return projects;
    }
    
    console.log('⚠️ Không lấy được dự án:', res.error);
    return [];
}

// 🆕 B. Tạo nhanh một dự án mới (Enhanced with required fields)
async function createQuickProject(idx) {
    console.log(`🆕 Tạo dự án nhanh số ${idx}...`);
    
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Tạo ngày kết thúc là 1 tháng sau
    
    // Enhanced: Include all required fields based on project model
    const payload = {
        project_name: `Quick Project ${idx}_${Date.now()}`,
        description: `Dự án được tạo tự động bằng auto-test cho team testing`,
        start_date: currentDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'Active',
        priority: 'Medium'
        // Note: project_type_id will be handled by backend (default "Không phân loại")
    };    const res = await apiCall('POST', '/projects', payload);
    
    // Fixed: Handle correct API response structure (res.data.project)
    if (res.success && res.data) {
        // The API returns { message: '...', project: {...} }
        const project = res.data.project || res.data;
        if (project && project._id) {
            console.log(`✅ Đã tạo project: ${project.project_name}`);
            console.log(`   - ID: ${project._id}`);
            console.log(`   - Thời gian: ${new Date(project.start_date).toLocaleDateString()} → ${new Date(project.end_date).toLocaleDateString()}`);
            console.log(`   - Trạng thái: ${project.status} | Ưu tiên: ${project.priority}`);
            
            // Update test results
            testResults.projectsCreated++;
            
            return project._id;
        }
    }
    
    console.log('❌ Lỗi tạo project:', res.error || 'Unknown error');
    console.log('🔍 Debug response structure:');
    console.log('   - Success:', res.success);
    console.log('   - Data:', res.data);
    console.log('   - Error:', res.error);
    console.log('   - Full response:', JSON.stringify(res, null, 2));
    return null;
}

// 🆕 C. Gán project cho team (Improved logic)
async function assignProjectToTeam(teamId, projectId) {
    console.log(`🗂 GÁN PROJECT ${projectId} CHO TEAM ${teamId}`);
    
    try {
        // First, get the current team info to extract required fields
        const teamInfo = await apiCall('GET', `/teams/${teamId}`);
        if (!teamInfo.success) {
            console.log('❌ Không thể lấy thông tin team:', teamInfo.error);
            return false;
        }
        
        // Enhanced: Better handling of team data structure
        const team = teamInfo.data.team || teamInfo.data;
        if (!team) {
            console.log('❌ Cấu trúc dữ liệu team không đúng');
            console.log('🔍 Debug team response:', typeof teamInfo.data);
            return false;
        }
        
        // Prepare update data with existing team info + new project assignment
        const updateData = {
            team_name: team.team_name,
            description: team.description || 'Mô tả team được cập nhật bởi auto-test',
            project_data: projectId // Assign project to team via project_data field
        };
        
        console.log(`   Updating team "${team.team_name}" với project ID: ${projectId}`);
        
        // Update team with project assignment
        const res = await apiCall('PUT', `/teams/${teamId}`, updateData);
        
        if (res.success) {
            console.log('✅ Gán project thành công');
            console.log(`   Team: ${team.team_name}`);
            console.log(`   Project ID: ${projectId}`);
            return true;
        } else {
            console.log('❌ Lỗi gán project:', res.error);
            console.log('🔍 Update payload:', JSON.stringify(updateData, null, 2));
            return false;
        }
        
    } catch (error) {
        console.log('❌ Lỗi nghiêm trọng khi gán project:', error.message);
        return false;
    }
}

// Chạy menu khi file được execute trực tiếp
if (require.main === module) {
    console.log('🎮 TEAMS API TEST INTERACTIVE');
    console.log('Sử dụng tài khoản Admin1@gmail.com để test');
    console.log('💡 TIP: Chọn số 1 để chạy nhanh nhất!');
    console.log('📝 Nếu lỗi "không có thành viên": chạy test_dsnv.js trước');
    menu().catch(console.error);
}

module.exports = {
    runFullTeamsScenario,
    runAutoAllInOne,
    testLogin,
    checkPersonalMemberList,
    createMultipleTeams,
    addPersonalMembersToTeams,
    checkFinalTeamsList,
    deleteAllTeamsWithConfirm,
    displaySummaryReport,
    ADMIN_ACCOUNT,
    testResults,
    getAvailableProjects,
    createQuickProject,
    assignProjectToTeam,
    createMultipleProjects
};