const apiService = require('./apiService');
const { MESSAGES, DELAYS } = require('../config/constants');

class TeamService {
    constructor() {
        this.testTeams = [];
        this.searchedTeam = null;
    }

    async createTeams(numberOfTeams = 3) {
        console.log('\n➕ TẠO TEAMS');
        console.log('=============');
        
        const results = [];
        
        try {
            for (let i = 1; i <= numberOfTeams; i++) {
                console.log(`\n${i}. Đang tạo Team ${i}...`);
                
                const teamData = {
                    team_name: apiService.generateUniqueTeamName(i),
                    description: apiService.generateRandomDescription('team', i),
                    members: []
                };

                const result = await apiService.apiCall('POST', '/teams', teamData);
                
                if (result.success) {
                    const createdTeam = {
                        id: result.data.team._id,
                        name: result.data.team.team_name,
                        description: result.data.team.description
                    };
                    
                    this.testTeams.push(createdTeam);
                    results.push({
                        index: i,
                        success: true,
                        team: createdTeam,
                        message: MESSAGES.TEAM_CREATED
                    });
                    
                    console.log(`   ✅ ${MESSAGES.TEAM_CREATED}`);
                    console.log(`   📝 Tên: ${createdTeam.name}`);
                    
                } else {
                    results.push({
                        index: i,
                        success: false,
                        error: result.error,
                        message: `Lỗi tạo team ${i}: ${result.error}`
                    });
                    
                    console.log(`   ❌ Tạo team ${i} thất bại: ${result.error}`);
                }
                
                await apiService.delay(DELAYS.API_CALL);
            }

            const successCount = results.filter(r => r.success).length;
            console.log(`\n📊 KẾT QUẢ: ${successCount}/${numberOfTeams} teams tạo thành công`);
            
            return {
                success: successCount > 0,
                results: results,
                totalCreated: successCount,
                teams: this.testTeams
            };
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI TẠO TEAMS:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                results: results
            };
        }
    }

    async searchTeam(teamId = null) {
        console.log('\n🔍 TÌM KIẾM TEAM');
        console.log('================');
        
        try {
            // Nếu không có teamId, chọn ngẫu nhiên từ testTeams
            let targetTeam;
            if (!teamId && this.testTeams.length > 0) {
                targetTeam = this.testTeams[Math.floor(Math.random() * this.testTeams.length)];
                teamId = targetTeam.id;
            }
            
            if (!teamId) {
                console.log('❌ Không có team nào để tìm kiếm!');
                return { success: false, error: 'Không có team để tìm kiếm' };
            }
            
            console.log(`🔍 Đang tìm kiếm team: ${targetTeam ? targetTeam.name : teamId}`);
            
            const result = await apiService.apiCall('GET', `/teams/${teamId}`);
            
            if (result.success) {
                this.searchedTeam = result.data.team || result.data;
                
                console.log(`✅ ${MESSAGES.TEAM_FOUND}`);
                console.log(`📝 Tên: ${this.searchedTeam.team_name}`);
                console.log(`📄 Mô tả: ${this.searchedTeam.description || 'Không có mô tả'}`);
                console.log(`👥 Số thành viên: ${this.searchedTeam.memberCount || 0}`);
                
                return {
                    success: true,
                    team: this.searchedTeam,
                    message: MESSAGES.TEAM_FOUND
                };
                
            } else {
                this.searchedTeam = null;
                console.log(`❌ ${MESSAGES.TEAM_NOT_FOUND}`);
                console.log(`💥 Chi tiết lỗi: ${result.error}`);
                
                return {
                    success: false,
                    error: result.error,
                    message: MESSAGES.TEAM_NOT_FOUND
                };
            }
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI TÌM KIẾM TEAM:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                message: MESSAGES.ERROR + error.message
            };
        }
    }

    async updateTeam(teamId = null, updateData = null) {
        console.log('\n🔧 SỬA TEAM');
        console.log('===========');
        
        try {
            // Sử dụng team đã tìm kiếm hoặc team được chỉ định
            const targetTeam = teamId ? { _id: teamId } : this.searchedTeam;
            
            if (!targetTeam || !targetTeam._id) {
                console.log('❌ Không có team để sửa! Hãy tìm kiếm team trước.');
                return { success: false, error: 'Không có team để sửa' };
            }
            
            // Tạo dữ liệu cập nhật mặc định nếu không có
            if (!updateData) {
                updateData = {
                    team_name: `${targetTeam.team_name || 'Updated Team'} - Đã cập nhật`,
                    description: `Mô tả đã được cập nhật lúc ${apiService.getCurrentDateTime()}`
                };
            }
            
            console.log(`🔧 Đang cập nhật team: ${targetTeam.team_name || targetTeam._id}`);
            console.log(`📝 Tên mới: ${updateData.team_name}`);
            
            const result = await apiService.apiCall('PUT', `/teams/${targetTeam._id}`, updateData);
            
            if (result.success) {
                const updatedTeam = result.data.team || result.data;
                
                console.log(`✅ ${MESSAGES.TEAM_UPDATED}`);
                console.log(`📝 Tên mới: ${updatedTeam.team_name}`);
                console.log(`📄 Mô tả mới: ${updatedTeam.description}`);
                
                // Cập nhật trong danh sách testTeams
                const teamIndex = this.testTeams.findIndex(t => t.id === targetTeam._id);
                if (teamIndex !== -1) {
                    this.testTeams[teamIndex] = {
                        id: updatedTeam._id,
                        name: updatedTeam.team_name,
                        description: updatedTeam.description
                    };
                }
                
                return {
                    success: true,
                    originalTeam: targetTeam,
                    updatedTeam: updatedTeam,
                    updateData: updateData,
                    message: MESSAGES.TEAM_UPDATED
                };
                
            } else {
                console.log(`❌ Cập nhật team thất bại: ${result.error}`);
                
                return {
                    success: false,
                    error: result.error,
                    originalTeam: targetTeam,
                    updateData: updateData
                };
            }
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI CẬP NHẬT TEAM:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                message: MESSAGES.ERROR + error.message
            };
        }
    }

    async deleteTeam(teamId = null, confirm = false) {
        console.log('\n🗑️ XÓA TEAM (CẦN XÁC NHẬN)');
        console.log('===========================');
        
        try {
            // Chọn team để xóa
            let targetTeam;
            if (teamId) {
                targetTeam = this.testTeams.find(t => t.id === teamId) || { id: teamId, name: 'Unknown' };
            } else if (this.testTeams.length > 0) {
                targetTeam = this.testTeams[0]; // Xóa team đầu tiên
            }
            
            if (!targetTeam) {
                console.log('❌ Không có team nào để xóa!');
                return { success: false, error: 'Không có team để xóa' };
            }
            
            console.log(`🗑️ Chuẩn bị xóa team: ${targetTeam.name}`);
            console.log('⚠️ LƯU Ý: Xóa team sẽ mất tất cả thành viên và dự án được gán!');
            
            if (!confirm) {
                console.log('🤖 Tự động xác nhận xóa cho test...');
                // Trong thực tế có thể dùng readline để xác nhận
            }
            
            const result = await apiService.apiCall('DELETE', `/teams/${targetTeam.id}`);
            
            if (result.success) {
                console.log(`✅ ${MESSAGES.TEAM_DELETED}`);
                console.log(`📝 Đã xóa team: ${targetTeam.name}`);
                
                // Xóa khỏi danh sách testTeams
                this.testTeams = this.testTeams.filter(t => t.id !== targetTeam.id);
                console.log(`📊 Còn lại ${this.testTeams.length} teams`);
                
                return {
                    success: true,
                    deletedTeam: targetTeam,
                    remainingTeams: this.testTeams.length,
                    message: MESSAGES.TEAM_DELETED
                };
                
            } else {
                console.log(`❌ Xóa team thất bại: ${result.error}`);
                
                return {
                    success: false,
                    error: result.error,
                    targetTeam: targetTeam
                };
            }
            
        } catch (error) {
            console.log('💥 LỖI NGHIÊM TRỌNG KHI XÓA TEAM:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                message: MESSAGES.ERROR + error.message
            };
        }
    }

    getTestTeams() {
        return this.testTeams;
    }

    getSearchedTeam() {
        return this.searchedTeam;
    }

    clearTestTeams() {
        this.testTeams = [];
        this.searchedTeam = null;
    }

    getTeamsSummary() {
        return {
            totalTeams: this.testTeams.length,
            teams: this.testTeams,
            searchedTeam: this.searchedTeam
        };
    }
}

module.exports = new TeamService();
