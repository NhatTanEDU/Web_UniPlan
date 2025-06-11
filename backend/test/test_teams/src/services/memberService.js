const apiService = require('./apiService');
const teamService = require('./teamService');
const { MESSAGES, DELAYS, MEMBER_ROLES } = require('../config/constants');

class MemberService {
    constructor() {
        this.personalMemberList = [];
        this.addedMembers = [];
        this.searchedMember = null;
    }

    async getPersonalMemberList() {
        console.log('\n👥 XEM DANH SÁCH THÀNH VIÊN');
        console.log('============================');
        
        try {
            console.log('⏳ Đang lấy danh sách thành viên cá nhân...');
            
            const result = await apiService.apiCall('GET', '/personal-members?page=1&limit=50');
            
            if (result.success && result.data) {
                let membersList = null;
                
                // Xử lý các cấu trúc response khác nhau
                if (Array.isArray(result.data)) {
                    membersList = result.data;
                } else if (result.data.data && Array.isArray(result.data.data)) {
                    membersList = result.data.data;
                } else if (result.data.members && Array.isArray(result.data.members)) {
                    membersList = result.data.members;
                }

                if (membersList) {
                    this.personalMemberList = membersList;
                    
                    console.log(`✅ Tìm thấy ${membersList.length} thành viên trong danh sách:`);
                    
                    if (membersList.length === 0) {
                        console.log('📝 Danh sách trống! Cần thêm thành viên vào danh sách trước.');
                        console.log('💡 Gợi ý: Chạy test_dsnv.js để tạo thành viên');
                        return { success: false, count: 0, members: [] };
                    }
                    
                    // Hiển thị 5 thành viên đầu tiên
                    membersList.slice(0, 5).forEach((member, index) => {
                        const user = member.member_user_id || member.user_id || member;
                        if (user) {
                            console.log(`   ${index + 1}. ${user.name || user.full_name} (${user.email}) - Vai trò: ${member.custom_role || 'N/A'}`);
                        }
                    });
                    
                    if (membersList.length > 5) {
                        console.log(`   ... và ${membersList.length - 5} thành viên khác.`);
                    }
                    
                    return {
                        success: true,
                        count: membersList.length,
                        members: membersList,
                        message: `Tìm thấy ${membersList.length} thành viên`
                    };
                }
            }
            
            // Fallback to users API
            console.log('💡 Thử fallback với API users...');
            return await this.fallbackToUsersAPI();
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI LẤY DANH SÁCH THÀNH VIÊN:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                count: 0,
                members: []
            };
        }
    }

    async fallbackToUsersAPI() {
        try {
            console.log('📝 Sử dụng API users làm fallback...');
            
            const result = await apiService.apiCall('GET', '/users?page=1&limit=50');
            
            if (result.success && result.data && result.data.data && result.data.data.users) {
                const availableUsers = result.data.data.users.filter(user => 
                    user.email !== 'Admin1@gmail.com' // Loại trừ admin hiện tại
                );
                
                this.personalMemberList = availableUsers.map(user => ({
                    user_id: user,
                    member_user_id: user,
                    added_at: new Date()
                }));
                
                console.log(`✅ Fallback thành công: Tìm thấy ${availableUsers.length} users:`);
                
                if (availableUsers.length === 0) {
                    console.log('📝 Không có users khác ngoài Admin1!');
                    return { success: false, count: 0, members: [] };
                }
                
                availableUsers.slice(0, 5).forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.full_name || user.name} (${user.email})`);
                });
                
                if (availableUsers.length > 5) {
                    console.log(`   ... và ${availableUsers.length - 5} users khác.`);
                }
                
                return {
                    success: true,
                    count: availableUsers.length,
                    members: this.personalMemberList,
                    message: `Fallback thành công: ${availableUsers.length} users`
                };
            }
            
            throw new Error('Không thể lấy danh sách users');
            
        } catch (error) {
            console.log('❌ Fallback cũng thất bại:', error.message);
            return {
                success: false,
                error: error.message,
                count: 0,
                members: []
            };
        }
    }

    async addMembersToTeams(maxMembers = 3) {
        console.log('\n➕ THÊM THÀNH VIÊN VÀO TEAMS');
        console.log('=============================');
        
        try {
            const validTeams = teamService.getTestTeams().filter(t => t.id);
            
            if (validTeams.length === 0) {
                console.log('❌ Không có team hợp lệ để thêm thành viên!');
                return { success: false, results: [] };
            }
            
            if (this.personalMemberList.length === 0) {
                console.log('❌ Không có thành viên trong danh sách để thêm!');
                return { success: false, results: [] };
            }
            
            console.log(`📋 Thêm tối đa ${maxMembers} thành viên vào ${validTeams.length} teams`);
            
            const results = [];
            let memberIndex = 0;
            
            for (const team of validTeams) {
                console.log(`\n📋 Thêm thành viên vào team: ${team.name}`);
                
                // Thêm tối đa maxMembers vào mỗi team
                for (let i = 0; i < Math.min(maxMembers, this.personalMemberList.length); i++) {
                    const memberWrapper = this.personalMemberList[memberIndex % this.personalMemberList.length];
                    const user = memberWrapper.user_id || memberWrapper.member_user_id || memberWrapper;
                    
                    if (!user || !user._id) {
                        console.log(`⚠️ Dữ liệu user không hợp lệ tại index ${memberIndex}`);
                        memberIndex++;
                        continue;
                    }
                    
                    // Đa dạng hóa vai trò
                    const roles = [MEMBER_ROLES.MEMBER, MEMBER_ROLES.EDITOR];
                    const role = roles[memberIndex % roles.length];
                    
                    console.log(`   ➤ Thêm ${user.full_name || user.name} với vai trò ${role}...`);
                    
                    const memberData = {
                        team_id: team.id,
                        user_id: user._id,
                        role: role
                    };
                    
                    const result = await apiService.apiCall('POST', '/teams/members', memberData);
                    
                    const memberResult = {
                        teamId: team.id,
                        teamName: team.name,
                        userId: user._id,
                        userName: user.full_name || user.name,
                        userEmail: user.email,
                        role: role,
                        success: result.success,
                        memberId: result.success ? result.data.member?._id : null,
                        message: result.success ? MESSAGES.MEMBER_ADDED : result.error,
                        status: 'online' // Mặc định online cho test
                    };
                    
                    if (result.success) {
                        console.log(`      ✅ ${MESSAGES.MEMBER_ADDED}`);
                        console.log(`      👤 Thành viên: ${memberResult.userName}`);
                        console.log(`      🏷️ Vai trò: ${role}`);
                        console.log(`      🟢 Trạng thái: ${memberResult.status}`);
                        
                        this.addedMembers.push(memberResult);
                    } else {
                        if (result.error && (result.error.includes('đã là thành viên') || result.error.includes('already exists'))) {
                            console.log(`      ⚠️ ${user.full_name || user.name} đã là thành viên của team này`);
                        } else {
                            console.log(`      ❌ Thêm thất bại: ${result.error}`);
                        }
                    }
                    
                    results.push(memberResult);
                    memberIndex++;
                    await apiService.delay(DELAYS.API_CALL);
                }
            }
            
            const successCount = results.filter(r => r.success).length;
            console.log(`\n📊 KẾT QUẢ: ${successCount}/${results.length} lượt thêm thành công`);
            
            return {
                success: successCount > 0,
                results: results,
                totalAdded: successCount,
                totalAttempts: results.length
            };
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI THÊM THÀNH VIÊN:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    async searchMemberInTeam(teamId = null, memberId = null) {
        console.log('\n🔍 TÌM KIẾM THÀNH VIÊN TRONG TEAM');
        console.log('=================================');
        
        try {
            // Chọn team ngẫu nhiên nếu không có teamId
            let targetTeam;
            if (!teamId) {
                const teams = teamService.getTestTeams();
                if (teams.length === 0) {
                    console.log('❌ Không có team nào để tìm kiếm thành viên!');
                    return { success: false, error: 'Không có team để tìm kiếm' };
                }
                targetTeam = teams[Math.floor(Math.random() * teams.length)];
                teamId = targetTeam.id;
            }
            
            console.log(`🔍 Đang tìm kiếm thành viên trong team: ${targetTeam ? targetTeam.name : teamId}`);
            
            // Lấy danh sách thành viên trong team
            const result = await apiService.apiCall('GET', `/teams/${teamId}/members`);
            
            if (result.success && result.data) {
                const members = result.data.members || result.data || [];
                
                if (members.length === 0) {
                    console.log('❌ Team này chưa có thành viên nào!');
                    return { success: false, error: 'Team chưa có thành viên' };
                }
                
                // Chọn thành viên ngẫu nhiên để tìm kiếm
                const randomMember = members[Math.floor(Math.random() * members.length)];
                this.searchedMember = randomMember;
                
                console.log(`✅ ${MESSAGES.MEMBER_FOUND}`);
                console.log(`👤 Tên: ${randomMember.user_id?.full_name || randomMember.user_id?.name || 'Unknown'}`);
                console.log(`📧 Email: ${randomMember.user_id?.email || 'Unknown'}`);
                console.log(`🏷️ Vai trò: ${randomMember.role || 'Unknown'}`);
                console.log(`📅 Ngày tham gia: ${randomMember.joined_at ? new Date(randomMember.joined_at).toLocaleDateString('vi-VN') : 'Unknown'}`);
                
                return {
                    success: true,
                    member: randomMember,
                    teamId: teamId,
                    teamName: targetTeam ? targetTeam.name : 'Unknown',
                    message: `Tìm thấy thành viên ${randomMember.user_id?.full_name || randomMember.user_id?.name} trong team ${targetTeam ? targetTeam.name : 'Unknown'}`
                };
                
            } else {
                console.log(`❌ ${MESSAGES.MEMBER_NOT_FOUND}: ${result.error}`);
                return {
                    success: false,
                    error: result.error,
                    teamId: teamId
                };
            }
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI TÌM KIẾM THÀNH VIÊN:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                message: MESSAGES.ERROR + error.message
            };
        }
    }

    getPersonalMembers() {
        return this.personalMemberList;
    }

    getAddedMembers() {
        return this.addedMembers;
    }

    getSearchedMember() {
        return this.searchedMember;
    }

    clearMemberData() {
        this.personalMemberList = [];
        this.addedMembers = [];
        this.searchedMember = null;
    }

    getMembersSummary() {
        return {
            personalMembersCount: this.personalMemberList.length,
            addedMembersCount: this.addedMembers.length,
            searchedMember: this.searchedMember,
            addedMembers: this.addedMembers
        };
    }
}

module.exports = new MemberService();
