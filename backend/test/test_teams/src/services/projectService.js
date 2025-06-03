// Project Management Service - Menu 6
// Quản lý dự án trong teams
const { MESSAGES, ENDPOINTS, DELAYS } = require('../config/constants');
const apiService = require('./apiService');

class ProjectService {
    constructor() {
        this.results = [];
        this.teamsList = [];
        this.projectsList = [];
        this.createdProjects = [];
        this.selectedTeam = null;
    }

    // Menu 6: Quản lý dự án
    async executeProjectManagement() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('📋 MENU 6: QUẢN LÝ DỰ ÁN');
            console.log('='.repeat(60));
            console.log(MESSAGES.PROJECT_MANAGEMENT.START);

            // Bước 1: Lấy danh sách teams
            console.log('\n🔍 Bước 1: Lấy danh sách teams...');
            const teamsResult = await this.getTeamsList();
            if (!teamsResult.success) {
                throw new Error(teamsResult.error);
            }

            // Bước 2: Chọn team để tạo dự án
            console.log('\n🎯 Bước 2: Chọn team để quản lý dự án...');
            this.selectedTeam = this.selectTeamForProject();
            console.log(`✅ Đã chọn team: "${this.selectedTeam.team_name}"`);

            // Bước 3: Xem dự án hiện tại của team
            console.log('\n📂 Bước 3: Kiểm tra dự án hiện tại...');
            await this.checkExistingProjects();

            // Bước 4: Tạo dự án mới
            console.log('\n➕ Bước 4: Tạo dự án mới...');
            const createResults = await this.createMultipleProjects();

            // Bước 5: Quản lý dự án (update, search)
            console.log('\n🛠️ Bước 5: Thực hiện các thao tác quản lý...');
            await this.executeProjectOperations();

            // Bước 6: Xóa một số dự án test
            console.log('\n🗑️ Bước 6: Dọn dẹp dự án test...');
            await this.cleanupTestProjects();

            // Tổng kết
            const summary = this.generateSummary();
            console.log('\n📊 KẾT QUẢ QUẢN LÝ DỰ ÁN:');
            console.log(summary);

            return {
                success: true,
                data: {
                    teamSelected: this.selectedTeam.team_name,
                    projectsCreated: this.createdProjects.length,
                    results: this.results,
                    summary: summary
                }
            };        } catch (error) {
            const errorMsg = `Lỗi trong quản lý dự án: ${error.message}`;
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
    }

    // Lấy danh sách teams
    async getTeamsList() {
        try {
            const result = await apiService.apiCall('GET', ENDPOINTS.TEAMS_LIST);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            this.teamsList = Array.isArray(result.data) ? result.data : 
                           (result.data.teams || []);

            console.log(`✅ Tìm thấy ${this.teamsList.length} teams`);
            
            if (this.teamsList.length > 0) {
                console.log('📋 Danh sách teams:');
                this.teamsList.forEach((team, index) => {
                    console.log(`  ${index + 1}. ${team.team_name} (${team.members?.length || 0} thành viên)`);
                });
            }

            return {
                success: true,
                data: this.teamsList
            };

        } catch (error) {
            return {
                success: false,
                error: `Lỗi lấy danh sách teams: ${error.message}`
            };
        }
    }

    // Chọn team để tạo dự án
    selectTeamForProject() {
        if (this.teamsList.length === 0) {
            throw new Error('Không có teams để chọn');
        }

        // Chọn team đầu tiên hoặc team có nhiều thành viên nhất
        return this.teamsList.reduce((maxTeam, currentTeam) => {
            const currentMembers = currentTeam.members?.length || 0;
            const maxMembers = maxTeam.members?.length || 0;
            return currentMembers > maxMembers ? currentTeam : maxTeam;
        });
    }

    // Kiểm tra dự án hiện tại
    async checkExistingProjects() {
        try {
            console.log('🔍 Lấy danh sách dự án hiện tại...');
            
            const result = await apiService.apiCall('GET', `/teams/${this.selectedTeam._id}/projects`);
            
            if (result.success) {
                this.projectsList = Array.isArray(result.data) ? result.data : 
                                  (result.data.projects || []);
                
                console.log(`📂 Team hiện có ${this.projectsList.length} dự án:`);
                
                if (this.projectsList.length > 0) {
                    this.projectsList.forEach((project, index) => {
                        console.log(`  ${index + 1}. 📋 ${project.project_name || project.name}`);
                        console.log(`     📝 ${project.description || 'Không có mô tả'}`);
                        console.log(`     📅 Tạo: ${new Date(project.created_at).toLocaleDateString()}`);
                    });
                } else {
                    console.log('  ℹ️ Team chưa có dự án nào');
                }
            } else {
                console.log('⚠️ Không thể lấy danh sách dự án hiện tại');
                this.projectsList = [];
            }

        } catch (error) {
            console.log(`⚠️ Lỗi kiểm tra dự án: ${error.message}`);
            this.projectsList = [];
        }
    }    // Tạo nhiều dự án
    async createMultipleProjects() {
        const projectsToCreate = [
            {
                name: `🚀 Dự án Test Auto ${Math.floor(Math.random() * 9000 + 1000)}`,
                description: 'Dự án test tự động được tạo bởi hệ thống kiểm tra',
                priority: 'High',
                status: 'Active'
            },
            {
                name: `📱 App Mobile ${Math.floor(Math.random() * 900 + 100)}`,
                description: 'Phát triển ứng dụng di động cho team',
                priority: 'Medium',
                status: 'Active'
            },
            {
                name: `🌐 Website Portal ${Math.floor(Math.random() * 90 + 10)}`,
                description: 'Xây dựng portal quản lý nội bộ',
                priority: 'Low',
                status: 'Archived'
            }
        ];

        const results = [];

        for (let i = 0; i < projectsToCreate.length; i++) {
            const projectData = projectsToCreate[i];
            console.log(`\n➕ Tạo dự án: ${projectData.name}`);
            console.log(`   📝 Mô tả: ${projectData.description}`);
            console.log(`   🎯 Ưu tiên: ${projectData.priority}`);
            console.log(`   📊 Trạng thái: ${projectData.status}`);

            try {
                const createResult = await this.createProject(projectData);
                
                const result = {
                    projectName: projectData.name,
                    description: projectData.description,
                    priority: projectData.priority,
                    status: projectData.status,
                    success: createResult.success,
                    message: createResult.success ? 
                            MESSAGES.PROJECT_MANAGEMENT.CREATE_SUCCESS : 
                            createResult.error,
                    projectId: createResult.success ? 
                              (createResult.data?.project?._id || createResult.data?._id) : null,
                    timestamp: new Date().toLocaleString(),
                    operation: 'CREATE'
                };

                results.push(result);
                this.results.push(result);

                if (createResult.success) {
                    this.createdProjects.push({
                        id: result.projectId,
                        name: projectData.name,
                        ...projectData
                    });
                    console.log(`   ✅ ${MESSAGES.PROJECT_MANAGEMENT.CREATE_SUCCESS}`);
                } else {
                    console.log(`   ❌ Lỗi: ${createResult.error}`);
                }

            } catch (error) {
                const errorResult = {
                    projectName: projectData.name,
                    description: projectData.description,
                    success: false,
                    message: `Lỗi không mong muốn: ${error.message}`,
                    timestamp: new Date().toLocaleString(),
                    operation: 'CREATE'
                };

                results.push(errorResult);
                this.results.push(errorResult);
                console.log(`   ❌ Lỗi không mong muốn: ${error.message}`);            }

            await new Promise(resolve => setTimeout(resolve, DELAYS.SHORT));
        }

        return results;
    }    // Lấy project type mặc định
    async getDefaultProjectType() {
        try {
            // Gọi API để lấy danh sách project types
            const result = await apiService.apiCall('GET', '/project-types');
            
            if (result.success && result.data && result.data.length > 0) {
                // Tìm project type mặc định hoặc lấy cái đầu tiên
                const defaultType = result.data.find(type => type.is_default) || result.data[0];
                console.log(`📋 Sử dụng project type: ${defaultType.type_name} (ID: ${defaultType._id})`);
                return defaultType._id;
            } else {
                // Fallback: sử dụng ObjectId giả để test
                console.log('⚠️ Không tìm thấy project type, sử dụng ID mặc định');
                return '507f1f77bcf86cd799439011'; // ObjectId giả cho test
            }
        } catch (error) {
            console.log(`⚠️ Lỗi lấy project type: ${error.message}, sử dụng ID mặc định`);
            return '507f1f77bcf86cd799439011'; // ObjectId giả cho test
        }
    }

    // Tạo dự án
    async createProject(projectData) {
        try {
            // Get default project type first
            const defaultProjectType = await this.getDefaultProjectType();
            
            const payload = {
                project_name: projectData.name,
                description: projectData.description,
                team_id: this.selectedTeam._id,
                priority: projectData.priority || 'Medium',  // Fixed: use correct enum
                status: projectData.status || 'Active',      // Fixed: use correct enum
                project_type_id: defaultProjectType,         // Fixed: add required field
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 ngày sau
            };

            console.log('📤 Payload tạo dự án:', {
                project_name: payload.project_name,
                team_id: payload.team_id,
                priority: payload.priority,
                status: payload.status,
                project_type_id: payload.project_type_id
            });

            const result = await apiService.apiCall('POST', ENDPOINTS.PROJECTS, payload);

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

    // Thực hiện các thao tác quản lý dự án
    async executeProjectOperations() {
        const operations = [];

        try {
            // Thao tác 1: Tìm kiếm dự án
            console.log('\n🔍 Thao tác 1: Tìm kiếm dự án...');
            const searchResult = await this.searchProjects();            operations.push(searchResult);

            await new Promise(resolve => setTimeout(resolve, DELAYS.SHORT));

            // Thao tác 2: Cập nhật dự án
            if (this.createdProjects.length > 0) {
                console.log('\n📝 Thao tác 2: Cập nhật dự án...');
                const updateResult = await this.updateProject();
                operations.push(updateResult);
            }            await new Promise(resolve => setTimeout(resolve, DELAYS.SHORT));

            // Thao tác 3: Lấy chi tiết dự án
            if (this.createdProjects.length > 0) {
                console.log('\n📋 Thao tác 3: Lấy chi tiết dự án...');
                const detailResult = await this.getProjectDetails();
                operations.push(detailResult);
            }

            return operations;

        } catch (error) {
            console.log(`⚠️ Lỗi trong thao tác quản lý: ${error.message}`);
            return operations;
        }
    }

    // Tìm kiếm dự án
    async searchProjects() {
        try {
            console.log('🔍 Tìm kiếm tất cả dự án của team...');
            
            const result = await apiService.apiCall('GET', `/teams/${this.selectedTeam._id}/projects`);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const projects = Array.isArray(result.data) ? result.data : 
                           (result.data.projects || []);

            console.log(`📂 Tìm thấy ${projects.length} dự án:`);
            projects.forEach((project, index) => {
                console.log(`  ${index + 1}. 📋 ${project.project_name || project.name}`);
                console.log(`     📝 ${project.description || 'Không có mô tả'}`);
                console.log(`     🎯 Ưu tiên: ${project.priority || 'N/A'}`);
                console.log(`     📊 Trạng thái: ${project.status || 'N/A'}`);
            });

            const searchResult = {
                operation: 'SEARCH',
                success: true,
                message: `Tìm thấy ${projects.length} dự án`,
                projectsFound: projects.length,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(searchResult);
            return searchResult;

        } catch (error) {
            const errorResult = {
                operation: 'SEARCH',
                success: false,
                message: `Lỗi tìm kiếm: ${error.message}`,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(errorResult);
            return errorResult;
        }
    }    // Cập nhật dự án
    async updateProject() {
        try {
            const projectToUpdate = this.createdProjects[0];
            const newData = {
                description: `📝 Mô tả đã cập nhật lúc ${new Date().toLocaleTimeString()}`,
                priority: 'High',
                status: 'Active'
            };

            console.log(`📝 Cập nhật dự án: ${projectToUpdate.name}`);
            console.log(`   📝 Mô tả mới: ${newData.description}`);
            console.log(`   🎯 Ưu tiên mới: ${newData.priority}`);
            console.log(`   📊 Trạng thái mới: ${newData.status}`);

            const result = await apiService.apiCall(
                'PUT', 
                `/projects/${projectToUpdate.id}`, 
                newData
            );

            const updateResult = {
                operation: 'UPDATE',
                projectName: projectToUpdate.name,
                projectId: projectToUpdate.id,
                success: result.success,
                message: result.success ? 
                        'Cập nhật dự án thành công' : 
                        `Lỗi cập nhật: ${result.error}`,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(updateResult);

            if (result.success) {
                console.log('   ✅ Cập nhật thành công');
            } else {
                console.log(`   ❌ Lỗi: ${result.error}`);
            }

            return updateResult;

        } catch (error) {
            const errorResult = {
                operation: 'UPDATE',
                success: false,
                message: `Lỗi cập nhật: ${error.message}`,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(errorResult);
            return errorResult;
        }
    }

    // Lấy chi tiết dự án
    async getProjectDetails() {
        try {
            const project = this.createdProjects[0];
            
            console.log(`📋 Lấy chi tiết dự án: ${project.name}`);

            const result = await apiService.apiCall('GET', `/projects/${project.id}`);

            if (result.success) {
                const projectData = result.data.project || result.data;
                console.log('   📋 Chi tiết dự án:');
                console.log(`   📝 Tên: ${projectData.project_name || projectData.name}`);
                console.log(`   📄 Mô tả: ${projectData.description || 'N/A'}`);
                console.log(`   🎯 Ưu tiên: ${projectData.priority || 'N/A'}`);
                console.log(`   📊 Trạng thái: ${projectData.status || 'N/A'}`);
                console.log(`   📅 Tạo: ${new Date(projectData.created_at).toLocaleString()}`);
            }

            const detailResult = {
                operation: 'GET_DETAILS',
                projectName: project.name,
                projectId: project.id,
                success: result.success,
                message: result.success ? 
                        'Lấy chi tiết thành công' : 
                        `Lỗi lấy chi tiết: ${result.error}`,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(detailResult);

            if (result.success) {
                console.log('   ✅ Lấy chi tiết thành công');
            } else {
                console.log(`   ❌ Lỗi: ${result.error}`);
            }

            return detailResult;

        } catch (error) {
            const errorResult = {
                operation: 'GET_DETAILS',
                success: false,
                message: `Lỗi lấy chi tiết: ${error.message}`,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(errorResult);
            return errorResult;
        }
    }

    // Dọn dẹp dự án test
    async cleanupTestProjects() {
        try {
            if (this.createdProjects.length === 0) {
                console.log('ℹ️ Không có dự án nào để dọn dẹp');
                return;
            }

            // Xóa dự án cuối cùng để test chức năng xóa
            const projectToDelete = this.createdProjects[this.createdProjects.length - 1];
            
            console.log(`🗑️ Xóa dự án test: ${projectToDelete.name}`);

            const result = await apiService.apiCall('DELETE', `/projects/${projectToDelete.id}`);

            const deleteResult = {
                operation: 'DELETE',
                projectName: projectToDelete.name,
                projectId: projectToDelete.id,
                success: result.success,
                message: result.success ? 
                        'Xóa dự án thành công' : 
                        `Lỗi xóa: ${result.error}`,
                timestamp: new Date().toLocaleString()
            };

            this.results.push(deleteResult);

            if (result.success) {
                console.log('   ✅ Xóa thành công');
                // Xóa khỏi danh sách local
                this.createdProjects = this.createdProjects.filter(p => p.id !== projectToDelete.id);
            } else {
                console.log(`   ❌ Lỗi: ${result.error}`);
            }

        } catch (error) {
            console.log(`⚠️ Lỗi dọn dẹp: ${error.message}`);
        }
    }

    // Tạo báo cáo tổng kết
    generateSummary() {
        const total = this.results.length;
        const successful = this.results.filter(r => r.success).length;
        const failed = total - successful;

        // Thống kê theo operation
        const operationStats = {};
        this.results.forEach(result => {
            const op = result.operation || 'UNKNOWN';
            if (!operationStats[op]) {
                operationStats[op] = { total: 0, success: 0, failed: 0 };
            }
            operationStats[op].total++;
            if (result.success) {
                operationStats[op].success++;
            } else {
                operationStats[op].failed++;
            }
        });

        let summary = `\n📊 TỔNG KẾT QUẢN LÝ DỰ ÁN:\n`;
        summary += `   • Team đã chọn: ${this.selectedTeam?.team_name || 'N/A'}\n`;
        summary += `   • Dự án đã tạo: ${this.createdProjects.length}\n`;
        summary += `   • Tổng thao tác: ${total}\n`;
        summary += `   • Thành công: ${successful} ✅\n`;
        summary += `   • Thất bại: ${failed} ❌\n`;
        summary += `   • Tỷ lệ thành công: ${total > 0 ? Math.round((successful/total) * 100) : 0}%\n`;

        if (Object.keys(operationStats).length > 0) {
            summary += `\n📋 THỐNG KÊ THEO THAO TÁC:\n`;
            Object.entries(operationStats).forEach(([operation, stats]) => {
                summary += `   • ${operation}: ${stats.success}/${stats.total} thành công\n`;
            });
        }

        if (this.createdProjects.length > 0) {
            summary += `\n📋 DỰ ÁN ĐÃ TẠO:\n`;
            this.createdProjects.forEach((project, index) => {
                summary += `   ${index + 1}. ${project.name}\n`;
                summary += `      📝 ${project.description}\n`;
                summary += `      🎯 Ưu tiên: ${project.priority}\n`;
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
            projectsList: this.projectsList,
            createdProjects: this.createdProjects,
            summary: this.generateSummary()
        };
    }

    // Reset service
    reset() {
        this.results = [];
        this.teamsList = [];
        this.projectsList = [];
        this.createdProjects = [];
        this.selectedTeam = null;
    }
}

module.exports = new ProjectService();
