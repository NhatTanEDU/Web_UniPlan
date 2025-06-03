// Member Removal Service - Menu 5
// Xóa thành viên khỏi teams

const { MESSAGES, ENDPOINTS, DELAYS } = require('../config/constants');
const apiService = require('./apiService');

class MemberRemovalService {
    constructor() {
        this.results = [];
        this.teamsList = [];
        this.selectedTeam = null;
        this.removedMembers = [];
    }

    // Menu 5: Xóa thành viên khỏi teams
    async executeMemberRemoval() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('🗑️ MENU 5: XÓA THÀNH VIÊN KHỎI TEAMS');
            console.log('='.repeat(60));
            console.log(MESSAGES.MEMBER_REMOVAL.START);

            // Bước 1: Lấy danh sách teams có thành viên
            console.log('\n🔍 Bước 1: Lấy danh sách teams có thành viên...');
            const teamsResult = await this.getTeamsWithMembers();
            if (!teamsResult.success) {
                throw new Error(teamsResult.error);
            }

            if (this.teamsList.length === 0) {
                console.log(MESSAGES.MEMBER_REMOVAL.NO_TEAMS);
                return {
                    success: false,
                    error: 'Không có teams với thành viên để xóa'
                };
            }

            // Bước 2: Hiển thị teams và chọn team
            console.log('\n📋 Bước 2: Danh sách teams có thành viên:');
            this.displayTeamsWithMembers();

            // Chọn team có nhiều thành viên nhất
            this.selectedTeam = this.selectTeamWithMostMembers();
            console.log(`\n🎯 Đã chọn team: "${this.selectedTeam.team_name}" (${this.selectedTeam.members.length} thành viên)`);

            // Bước 3: Hiển thị thành viên hiện tại
            console.log('\n👥 Bước 3: Danh sách thành viên hiện tại:');
            this.displayCurrentMembers();

            // Bước 4: Thực hiện xóa thành viên
            console.log('\n🗑️ Bước 4: Thực hiện xóa thành viên...');
            const removalResults = await this.executeRemovalProcess();

            // Bước 5: Kiểm tra lại danh sách thành viên
            console.log('\n✅ Bước 5: Kiểm tra danh sách thành viên sau khi xóa...');
            await apiService.delay(DELAYS.MEDIUM);
            await this.verifyMemberRemoval();

            // Tổng kết
            const summary = this.generateSummary();
            console.log('\n📊 KẾT QUẢ XÓA THÀNH VIÊN:');
            console.log(summary);

            return {
                success: true,
                data: {
                    teamSelected: this.selectedTeam.team_name,
                    originalMembersCount: this.selectedTeam.members.length,
                    removedMembers: this.removedMembers,
                    results: this.results,
                    summary: summary
                }
            };        } catch (error) {
            const errorMsg = `Lỗi trong xóa thành viên: ${error.message}`;
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
                        
                        // Cần ít nhất 2 thành viên để có thể xóa (giữ lại ít nhất 1)
                        if (activeMembers.length >= 2) {
                            console.log(`   ✅ Có ${activeMembers.length} thành viên (có thể xóa)`);
                            teamsWithMembers.push({
                                ...team,
                                members: activeMembers
                            });
                        } else if (activeMembers.length === 1) {
                            console.log(`   ⚠️ Chỉ có 1 thành viên (không thể xóa)`);
                            teamsWithoutMembers.push(team);
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
            console.log(`   ✅ Teams có thể xóa thành viên: ${teamsWithMembers.length}`);
            console.log(`   ⚪ Teams không thể xóa thành viên: ${teamsWithoutMembers.length}`);

            // Lưu cả 2 danh sách để sử dụng sau
            this.teamsList = teamsWithMembers;
            this.teamsWithoutMembers = teamsWithoutMembers;

            if (teamsWithMembers.length === 0) {
                console.log(`⚠️ Không có teams nào có đủ thành viên để xóa!`);
            }
            
            return {
                success: true,
                data: teamsWithMembers,
                summary: {
                    totalTeams: allTeams.length,
                    teamsCanRemoveMembers: teamsWithMembers.length,
                    teamsCannotRemoveMembers: teamsWithoutMembers.length
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
            console.log(`  ${index + 1}. ${team.team_name}`);
            console.log(`     📍 ID: ${team._id}`);
            console.log(`     👥 Thành viên: ${team.members.length}`);
            console.log(`     📝 Mô tả: ${team.description || 'Không có mô tả'}`);
        });
    }

    // Chọn team có nhiều thành viên nhất
    selectTeamWithMostMembers() {
        return this.teamsList.reduce((maxTeam, currentTeam) => {
            return currentTeam.members.length > maxTeam.members.length ? 
                   currentTeam : maxTeam;
        });
    }

    // Hiển thị thành viên hiện tại
    displayCurrentMembers() {
        this.selectedTeam.members.forEach((member, index) => {
            const user = member.member_id || member.user_id || {};
            const userName = user.full_name || user.name || user.email || 'Unknown';
            const role = member.role || 'Member';
            
            console.log(`  ${index + 1}. 👤 ${userName}`);
            console.log(`     📧 Email: ${user.email || 'N/A'}`);
            console.log(`     🎭 Vai trò: ${role}`);
            console.log(`     🆔 Member ID: ${member._id || 'N/A'}`);
        });
    }

    // Thực hiện quá trình xóa thành viên
    async executeRemovalProcess() {
        const results = [];

        try {
            // Chọn một số thành viên để xóa (không xóa hết, giữ lại ít nhất 1)
            const membersToRemove = this.selectedTeam.members.slice(-2); // Xóa 2 thành viên cuối
            
            for (let i = 0; i < membersToRemove.length; i++) {
                const member = membersToRemove[i];
                const user = member.member_id || member.user_id || {};
                const userName = user.full_name || user.name || user.email || 'Unknown';
                
                console.log(`\n🗑️ Xóa thành viên: ${userName}`);
                console.log(`   📧 Email: ${user.email || 'N/A'}`);
                console.log(`   🎭 Vai trò: ${member.role || 'Member'}`);

                try {
                    // Gọi API để xóa thành viên
                    const removeResult = await this.removeMemberFromTeam(
                        this.selectedTeam._id, 
                        member._id || user._id
                    );

                    const result = {
                        memberName: userName,
                        memberEmail: user.email || 'N/A',
                        memberId: member._id || user._id,
                        role: member.role || 'Member',
                        success: removeResult.success,
                        message: removeResult.success ? 
                                MESSAGES.MEMBER_REMOVAL.REMOVE_SUCCESS : 
                                removeResult.error,
                        timestamp: new Date().toLocaleString()
                    };

                    results.push(result);
                    this.results.push(result);

                    if (removeResult.success) {
                        this.removedMembers.push({
                            name: userName,
                            email: user.email,
                            role: member.role
                        });
                        console.log(`   ✅ ${MESSAGES.MEMBER_REMOVAL.REMOVE_SUCCESS}`);
                    } else {
                        console.log(`   ❌ Lỗi: ${removeResult.error}`);
                    }

                } catch (error) {
                    const errorResult = {
                        memberName: userName,
                        memberEmail: user.email || 'N/A',
                        memberId: member._id || user._id,
                        role: member.role || 'Member',
                        success: false,
                        message: `Lỗi không mong muốn: ${error.message}`,
                        timestamp: new Date().toLocaleString()
                    };

                    results.push(errorResult);
                    this.results.push(errorResult);
                    console.log(`   ❌ Lỗi không mong muốn: ${error.message}`);
                }

                await apiService.delay(DELAYS.SHORT);
            }

            return results;

        } catch (error) {
            throw new Error(`Lỗi trong quá trình xóa thành viên: ${error.message}`);
        }
    }

    // Xóa thành viên khỏi team
    async removeMemberFromTeam(teamId, memberId) {
        try {            const result = await apiService.apiCall(
                'DELETE',
                `/teams/${teamId}/members/${memberId}`
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
    }

    // Kiểm tra lại danh sách thành viên sau khi xóa
    async verifyMemberRemoval() {
        try {
            console.log('🔍 Lấy thông tin team cập nhật...');
            
            const result = await apiService.apiCall('GET', `/teams/${this.selectedTeam._id}`);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const updatedTeam = result.data.team || result.data;
            console.log('\n👥 Danh sách thành viên sau khi xóa:');
            
            if (updatedTeam.members && updatedTeam.members.length > 0) {
                updatedTeam.members.forEach((member, index) => {
                    const user = member.member_id || member.user_id || {};
                    const userName = user.full_name || user.name || user.email || 'Unknown';
                    const role = member.role || 'Member';
                    
                    console.log(`  ${index + 1}. ✅ ${userName} - ${role}`);
                    console.log(`     📧 ${user.email || 'N/A'}`);
                });
            } else {
                console.log('  ⚠️ Team không còn thành viên nào');
            }

            console.log(`\n📊 Số lượng thành viên: ${this.selectedTeam.members.length} → ${updatedTeam.members?.length || 0}`);
            console.log(`🗑️ Đã xóa: ${this.removedMembers.length} thành viên`);

        } catch (error) {
            console.log(`⚠️ Không thể kiểm tra lại danh sách thành viên: ${error.message}`);
        }
    }

    // Tạo báo cáo tổng kết
    generateSummary() {
        const total = this.results.length;
        const successful = this.results.filter(r => r.success).length;
        const failed = total - successful;

        let summary = `\n📊 TỔNG KẾT XÓA THÀNH VIÊN:\n`;
        summary += `   • Team đã chọn: ${this.selectedTeam?.team_name || 'N/A'}\n`;
        summary += `   • Thành viên ban đầu: ${this.selectedTeam?.members?.length || 0}\n`;
        summary += `   • Tổng số xóa: ${total}\n`;
        summary += `   • Xóa thành công: ${successful} ✅\n`;
        summary += `   • Xóa thất bại: ${failed} ❌\n`;
        summary += `   • Tỷ lệ thành công: ${total > 0 ? Math.round((successful/total) * 100) : 0}%\n`;

        if (this.removedMembers.length > 0) {
            summary += `\n🗑️ DANH SÁCH ĐÃ XÓA:\n`;
            this.removedMembers.forEach((member, index) => {
                summary += `   ${index + 1}. ${member.name} (${member.role})\n`;
                summary += `      📧 ${member.email || 'N/A'}\n`;
            });
        }

        if (this.results.length > 0) {
            summary += `\n📋 CHI TIẾT QUÁ TRÌNH:\n`;
            this.results.forEach((result, index) => {
                const status = result.success ? '✅' : '❌';
                summary += `   ${index + 1}. ${status} ${result.memberName} (${result.role})\n`;
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
            removedMembers: this.removedMembers,
            summary: this.generateSummary()
        };
    }

    // Reset service
    reset() {
        this.results = [];
        this.teamsList = [];
        this.selectedTeam = null;
        this.removedMembers = [];
    }
}

module.exports = new MemberRemovalService();
