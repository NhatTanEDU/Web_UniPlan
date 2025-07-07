// Main Test System - Hệ thống test teams hoàn chỉnh
// Quản lý tất cả 6 menu và chức năng auto-run

const readline = require('readline');
const { MENU_CONFIG, MESSAGES, DELAYS } = require('./config/constants');

// Import các services
const apiService = require('./services/apiService');
const AuthService = require('./services/authService');
const TeamService = require('./services/teamService');
const MemberService = require('./services/memberService');
const RoleService = require('./services/roleService');
const MemberRemovalService = require('./services/memberRemovalService');
const ProjectService = require('./services/projectService');
const StatisticsManager = require('./services/statisticsManager');

class MainTestSystem {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
          // Khởi tạo services (sử dụng instances đã export)
        this.authService = AuthService;
        this.teamService = TeamService;
        this.memberService = MemberService;
        this.roleService = RoleService;
        this.memberRemovalService = MemberRemovalService;
        this.projectService = ProjectService;
        this.statisticsManager = StatisticsManager;
        
        this.isLoggedIn = false;
        this.currentSession = {
            startTime: null,
            menuResults: {},
            totalMenus: 6
        };
    }

    // Menu chính
    async start() {
        try {
            console.clear();
            this.displayWelcome();
            
            while (true) {
                this.displayMainMenu();
                const choice = await this.getUserInput('Nhập lựa chọn (1-9): ');
                
                console.clear();
                
                switch (choice) {
                    case '1':
                        await this.executeMenu1(); // Đăng nhập Admin
                        break;
                    case '2':
                        await this.executeMenu2(); // CRUD Teams
                        break;
                    case '3':
                        await this.executeMenu3(); // Quản lý thành viên
                        break;
                    case '4':
                        await this.executeMenu4(); // Thay đổi vai trò
                        break;
                    case '5':
                        await this.executeMenu5(); // Xóa thành viên
                        break;
                    case '6':
                        await this.executeMenu6(); // Quản lý dự án
                        break;
                    case '7':
                        await this.executeAutoRun(); // Chạy tất cả tự động
                        break;
                    case '8':
                        await this.viewStatistics(); // Xem thống kê
                        break;
                    case '9':
                        await this.exitSystem(); // Thoát
                        return;
                    default:
                        console.log('❌ Lựa chọn không hợp lệ. Vui lòng nhập số từ 1-9.');
                        await this.waitForUser();
                }
            }
        } catch (error) {
            console.log(`\n💥 Lỗi hệ thống: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Hiển thị welcome
    displayWelcome() {
        console.log('╔' + '═'.repeat(78) + '╗');
        console.log('║' + ' '.repeat(78) + '║');
        console.log('║' + this.centerText('🎯 HỆ THỐNG TEST TEAMS - UNIPLAN', 78) + '║');
        console.log('║' + this.centerText('Version 1.0 - Test Automation System', 78) + '║');
        console.log('║' + ' '.repeat(78) + '║');
        console.log('║' + this.centerText('🔧 Hệ thống kiểm tra tự động các chức năng teams', 78) + '║');
        console.log('║' + this.centerText('📊 Thống kê chi tiết và lưu kết quả tự động', 78) + '║');
        console.log('║' + ' '.repeat(78) + '║');
        console.log('╚' + '═'.repeat(78) + '╝');
        console.log('\n⚡ Sẵn sàng bắt đầu kiểm tra!\n');
    }

    // Hiển thị menu chính
    displayMainMenu() {
        const loginStatus = this.isLoggedIn ? '✅ Đã đăng nhập' : '❌ Chưa đăng nhập';
        
        console.log('┌' + '─'.repeat(60) + '┐');
        console.log('│' + this.centerText('📋 MENU CHÍNH', 60) + '│');
        console.log('├' + '─'.repeat(60) + '┤');
        console.log(`│ Trạng thái: ${loginStatus.padEnd(48)} │`);
        console.log('├' + '─'.repeat(60) + '┤');
        console.log('│ 1. 🔐 Đăng nhập Admin                              │');
        console.log('│ 2. 👥 CRUD Teams                                   │');
        console.log('│ 3. 👤 Quản lý thành viên                           │');
        console.log('│ 4. 🔄 Thay đổi vai trò                             │');
        console.log('│ 5. 🗑️ Xóa thành viên                               │');
        console.log('│ 6. 📁 Quản lý dự án                                │');
        console.log('├' + '─'.repeat(60) + '┤');
        console.log('│ 7. ⚡ Chạy tất cả (Tự động)                        │');
        console.log('│ 8. 📊 Xem thống kê                                 │');
        console.log('│ 9. ❌ Thoát                                         │');
        console.log('└' + '─'.repeat(60) + '┘');
    }

    // Menu 1: Đăng nhập Admin
    async executeMenu1() {
        try {
            console.log('🔐 THỰC THI MENU 1: ĐĂNG NHẬP ADMIN');
            console.log('='.repeat(50));
              const result = await this.authService.login();
            this.isLoggedIn = result.success;
            
            if (result.success) {
                console.log(`\n✅ ${MESSAGES.LOGIN_SUCCESS}`);
                this.currentSession.menuResults['Menu 1 - Đăng nhập Admin'] = result;
                this.statisticsManager.addMenuResult('Menu 1 - Đăng nhập Admin', result);
            } else {
                console.log(`\n❌ ${MESSAGES.LOGIN_FAILURE}`);
                console.log(`💬 Chi tiết: ${result.error}`);
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi thực thi Menu 1: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Menu 2: CRUD Teams
    async executeMenu2() {
        try {
            if (!this.checkLogin()) return;
            
            console.log('👥 THỰC THI MENU 2: CRUD TEAMS');
            console.log('='.repeat(50));
            
            const result = await this.executeTeamCRUD();
            
            if (result.success) {
                console.log('\n✅ Menu 2 hoàn thành thành công!');
                this.currentSession.menuResults['Menu 2 - CRUD Teams'] = result;
                this.statisticsManager.addMenuResult('Menu 2 - CRUD Teams', result);
            } else {
                console.log(`\n❌ Menu 2 thất bại: ${result.error}`);
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi thực thi Menu 2: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Menu 3: Quản lý thành viên
    async executeMenu3() {
        try {
            if (!this.checkLogin()) return;
            
            console.log('👤 THỰC THI MENU 3: QUẢN LÝ THÀNH VIÊN');
            console.log('='.repeat(50));
            
            const result = await this.executeMemberManagement();
            
            if (result.success) {
                console.log('\n✅ Menu 3 hoàn thành thành công!');
                this.currentSession.menuResults['Menu 3 - Quản lý thành viên'] = result;
                this.statisticsManager.addMenuResult('Menu 3 - Quản lý thành viên', result);
            } else {
                console.log(`\n❌ Menu 3 thất bại: ${result.error}`);
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi thực thi Menu 3: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Menu 4: Thay đổi vai trò
    async executeMenu4() {
        try {
            if (!this.checkLogin()) return;
            
            console.log('🔄 THỰC THI MENU 4: THAY ĐỔI VAI TRÒ');
            console.log('='.repeat(50));
            
            const result = await this.roleService.executeRoleManagement();
            
            if (result.success) {
                console.log('\n✅ Menu 4 hoàn thành thành công!');
                this.currentSession.menuResults['Menu 4 - Thay đổi vai trò'] = result;
                this.statisticsManager.addMenuResult('Menu 4 - Thay đổi vai trò', result);
            } else {
                console.log(`\n❌ Menu 4 thất bại: ${result.error}`);
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi thực thi Menu 4: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Menu 5: Xóa thành viên
    async executeMenu5() {
        try {
            if (!this.checkLogin()) return;
            
            console.log('🗑️ THỰC THI MENU 5: XÓA THÀNH VIÊN');
            console.log('='.repeat(50));
            
            const result = await this.memberRemovalService.executeMemberRemoval();
            
            if (result.success) {
                console.log('\n✅ Menu 5 hoàn thành thành công!');
                this.currentSession.menuResults['Menu 5 - Xóa thành viên'] = result;
                this.statisticsManager.addMenuResult('Menu 5 - Xóa thành viên', result);
            } else {
                console.log(`\n❌ Menu 5 thất bại: ${result.error}`);
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi thực thi Menu 5: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Menu 6: Quản lý dự án
    async executeMenu6() {
        try {
            if (!this.checkLogin()) return;
            
            console.log('📁 THỰC THI MENU 6: QUẢN LÝ DỰ ÁN');
            console.log('='.repeat(50));
            
            const result = await this.projectService.executeProjectManagement();
            
            if (result.success) {
                console.log('\n✅ Menu 6 hoàn thành thành công!');
                this.currentSession.menuResults['Menu 6 - Quản lý dự án'] = result;
                this.statisticsManager.addMenuResult('Menu 6 - Quản lý dự án', result);
            } else {
                console.log(`\n❌ Menu 6 thất bại: ${result.error}`);
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi thực thi Menu 6: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Wrapper method for Team CRUD operations
    async executeTeamCRUD() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('📋 THỰC THI TEAM CRUD OPERATIONS');
            console.log('='.repeat(60));

            const results = {
                operations: [],
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0
            };

            // Step 1: Create Teams
            console.log('\n🏗️ Bước 1: Tạo teams...');
            const createResult = await this.teamService.createTeams(3);
            results.operations.push({
                operation: 'CREATE_TEAMS',
                success: createResult.success || false,
                details: createResult
            });
            results.totalOperations++;
            if (createResult.success !== false) results.successfulOperations++;
            else results.failedOperations++;

            await apiService.delay(DELAYS.BETWEEN_OPERATIONS);

            // Step 2: Search Team (if teams were created)
            if (this.teamService.testTeams.length > 0) {
                console.log('\n🔍 Bước 2: Tìm kiếm team...');
                const searchResult = await this.teamService.searchTeam(this.teamService.testTeams[0].id);
                results.operations.push({
                    operation: 'SEARCH_TEAM',
                    success: searchResult.success || false,
                    details: searchResult
                });
                results.totalOperations++;
                if (searchResult.success !== false) results.successfulOperations++;
                else results.failedOperations++;

                await apiService.delay(DELAYS.BETWEEN_OPERATIONS);

                // Step 3: Update Team
                console.log('\n✏️ Bước 3: Cập nhật team...');
                const updateData = {
                    team_name: `Updated_${this.teamService.testTeams[0].name}`,
                    description: `Updated description for ${this.teamService.testTeams[0].name}`
                };
                const updateResult = await this.teamService.updateTeam(this.teamService.testTeams[0].id, updateData);
                results.operations.push({
                    operation: 'UPDATE_TEAM',
                    success: updateResult.success || false,
                    details: updateResult
                });
                results.totalOperations++;
                if (updateResult.success !== false) results.successfulOperations++;
                else results.failedOperations++;

                await apiService.delay(DELAYS.BETWEEN_OPERATIONS);

                // Step 4: Delete Team (only delete the last one to keep some for other tests)
                if (this.teamService.testTeams.length > 1) {
                    console.log('\n🗑️ Bước 4: Xóa team...');
                    const lastTeam = this.teamService.testTeams[this.teamService.testTeams.length - 1];
                    const deleteResult = await this.teamService.deleteTeam(lastTeam.id, true);
                    results.operations.push({
                        operation: 'DELETE_TEAM',
                        success: deleteResult.success || false,
                        details: deleteResult
                    });
                    results.totalOperations++;
                    if (deleteResult.success !== false) results.successfulOperations++;
                    else results.failedOperations++;
                }
            }

            // Summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 KẾT QUẢ TEAM CRUD OPERATIONS');
            console.log('='.repeat(60));
            console.log(`✅ Thành công: ${results.successfulOperations}/${results.totalOperations} operations`);
            console.log(`❌ Thất bại: ${results.failedOperations}/${results.totalOperations} operations`);
            console.log(`📈 Tỷ lệ thành công: ${Math.round((results.successfulOperations/results.totalOperations) * 100)}%`);

            return {
                success: results.successfulOperations > 0,
                totalOperations: results.totalOperations,
                successfulOperations: results.successfulOperations,
                failedOperations: results.failedOperations,
                operations: results.operations,
                message: `Team CRUD: ${results.successfulOperations}/${results.totalOperations} operations successful`
            };

        } catch (error) {
            console.log(`\n💥 Lỗi executeTeamCRUD: ${error.message}`);
            return {
                success: false,
                error: error.message,
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 1
            };
        }
    }

    // Wrapper method for Member Management operations
    async executeMemberManagement() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('📋 THỰC THI MEMBER MANAGEMENT OPERATIONS');
            console.log('='.repeat(60));

            const results = {
                operations: [],
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0
            };

            // Step 1: Get Personal Member List
            console.log('\n👥 Bước 1: Lấy danh sách thành viên cá nhân...');
            const memberListResult = await this.memberService.getPersonalMemberList();
            results.operations.push({
                operation: 'GET_PERSONAL_MEMBER_LIST',
                success: memberListResult.success || false,
                details: memberListResult
            });
            results.totalOperations++;
            if (memberListResult.success !== false) results.successfulOperations++;
            else results.failedOperations++;

            await apiService.delay(DELAYS.BETWEEN_OPERATIONS);

            // Step 2: Fallback to Users API (if member list was empty)
            if (!memberListResult.success || (memberListResult.members && memberListResult.members.length === 0)) {
                console.log('\n🔄 Bước 2: Fallback to Users API...');
                const usersResult = await this.memberService.fallbackToUsersAPI();
                results.operations.push({
                    operation: 'FALLBACK_TO_USERS_API',
                    success: usersResult.success || false,
                    details: usersResult
                });
                results.totalOperations++;
                if (usersResult.success !== false) results.successfulOperations++;
                else results.failedOperations++;

                await apiService.delay(DELAYS.BETWEEN_OPERATIONS);
            }

            // Step 3: Add Members to Teams (if we have teams and members)
            if (this.teamService.testTeams.length > 0 && 
                (this.memberService.personalMemberList.length > 0 || memberListResult.success)) {
                console.log('\n➕ Bước 3: Thêm thành viên vào teams...');
                const addMembersResult = await this.memberService.addMembersToTeams(2);
                results.operations.push({
                    operation: 'ADD_MEMBERS_TO_TEAMS',
                    success: addMembersResult.success || false,
                    details: addMembersResult
                });
                results.totalOperations++;
                if (addMembersResult.success !== false) results.successfulOperations++;
                else results.failedOperations++;

                await apiService.delay(DELAYS.BETWEEN_OPERATIONS);

                // Step 4: Search Member in Team
                if (this.teamService.testTeams.length > 0 && this.memberService.addedMembers.length > 0) {
                    console.log('\n🔍 Bước 4: Tìm kiếm thành viên trong team...');
                    const firstTeam = this.teamService.testTeams[0];
                    const firstMember = this.memberService.addedMembers[0];
                    const searchMemberResult = await this.memberService.searchMemberInTeam(
                        firstTeam.id, 
                        firstMember.userId || firstMember.id
                    );
                    results.operations.push({
                        operation: 'SEARCH_MEMBER_IN_TEAM',
                        success: searchMemberResult.success || false,
                        details: searchMemberResult
                    });
                    results.totalOperations++;
                    if (searchMemberResult.success !== false) results.successfulOperations++;
                    else results.failedOperations++;
                }
            }

            // Summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 KẾT QUẢ MEMBER MANAGEMENT OPERATIONS');
            console.log('='.repeat(60));
            console.log(`✅ Thành công: ${results.successfulOperations}/${results.totalOperations} operations`);
            console.log(`❌ Thất bại: ${results.failedOperations}/${results.totalOperations} operations`);
            console.log(`📈 Tỷ lệ thành công: ${Math.round((results.successfulOperations/results.totalOperations) * 100)}%`);

            return {
                success: results.successfulOperations > 0,
                totalOperations: results.totalOperations,
                successfulOperations: results.successfulOperations,
                failedOperations: results.failedOperations,
                operations: results.operations,
                message: `Member Management: ${results.successfulOperations}/${results.totalOperations} operations successful`
            };

        } catch (error) {
            console.log(`\n💥 Lỗi executeMemberManagement: ${error.message}`);
            return {
                success: false,
                error: error.message,
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 1
            };
        }
    }

    // Chạy tất cả tự động
    async executeAutoRun() {
        try {
            console.log('⚡ CHẠY TẤT CẢ TỰ ĐỘNG');
            console.log('='.repeat(50));
            console.log('🚀 Bắt đầu chạy toàn bộ 6 menu một cách tự động...\n');
            
            // Reset statistics và bắt đầu timer
            this.statisticsManager.reset();
            this.statisticsManager.startTimer();
            this.currentSession.startTime = Date.now();
              const menus = [
                { name: 'Menu 1 - Đăng nhập Admin', executor: () => this.authService.login() },
                { name: 'Menu 2 - CRUD Teams', executor: () => this.executeTeamCRUD() },
                { name: 'Menu 3 - Quản lý thành viên', executor: () => this.executeMemberManagement() },
                { name: 'Menu 4 - Thay đổi vai trò', executor: () => this.roleService.executeRoleManagement() },
                { name: 'Menu 5 - Xóa thành viên', executor: () => this.memberRemovalService.executeMemberRemoval() },
                { name: 'Menu 6 - Quản lý dự án', executor: () => this.projectService.executeProjectManagement() }
            ];
            
            let totalSuccess = 0;
            let totalFailed = 0;
            
            for (let i = 0; i < menus.length; i++) {
                const menu = menus[i];
                console.log(`\n🔄 [${i + 1}/${menus.length}] Thực thi: ${menu.name}`);
                console.log('─'.repeat(60));
                
                try {
                    const result = await menu.executor();
                    
                    // Đặc biệt xử lý menu đăng nhập
                    if (i === 0) {
                        this.isLoggedIn = result.success;
                    }
                    
                    if (result.success) {
                        console.log(`✅ ${menu.name}: THÀNH CÔNG`);
                        totalSuccess++;
                        this.isLoggedIn = true; // Đảm bảo các menu tiếp theo có thể chạy
                    } else {
                        console.log(`❌ ${menu.name}: THẤT BẠI - ${result.error}`);
                        totalFailed++;
                    }
                    
                    // Lưu kết quả
                    this.currentSession.menuResults[menu.name] = result;
                    this.statisticsManager.addMenuResult(menu.name, result);
                    
                    // Delay giữa các menu
                    if (i < menus.length - 1) {
                        console.log(`⏳ Chờ ${DELAYS.MEDIUM}ms trước menu tiếp theo...`);
                        await this.delay(DELAYS.MEDIUM);
                    }
                    
                } catch (error) {
                    console.log(`💥 Lỗi thực thi ${menu.name}: ${error.message}`);
                    totalFailed++;
                    
                    // Lưu lỗi vào thống kê
                    this.statisticsManager.addMenuResult(menu.name, {
                        success: false,
                        error: error.message,
                        results: []
                    });
                }
            }
            
            // Kết thúc timer
            this.statisticsManager.endTimer();
            
            // Hiển thị tổng kết
            console.log('\n' + '='.repeat(60));
            console.log('🎉 HOÀN THÀNH CHẠY TẤT CẢ MENU');
            console.log('='.repeat(60));
            console.log(`✅ Thành công: ${totalSuccess}/${menus.length} menu`);
            console.log(`❌ Thất bại: ${totalFailed}/${menus.length} menu`);
            console.log(`📈 Tỷ lệ thành công: ${Math.round((totalSuccess/menus.length) * 100)}%`);
            
            const executionTime = Date.now() - this.currentSession.startTime;
            console.log(`⏱️ Tổng thời gian: ${this.formatTime(executionTime)}`);
            
            // Lưu thống kê
            console.log('\n💾 Đang lưu thống kê...');
            const saveResult = await this.statisticsManager.saveStatistics();
            
            if (saveResult.success) {
                console.log(`✅ ${MESSAGES.STATS_SAVED}`);
                console.log(`📄 File: ${saveResult.filename}`);
            } else {
                console.log(`❌ ${MESSAGES.STATS_ERROR} ${saveResult.error}`);
            }
            
            // Hiển thị thống kê tóm tắt
            this.statisticsManager.displaySummary();
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi chạy tự động: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Xem thống kê
    async viewStatistics() {
        try {
            console.log('📊 XEM THỐNG KÊ');
            console.log('='.repeat(50));
            
            const files = await this.statisticsManager.getStatisticsFiles();
            
            if (files.length === 0) {
                console.log('📭 Chưa có file thống kê nào được tạo.');
                console.log('💡 Hãy chạy "Auto Run" để tạo thống kê đầu tiên!');
                await this.waitForUser();
                return;
            }
            
            console.log(`📁 Tìm thấy ${files.length} file thống kê:`);
            console.log('─'.repeat(50));
            
            files.forEach((file, index) => {
                const createdDate = new Date(file.created).toLocaleString('vi-VN');
                const fileSize = (file.size / 1024).toFixed(1);
                console.log(`${index + 1}. 📄 ${file.name}`);
                console.log(`   📅 Tạo: ${createdDate}`);
                console.log(`   📏 Kích thước: ${fileSize} KB`);
                console.log('');
            });
            
            const choice = await this.getUserInput('Nhập số thứ tự file để xem (0 để quay lại): ');
            const fileIndex = parseInt(choice) - 1;
            
            if (choice === '0') {
                return;
            }
            
            if (fileIndex >= 0 && fileIndex < files.length) {
                const selectedFile = files[fileIndex];
                console.log(`\n📖 Đang đọc file: ${selectedFile.name}`);
                console.log('='.repeat(60));
                
                const readResult = await this.statisticsManager.readStatisticsFile(selectedFile.name);
                
                if (readResult.success) {
                    console.log(readResult.content);
                } else {
                    console.log(`❌ ${readResult.error}`);
                }
            } else {
                console.log('❌ Lựa chọn không hợp lệ.');
            }
            
            await this.waitForUser();
            
        } catch (error) {
            console.log(`\n💥 Lỗi xem thống kê: ${error.message}`);
            await this.waitForUser();
        }
    }

    // Thoát hệ thống
    async exitSystem() {
        console.log('👋 THOÁT HỆ THỐNG');
        console.log('='.repeat(50));
        
        if (Object.keys(this.currentSession.menuResults).length > 0) {
            console.log('💾 Bạn có muốn lưu thống kê phiên hiện tại?');
            const choice = await this.getUserInput('Nhập "y" để lưu, "n" để bỏ qua: ');
            
            if (choice.toLowerCase() === 'y') {
                this.statisticsManager.endTimer();
                const saveResult = await this.statisticsManager.saveStatistics();
                
                if (saveResult.success) {
                    console.log(`✅ Đã lưu thống kê: ${saveResult.filename}`);
                } else {
                    console.log(`❌ Lỗi lưu thống kê: ${saveResult.error}`);
                }
            }
        }
        
        console.log('\n🎯 Cảm ơn bạn đã sử dụng hệ thống Test Teams!');
        console.log('📧 Liên hệ: uniplan.support@gmail.com');
        console.log('🌐 Website: https://uniplan.vn');
        console.log('\n👋 Tạm biệt!');
        
        this.rl.close();
    }

    // Utility functions
    async checkLogin() {
        if (!this.isLoggedIn) {
            console.log('❌ Bạn cần đăng nhập trước khi sử dụng chức năng này!');
            console.log('💡 Hãy chọn Menu 1 để đăng nhập.');
            await this.waitForUser();
            return false;
        }
        return true;
    }

    async getUserInput(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    async waitForUser() {
        await this.getUserInput('\n⏸️ Nhấn Enter để tiếp tục...');
        console.clear();
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    centerText(text, width) {
        const padding = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(padding) + text + ' '.repeat(width - text.length - padding);
    }

    formatTime(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        } else if (milliseconds < 60000) {
            return `${(milliseconds / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(milliseconds / 60000);
            const seconds = ((milliseconds % 60000) / 1000).toFixed(1);
            return `${minutes}m ${seconds}s`;
        }
    }
}

// Khởi chạy hệ thống
async function main() {
    const system = new MainTestSystem();
    
    // Xử lý tín hiệu thoát
    process.on('SIGINT', async () => {
        console.log('\n\n🛑 Nhận tín hiệu thoát...');
        await system.exitSystem();
        process.exit(0);
    });
    
    // Xử lý lỗi không được catch
    process.on('uncaughtException', (error) => {
        console.log(`\n💥 Lỗi nghiêm trọng: ${error.message}`);
        console.log('📝 Chi tiết:', error.stack);
        process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.log(`\n⚠️ Promise bị từ chối:`, reason);
        console.log('🔍 Promise:', promise);
    });
    
    try {
        await system.start();
    } catch (error) {
        console.log(`\n💥 Lỗi khởi động hệ thống: ${error.message}`);
        process.exit(1);
    }
}

// Chỉ chạy nếu được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = MainTestSystem;
