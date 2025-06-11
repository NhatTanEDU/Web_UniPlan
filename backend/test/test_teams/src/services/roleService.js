// Role Management Service - Menu 4
// Quản lý vai trò thành viên: Member/Editor role changes

const { MESSAGES, ENDPOINTS, MEMBER_ROLES, DELAYS } = require('../config/constants');
const apiService = require('./apiService');

class RoleService {
    constructor() {
        this.results = [];
        this.teamsList = [];
        this.selectedTeam = null;
    }

    // Menu 4: Quản lý vai trò thành viên
    async executeRoleManagement() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('📋 MENU 4: QUẢN LÝ VAI TRÒ THÀNH VIÊN');
            console.log('='.repeat(60));
            console.log(MESSAGES.ROLE_MANAGEMENT.START);

            // Bước 1: Lấy danh sách teams
            console.log('\n🔍 Bước 1: Lấy danh sách teams có thành viên...');
            const teamsResult = await this.getTeamsWithMembers();
            if (!teamsResult.success) {
                throw new Error(teamsResult.error);
            }

            if (this.teamsList.length === 0) {
                console.log(MESSAGES.ROLE_MANAGEMENT.NO_TEAMS);
                return {
                    success: false,
                    error: 'Không có teams với thành viên để quản lý vai trò'
                };
            }

            // Bước 2: Hiển thị teams và chọn team
            console.log('\n📋 Bước 2: Danh sách teams có thành viên:');
            this.displayTeamsWithMembers();

            // Chọn team đầu tiên có nhiều thành viên nhất
            this.selectedTeam = this.selectTeamWithMostMembers();
            console.log(`\n🎯 Đã chọn team: "${this.selectedTeam.team_name}" (${this.selectedTeam.members.length} thành viên)`);

            // Bước 3: Hiển thị thành viên và vai trò hiện tại
            console.log('\n👥 Bước 3: Danh sách thành viên và vai trò hiện tại:');
            this.displayCurrentRoles();

            // Bước 4: Thực hiện thay đổi vai trò
            console.log('\n🔄 Bước 4: Thực hiện thay đổi vai trò...');
            const changeResults = await this.executeRoleChanges();

            // Bước 5: Kiểm tra lại vai trò sau thay đổi
            console.log('\n✅ Bước 5: Kiểm tra vai trò sau thay đổi...');
            await this.delay(DELAYS.MEDIUM);
            await this.verifyRoleChanges();

            // Tổng kết
            const summary = this.generateSummary();
            console.log('\n📊 KẾT QUẢ QUẢN LÝ VAI TRÒ:');
            console.log(summary);

            return {
                success: true,
                data: {
                    teamSelected: this.selectedTeam.team_name,
                    membersCount: this.selectedTeam.members.length,
                    roleChanges: this.results,
                    summary: summary
                }
            };        } catch (error) {
            const errorMsg = `Lỗi trong quản lý vai trò: ${error.message}`;
            console.log(`\n❌ ${errorMsg}`);
            console.log('🔍 Chi tiết lỗi:', {
                selectedTeam: this.selectedTeam?.team_name || 'None',
                results: this.results
            });

            return {
                success: false,
                error: errorMsg,
                details: error
            };
        }
    }    // Lấy danh sách teams có thành viên
    async getTeamsWithMembers() {
        try {
            // Bước 1: Lấy danh sách tất cả teams
            const result = await apiService.apiCall('GET', ENDPOINTS.TEAMS_LIST);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const allTeams = Array.isArray(result.data.teams) ? result.data.teams : result.data;
            console.log(`📋 Tìm thấy ${allTeams.length} teams tổng cộng`);

            // Bước 2: Lấy chi tiết từng team để kiểm tra members
            const teamsWithMembers = [];
            const teamsWithoutMembers = [];

            for (const team of allTeams) {
                try {
                    console.log(`🔍 Kiểm tra team: ${team.team_name}`);
                    const detailResult = await apiService.apiCall('GET', `/teams/${team._id}`);
                    
                    if (detailResult.success && detailResult.data.members) {
                        const members = detailResult.data.members || [];
                        const activeMembers = members.filter(member => member.is_active !== false);
                        
                        if (activeMembers.length > 0) {
                            console.log(`   ✅ Có ${activeMembers.length} thành viên`);
                            teamsWithMembers.push({
                                ...team,
                                members: activeMembers
                            });
                        } else {
                            console.log(`   ⚪ Không có thành viên hoạt động`);
                            teamsWithoutMembers.push(team);
                        }
                    } else {
                        console.log(`   ⚠️ Không thể lấy chi tiết team`);
                        teamsWithoutMembers.push(team);
                    }
                } catch (error) {
                    console.log(`   ❌ Lỗi kiểm tra team: ${error.message}`);
                    teamsWithoutMembers.push(team);
                }
                
                await new Promise(resolve => setTimeout(resolve, 100)); // Tránh spam API
            }

            // Bước 3: Báo cáo kết quả
            console.log(`\n📊 KẾT QUẢ PHÂN LOẠI TEAMS:`);
            console.log(`   ✅ Teams có thành viên: ${teamsWithMembers.length}`);
            console.log(`   ⚪ Teams không có thành viên: ${teamsWithoutMembers.length}`);

            // Lưu cả 2 danh sách để sử dụng sau
            this.teamsList = teamsWithMembers;
            this.teamsWithoutMembers = teamsWithoutMembers;

            if (teamsWithMembers.length === 0) {
                console.log(`⚠️ Không có teams nào có thành viên để quản lý vai trò!`);
            }
            
            return {
                success: true,
                data: teamsWithMembers,
                summary: {
                    totalTeams: allTeams.length,
                    teamsWithMembers: teamsWithMembers.length,
                    teamsWithoutMembers: teamsWithoutMembers.length
                }
            };

        } catch (error) {
            return {
                success: false,
                error: `Lỗi lấy danh sách teams: ${error.message}`
            };
        }
    }

    // Hiển thị teams với thành viên
    displayTeamsWithMembers() {
        this.teamsList.forEach((team, index) => {
            const memberRoles = this.getMemberRolesSummary(team.members);
            console.log(`  ${index + 1}. ${team.team_name}`);
            console.log(`     📍 ID: ${team._id}`);
            console.log(`     👥 Thành viên: ${team.members.length}`);
            console.log(`     🎭 Vai trò: ${memberRoles}`);
        });
    }

    // Lấy tóm tắt vai trò của thành viên
    getMemberRolesSummary(members) {
        const roleCount = {};
        members.forEach(member => {
            const role = member.role || 'Member';
            roleCount[role] = (roleCount[role] || 0) + 1;
        });

        return Object.entries(roleCount)
            .map(([role, count]) => `${role}: ${count}`)
            .join(', ');
    }

    // Chọn team có nhiều thành viên nhất
    selectTeamWithMostMembers() {
        return this.teamsList.reduce((maxTeam, currentTeam) => {
            return currentTeam.members.length > maxTeam.members.length ? 
                   currentTeam : maxTeam;
        });
    }

    // Hiển thị vai trò hiện tại
    displayCurrentRoles() {
        this.selectedTeam.members.forEach((member, index) => {
            const user = member.member_id || member.user_id || {};
            const userName = user.full_name || user.name || user.email || 'Unknown';
            const currentRole = member.role || 'Member';
            
            console.log(`  ${index + 1}. 👤 ${userName}`);
            console.log(`     📧 Email: ${user.email || 'N/A'}`);
            console.log(`     🎭 Vai trò hiện tại: ${currentRole}`);
        });
    }

    // Thực hiện thay đổi vai trò
    async executeRoleChanges() {
        const changes = [];

        try {
            // Lấy danh sách thành viên để thay đổi vai trò
            const membersToChange = this.selectedTeam.members.slice(0, 3); // Chỉ thay đổi 3 thành viên đầu
            
            for (let i = 0; i < membersToChange.length; i++) {
                const member = membersToChange[i];
                const user = member.member_id || member.user_id || {};
                const userName = user.full_name || user.name || 'Unknown';
                const currentRole = member.role || 'Member';
                
                // Xác định vai trò mới (chuyển đổi giữa Member và Editor)
                const newRole = currentRole === 'Member' ? 'Editor' : 'Member';
                
                console.log(`\n🔄 Thay đổi vai trò cho: ${userName}`);
                console.log(`   Từ: ${currentRole} → ${newRole}`);

                try {
                    // Gọi API để thay đổi vai trò
                    const changeResult = await this.changeUserRole(
                        this.selectedTeam._id, 
                        member._id || user._id, 
                        newRole
                    );

                    const result = {
                        memberName: userName,
                        memberId: member._id || user._id,
                        oldRole: currentRole,
                        newRole: newRole,
                        success: changeResult.success,
                        message: changeResult.success ? 
                                MESSAGES.ROLE_MANAGEMENT.CHANGE_SUCCESS : 
                                changeResult.error,
                        timestamp: new Date().toLocaleString()
                    };

                    changes.push(result);
                    this.results.push(result);

                    if (changeResult.success) {
                        console.log(`   ✅ ${MESSAGES.ROLE_MANAGEMENT.CHANGE_SUCCESS}`);
                    } else {
                        console.log(`   ❌ Lỗi: ${changeResult.error}`);
                    }

                } catch (error) {
                    const errorResult = {
                        memberName: userName,
                        memberId: member._id || user._id,
                        oldRole: currentRole,
                        newRole: newRole,
                        success: false,
                        message: `Lỗi không mong muốn: ${error.message}`,
                        timestamp: new Date().toLocaleString()
                    };

                    changes.push(errorResult);
                    this.results.push(errorResult);
                    console.log(`   ❌ Lỗi không mong muốn: ${error.message}`);
                }

                await this.delay(DELAYS.SHORT);
            }

            return changes;

        } catch (error) {
            throw new Error(`Lỗi trong quá trình thay đổi vai trò: ${error.message}`);
        }
    }

    // Thay đổi vai trò người dùng
    async changeUserRole(teamId, memberId, newRole) {
        try {
            // Kiểm tra vai trò hợp lệ
            if (!Object.values(MEMBER_ROLES).includes(newRole)) {
                throw new Error(`Vai trò không hợp lệ: ${newRole}`);
            }

            const updateData = {
                role: newRole
            };            const result = await apiService.apiCall(
                'PUT',
                `/teams/${teamId}/members/${memberId}`,
                updateData
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            return {
                success: true,
                data: result.data
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }    // Kiểm tra lại vai trò sau thay đổi
    async verifyRoleChanges() {
        try {
            console.log('🔍 Lấy thông tin team cập nhật...');
            
            const result = await apiService.apiCall('GET', `/teams/${this.selectedTeam._id}`);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const updatedTeam = result.data.team || result.data;
            console.log('\n👥 Vai trò sau thay đổi:');
            
            // Kiểm tra members có tồn tại và là array không
            if (!updatedTeam.members || !Array.isArray(updatedTeam.members)) {
                console.log('⚠️ Không tìm thấy danh sách thành viên trong team cập nhật');
                console.log('🔍 Cấu trúc dữ liệu nhận được:', JSON.stringify(updatedTeam, null, 2));
                
                // Thử gọi API để lấy members riêng
                console.log('🔄 Thử lấy danh sách members từ API riêng...');
                const membersResult = await apiService.apiCall('GET', `/teams/${this.selectedTeam._id}/members`);
                
                if (membersResult.success && membersResult.data && Array.isArray(membersResult.data)) {
                    console.log(`✅ Lấy được ${membersResult.data.length} thành viên từ API members`);
                    this.displayMembersAfterChange(membersResult.data);
                } else {
                    console.log('❌ Không thể lấy danh sách members từ API riêng');
                }
                return;
            }
            
            this.displayMembersAfterChange(updatedTeam.members);

        } catch (error) {
            console.log(`⚠️ Không thể kiểm tra lại vai trò: ${error.message}`);
            console.log('🔍 Chi tiết lỗi:', error);
        }
    }

    // Helper method để hiển thị members sau khi thay đổi
    displayMembersAfterChange(members) {
        if (!members || !Array.isArray(members)) {
            console.log('❌ Danh sách thành viên không hợp lệ');
            return;
        }

        console.log(`\n👥 Tìm thấy ${members.length} thành viên:`);
        
        members.forEach((member, index) => {
            const user = member.member_id || member.user_id || {};
            const userName = user.full_name || user.name || 'Unknown';
            const currentRole = member.role || 'Member';
            
            // Tìm kết quả thay đổi tương ứng
            const changeResult = this.results.find(r => 
                r.memberName === userName || r.memberId === (member._id || user._id)
            );

            let status = '🔵';
            if (changeResult) {
                status = changeResult.success ? '✅' : '❌';
            }

            console.log(`  ${index + 1}. ${status} ${userName} - Vai trò: ${currentRole}`);
        });
    }

    // Tạo báo cáo tổng kết
    generateSummary() {
        const total = this.results.length;
        const successful = this.results.filter(r => r.success).length;
        const failed = total - successful;

        let summary = `\n📊 TỔNG KẾT QUẢN LÝ VAI TRÒ:\n`;
        summary += `   • Team đã chọn: ${this.selectedTeam?.team_name || 'N/A'}\n`;
        summary += `   • Tổng số thay đổi: ${total}\n`;
        summary += `   • Thành công: ${successful} ✅\n`;
        summary += `   • Thất bại: ${failed} ❌\n`;
        summary += `   • Tỷ lệ thành công: ${total > 0 ? Math.round((successful/total) * 100) : 0}%\n`;

        if (this.results.length > 0) {
            summary += `\n📋 CHI TIẾT THAY ĐỔI:\n`;
            this.results.forEach((result, index) => {
                const status = result.success ? '✅' : '❌';
                summary += `   ${index + 1}. ${status} ${result.memberName}: ${result.oldRole} → ${result.newRole}\n`;
                summary += `      💬 ${result.message}\n`;
            });
        }

        return summary;
    }

    // Lấy kết quả test
    getResults() {
        return {
            results: this.results,
            selectedTeam: this.selectedTeam,
            teamsList: this.teamsList,
            summary: this.generateSummary()
        };
    }

    // Reset service
    reset() {
        this.results = [];
        this.teamsList = [];
        this.selectedTeam = null;
    }

    // Delay helper method
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new RoleService();
