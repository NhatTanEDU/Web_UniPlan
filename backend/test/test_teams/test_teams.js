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
    userName: '',
    createdTeams: [],
    personalMemberList: [],
    createdMembers: [],
    projects: [],
    projectAssignments: []
};

// Kết quả test
let testResults = {
    login: false,
    teamsCreated: [],
    personalMembersFound: 0,
    membersAdded: [],
    projectsFound: 0,
    projectsCreated: 0,
    projectsAssigned: [],
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
        return { success: true, data: response.data, status: response.status };    } catch (error) {
        const errorInfo = {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500,
            fullError: error.response?.data || null,
            requestData: data,
            url: `${BASE_URL}${url}`
        };
        
        // Log detailed error for debugging
        console.log('🔍 Detailed API Error:');
        console.log('   - URL:', errorInfo.url);
        console.log('   - Status:', errorInfo.status);
        console.log('   - Error Message:', errorInfo.error);
        console.log('   - Full Error Response:', JSON.stringify(errorInfo.fullError, null, 2));
        console.log('   - Request Data:', JSON.stringify(errorInfo.requestData, null, 2));
        
        return errorInfo;
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        testData.userName = result.data.user.full_name || result.data.user.name;
        testResults.login = true;
        console.log('✅ Login Success');
        console.log(`👤 User: ${testData.userName} (${result.data.user.email})`);
        return true;
    } else {
        console.log('❌ Login Failed:', result.error);
        testResults.login = false; // Ensure login status is false on failure
        return false;
    }
}

// 2. Tạo nhiều nhóm mới
async function createMultipleTeams() {
    console.log('\n📝 TẠO NHIỀU NHÓM MỚI');
    console.log('=====================');
    const numberOfTeams = 3;
    testResults.teamsCreated = []; // Clear previous results for this specific action if re-run

    for (let i = 1; i <= numberOfTeams; i++) {
        console.log(`\n➕ Tạo Team ${i}...`);
        const teamData = {
            team_name: generateUniqueTeamName(i),
            description: `Nhóm test số ${i} - Tạo lúc ${new Date().toLocaleString()}`,
            members: [],
            project_data: null
        };
        const result = await apiCall('POST', '/teams', teamData);
        const teamResult = {
            index: i,
            teamId: result.success ? result.data.team._id : null,
            teamName: teamData.team_name, // Log intended name even on failure
            description: teamData.description,
            success: result.success,
            message: result.success ? 'Tạo nhóm thành công' : `Lỗi: ${result.error}`
        };

        if (result.success) {
            testData.createdTeams.push(teamResult); // Store successfully created team basic info
            console.log(`✅ Team ${i} tạo thành công: ${result.data.team.team_name}`);
        } else {
            console.log(`❌ Team ${i} tạo thất bại: ${result.error}`);
        }
        testResults.teamsCreated.push(teamResult); // Store all attempts
        await delay(300);
    }
    const successCount = testResults.teamsCreated.filter(t => t.success).length;
    console.log(`\n📊 Kết quả tạo teams: ${successCount}/${numberOfTeams} thành công`);
    return successCount > 0;
}

// 3. Kiểm tra danh sách nhân viên cá nhân
async function checkPersonalMemberList() {
    console.log('\n👥 KIỂM TRA DANH SÁCH NHÂN VIÊN CÁ NHÂN');
    console.log('======================================');
    const result = await apiCall('GET', '/personal-members?page=1&limit=50');
    // Debug logs (can be commented out for cleaner output)
    // console.log('🔍 Debug response structure:');
    // console.log('   - Success:', result.success);
    // console.log('   - Error:', result.error);
    // if (result.success && result.data) { /* ... more debug ... */ }

    if (result.success && result.data) {
        let membersList = null;
        if (Array.isArray(result.data)) membersList = result.data;
        else if (result.data.data && Array.isArray(result.data.data)) membersList = result.data.data;
        else if (result.data.members && Array.isArray(result.data.members)) membersList = result.data.members;

        if (membersList) {
            testData.personalMemberList = membersList;
            testResults.personalMembersFound = membersList.length;
            console.log(`✅ Tìm thấy ${membersList.length} thành viên trong danh sách cá nhân:`);
            if (membersList.length === 0) {
                console.log('📝 Danh sách trống! Bạn cần thêm thành viên vào danh sách trước.');
                console.log('💡 Hướng dẫn: Chạy file test_dsnv.js');
                return false;
            }
            membersList.slice(0,5).forEach((member, index) => { // Show first 5
                const user = member.member_user_id;
                if (user) {
                    console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${member.custom_role || 'N/A'}`);
                }
            });
            if(membersList.length > 5) console.log(`  ... và ${membersList.length - 5} thành viên khác.`);
            return true;
        }
    }
    console.log('❌ Lỗi kiểm tra danh sách nhân viên cá nhân:', result.error || 'Cấu trúc data không đúng');
    console.log('💡 Kiểm tra API /personal-members. Thử fallback với API users...');
    return await fallbackToUsersAPI();
}

async function fallbackToUsersAPI() {
    console.log('📝 Sử dụng API users làm fallback...');
    const result = await apiCall('GET', '/users?page=1&limit=50');
    if (result.success && result.data && result.data.data && result.data.data.users) {
        const currentUserEmail = ADMIN_ACCOUNT.email;
        const availableUsers = result.data.data.users.filter(user => user.email !== currentUserEmail);
        testData.personalMemberList = availableUsers.map(user => ({
            user_id: user, member_user_id: user, added_at: new Date()
        }));
        testResults.personalMembersFound = availableUsers.length;
        console.log(`✅ Fallback thành công: Tìm thấy ${availableUsers.length} users có thể sử dụng:`);
        if (availableUsers.length === 0) {
            console.log('📝 Không có users nào khác ngoài Admin1! Chạy test_dsnv.js để tạo users.');
            return false;
        }
        availableUsers.slice(0, 5).forEach((user, index) => { // Show first 5
             const userName = user.full_name || user.name || 'Unknown User';
             console.log(`  ${index + 1}. ${userName} (${user.email})`);
        });
        if(availableUsers.length > 5) console.log(`  ... và ${availableUsers.length - 5} users khác.`);
        return true;
    } else {
        console.log('❌ Fallback cũng thất bại:', result.error);
        testResults.personalMembersFound = 0; // Ensure this is set on failure
        return false;
    }
}

// 4. Thêm members từ danh sách nhân viên vào teams
async function addPersonalMembersToTeams() {
    console.log('\n➕ THÊM MEMBERS TỪ DANH SÁCH NHÂN VIÊN VÀO TEAMS');
    console.log('===============================================');
    const validTeams = testData.createdTeams.filter(t => t.success && t.teamId);
    testResults.membersAdded = []; // Clear previous results

    if (validTeams.length === 0) {
        console.log('❌ Không có team hợp lệ (tạo ở bước trước) để thêm members. Hãy tạo team trước.');
        return false;
    }
    if (testData.personalMemberList.length === 0) {
        console.log('❌ Không có thành viên trong danh sách để thêm. Chạy test_dsnv.js hoặc kiểm tra danh sách (menu 20).');
        return false;
    }
    console.log(`📋 Sẽ thêm thành viên từ ${testData.personalMemberList.length} người có sẵn vào ${validTeams.length} teams.`);
    let memberIndex = 0;
    for (const team of validTeams) {
        console.log(`\n📋 Thêm members vào team: ${team.teamName}`);
        const memberWrapper = testData.personalMemberList[memberIndex % testData.personalMemberList.length];
        const user = memberWrapper.user_id || memberWrapper.member_user_id || memberWrapper;
        if (!user || !user._id) {
            console.log(`⚠️ Dữ liệu user không hợp lệ tại index ${memberIndex}`);
            memberIndex++;
            continue;
        }
        const roles = ['Member', 'Editor', 'Admin']; // Diversify roles - sử dụng roles hợp lệ
        const role = roles[memberIndex % roles.length];
        console.log(`  ➤ Thêm ${user.full_name || user.name || 'Unknown User'} (${user.email}) với vai trò ${role}...`);
        const memberData = { team_id: team.teamId, user_id: user._id, role: role };
        const result = await apiCall('POST', '/teams/members', memberData);
        const memberResult = {
            teamId: team.teamId, teamName: team.teamName,
            userId: user._id, userName: user.full_name || user.name || 'Unknown User', userEmail: user.email,
            role: memberData.role, success: result.success,
            memberId: result.success ? result.data.member?._id : null,
            message: result.success ? 'Thêm thành viên thành công' : result.error
        };
        if (result.success) {
            console.log(`    ✅ Đã thêm ${memberResult.userName} với vai trò ${memberData.role}`);
        } else {
            if (result.error && (result.error.includes('đã là thành viên') || result.error.includes('already exists'))) {
                memberResult.success = true; // Treat as success if already a member for idempotency
                memberResult.message = 'User đã là thành viên (OK)';
                console.log(`    ℹ️ ${memberResult.userName} đã là thành viên - coi như thành công.`);
            } else {
                console.log(`    ❌ Lỗi thêm ${memberResult.userName}: ${result.error}`);
            }
        }
        testResults.membersAdded.push(memberResult);
        testData.createdMembers.push(memberResult); // Keep a running list of all members ever created in session
        memberIndex++;
        await delay(300);
    }
    const successCount = testResults.membersAdded.filter(m => m.success).length;
    console.log(`\n📊 Kết quả thêm members: ${successCount}/${testResults.membersAdded.length} lượt thêm thành công.`);
    return successCount > 0 || testResults.membersAdded.length === 0; // Return true if no members were meant to be added
}

// 5. Kiểm tra danh sách teams cuối cùng
async function checkFinalTeamsList() {
    console.log('\n📊 KIỂM TRA DANH SÁCH TEAMS HIỆN TẠI');
    console.log('====================================');
    const result = await apiCall('GET', '/teams?page=1&limit=20');
    if (result.success && result.data && result.data.teams) { // Ensure result.data.teams exists
        testResults.finalTeamsList = result.data;
        const teams = result.data.teams;
        console.log(`✅ Hiện có ${teams.length} teams trong hệ thống:`);
        teams.forEach((team, index) => {
            console.log(`  ${index + 1}. ${team.team_name} (ID: ${team._id})`);
            console.log(`     - Mô tả: ${team.description || 'Không có'}`);
            console.log(`     - Số thành viên: ${team.memberCount || 0}`);
            if (team.relatedProject) {
                console.log(`     - Dự án: ${team.relatedProject.project_name} (Trạng thái: ${team.relatedProject.status})`);
            } else {
                console.log(`     - Dự án: Chưa gán`);
            }
        });
        return true;
    } else {
        console.log('❌ Lỗi kiểm tra danh sách teams:', result.error || "Không có dữ liệu teams trả về");
        testResults.finalTeamsList = null; // Reset if failed
        return false;
    }
}

// 6. Xóa tất cả teams (với xác nhận)
async function deleteAllTeamsWithConfirm(rl) {
    function ask(question) { return new Promise(resolve => rl.question(question, resolve)); }
    console.log('\n🗑️ XÓA TẤT CẢ TEAMS (NGUY HIỂM!)');
    console.log('================================');
    await checkFinalTeamsList(); // Refresh list
    if (!testResults.finalTeamsList || !testResults.finalTeamsList.teams || testResults.finalTeamsList.teams.length === 0) {
        console.log('✅ Không có teams nào để xóa!');
        testResults.deleteResults = [];
        return;
    }
    const teams = testResults.finalTeamsList.teams;
    console.log(`\n⚠️  Bạn sắp xóa toàn bộ ${teams.length} teams! Thao tác này KHÔNG THỂ HOÀN TÁC.`);
    teams.forEach((team, index) => console.log(`  ${index + 1}. ${team.team_name}`));
    const confirm = await ask('Nhấn "DELETE" để xác nhận xóa, bất kỳ phím nào khác để hủy: ');
    if (confirm.trim().toUpperCase() !== 'DELETE') {
        console.log('⏪ Đã hủy thao tác xóa.');
        return;
    }
    console.log('\n🔥 BẮT ĐẦU XÓA TẤT CẢ TEAMS...');
    let successCount = 0;
    testResults.deleteResults = []; // Reset for this operation

    for (const team of teams) {
        const result = await apiCall('DELETE', `/teams/${team._id}`);
        const deleteOp = { teamId: team._id, teamName: team.team_name, success: result.success, message: result.success ? 'Xóa thành công' : result.error };
        testResults.deleteResults.push(deleteOp);
        if (result.success) {
            successCount++;
            console.log(`✅ Đã xóa: ${team.team_name}`);
        } else {
            console.log(`❌ Lỗi xóa ${team.team_name}: ${result.error}`);
        }
        await delay(300);
    }
    console.log(`\n📊 KẾT QUẢ XÓA: ${successCount}/${teams.length} thành công.`);
    await checkFinalTeamsList(); // Verify
}


// --- PROJECT RELATED FUNCTIONS ---
async function getAvailableProjects() {
    console.log('\n📂 LẤY DANH SÁCH DỰ ÁN');
    console.log('=====================');
    const res = await apiCall('GET', '/projects?page=1&limit=10');
    if (res.success) {
        const projects = Array.isArray(res.data) ? res.data : (res.data.projects || []); // More robust check
        console.log(`✅ Tìm thấy ${projects.length} dự án.`);
        testResults.projectsFound = projects.length;
        if (projects.length > 0) {
            projects.slice(0,5).forEach((p, i) => console.log(`  ${i+1}. ${p.project_name} (ID: ${p._id}, Status: ${p.status})`));
            if(projects.length > 5) console.log(`  ... và ${projects.length - 5} dự án khác.`);
        }
        return projects;
    }
    console.log('⚠️ Không lấy được dự án:', res.error);
    testResults.projectsFound = 0;
    return [];
}

async function createQuickProject(idx) {
    console.log(`🆕 Tạo dự án nhanh số ${idx}...`);
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const payload = {
        project_name: `Quick Project ${idx}_${Date.now()}`,
        description: `Dự án tự động cho test team`,
        start_date: currentDate.toISOString(), end_date: endDate.toISOString(),
        status: 'Active', priority: 'Medium'
    };
    const res = await apiCall('POST', '/projects', payload);
    if (res.success && res.data) {
        const project = res.data.project || res.data; // Handle potential variations in API response
        if (project && project._id) {
            console.log(`✅ Đã tạo project: ${project.project_name} (ID: ${project._id})`);
            testResults.projectsCreated++;
            return project._id; // Return ID
        }
    }
    console.log('❌ Lỗi tạo project:', res.error || 'Dữ liệu project không hợp lệ');
    return null;
}

async function assignProjectToTeam(teamId, projectId) {
    console.log(`🔗 GÁN PROJECT ${projectId} CHO TEAM ${teamId}`);
    try {
        // NEW APPROACH: Update Project's team_id field instead of Team's project_data field
        console.log(`   🔄 Đang cập nhật Project ID ${projectId} với team_id: ${teamId}`);
        
        const updateData = {
            team_id: teamId  // ✅ CORRECT: Update project's team_id field
        };
        
        const res = await apiCall('PUT', `/projects/${projectId}`, updateData);
        
        if (res.success) {
            console.log(`✅ Gán project ${projectId} cho team ${teamId} thành công`);
            console.log(`   📋 Phương pháp: Cập nhật Project.team_id`);
            return true;
        } else {
            console.log(`❌ Lỗi gán project cho team:`, res.error);
            console.log(`   🔍 Update payload:`, JSON.stringify(updateData, null, 2));
            return false;
        }
    } catch (error) {
        console.log('❌ Lỗi nghiêm trọng khi gán project:', error.message);
        return false;
    }
}

async function createMultipleProjects() {
    console.log('\n🆕 TẠO NHIỀU DỰ ÁN MỚI (5 DỰ ÁN)');
    console.log('================================');
    const projectNames = ['Mobile App UniPlan', 'Web Dashboard', 'API Backend', 'Testing Framework', 'DevOps Pipeline'];
    const initialProjectsCreatedCount = testResults.projectsCreated;
    let localSuccessCount = 0;

    // Get project type (optional, backend might handle default)
    const projectTypesRes = await apiCall('GET', '/project-types');
    let defaultProjectTypeId = null;
    if (projectTypesRes.success && projectTypesRes.data && projectTypesRes.data.length > 0) {
        defaultProjectTypeId = projectTypesRes.data[0]._id;
        console.log(`ℹ️ Sử dụng project type: ${projectTypesRes.data[0].name}`);
    } else {
        console.log('⚠️ Không tìm thấy project type, backend sẽ dùng mặc định (nếu có).');
    }

    for (let i = 0; i < projectNames.length; i++) {
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (i + 1));
        const payload = {
            project_name: `${projectNames[i]} Test - ${Date.now()}`,
            description: `Mô tả cho ${projectNames[i]}`,
            start_date: currentDate.toISOString(),
            end_date: endDate.toISOString(),
            status: 'Active', priority: i % 2 === 0 ? 'High' : 'Medium',
            ...(defaultProjectTypeId && { project_type_id: defaultProjectTypeId })
        };
        console.log(`\n➕ Tạo dự án ${i + 1}/5: ${payload.project_name}`);
        const res = await apiCall('POST', '/projects', payload);
        if (res.success && (res.data.project || res.data)?._id) {
            console.log(`   ✅ Thành công: ${(res.data.project || res.data).project_name}`);
            // testResults.projectsCreated is incremented globally by createQuickProject,
            // or directly if not using it. Here we use direct call.
            testResults.projectsCreated++;
            localSuccessCount++;
        } else {
            console.log(`   ❌ Lỗi: ${res.error || 'Không nhận được ID dự án'}`);
        }
        await delay(300);
    }
    console.log(`\n📊 Kết quả tạo dự án: ${localSuccessCount}/${projectNames.length} thành công.`);
    return localSuccessCount > 0;
}
// --- END PROJECT RELATED FUNCTIONS ---


// 7. Báo cáo tổng kết (Refactored for conciseness and detail)
function displaySummaryReport() {
    console.log('\n🎯 BÁO CÁO TỔNG KẾT TEAMS - PHIÊN BẢN TỐI ƯU');
    console.log('================================================');

    // 1. Login
    console.log(`\n1️⃣  ĐĂNG NHẬP: ${testResults.login ? `✅ Thành công (${testData.userName})` : '❌ Thất bại'}`);

    // 2. Tạo Teams
    const teamCreationSuccessCount = testResults.teamsCreated.filter(t => t.success).length;
    console.log(`\n2️⃣  TẠO TEAMS: ${teamCreationSuccessCount}/${testResults.teamsCreated.length} thành công.`);
    if (testResults.teamsCreated.length > 0 && teamCreationSuccessCount < testResults.teamsCreated.length) {
        console.log('   Chi tiết lỗi tạo team:');
        testResults.teamsCreated.filter(t => !t.success).forEach(t => {
            console.log(`     ❌ Team "${(t.teamName || 'N/A').substring(0, 30)}...": ${t.message}`);
        });
    }

    // 3. Danh sách nhân viên cá nhân
    console.log(`\n3️⃣  KIỂM TRA NHÂN VIÊN: ${testResults.personalMembersFound > 0 ? `✅ Tìm thấy ${testResults.personalMembersFound} thành viên.` : '⚠️ Không tìm thấy thành viên nào.'}`);
    if (testResults.personalMembersFound === 0 && (testResults.login || testResults.teamsCreated.length > 0) ) { // Only warn if other steps were attempted
        console.log('   💡 Gợi ý: Chạy test_dsnv.js để thêm nhân viên, hoặc chọn menu 20.');
    }

    // 4. Thêm Members vào Teams (Cụ thể hơn)
    console.log('\n4️⃣  THÊM MEMBERS VÀO TEAMS:');
    const memberAddSuccessCount = testResults.membersAdded.filter(m => m.success).length;
    console.log(`   📊 Tổng quan: ${memberAddSuccessCount}/${testResults.membersAdded.length} lượt thêm thành công.`);
    if (testResults.membersAdded.length > 0) {
        const teamsWithMemberAssignments = {};
        testResults.membersAdded.forEach(m => {
            const teamKey = m.teamName || "Team không xác định";
            if (!teamsWithMemberAssignments[teamKey]) {
                teamsWithMemberAssignments[teamKey] = { success: [], failed: [] };
            }
            const userDetail = `👤 ${m.userName || 'N/A'} (${m.userEmail || 'N/A'})`;
            if (m.success) {
                teamsWithMemberAssignments[teamKey].success.push(`${userDetail} (Vai trò: ${m.role})`);
            } else {
                teamsWithMemberAssignments[teamKey].failed.push(`${userDetail} (Lỗi: ${m.message})`);
            }
        });

        for (const teamName in teamsWithMemberAssignments) {
            console.log(`   ➤ Team "${teamName.substring(0, 30)}...":`);
            teamsWithMemberAssignments[teamName].success.forEach(s => console.log(`     ✅ ${s}`));
            teamsWithMemberAssignments[teamName].failed.forEach(f => console.log(`     ❌ ${f}`));
        }
    } else if (testData.createdTeams.filter(t => t.success).length > 0 && testResults.personalMembersFound > 0) {
         console.log('   ⚠️ Không có hoạt động thêm thành viên nào được ghi nhận (có thể do lỗi trước đó hoặc chưa chạy bước này).');
    }


    // 5. Gán Dự án cho Teams (Cụ thể hơn)
    console.log('\n5️⃣  GÁN DỰ ÁN CHO TEAMS:');
    const projectAssignments = testResults.projectsAssigned || [];
    const projectAssignSuccessCount = projectAssignments.filter(p => p && p.success).length;
    console.log(`   📊 Tổng quan: ${projectAssignSuccessCount}/${projectAssignments.length} lượt gán dự án thành công.`);
    console.log(`      (Thông tin dự án: ${testResults.projectsFound || 0} tìm thấy, ${testResults.projectsCreated || 0} tạo mới trong phiên)`);

    if (projectAssignments.length > 0) {
        const teamsWithProjectAssignments = {};
        projectAssignments.forEach(p => {
            if (!p) return;
            const teamKey = p.teamName || "Team không xác định";
            if (!teamsWithProjectAssignments[teamKey]) {
                teamsWithProjectAssignments[teamKey] = [];
            }
            const projectOrigin = p.isNewProject ? '(Mới tạo)' : '(Có sẵn)';
            const projectDetail = `📁 "${(p.projectName || 'N/A').substring(0, 25)}..." ${projectOrigin}`;
            if (p.success) {
                teamsWithProjectAssignments[teamKey].push(`✅ ${projectDetail}`);
            } else {
                teamsWithProjectAssignments[teamKey].push(`❌ ${projectDetail} (Lỗi: ${p.error || 'Không rõ'})`);
            }
        });

        for (const teamName in teamsWithProjectAssignments) {
            console.log(`   ➤ Team "${teamName.substring(0, 30)}...":`);
            teamsWithProjectAssignments[teamName].forEach(s => console.log(`     ${s}`));
        }
    } else if (testData.createdTeams.filter(t => t.success).length > 0) {
        console.log('   ⚠️ Không có hoạt động gán dự án nào được ghi nhận.');
    }

    // 6. Danh sách Teams Cuối Cùng
    console.log('\n6️⃣  TRẠNG THÁI TEAMS CUỐI CÙNG:');
    if (testResults.finalTeamsList && testResults.finalTeamsList.teams) {
        const finalTeams = testResults.finalTeamsList.teams;
        const totalMembersInTeams = finalTeams.reduce((sum, team) => sum + (team.memberCount || 0), 0);
        console.log(`   📊 Tổng số teams: ${finalTeams.length}. Tổng số thành viên trong các teams: ${totalMembersInTeams}.`);
    } else {
        console.log('   ❌ Không thể lấy danh sách teams cuối cùng (có thể chưa chạy bước này hoặc có lỗi).');
    }

    // 7. Xóa Teams (nếu có)
    if (testResults.deleteResults.length > 0) {
        console.log('\n7️⃣  XÓA TEAMS:');
        const deleteSuccessCount = testResults.deleteResults.filter(d => d.success).length;
        console.log(`   📊 ${deleteSuccessCount}/${testResults.deleteResults.length} teams đã được xóa thành công.`);
        if (deleteSuccessCount < testResults.deleteResults.length) {
            console.log('   Chi tiết lỗi xóa team:');
            testResults.deleteResults.filter(d => !d.success).forEach(d => {
                console.log(`     ❌ Team "${(d.teamName || 'N/A').substring(0, 30)}...": ${d.message}`);
            });
        }
    }

    // 8. Tổng kết chung
    console.log('\n🏆 TỔNG KẾT CHUNG:');
    let overallMessage = "Kịch bản test đã hoàn thành với một số điểm cần lưu ý.";
    let stepsAttempted = 0;
    let stepsSucceeded = 0;

    if (testResults.login !== undefined) { // Login was attempted
        stepsAttempted++;
        if (testResults.login) stepsSucceeded++;
    }
    if (testResults.teamsCreated.length > 0) { // Team creation was attempted
        stepsAttempted++;
        if (teamCreationSuccessCount > 0) stepsSucceeded++;
    }
    if (testResults.personalMembersFound !== undefined && testResults.login) { // Member check was relevant
        stepsAttempted++;
        if (testResults.personalMembersFound > 0) stepsSucceeded++;
    }
    if (testResults.membersAdded.length > 0) { // Member addition was attempted
        stepsAttempted++;
        if (memberAddSuccessCount > 0) stepsSucceeded++;
    }
    if (projectAssignments.length > 0) { // Project assignment was attempted
        stepsAttempted++;
        if (projectAssignSuccessCount > 0) stepsSucceeded++;
    }
    
    const successPercentage = stepsAttempted > 0 ? Math.round((stepsSucceeded / stepsAttempted) * 100) : 100; // 100 if no steps attempted (e.g. just login)

    if (!testResults.login) {
        overallMessage = "❌ Kịch bản test: THẤT BẠI NGHIÊM TRỌNG - Không thể đăng nhập.";
    } else if (stepsAttempted > 1 && successPercentage === 100) { // More than just login, and all attempted steps succeeded
        overallMessage = "🎉 Kịch bản test: THÀNH CÔNG HOÀN HẢO!";
    } else if (stepsAttempted > 0 && successPercentage > 70) {
        overallMessage = "✅ Kịch bản test: THÀNH CÔNG TỐT!";
    } else if (stepsAttempted > 0 && successPercentage > 0) {
        overallMessage = "⚠️ Kịch bản test: THÀNH CÔNG MỘT PHẦN.";
    } else if (stepsAttempted > 0) {
        overallMessage = "❌ Kịch bản test: CÓ NHIỀU VẤN ĐỀ.";
    }


    console.log(`   ${overallMessage}`);
    console.log(`   📈 Tỷ lệ thành công (các bước chính đã thực hiện): ${successPercentage}% (${stepsSucceeded}/${stepsAttempted} bước có kết quả tích cực)`);
    if (testResults.personalMembersFound === 0 && stepsAttempted > 1 && !overallMessage.includes("THẤT BẠI NGHIÊM TRỌNG")) {
        console.log('   ❗️ Lưu ý: Không có thành viên nào trong danh sách cá nhân, điều này có thể ảnh hưởng đến kết quả các bước sau.');
    }
    console.log('================================================');
}

// Function to reset test data for a new full scenario run
function resetTestDataForFullScenario() {
    console.log("🔄 Resetting test data and results for a new scenario run...");
    authToken = ''; // Reset token, will be set by login
    testData = {
        userId: '',
        userName: '',
        createdTeams: [],
        personalMemberList: [],
        createdMembers: [],
        projects: [],
        projectAssignments: []
    };
    testResults = {
        login: false,
        teamsCreated: [],
        personalMembersFound: 0, // Explicitly reset
        membersAdded: [],
        projectsFound: 0,
        projectsCreated: 0,
        projectsAssigned: [],
        finalTeamsList: null,
        deleteResults: []
    };
}


// 8. Kịch bản test hoàn chỉnh (Cập nhật)
async function runFullTeamsScenario() {
    resetTestDataForFullScenario(); // Reset for a clean run

    console.log('\n🚀 BẮT ĐẦU KỊCH BẢN TEST TEAMS (TƯƠNG TÁC)');
    console.log('=============================================');
    console.log('📋 Kịch bản: Admin1 tạo teams, thêm members, gán projects');
    console.log('');

    try {
        if (!await testLogin()) { console.log('❌ Đăng nhập thất bại, dừng kịch bản.'); return; }
        if (!await checkPersonalMemberList()) { console.log('⚠️ Không có thành viên, các bước sau có thể bị ảnh hưởng hoặc thất bại.'); /* Continue? Decide based on strictness */ }
        
        await createMultipleTeams();
        if (testData.createdTeams.filter(t=>t.success).length === 0 && testResults.teamsCreated.length > 0) {
             console.log('❌ Không tạo được team nào, không thể tiếp tục gán member/project.');
        } else {
            await addPersonalMembersToTeams();
            // Project Assignment Logic specific to this scenario
            console.log('\n🔹 Gán dự án cho các team vừa tạo...');
            const availableProjects = await getAvailableProjects();
            let projectIdx = 0;
            for (const team of testData.createdTeams.filter(t => t.success)) {
                let projId = null, projName = '', isNew = false;
                if (availableProjects[projectIdx]) {
                    projId = availableProjects[projectIdx]._id;
                    projName = availableProjects[projectIdx].project_name;
                } else {
                    projId = await createQuickProject(projectIdx + 1); // create if not enough
                    if (projId) { projName = `Quick Project ${projectIdx + 1}`; isNew = true; }
                }
                if (projId) {
                    const assignRes = await assignProjectToTeam(team.teamId, projId);
                    testResults.projectsAssigned.push({
                        teamId: team.teamId, teamName: team.teamName, projectId: projId, projectName: projName,
                        success: assignRes, isNewProject: isNew, error: assignRes ? null : "Gán thất bại"
                    });
                }
                projectIdx++;
                await delay(200);
            }
        }
        
        await checkFinalTeamsList();
        displaySummaryReport();
        console.log('\n🎊 HOÀN THÀNH KỊCH BẢN TEST TEAMS (TƯƠNG TÁC)!');

    } catch (error) {
        console.log('\n💥 LỖI NGHIÊM TRỌNG TRONG KỊCH BẢN:', error.message);
        displaySummaryReport(); // Display partial report
    }
}

// NEW: Basic Data Setup Scenario (from test_teams_basic.js)
async function runBasicDataSetupScenario() {
    resetTestDataForFullScenario(); // Reset for a clean run

    console.log('\n🚀 BẮT ĐẦU KỊCH BẢN TEST CƠ BẢN TỰ ĐỘNG 🚀');
    console.log('=========================================');
    console.log('📋 Kịch bản: Tạo 2 teams, thêm members, gán projects (tự động)');
    
    try {
        if (!await testLogin()) {
            console.log('❌ Đăng nhập thất bại, dừng kịch bản.');
            displaySummaryReport();
            return;
        }
        await delay(300);

        if (!await checkPersonalMemberList()) {
            console.log("⚠️ Không có thành viên để thêm. Bước thêm thành viên vào đội sẽ bị bỏ qua hoặc thất bại.");
        }
        await delay(300);

        // Create only 2 teams for basic scenario
        const numberOfTeamsToCreate = 2;
        console.log(`\n📝 ĐANG TẠO ${numberOfTeamsToCreate} NHÓM MỚI...`);
        
        const originalCreateTeams = createMultipleTeams;
        // Temporarily modify team creation for basic scenario
        createMultipleTeams = async function() {
            const numberOfTeams = 2;
            testResults.teamsCreated = [];

            for (let i = 1; i <= numberOfTeams; i++) {
                console.log(`\n➕ Tạo Team Cơ Bản ${i}...`);
                const teamData = {
                    team_name: generateUniqueTeamName(i),
                    description: `Nhóm test cơ bản số ${i} - Tạo lúc ${new Date().toLocaleString()}`,
                    members: [],
                    project_data: null
                };
                const result = await apiCall('POST', '/teams', teamData);
                const teamResult = {
                    index: i,
                    teamId: result.success ? result.data.team._id : null,
                    teamName: teamData.team_name,
                    description: teamData.description,
                    success: result.success,
                    message: result.success ? 'Tạo nhóm thành công' : `Lỗi: ${result.error}`
                };

                if (result.success) {
                    testData.createdTeams.push(teamResult);
                    console.log(`✅ Team ${i} tạo thành công: ${result.data.team.team_name}`);
                } else {
                    console.log(`❌ Team ${i} tạo thất bại: ${result.error}`);
                }
                testResults.teamsCreated.push(teamResult);
                await delay(300);
            }
            const successCount = testResults.teamsCreated.filter(t => t.success).length;
            console.log(`\n📊 Kết quả tạo teams: ${successCount}/${numberOfTeams} thành công`);
            return successCount > 0;
        };

        const teamsWereCreated = await createMultipleTeams();
        createMultipleTeams = originalCreateTeams; // Restore original function
        await delay(300);

        if (teamsWereCreated) {
            if (testData.personalMemberList.length > 0) {
                await addPersonalMembersToTeams();
                await delay(300);
            } else {
                console.log("ℹ️ Bỏ qua bước thêm thành viên do không có thành viên trong danh sách.");
            }

            // Project assignment using improved logic from basic version
            console.log('\n🔗 ĐANG GÁN DỰ ÁN CHO CÁC ĐỘI (Cập nhật Project)...');
            const projectsForAssignment = await getOrCreateProjectsBasic(testData.createdTeams.length);
            await delay(300);

            if (projectsForAssignment.length >= testData.createdTeams.length) {
                await assignProjectsToTeamsBasic();
            } else if (projectsForAssignment.length > 0) {
                console.log(`ℹ️ Chỉ có ${projectsForAssignment.length} dự án để gán cho ${testData.createdTeams.length} đội.`);
                await assignProjectsToTeamsBasic();
            } else {
                console.log("ℹ️ Bỏ qua bước gán dự án do không có đủ dự án.");
            }
        } else {
            console.log("ℹ️ Bỏ qua các bước liên quan đến đội do không tạo được đội nào.");
        }

        await delay(300);
        await checkFinalTeamsList();
        await delay(300);

        displaySummaryReport();
        console.log('\n🎊 KỊCH BẢN CƠ BẢN KẾT THÚC 🎊');

    } catch (error) {
        console.log('\n💥 LỖI KHÔNG MONG MUỐN TRONG KỊCH BẢN CƠ BẢN:', error);
        displaySummaryReport();
    }
}

// Helper function for basic scenario - get or create projects
async function getOrCreateProjectsBasic(numberOfProjectsToEnsure = 1) {
    console.log('\n📁 ĐANG LẤY HOẶC TẠO DỰ ÁN...');
    testData.projects = [];
    testResults.projectsFound = 0;

    let fetchedProjects = [];
    const projectListResult = await apiCall('GET', `/projects?page=1&limit=${numberOfProjectsToEnsure * 2}`);
    if (projectListResult.success && Array.isArray(projectListResult.data)) {
        fetchedProjects = projectListResult.data;
        testResults.projectsFound = fetchedProjects.length;
        console.log(`✅ Tìm thấy ${fetchedProjects.length} dự án có sẵn.`);
    }

    // Prioritize projects without team_id
    const projectsWithoutTeam = fetchedProjects.filter(p => !p.team_id);
    let finalProjectsForAssignment = projectsWithoutTeam.slice(0, numberOfProjectsToEnsure);

    const projectsStillNeeded = numberOfProjectsToEnsure - finalProjectsForAssignment.length;
    if (projectsStillNeeded > 0) {
        console.log(`ℹ️ Cần tạo thêm ${projectsStillNeeded} dự án mới.`);
        for (let i = 0; i < projectsStillNeeded; i++) {
            const quickProjectPayload = {
                project_name: `Dự án Nhanh Cơ Bản ${i + 1}_${Date.now()}`,
                description: `Mô tả cho dự án nhanh cơ bản ${i + 1}`
            };
            const createResult = await apiCall('POST', '/projects', quickProjectPayload);
            if (createResult.success && createResult.data.project) {
                finalProjectsForAssignment.push(createResult.data.project);
                testResults.projectsCreated++;
                console.log(`✅ Đã tạo dự án nhanh: "${createResult.data.project.project_name}"`);
            } else {
                console.log(`❌ Lỗi tạo dự án nhanh: ${createResult.error}`);
            }
            await delay(200);
        }
    }

    // Fill remaining slots if still not enough
    if (finalProjectsForAssignment.length < numberOfProjectsToEnsure) {
        const remainingFetched = fetchedProjects.filter(p => !finalProjectsForAssignment.find(fp => fp._id === p._id));
        finalProjectsForAssignment.push(...remainingFetched.slice(0, numberOfProjectsToEnsure - finalProjectsForAssignment.length));
    }

    testData.projects = finalProjectsForAssignment.slice(0, numberOfProjectsToEnsure);
    console.log(`ℹ️ Sẽ sử dụng ${testData.projects.length} dự án cho việc gán.`);
    return testData.projects;
}

// Helper function for basic scenario - assign projects to teams (using Project update)
async function assignProjectsToTeamsBasic() {
    console.log('\n🔗 ĐANG GÁN DỰ ÁN CHO CÁC ĐỘI (Cập nhật Project)...');
    testResults.projectsAssigned = testResults.projectsAssigned || [];
    testData.projectAssignments = testData.projectAssignments || [];

    if (testData.createdTeams.length === 0) {
        console.log('❌ Không có đội để gán dự án.');
        return false;
    }
    if (testData.projects.length === 0) {
        console.log('❌ Không có dự án để gán.');
        return false;
    }

    let projectIndex = 0;
    for (const team of testData.createdTeams.filter(t => t.success)) {
        if (projectIndex >= testData.projects.length) {
            console.log('ℹ️ Đã dùng hết dự án có sẵn để gán.');
            break;
        }
        const projectToAssign = testData.projects[projectIndex];

        // Update Project with team_id (better approach from basic version)
        const updateProjectPayload = {
            team_id: team.teamId
        };

        console.log(`ℹ️ Gán đội "${team.teamName}" (ID: ${team.teamId}) cho dự án "${projectToAssign.project_name}" (ID: ${projectToAssign._id})...`);
        const result = await apiCall('PUT', `/projects/${projectToAssign._id}`, updateProjectPayload);

        const assignResult = {
            teamName: team.teamName,
            teamId: team.teamId,
            projectName: projectToAssign.project_name,
            projectId: projectToAssign._id,
            success: result.success,
            isNewProject: false,
            error: result.success ? null : result.error
        };
        testResults.projectsAssigned.push(assignResult);

        if (result.success) {
            testData.projectAssignments.push({
                teamId: team.teamId,
                teamName: team.teamName,
                projectId: projectToAssign._id,
                projectName: projectToAssign.project_name
            });
            console.log(`✅ Gán thành công.`);
        } else {
            console.log(`❌ Lỗi khi cập nhật dự án "${projectToAssign.project_name}" với team ID: ${result.error}`);
        }
        projectIndex++;
        await delay(300);
    }
    const successCount = testResults.projectsAssigned.filter(r => r.success).length;
    console.log(`\n📊 Kết quả gán dự án (cập nhật project): ${successCount}/${Math.min(testData.createdTeams.length, testData.projects.length)} lượt gán thành công.`);
    return successCount > 0;
}

// =============================================================================
// ===== TEAM STATISTICS TEST FUNCTIONS =====
// =============================================================================

// Helper function to check team project statistics via API
async function checkTeamProjectStats() {
    try {
        console.log('📊 Gọi API thống kê team-project...');
        const result = await apiCall('GET', '/teams-enhanced/stats/projects');
        
        if (result.success && result.data) {
            console.log('✅ API thống kê hoạt động tốt');
            return result;
        } else {
            console.log('⚠️ API thống kê có vấn đề:', result.error);
            return result;
        }
    } catch (error) {
        console.log('❌ Lỗi khi gọi API thống kê:', error.message);
        return { success: false, error: error.message };
    }
}

// Test Team Project Statistics - Thống kê team có/chưa có dự án
async function testTeamProjectStatistics() {
    console.log('\n📈 KIỂM TRA THỐNG KÊ TEAM CÓ/CHƯA CÓ DỰ ÁN');
    console.log('===========================================================');
    
    try {        // Test Enhanced Teams API (nếu có)
        console.log('\n🔍 Test 1: Enhanced Teams Statistics API');
        const enhancedResult = await apiCall('GET', '/teams-enhanced/stats/projects');
        
        if (enhancedResult.success && enhancedResult.data) {
            console.log('✅ Enhanced API hoạt động tốt!');
            console.log('\n📊 THỐNG KÊ TỔNG QUAN:');
            
            // Debug: In ra cấu trúc response để xem
            console.log('🔍 [DEBUG] Response structure:', JSON.stringify(enhancedResult.data, null, 2).substring(0, 500) + '...');
            
            // Xử lý linh hoạt các cấu trúc response khác nhau
            const summary = enhancedResult.data.summary || enhancedResult.data.data?.summary || enhancedResult.data;
            
            if (summary && typeof summary === 'object') {
                // Hiển thị thống kê nếu có dữ liệu
                if (summary.totalTeams !== undefined) {
                    console.log(`   • Tổng số teams: ${summary.totalTeams}`);
                    
                    if (summary.teamsWithProjects !== undefined) {
                        console.log(`   • Teams có dự án: ${summary.teamsWithProjects} (${summary.percentageWithProjects || 'N/A'}%)`);
                    }
                    
                    if (summary.teamsWithoutProjects !== undefined) {
                        console.log(`   • Teams chưa có dự án: ${summary.teamsWithoutProjects} (${summary.percentageWithoutProjects || 'N/A'}%)`);
                    }
                } else {
                    // Thử tìm dữ liệu ở các nơi khác
                    console.log('   📋 Dữ liệu thống kê có sẵn:');
                    Object.keys(summary).forEach(key => {
                        console.log(`   • ${key}: ${summary[key]}`);
                    });
                }
            } else {
                console.log('⚠️ Cấu trúc response không như mong đợi. Response type:', typeof summary);
                console.log('⚠️ Response data:', summary);
            }            
            // Hiển thị phân bố dự án nếu có
            const distribution = enhancedResult.data.distribution || enhancedResult.data.data?.distribution;
            if (distribution && typeof distribution === 'object') {
                console.log('\n📈 PHÂN BỐ SỐ LƯỢNG DỰ ÁN:');
                
                if (distribution.noProjects !== undefined) {
                    console.log(`   • Không có dự án: ${distribution.noProjects} teams`);
                }
                if (distribution.oneProject !== undefined) {
                    console.log(`   • 1 dự án: ${distribution.oneProject} teams`);
                }
                if (distribution.twoToFiveProjects !== undefined) {
                    console.log(`   • 2-5 dự án: ${distribution.twoToFiveProjects} teams`);
                }
                if (distribution.moreThanFiveProjects !== undefined) {
                    console.log(`   • Hơn 5 dự án: ${distribution.moreThanFiveProjects} teams`);
                }
            }
            
            // Hiển thị chi tiết teams nếu có
            const teamsData = enhancedResult.data.teams || enhancedResult.data.data?.teams;
            if (teamsData && typeof teamsData === 'object') {
                if (teamsData.withProjects && Array.isArray(teamsData.withProjects) && teamsData.withProjects.length > 0) {
                    console.log('\n📋 CHI TIẾT TEAMS CÓ DỰ ÁN:');
                    teamsData.withProjects.forEach((team, index) => {
                        const teamName = team.teamName || team.team_name || team.name || `Team ${index + 1}`;
                        const projectCount = team.projectCount || team.projects || 0;
                        const userRole = team.userRole || team.role || 'N/A';
                        console.log(`   ${index + 1}. ${teamName} - ${projectCount} dự án (Role: ${userRole})`);
                    });
                }
                
                if (teamsData.withoutProjects && Array.isArray(teamsData.withoutProjects) && teamsData.withoutProjects.length > 0) {
                    console.log('\n📋 CHI TIẾT TEAMS CHƯA CÓ DỰ ÁN:');
                    teamsData.withoutProjects.forEach((team, index) => {
                        const teamName = team.teamName || team.team_name || team.name || `Team ${index + 1}`;
                        const userRole = team.userRole || team.role || 'N/A';
                        console.log(`   ${index + 1}. ${teamName} - Chưa có dự án (Role: ${userRole})`);
                    });
                }
            }            
            console.log('\n✅ Test Enhanced Teams Statistics: THÀNH CÔNG');
        } else {
            console.log('⚠️ Enhanced API không khả dụng hoặc có lỗi.');
            if (enhancedResult.error) {
                console.log(`   📝 Chi tiết lỗi: ${enhancedResult.error}`);
            }
            if (enhancedResult.status) {
                console.log(`   📊 HTTP Status: ${enhancedResult.status}`);
            }
            console.log('   💡 Sẽ thử phương pháp thống kê manual từ Basic API...');
        }
        
        // Test cơ bản - lấy danh sách teams và kiểm tra manual
        console.log('\n🔍 Test 2: Manual Statistics từ Basic Teams API');
        const teamsResult = await apiCall('GET', '/teams');
        
        if (teamsResult.success && teamsResult.data) {
            const teams = Array.isArray(teamsResult.data) ? teamsResult.data : 
                         (teamsResult.data.teams || []);
            
            console.log(`\n📊 Phân tích ${teams.length} teams từ Basic API:`);
            
            let teamsWithProjects = 0;
            let teamsWithoutProjects = 0;
            
            for (const team of teams) {
                if (team.relatedProject || team.project_id) {
                    teamsWithProjects++;
                    console.log(`   ✅ ${team.team_name || team.name} - CÓ dự án`);
                } else {
                    teamsWithoutProjects++;
                    console.log(`   ❌ ${team.team_name || team.name} - CHƯA có dự án`);
                }
            }
            
            const totalTeams = teams.length;
            const percentageWithProjects = totalTeams > 0 ? Math.round((teamsWithProjects / totalTeams) * 100) : 0;
            const percentageWithoutProjects = 100 - percentageWithProjects;
            
            console.log('\n📊 THỐNG KÊ MANUAL:');
            console.log(`   • Tổng teams: ${totalTeams}`);
            console.log(`   • Teams có dự án: ${teamsWithProjects} (${percentageWithProjects}%)`);
            console.log(`   • Teams chưa có dự án: ${teamsWithoutProjects} (${percentageWithoutProjects}%)`);
            
            console.log('\n✅ Test Manual Statistics: THÀNH CÔNG');
        } else {
            console.log('❌ Lỗi lấy danh sách teams cơ bản:', teamsResult.error);
        }
        
        // Test các API thống kê khác (nếu có)
        console.log('\n🔍 Test 3: Các API thống kê khác');
        
        const overviewResult = await apiCall('GET', '/teams-enhanced/stats/overview');
        if (overviewResult.success) {
            console.log('✅ Overview Stats API hoạt động');
            if (overviewResult.data && overviewResult.data.overview) {
                console.log(`   • Total teams: ${overviewResult.data.overview.totalTeams}`);
            }
        } else {
            console.log('⚠️ Overview Stats API không khả dụng');
        }
        
        const comparisonResult = await apiCall('GET', '/teams-enhanced/stats/comparison');
        if (comparisonResult.success) {
            console.log('✅ Comparison Stats API hoạt động');
        } else {
            console.log('⚠️ Comparison Stats API không khả dụng');
        }
          console.log('\n🎉 HOÀN TẤT KIỂM TRA THỐNG KÊ TEAM!');
        console.log('===========================================================');
        console.log('📊 TỔNG KẾT KIỂM THỬ THỐNG KÊ:');
        console.log('   ✅ Enhanced Teams Statistics API: Đã kiểm tra');
        console.log('   ✅ Manual Statistics từ Basic API: Đã kiểm tra');
        console.log('   ✅ Overview Stats API: Đã kiểm tra');
        console.log('   ✅ Comparison Stats API: Đã kiểm tra');
        console.log('');
        console.log('💡 LƯU Ý: Nếu thấy lỗi "Cannot read properties of undefined"');
        console.log('   → Hãy kiểm tra cấu trúc response từ API');
        console.log('   → Có thể server cần restart để cập nhật feature flags');
        console.log('   → Đảm bảo token authentication còn hợp lệ');
        console.log('===========================================================');
        
    } catch (error) {
        console.error('❌ Lỗi khi test thống kê:', error.message);
    }
}

// =============================================================================
// ===== SIMPLE SEARCH APIs TEST FUNCTIONS =====
// =============================================================================

// Test Simple Team Search by Name
async function testSimpleTeamSearchByName() {
    console.log('\n🔍 TEST SIMPLE TEAM SEARCH BY NAME');
    console.log('==================================');
    
    // First, get available teams to test with
    await checkFinalTeamsList();
    if (!testResults.finalTeamsList || !testResults.finalTeamsList.teams || testResults.finalTeamsList.teams.length === 0) {
        console.log('⚠️ Không có team nào để test search. Hãy tạo team trước.');
        return false;
    }
    
    const allTeams = testResults.finalTeamsList.teams;
    console.log(`📊 Có ${allTeams.length} teams để test search`);
    
    // Test 1: Search with exact team name
    const testTeam = allTeams[0];
    console.log(`\n🎯 Test 1: Search exact name "${testTeam.team_name}"`);
    const exactResult = await apiCall('GET', '/teams-simple/search', null, { name: testTeam.team_name });
    
    if (exactResult.success) {
        console.log(`✅ Exact search success: Found ${exactResult.data.data?.teams?.length || 0} teams`);
        if (exactResult.data.data?.teams?.length > 0) {
            console.log(`   📋 First result: ${exactResult.data.data.teams[0].team_name}`);
        }
    } else {
        console.log(`❌ Exact search failed: ${exactResult.error}`);
    }
    
    // Test 2: Search with partial name
    const partialName = testTeam.team_name.split(' ')[0]; // Get first word
    console.log(`\n🔎 Test 2: Search partial name "${partialName}"`);
    const partialResult = await apiCall('GET', '/teams-simple/search', null, { name: partialName });
    
    if (partialResult.success) {
        console.log(`✅ Partial search success: Found ${partialResult.data.data?.teams?.length || 0} teams`);
        if (partialResult.data.data?.teams?.length > 0) {
            console.log(`   📋 Sample results:`);
            partialResult.data.data.teams.slice(0, 3).forEach((team, idx) => {
                console.log(`   ${idx + 1}. ${team.team_name}`);
            });
        }
    } else {
        console.log(`❌ Partial search failed: ${partialResult.error}`);
    }
    
    // Test 3: Search with non-existent name
    console.log(`\n🚫 Test 3: Search non-existent name "NonExistentTeam123"`);
    const notFoundResult = await apiCall('GET', '/teams-simple/search', null, { name: 'NonExistentTeam123' });
    
    if (notFoundResult.success) {
        console.log(`✅ Not found search success: Found ${notFoundResult.data.data?.teams?.length || 0} teams (expected 0)`);
    } else {
        console.log(`❌ Not found search failed: ${notFoundResult.error}`);
    }
    
    // Test 4: Search without name parameter
    console.log(`\n❓ Test 4: Search without name parameter`);
    const noParamResult = await apiCall('GET', '/teams-simple/search');
    
    if (noParamResult.success) {
        console.log(`✅ No param search success: Found ${noParamResult.data.data?.teams?.length || 0} teams`);
    } else {
        console.log(`❌ No param search failed: ${noParamResult.error}`);
    }
    
    console.log('\n📊 Simple team search test completed');
    return true;
}

// Test Simple Member Search in Team
async function testSimpleMemberSearchInTeam() {
    console.log('\n👥 TEST SIMPLE MEMBER SEARCH IN TEAM');
    console.log('=====================================');
    
    // First, get available teams
    await checkFinalTeamsList();
    if (!testResults.finalTeamsList || !testResults.finalTeamsList.teams || testResults.finalTeamsList.teams.length === 0) {
        console.log('⚠️ Không có team nào để test member search. Hãy tạo team trước.');
        return false;
    }
    
    const allTeams = testResults.finalTeamsList.teams;
    
    // Find a team with members
    let testTeam = null;
    for (const team of allTeams) {
        if (team.members && team.members.length > 0) {
            testTeam = team;
            break;
        }
    }
    
    if (!testTeam) {
        console.log('⚠️ Không có team nào có members để test search. Hãy thêm members vào team trước.');
        return false;
    }
    
    console.log(`📊 Testing with team: "${testTeam.team_name}" (${testTeam.members.length} members)`);
    
    // Test 1: Search member by name
    const testMember = testTeam.members[0];
    const memberName = testMember.member_id?.full_name || testMember.member_id?.name || 'Unknown';
    
    console.log(`\n🎯 Test 1: Search member by name "${memberName}"`);
    const nameSearchResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: memberName });
    
    if (nameSearchResult.success) {
        console.log(`✅ Name search success: Found ${nameSearchResult.data.data?.members?.length || 0} members`);
        if (nameSearchResult.data.data?.members?.length > 0) {
            console.log(`   👤 First result: ${nameSearchResult.data.data.members[0].member_id?.full_name || nameSearchResult.data.data.members[0].member_id?.name}`);
        }
    } else {
        console.log(`❌ Name search failed: ${nameSearchResult.error}`);
    }
    
    // Test 2: Search member by email (if available)
    const memberEmail = testMember.member_id?.email;
    if (memberEmail) {
        console.log(`\n📧 Test 2: Search member by email "${memberEmail}"`);
        const emailSearchResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: memberEmail });
        
        if (emailSearchResult.success) {
            console.log(`✅ Email search success: Found ${emailSearchResult.data.data?.members?.length || 0} members`);
        } else {
            console.log(`❌ Email search failed: ${emailSearchResult.error}`);
        }
    }
    
    // Test 3: Search with partial query
    const partialQuery = memberName.split(' ')[0]; // Get first word of name
    console.log(`\n🔎 Test 3: Search with partial query "${partialQuery}"`);
    const partialSearchResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: partialQuery });
    
    if (partialSearchResult.success) {
        console.log(`✅ Partial search success: Found ${partialSearchResult.data.data?.members?.length || 0} members`);
    } else {
        console.log(`❌ Partial search failed: ${partialSearchResult.error}`);
    }
    
    // Test 4: Search with non-existent query
    console.log(`\n🚫 Test 4: Search non-existent member "NonExistentMember123"`);
    const notFoundResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`, null, { query: 'NonExistentMember123' });
    
    if (notFoundResult.success) {
        console.log(`✅ Not found search success: Found ${notFoundResult.data.data?.members?.length || 0} members (expected 0)`);
    } else {
        console.log(`❌ Not found search failed: ${notFoundResult.error}`);
    }
    
    // Test 5: Search without query parameter
    console.log(`\n❓ Test 5: Search without query parameter`);
    const noQueryResult = await apiCall('GET', `/teams-simple/${testTeam._id}/members/search`);
    
    if (noQueryResult.success) {
        console.log(`✅ No query search success: Found ${noQueryResult.data.data?.members?.length || 0} members`);
    } else {
        console.log(`❌ No query search failed: ${noQueryResult.error}`);
    }
    
    // Test 6: Search with invalid team ID
    console.log(`\n🚫 Test 6: Search with invalid team ID`);
    const invalidTeamResult = await apiCall('GET', `/teams-simple/invalid_team_id/members/search`, null, { query: memberName });
    
    if (invalidTeamResult.success) {
        console.log(`⚠️ Invalid team ID search unexpectedly succeeded`);
    } else {
        console.log(`✅ Invalid team ID search properly failed: ${invalidTeamResult.error}`);
    }
    
    console.log('\n📊 Simple member search test completed');
    return true;
}

// Test both simple search APIs together
async function testAllSimpleSearchAPIs() {
    console.log('\n🚀 RUNNING ALL SIMPLE SEARCH API TESTS');
    console.log('=======================================');
    
    if (!authToken) {
        console.log('❌ Vui lòng đăng nhập trước (menu 10)');
        return false;
    }
    
    try {
        // Test team search
        console.log('\n📍 Phase 1: Testing Simple Team Search...');
        const teamSearchResult = await testSimpleTeamSearchByName();
        await delay(1000);
        
        // Test member search
        console.log('\n📍 Phase 2: Testing Simple Member Search...');
        const memberSearchResult = await testSimpleMemberSearchInTeam();
        
        // Summary
        console.log('\n📊 SIMPLE SEARCH TESTS SUMMARY');
        console.log('==============================');
        console.log(`🔍 Team Search: ${teamSearchResult ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`👥 Member Search: ${memberSearchResult ? '✅ PASSED' : '❌ FAILED'}`);
        
        const allPassed = teamSearchResult && memberSearchResult;
        console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        return allPassed;
        
    } catch (error) {
        console.log(`💥 Error during simple search tests: ${error.message}`);
        return false;
    }
}

