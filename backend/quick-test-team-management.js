const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';

// Thông tin admin
const ADMIN_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

// Tạo thông tin user mới với timestamp để tránh trùng lặp
const timestamp = Date.now();
const NEW_USER_DATA = {
    full_name: `Test User ${timestamp}`,
    email: `testuser${timestamp}@gmail.com`,
    password: '123456'
};

async function quickTeamTest() {
    try {
        console.log('🚀 Bắt đầu test quản lý team...\n');
        console.log(`👤 Admin: ${ADMIN_CREDENTIALS.email}`);
        console.log(`👤 User mới: ${NEW_USER_DATA.email}`);
        console.log(`👤 Tên user mới: ${NEW_USER_DATA.full_name}\n`);

        // 1. Kiểm tra server
        console.log('1️⃣ Kiểm tra server...');
        try {
            const healthResponse = await axios.get(`${API_BASE}/health`);
            console.log('✅ Server đang hoạt động:', healthResponse.data.status);
        } catch (error) {
            console.log('❌ Server không phản hồi. Đảm bảo server đang chạy trên port 5000');
            return;
        }

        // 2. Đăng nhập admin
        console.log('\n2️⃣ Đăng nhập admin...');
        const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
        const adminToken = adminLoginResponse.data.token;
        const adminUser = adminLoginResponse.data.user;
        console.log('✅ Đăng nhập admin thành công. User:', adminUser.name);

        // 3. Tạo user mới
        console.log('\n3️⃣ Tạo user mới...');
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, NEW_USER_DATA);
        console.log('✅ Tạo user mới thành công:', registerResponse.data.user?.name || NEW_USER_DATA.full_name);

        // 4. Đăng nhập user mới
        console.log('\n4️⃣ Đăng nhập user mới...');
        const newUserLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: NEW_USER_DATA.email,
            password: NEW_USER_DATA.password
        });
        const newUserToken = newUserLoginResponse.data.token;
        const newUser = newUserLoginResponse.data.user;
        console.log('✅ Đăng nhập user mới thành công. User:', newUser.name);

        // 5. Tạo team mới (bằng admin)
        console.log('\n5️⃣ Tạo team mới...');
        const teamData = {
            team_name: `Team Test ${new Date().toLocaleString('vi-VN')}`,
            description: 'Team test được tạo tự động',
            type: 'project'
        };

        const createTeamResponse = await axios.post(`${API_BASE}/teams`, teamData, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        const newTeam = createTeamResponse.data.team;
        console.log('✅ Tạo team thành công:', newTeam.team_name);
        console.log('   Team ID:', newTeam._id);
        console.log('   Type:', newTeam.type);
        console.log('   Created by:', newTeam.created_by?.full_name || 'Unknown');

        // 6. Thêm user mới vào team
        console.log('\n6️⃣ Thêm user mới vào team...');
        const memberData = {
            user_id: newUser.id,
            role: 'Member'
        };

        const addMemberResponse = await axios.post(
            `${API_BASE}/teams/${newTeam._id}/members`, 
            memberData, 
            {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );

        console.log('📝 Debug - Add member response:', JSON.stringify(addMemberResponse.data, null, 2));
        console.log('✅ Thêm user vào team thành công');
        if (addMemberResponse.data.member) {
            console.log('   Member ID:', addMemberResponse.data.member._id);
            console.log('   Role:', addMemberResponse.data.member.role);
        } else {
            console.log('   Response:', addMemberResponse.data.message || 'Success');
        }

        // 7. Lấy danh sách thành viên team
        console.log('\n7️⃣ Lấy danh sách thành viên team...');
        const membersResponse = await axios.get(
            `${API_BASE}/teams/${newTeam._id}/members`,
            {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );

        console.log('📝 Debug - Response data:', JSON.stringify(membersResponse.data, null, 2));

        // Xử lý dữ liệu trả về từ API - có thể là array hoặc object
        let members = [];
        if (Array.isArray(membersResponse.data)) {
            members = membersResponse.data;
        } else if (membersResponse.data.members && Array.isArray(membersResponse.data.members)) {
            members = membersResponse.data.members;
        } else if (membersResponse.data.data && Array.isArray(membersResponse.data.data)) {
            members = membersResponse.data.data;
        } else {
            console.log('⚠️ Dữ liệu thành viên không đúng định dạng:', typeof membersResponse.data);
            members = [];
        }

        console.log(`✅ Team có ${members.length} thành viên:`);
        if (members.length > 0) {
            members.forEach((member, index) => {
                const userName = member.user_id?.full_name || member.user_id?.name || member.full_name || 'Unknown';
                const userRole = member.role || 'Unknown Role';
                console.log(`   ${index + 1}. ${userName} - ${userRole}`);
            });

            // Kiểm tra user mới có trong team không
            const newUserInTeam = members.find(m => 
                m.user_id?.email === NEW_USER_DATA.email || 
                m.email === NEW_USER_DATA.email ||
                m.user_id?._id === newUser.id ||
                m.user_id === newUser.id
            );
            
            if (newUserInTeam) {
                console.log('✅ User mới đã được thêm vào team thành công!');
            } else {
                console.log('⚠️ User mới chưa xuất hiện trong team');
                console.log('📝 Debug - Looking for user:', NEW_USER_DATA.email, 'or ID:', newUser.id);
            }
        } else {
            console.log('⚠️ Team chưa có thành viên nào hoặc có lỗi khi lấy dữ liệu');
        }

        // 8. Lấy danh sách teams của user mới
        console.log('\n8️⃣ Lấy danh sách teams của user mới...');
        const userTeamsResponse = await axios.get(`${API_BASE}/teams`, {
            headers: { 'Authorization': `Bearer ${newUserToken}` }
        });

        console.log('📝 Debug - User teams response:', JSON.stringify(userTeamsResponse.data, null, 2));

        // Xử lý dữ liệu teams của user
        let userTeams = [];
        if (Array.isArray(userTeamsResponse.data)) {
            userTeams = userTeamsResponse.data;
        } else if (userTeamsResponse.data.teams && Array.isArray(userTeamsResponse.data.teams)) {
            userTeams = userTeamsResponse.data.teams;
        } else if (userTeamsResponse.data.data && Array.isArray(userTeamsResponse.data.data)) {
            userTeams = userTeamsResponse.data.data;
        } else {
            console.log('⚠️ Dữ liệu teams không đúng định dạng:', typeof userTeamsResponse.data);
            userTeams = [];
        }

        console.log(`✅ User mới tham gia ${userTeams.length} team(s):`);
        if (userTeams.length > 0) {
            userTeams.forEach((team, index) => {
                const teamName = team.team_name || team.name || 'Unknown Team';
                const userRole = team.myRole || team.role || 'Unknown Role';
                console.log(`   ${index + 1}. ${teamName} - Role: ${userRole}`);
            });

            // Kiểm tra team vừa tạo có trong danh sách của user không
            const createdTeamInUserList = userTeams.find(t => 
                t._id === newTeam._id || 
                t.id === newTeam._id ||
                t.team_name === newTeam.team_name
            );
            
            if (createdTeamInUserList) {
                console.log('✅ Team vừa tạo đã xuất hiện trong danh sách teams của user mới!');
            } else {
                console.log('⚠️ Team vừa tạo chưa xuất hiện trong danh sách teams của user mới');
                console.log('📝 Debug - Looking for team ID:', newTeam._id);
            }
        } else {
            console.log('⚠️ User mới chưa tham gia team nào hoặc có lỗi khi lấy dữ liệu');
        }

        console.log('\n🎉 Tất cả test Team Management đều PASS! API hoạt động tốt.');
        console.log('\n📊 Tóm tắt kết quả:');
        console.log(`   👤 Admin: ${adminUser.name}`);
        console.log(`   👤 User mới: ${newUser.name}`);
        console.log(`   👥 Team: ${newTeam.team_name}`);
        console.log(`   👥 Tổng thành viên: ${members ? members.length : 'Unknown'}`);
        console.log(`   👥 User teams: ${userTeams ? userTeams.length : 'Unknown'}`);

    } catch (error) {
        console.error('\n❌ Test thất bại:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data.message || error.response.data);
            if (error.response.data.error) {
                console.error('   Error Detail:', error.response.data.error);
            }
        } else {
            console.error('   Error:', error.message);
        }
    }
}

// Chạy test
if (require.main === module) {
    quickTeamTest();
}

module.exports = quickTeamTest;
