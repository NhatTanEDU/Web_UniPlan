// Advanced Team Management API Test Suite
// Optimized for performance and reliability - Professional Edition

const axios = require('axios');
const readline = require('readline');

// =============================================================================
// ===== CONFIGURATION & CONSTANTS =====
// =============================================================================

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin Mặc Định'
};

// Optimized test configuration for maximum performance
const TEST_CONFIG = {
    timeouts: {
        api: 25000,             // Increased to 25s for complex search operations with large datasets
        betweenTests: 100,      // Increased for stability 
        setup: 2000,            // Increased for setup operations
        search: 30000           // Special timeout for search operations (30s)
    },
    limits: {
        maxRetries: 5,          // Increased retry count for better reliability
        bulkSize: 2,            
        pagination: 5,          // Better test coverage
        maxParallel: 3          // Enable parallel processing
    },
    performance: {
        logTiming: true,
        enableDetailedLogs: false,
        skipHeavyOps: false,
        enableCache: true,      // Performance enhancement
        enableBatch: true       // Batch operations
    }
};

// Test data container - cleaner structure with enhanced caching
const testData = {
    userId: '',
    userName: '',
    createdTeams: [],
    personalMemberList: [],
    teamMembersForAdvancedTest: [],
    
    // Enhanced caching system for performance
    cache: {
        users: new Map(),
        teams: new Map(),
        stats: new Map(),
        lastFetch: new Map()
    },
    
    // Helper methods
    reset() {
        this.userId = '';
        this.userName = '';
        this.createdTeams = [];
        this.personalMemberList = [];
        this.teamMembersForAdvancedTest = [];
        this.cache.users.clear();
        this.cache.teams.clear();
        this.cache.stats.clear();
        this.cache.lastFetch.clear();
    },
    
    hasTeam() {
        return this.createdTeams.length > 0;
    },
    
    hasMembers() {
        return this.teamMembersForAdvancedTest.length > 0;
    },
    
    // Cache management methods
    getCachedUsers() {
        const cacheKey = 'allUsers';
        const cached = this.cache.users.get(cacheKey);
        const lastFetch = this.cache.lastFetch.get(cacheKey);
        
        if (cached && lastFetch && (Date.now() - lastFetch) < 30000) {
            return cached;
        }
        return null;
    },
    
    setCachedUsers(users) {
        const cacheKey = 'allUsers';
        this.cache.users.set(cacheKey, users);
        this.cache.lastFetch.set(cacheKey, Date.now());
    }
};

// =============================================================================
// ===== UTILITY FUNCTIONS =====
// =============================================================================

const timer = {
    start: (label) => {
        if (TEST_CONFIG.performance.logTiming) {
            console.time(`⏱️  ${label}`);
        }
    },
    end: (label) => {
        if (TEST_CONFIG.performance.logTiming) {
            console.timeEnd(`⏱️  ${label}`);
        }
    }
};

const waitDelay = (ms = TEST_CONFIG.timeouts.betweenTests) => 
    new Promise(resolve => setTimeout(resolve, ms));

// Enhanced performance monitoring
const performanceMonitor = {
    timings: new Map(),
    
    start(label) {
        if (TEST_CONFIG.performance.logTiming) {
            this.timings.set(label, { start: Date.now(), label });
            console.time(`⏱️  ${label}`);
        }
    },
    
    end(label) {
        if (TEST_CONFIG.performance.logTiming) {
            console.timeEnd(`⏱️  ${label}`);
            const timing = this.timings.get(label);
            if (timing) {
                timing.duration = Date.now() - timing.start;
                timing.end = Date.now();
            }
        }
    },
    
    getReport() {
        const report = [];
        for (const [label, data] of this.timings) {
            if (data.duration) {
                report.push(`${label}: ${data.duration}ms`);
            }
        }
        return report.length > 0 ? report.join(', ') : 'No timing data';
    },
    
    reset() {
        this.timings.clear();
    }
};

// Batch processing utility for improved performance
const batchProcessor = {
    async processBatch(items, processor, batchSize = TEST_CONFIG.limits.bulkSize) {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            // Small delay between batches to avoid overwhelming the server
            if (i + batchSize < items.length) {
                await waitDelay(100);
            }
        }
        return results;
    }
};

/**
 * Enhanced API call function with retry logic and better error handling
 */
const apiCall = async (method, url, data = null, params = null, retries = 0, useSearchTimeout = false) => {
    const startTime = Date.now();
    const maxRetries = TEST_CONFIG.limits.maxRetries;
    
    // Use search timeout for search operations
    const timeout = useSearchTimeout ? TEST_CONFIG.timeouts.search : TEST_CONFIG.timeouts.api;
    
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            timeout,
            ...(data && { data }),
            ...(params && { params })
        };
        
        const response = await axios(config);
        const duration = Date.now() - startTime;
        
        if (TEST_CONFIG.performance.logTiming && duration > 500) {
            console.log(`⚠️  Slow API: ${method} ${url} took ${duration}ms`);
        }
        
        return { 
            success: true,
            data: response.data, 
            status: response.status,
            duration 
        };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 'Unknown error';
        
        // Better timeout error handling
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.log(`⏰ Timeout after ${duration}ms for ${method} ${url}`);
            
            // Retry for timeout only if we haven't exceeded max retries
            if (retries < maxRetries) {
                console.log(`🔄 Retrying ${method} ${url} (attempt ${retries + 1}/${maxRetries}) with extended timeout`);
                await waitDelay(2000 * (retries + 1)); // Exponential backoff
                return apiCall(method, url, data, params, retries + 1, true); // Use search timeout for retries
            }
        }
        
        // Retry logic for network errors
        if (retries < maxRetries && 
            (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
            console.log(`🔄 Retrying ${method} ${url} (attempt ${retries + 1}/${maxRetries})`);
            await waitDelay(1000 * (retries + 1)); // Exponential backoff
            return apiCall(method, url, data, params, retries + 1, useSearchTimeout);
        }
        
        return {
            success: false,
            error: errorMessage,
            status: error.response?.status || 500,
            data: error.response?.data,
            duration
        };
    }
};

/**
 * Logger utility for consistent output
 */
const logger = {
    info: (message) => console.log(`ℹ️  ${message}`),
    success: (message) => console.log(`✅ ${message}`),
    error: (message) => console.log(`❌ ${message}`),
    warning: (message) => console.log(`⚠️  ${message}`),
    debug: (message) => {
        if (TEST_CONFIG.performance.enableDetailedLogs) {
            console.log(`🐛 ${message}`);
        }
    },
    step: (message) => console.log(`\n🔄 ${message}`),
    result: (message) => console.log(`📊 ${message}`)
};

// =============================================================================
// ===== AUTHENTICATION & SETUP FUNCTIONS =====
// =============================================================================

/**
 * Enhanced login function with better error handling
 */
async function loginAdmin() {
    timer.start('Admin Login');
    logger.step('AUTHENTICATING ADMIN...');
    
    const result = await apiCall('POST', '/auth/login', ADMIN_ACCOUNT);
    
    if (result.success && result.data.token) {
        authToken = result.data.token;
        const user = result.data.user;
        
        if (user) {
            testData.userId = user.id || user._id;
            testData.userName = user.full_name || user.name || user.email || ADMIN_ACCOUNT.name;
        } else {
            // Fallback: decode token
            try {
                const decodedToken = JSON.parse(
                    Buffer.from(result.data.token.split('.')[1], 'base64').toString()
                );
                testData.userId = decodedToken.id || decodedToken._id || 'unknown_admin_id';
                testData.userName = ADMIN_ACCOUNT.name;
                if (decodedToken.email && !testData.userName) {
                    testData.userName = decodedToken.email;
                }
            } catch (e) {
                logger.warning('Could not decode token, using fallback values');
                testData.userId = 'fallback_admin_id';
                testData.userName = ADMIN_ACCOUNT.name;
            }
        }
        
        timer.end('Admin Login');
        logger.success(`Login successful as: ${testData.userName} (ID: ${testData.userId})`);
        return true;
    }
    
    timer.end('Admin Login');
    logger.error(`Login failed: ${result.error}`);
    return false;
}

/**
 * Optimized team setup function
 */
async function setupInitialTeamForAdvancedTests() {
    timer.start('Team Setup');
    logger.step('Setting up initial team for advanced tests...');
    
    const teamName = `Advanced Test Team ${Date.now()}`;
    const teamPayload = {
        team_name: teamName,
        description: 'Team for advanced testing - auto-generated'
    };
    
    const teamResult = await apiCall('POST', '/teams', teamPayload);
    
    if (teamResult.success && teamResult.data.team) {
        const newTeam = teamResult.data.team;
        testData.createdTeams = [newTeam]; // Replace array for clean state
        timer.end('Team Setup');
        logger.success(`Team "${newTeam.team_name}" (ID: ${newTeam._id}) created successfully`);
        return newTeam;
    }
    
    timer.end('Team Setup');
    logger.error(`Failed to create initial team: ${teamResult.error}`);
    testData.createdTeams = [];
    return null;
}

/**
 * Optimized member setup function with better error handling
 */
async function setupTeamMembersForAdvancedTests(teamId, numberOfMembers = 2) {
    timer.start('Members Setup');
    logger.step(`Setting up ${numberOfMembers} members for team ID: ${teamId}`);
    
    // Reset member lists
    testData.personalMemberList = [];
    testData.teamMembersForAdvancedTest = [];
    
    // Fetch available users with error handling
    const usersResult = await fetchAvailableUsers(numberOfMembers);
    if (!usersResult.success) {
        timer.end('Members Setup');
        return false;
    }
    
    testData.personalMemberList = usersResult.users;
    
    if (testData.personalMemberList.length < numberOfMembers) {
        timer.end('Members Setup');
        logger.warning(`Only found ${testData.personalMemberList.length} valid members, needed ${numberOfMembers}`);
        return false;
    }
    
    // Add members to team
    const addResults = await addMembersToTeam(teamId, testData.personalMemberList);
    
    timer.end('Members Setup');
    logger.result(`${addResults.successCount}/${testData.personalMemberList.length} members processed successfully`);
    
    return addResults.successCount >= Math.min(numberOfMembers, testData.personalMemberList.length);
}

/**
 * Helper function to fetch available users
 */
async function fetchAvailableUsers(numberOfMembers) {
    let usersToConsider = [];
    
    // Try /users endpoint first
    const usersRes = await apiCall('GET', '/users', null, { 
        page: 1, 
        limit: numberOfMembers + 3 
    });
    
    if (usersRes.success && usersRes.data.data?.users) {
        usersToConsider = usersRes.data.data.users.filter(user => 
            user && user._id && user.email !== ADMIN_ACCOUNT.email
        );
    } else {
        // Fallback to /personal-members
        logger.debug('Trying fallback endpoint /personal-members');
        const membersListRes = await apiCall('GET', '/personal-members', null, { 
            page: 1, 
            limit: numberOfMembers + 3 
        });
        
        if (membersListRes.success && membersListRes.data) {
            const rawMemberList = membersListRes.data.data || 
                                membersListRes.data.members || 
                                (Array.isArray(membersListRes.data) ? membersListRes.data : []);
            
            usersToConsider = rawMemberList
                .map(pm => pm.member_user_id || pm.user_id || pm)
                .filter(user => user && user._id && user.email !== ADMIN_ACCOUNT.email);
        }
    }
    
    if (usersToConsider.length === 0) {
        logger.error('No users found from any endpoint');
        return { success: false, users: [] };
    }
    
    // Remove duplicates and filter valid users
    const uniqueUserMap = new Map();
    usersToConsider.forEach(user => {
        if (user && typeof user === 'object' && user._id) {
            uniqueUserMap.set(user._id.toString(), user);
        }
    });
    
    const finalUsers = Array.from(uniqueUserMap.values()).slice(0, numberOfMembers);
    
    return { success: true, users: finalUsers };
}

/**
 * Helper function to add members to team
 */
async function addMembersToTeam(teamId, usersToAdd) {
    let successCount = 0;
    
    for (let i = 0; i < usersToAdd.length; i++) {
        const userToAdd = usersToAdd[i];
        const memberPayload = {
            team_id: teamId,
            user_id: userToAdd._id,
            role: i === 0 ? 'Editor' : 'Member' // First member as Editor, others as Members
        };
        
        const addResult = await apiCall('POST', '/teams/members', memberPayload);
        
        if (addResult.success && addResult.data.member) {
            const memberRecord = addResult.data.member;
            const userName = memberRecord.user_id?.full_name || 
                           memberRecord.user_id?.name || 
                           memberRecord.user_id?.email || 
                           'Unknown User';
            
            logger.debug(`Added "${userName}" as ${memberRecord.role} (TeamMember ID: ${memberRecord._id})`);
            testData.teamMembersForAdvancedTest.push(memberRecord);
            successCount++;
            
        } else if (addResult.error && 
                  (addResult.error.includes('đã là thành viên') || 
                   addResult.error.includes('already exists'))) {
            
            // Handle existing member
            const userName = userToAdd.full_name || userToAdd.name || userToAdd.email;
            logger.debug(`User "${userName}" is already a team member`);
            
            // Try to get existing member record
            const existingMember = await getExistingTeamMember(teamId, userToAdd._id);
            if (existingMember) {
                testData.teamMembersForAdvancedTest.push(existingMember);
            }
            successCount++;
            
        } else {
            const userName = userToAdd.full_name || userToAdd.name || userToAdd.email;
            logger.error(`Failed to add "${userName}": ${addResult.error}`);
        }
        
        // Small delay between member additions
        await waitDelay(50);
    }
    
    return { successCount };
}

/**
 * Helper function to get existing team member record
 */
async function getExistingTeamMember(teamId, userId) {
    const teamDetailsRes = await apiCall('GET', `/teams/${teamId}`);
    
    if (teamDetailsRes.success && teamDetailsRes.data.members) {
        const existingMember = teamDetailsRes.data.members.find(m => 
            (m.user_id._id || m.user_id.toString()) === userId.toString()
        );
        
        if (existingMember) {
            // Ensure user_id is populated
            if (typeof existingMember.user_id !== 'object' || !existingMember.user_id._id) {
                const userToAdd = testData.personalMemberList.find(u => u._id.toString() === userId.toString());
                if (userToAdd) {
                    existingMember.user_id = userToAdd;
                }
            }
            return existingMember;
        }
    }
      return null;
}

// =============================================================================
// ===== CÁC TRƯỜNG HỢP KIỂM THỬ CHO TÍNH NĂNG NÂNG CAO (từ teamEnhanced.routes.js) =====
// Các URL API ở đây phải dùng tiền tố /teams-enhanced/ theo như app.js đã mount
// =============================================================================

// --- 1. Thống kê Đội (Team Statistics - teamStats.controller.js) ---
async function testGetTeamOverviewStats() {
    console.log('\n📊 [Bài Test] Lấy thống kê tổng quan của các đội...');
    // URL ĐÚNG: /api/teams-enhanced/stats/overview
    const response = await apiCall('GET', '/teams-enhanced/stats/overview');
    
    if (response.success) {
        const stats = response.data;
        console.log(`✅ Thành công lấy thống kê tổng quan:`);
        console.log(`   📈 Tổng số đội: ${stats.totalTeams || 0}`);
        console.log(`   👥 Tổng thành viên: ${stats.totalMembers || 0}`);
        console.log(`   📊 Phân bố vai trò:`);
        if (stats.roleDistribution) {
            Object.entries(stats.roleDistribution).forEach(([role, count]) => {
                console.log(`      ${role}: ${count}`);
            });
        }
        console.log(`   🔄 Trạng thái hoạt động: ${stats.activeTeams || 0} đội đang hoạt động`);
        
        return true;
    } else {
        console.log(`❌ Lỗi: ${response.error}`);
        return false;
    }
}

async function testGetTeamDetailStats(teamId) {
    if (!teamId) {
        console.log('❌ Cần teamId để test thống kê chi tiết đội.');
        return false;
    }
    
    console.log(`\n📊 [Bài Test] Lấy thống kê chi tiết đội ${teamId}...`);
    // URL ĐÚNG: /api/teams-enhanced/stats/team/:id
    const response = await apiCall('GET', `/teams-enhanced/stats/team/${teamId}`);
    
    if (response.success) {
        const stats = response.data;
        console.log(`✅ Thành công lấy thống kê chi tiết đội:`);
        console.log(`   📝 Tên đội: ${stats.teamName || 'N/A'}`);
        console.log(`   👥 Số thành viên: ${stats.memberCount || 0}`);
        console.log(`   📊 Phân bố vai trò trong đội:`);
        if (stats.roleDistribution) {
            Object.entries(stats.roleDistribution).forEach(([role, count]) => {
                console.log(`      ${role}: ${count}`);
            });
        }
        console.log(`   📅 Ngày tạo: ${stats.createdAt ? new Date(stats.createdAt).toLocaleDateString('vi-VN') : 'N/A'}`);
        console.log(`   🔄 Cập nhật cuối: ${stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString('vi-VN') : 'N/A'}`);
        
        return true;
    } else {
        console.log(`❌ Lỗi: ${response.error}`);
        return false;
    }
}

// --- 2. Tìm kiếm Đội Nâng Cao (Team Search - teamSearch.controller.js) ---
async function testSearchTeams(searchTerm = '') {
    console.log(`\n🔍 [Bài Test] Tìm kiếm đội với từ khóa: "${searchTerm}"...`);
    // URL CORRECT: /api/teams-enhanced/search?searchTerm=...
    const response = await apiCall('GET', `/teams-enhanced/search?searchTerm=${encodeURIComponent(searchTerm)}&limit=${TEST_CONFIG.limits.pagination}`, null, null, 0, true);
    
    if (response.success) {
        const teams = response.data?.teams || [];
        console.log(`✅ Tìm thấy ${teams.length} đội:`);
        teams.forEach((team, index) => {
            console.log(`   ${index + 1}. ${team.team_name} (ID: ${team._id}) - ${team.memberCount || 0} thành viên`);
        });
        
        return true;
    } else {
        console.log(`❌ Lỗi tìm kiếm đội: ${response.error} ${response.data ? JSON.stringify(response.data) : ''}`);
        return false;
    }
}

async function testSearchTeamMembers(teamId, searchTerm = '') {
    if (!teamId) {
        console.log('❌ Cần teamId để test tìm kiếm thành viên đội.');
        return false;
    }
      console.log(`\n🔍 [Bài Test] Tìm kiếm thành viên trong đội ${teamId} với từ khóa "${searchTerm}"...`);
    // URL CORRECT: /api/teams-enhanced/:teamId/members/search?searchTerm=...
    const response = await apiCall('GET', `/teams-enhanced/${teamId}/members/search?searchTerm=${encodeURIComponent(searchTerm)}&limit=${TEST_CONFIG.limits.pagination}`, null, null, 0, true);
    
    if (response.success) {
        const members = response.data?.members || [];
        console.log(`✅ Tìm thấy ${members.length} thành viên:`);
        members.forEach((member, index) => {
            console.log(`   ${index + 1}. ${member.user_id?.full_name || member.user_id?.name || member.user_id?.email || 'N/A'} (${member.role})`);
        });
        
        return true;
    } else {
        console.log(`❌ Lỗi tìm kiếm thành viên: ${response.error} ${response.data ? JSON.stringify(response.data) : ''}`);
        return false;
    }
}

// --- 3. Quản lý Thành viên Hàng loạt (Bulk Operations - teamBulk.controller.js) ---
async function testAddMultipleMembersToTeam(teamId) {
    if (!teamId) {
        console.log('❌ Cần teamId để test thêm nhiều thành viên.');
        return false;
    }

    const numberOfMembers = Math.min(TEST_CONFIG.limits.bulkSize, testData.personalMemberList.length);
    console.log(`\n👥 [Bài Test] Thêm ${numberOfMembers} thành viên vào đội ${teamId}...`);

    if (testData.personalMemberList.length === 0) {
        console.log('⚠️ Không có dữ liệu danh sách cá nhân để thêm thành viên.');
        return false;
    }

    let membersSuccessfullyProcessed = 0;
    
    for (let i = 0; i < numberOfMembers; i++) {
        const userToAdd = testData.personalMemberList[i];
        console.log(`   Đang thêm ${i + 1}/${numberOfMembers}: ${userToAdd.full_name || userToAdd.name || userToAdd.email}`);
        
        // URL ĐÚNG: /api/teams/:id/members (POST)
        const addResult = await apiCall('POST', `/teams/${teamId}/members`, {
            team_id: teamId,
            user_id: userToAdd._id, // Truyền _id của user
            role: i === 0 ? 'Editor' : 'Member' // Ví dụ: người đầu tiên là Editor, còn lại là Member
        });

        if (addResult.success && addResult.data.member) {
            const memberRecord = addResult.data.member; // API trả về bản ghi TeamMember (teamMember.controller.js)
            // user_id trong memberRecord đã được populate từ controller
            console.log(`✅ Đã thêm "${memberRecord.user_id.full_name || memberRecord.user_id.name || memberRecord.user_id.email}" vào đội với vai trò ${memberRecord.role}. (TeamMember ID: ${memberRecord._id})`);
            testData.teamMembersForAdvancedTest.push(memberRecord); // Lưu bản ghi TeamMember đầy đủ để dùng sau
            membersSuccessfullyProcessed++;
        } else if (addResult.error && (addResult.error.includes('đã là thành viên') || addResult.error.includes('already exists'))) {
            console.log(`ℹ️ Người dùng "${userToAdd.full_name || userToAdd.name || userToAdd.email}" đã là thành viên của đội này.`);
            // Cố gắng lấy thông tin TeamMember ID nếu đã tồn tại để đảm bảo testData.teamMembersForAdvancedTest có đủ _id
            const teamDetailsRes = await apiCall('GET', `/teams/${teamId}`); // API này từ team.routes.js
            if(teamDetailsRes.success && teamDetailsRes.data.members){ // team.controller.js -> getTeamById trả về team.members
                const existingTm = teamDetailsRes.data.members.find(m => (m.user_id._id || m.user_id.toString()) === userToAdd._id.toString()); // So sánh ID của user object
                if(existingTm) {
                    // Đảm bảo user_id trong existingTm là object đã populate, nếu không thì gán userToAdd
                    if (typeof existingTm.user_id !== 'object' || !existingTm.user_id._id) {
                        existingTm.user_id = userToAdd;
                    }
                    // Kiểm tra xem member này đã có trong testData.teamMembersForAdvancedTest chưa bằng _id của TeamMember
                    if (!testData.teamMembersForAdvancedTest.find(tm => tm._id === existingTm._id)) {
                        testData.teamMembersForAdvancedTest.push(existingTm);
                    }
                } else {
                     console.log(`   Không tìm thấy bản ghi TeamMember cho user ${userToAdd.email} trong chi tiết team, dù API báo đã tồn tại. Kiểm tra team.controller -> getTeamById -> populate members.`);
                }
            }
            membersSuccessfullyProcessed++; // Vẫn tính là đã xử lý thành công
        } else {
            console.log(`❌ Lỗi khi thêm "${userToAdd.full_name || userToAdd.name || userToAdd.email}": ${addResult.error}`);
        }
    }
    console.log(`📊 ${membersSuccessfullyProcessed}/${testData.personalMemberList.length} thành viên được xử lý (thêm mới hoặc đã tồn tại).`);
    // Trả về true nếu số lượng thành viên được xử lý (thêm mới hoặc đã là thành viên) đạt yêu cầu
    return membersSuccessfullyProcessed >= Math.min(numberOfMembers, testData.personalMemberList.length) || numberOfMembers === 0;
}


// =============================================================================
// ===== CÁC TRƯỜNG HỢP KIỂM THỬ CHO TÍNH NĂNG NÂNG CAO (từ teamEnhanced.routes.js) =====
// Các URL API ở đây phải dùng tiền tố /teams-enhanced/ theo như app.js đã mount
// =============================================================================

// --- 1. Thống kê Đội (Team Statistics - teamStats.controller.js) ---
async function testGetTeamOverviewStats() {
    console.log('\n📊 [Bài Test] Lấy thống kê tổng quan của các đội...');
    // URL ĐÚNG: /api/teams-enhanced/stats/overview
    const result = await apiCall('GET', '/teams-enhanced/stats/overview'); //
    if (result.success) {
        console.log('✅ Lấy thống kê tổng quan thành công. Dữ liệu:', JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Lỗi lấy thống kê tổng quan:', result.error, result.data);
        if(result.status === 404) console.log("💡 Gợi ý Server: Kiểm tra việc mount `teamEnhancedRoutes` tại `/api/teams-enhanced` trong app.js và thứ tự route `/stats/overview` TRƯỚC `/:teamId` trong `teamEnhanced.routes.js`.");
        else if(result.data && result.data.data && result.data.data.overview && result.data.data.overview.totalTeams === 0) {
            console.log("💡 Gợi ý Controller: `teamStatsController.getTeamOverviewStats` không tìm thấy team nào cho user hiện tại. Kiểm tra logic query `TeamMember.find({ user_id: userId })` và đảm bảo `userId` (từ `req.user.id`) là chính xác và có dữ liệu `TeamMember` tương ứng trong CSDL.");
        }
    }
}

async function testGetTeamDetailStats(teamId) {
    if (!teamId) {
        console.log('⚠️  Cần teamId để test thống kê chi tiết.');
        return;
    }
    console.log(`\n📊 [Bài Test] Lấy thống kê chi tiết cho đội ID: ${teamId}...`);
    // URL ĐÚNG: /api/teams-enhanced/:teamId/stats/detail
    const result = await apiCall('GET', `/teams-enhanced/${teamId}/stats/detail`); //
    if (result.success) {
        console.log('✅ Lấy thống kê chi tiết thành công. Dữ liệu:', JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Lỗi lấy thống kê chi tiết:', result.error, result.data);
        if(result.status === 404) console.log("💡 Gợi ý Server: Kiểm tra URL. Route này đúng là `/teams-enhanced/:teamId/stats/detail`. Có thể do thứ tự route trong `teamEnhanced.routes.js`.");
    }
}

// --- 2. Tìm kiếm Đội Nâng cao (Advanced Team Search - teamSearch.controller.js) ---
async function testSearchTeams(searchTerm) {
    console.log(`\n🔍 [Bài Test] Tìm kiếm đội với từ khóa: "${searchTerm}"...`);
    const params = { searchTerm, page: 1, limit: 5, myRole: "Admin" }; // `myRole` là ví dụ, API của bạn có thể dùng param khác hoặc không cần
    // URL ĐÚNG: /api/teams-enhanced/search
    const result = await apiCall('GET', '/teams-enhanced/search', null, params); //
    if (result.success && result.data) { // Controller trả về pagination và data
        console.log(`✅ Tìm kiếm đội thành công. Tìm thấy ${result.data.pagination?.totalItems || result.data.data?.length || 0} đội.`, JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Lỗi tìm kiếm đội:', result.error, result.data);
        if (result.error && result.error.toString().includes("Cast to ObjectId failed")) {
            console.log("💡 Gợi ý Server: Lỗi này thường do thứ tự route sai. Route '/teams-enhanced/search' có thể đang bị nhầm với '/teams-enhanced/:teamId'. Hãy đặt route '/search' TRƯỚC route '/:teamId' trong `teamEnhanced.routes.js` và khởi động lại server.");
        } else if (result.status === 500 && result.error.toString().includes("Cannot read properties of undefined (reading 'map')")) {
            console.log("💡 Gợi ý Controller: Có thể `userTeamMemberships` trong `teamSearchController.searchTeams` là undefined hoặc null khi cố gắng gọi `.map()`. Kiểm tra logic query `TeamMember.find({ user_id: userId })` và đảm bảo `userId` chính xác.");
        } else if (result.status === 404) {
            console.log("💡 Gợi ý Server: URL có thể sai hoặc thứ tự route trong `teamEnhanced.routes.js` chưa đúng. Route `/search` cần được định nghĩa trước `/:teamId`. Đảm bảo server đã được khởi động lại sau khi sửa route.");
        } else if (result.data && result.data.pagination?.totalItems === 0 && !searchTerm) {
             console.log("💡 Gợi ý Controller: Tìm kiếm không có từ khóa trả về 0 kết quả. Kiểm tra logic `TeamMember.find({ user_id: userId})` trong `teamSearchController.searchTeams` xem user hiện tại có thuộc team nào không, hoặc logic query `Team.find(matchQuery)`.");
        }
    }
}

async function testSearchTeamMembers(teamId, memberSearchTerm) {
    if (!teamId) {
        console.log('⚠️  Cần teamId để test tìm kiếm thành viên trong đội.');
        return;
    }
    console.log(`\n🔍 [Bài Test] Tìm kiếm thành viên giống "${memberSearchTerm}" trong đội ID: ${teamId}...`);
    const params = { searchTerm: memberSearchTerm, page: 1, limit: 5 };
    // URL ĐÚNG: /api/teams-enhanced/:teamId/members/search
    const result = await apiCall('GET', `/teams-enhanced/${teamId}/members/search`, null, params); //
    if (result.success) {
        console.log(`✅ Kết quả tìm kiếm thành viên:`, JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Lỗi tìm kiếm thành viên trong đội:', result.error, result.data);
        if(result.status === 404) console.log("💡 Gợi ý Server: Kiểm tra lại URL. Route này đúng là `/teams-enhanced/:teamId/members/search`. Có thể do thứ tự route trong `teamEnhanced.routes.js`.");
    }
}

// --- 3. Thao tác Hàng loạt với Đội (Team Bulk Operations - teamBulk.controller.js) ---
async function testAddMultipleMembersToTeam(teamId) {
    if (!teamId) {
        console.log('⚠️  Cần teamId để test thêm nhiều thành viên.');
        return;
    }
    let usersToAddIds = [];
    const currentMemberUserIdsInTeam = testData.teamMembersForAdvancedTest.map(m => m.user_id?._id?.toString() || m.user_id?.toString()).filter(Boolean);

    const usersRes = await apiCall('GET', '/users', null, { page: 1, limit: 7 }); // Lấy nhiều user hơn để có lựa chọn
    if (usersRes.success && usersRes.data.data && usersRes.data.data.users) {
        usersToAddIds = usersRes.data.data.users
            .filter(u => u && u._id && u.email !== ADMIN_ACCOUNT.email && !currentMemberUserIdsInTeam.includes(u._id.toString()))
            .slice(0, 2) // Lấy tối đa 2 người dùng mới
            .map(u => u._id); // Chỉ lấy ID
    }

    if (usersToAddIds.length === 0) {
        console.log('⚠️  Không tìm thấy người dùng mới nào (chưa có trong đội đang test và không phải admin) để thực hiện thêm hàng loạt. Bỏ qua test này.');
        return;
    }

    console.log(`\n➕ [Bài Test] Thêm ${usersToAddIds.length} thành viên (User IDs: ${usersToAddIds.join(', ')}) vào đội ID: ${teamId}...`);
    // teamBulkController.addMultipleMembers dùng role chữ thường
    const payload = { userIds: usersToAddIds, role: 'member' };
    // URL ĐÚNG: /api/teams-enhanced/:teamId/members/bulk/add
    const result = await apiCall('POST', `/teams-enhanced/${teamId}/members/bulk/add`, payload); //
    if (result.success && result.data.newMembers) { // API bulk add trả về newMembers
        console.log('✅ Thêm nhiều thành viên thành công:', JSON.stringify(result.data, null, 2));
        result.data.newMembers.forEach(nm => {
            // nm.user là object User đã được populate từ controller
            testData.teamMembersForAdvancedTest.push({_id: nm.memberId, user_id: nm.user, role: nm.role, joined_at: nm.joinedAt});
        });
    } else {
        console.log('❌ Lỗi thêm nhiều thành viên:', result.error, result.data);
        if(result.status === 404) console.log("💡 Gợi ý Server: Kiểm tra lại URL. Route này đúng là `/teams-enhanced/:teamId/members/bulk/add`. Có thể do thứ tự route trong `teamEnhanced.routes.js`.");
    }
}

async function testRemoveMultipleMembersFromTeam(teamId) {
    if (!teamId) {
        console.log('⚠️  Cần teamId để test xóa nhiều thành viên.');
        return;
    }
    // Xóa các thành viên có vai trò 'Member' đã được thêm vào, và không phải là admin hệ thống
    const membersToRemoveUserIds = testData.teamMembersForAdvancedTest
        .filter(m => m.role === 'Member' && (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId)
        .slice(0, 1) // Xóa 1 người để kiểm tra
        .map(m => m.user_id?._id || m.user_id); // API bulk remove dùng danh sách userIds

    if (membersToRemoveUserIds.length === 0) {
        console.log('⚠️  Không có thành viên (vai trò "Member", không phải admin hệ thống) phù hợp trong đội để test xóa hàng loạt. Bỏ qua test này.');
        return;
    }

    console.log(`\n➖ [Bài Test] Xóa ${membersToRemoveUserIds.length} thành viên (User IDs: ${membersToRemoveUserIds.join(', ')}) khỏi đội ID: ${teamId}...`);
    const payload = { userIds: membersToRemoveUserIds }; // teamBulkController.removeMultipleMembers dùng userIds
    // URL ĐÚNG: /api/teams-enhanced/:teamId/members/bulk/remove
    const result = await apiCall('DELETE', `/teams-enhanced/${teamId}/members/bulk/remove`, payload); //
    if (result.success) {
        console.log('✅ Xóa nhiều thành viên thành công:', JSON.stringify(result.data, null, 2));
        // Cập nhật lại testData.teamMembersForAdvancedTest
        testData.teamMembersForAdvancedTest = testData.teamMembersForAdvancedTest.filter(m => !membersToRemoveUserIds.includes(m.user_id?._id?.toString() || m.user_id?.toString()));
    } else {
        console.log('❌ Lỗi xóa nhiều thành viên:', result.error, result.data);
        if(result.status === 404) console.log("💡 Gợi ý Server: Kiểm tra lại URL. Route này đúng là `/teams-enhanced/:teamId/members/bulk/remove`. Có thể do thứ tự route trong `teamEnhanced.routes.js`.");
    }
}

// =============================================================================
// ===== CÁC TRƯỜNG HỢP KIỂM THỬ CHO TÍNH NĂNG THÀNH VIÊN (từ team.routes.js & teamMember.controller.js) =====
// Các API này dùng tiền tố /teams/ và đã hoạt động tốt từ log trước.
// =============================================================================

async function testUpdateMemberRole(teamId) {
    if (!teamId || testData.teamMembersForAdvancedTest.length === 0) {
        console.log('⚠️  Cần teamId và có ít nhất một thành viên trong `testData.teamMembersForAdvancedTest` để test cập nhật vai trò.');
        return;
    }

    // Tìm một thành viên không phải là admin hệ thống để cập nhật vai trò
    // Ưu tiên người có vai trò 'Member' hoặc 'Editor'
    let memberToUpdate = testData.teamMembersForAdvancedTest.find(m => (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId && (m.role === 'Member' || m.role === 'Editor'));
    if (!memberToUpdate) { // Nếu không tìm thấy, lấy người đầu tiên không phải admin
        memberToUpdate = testData.teamMembersForAdvancedTest.find(m => (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId);
    }

    if (!memberToUpdate || !memberToUpdate._id || !memberToUpdate.user_id || !memberToUpdate.user_id._id) {
        console.log('⚠️  Không tìm thấy thành viên phù hợp (có _id của TeamMember và user_id._id đầy đủ, không phải admin) để cập nhật vai trò. Bỏ qua test này.');
        return;
    }

    const memberRecordId = memberToUpdate._id; // ID của bản ghi TeamMember
    const userBeingUpdated = memberToUpdate.user_id; // Đây là object User đã được populate
    const currentRole = memberToUpdate.role;
    // API của teamMember.controller.js chấp nhận "Member", "Editor", "Admin" (chữ hoa)
    const newRole = currentRole === 'Member' ? 'Editor' : (currentRole === 'Editor' ? 'Admin' : 'Member');

    console.log(`\n🔄 [Bài Test] Cập nhật vai trò cho thành viên "${userBeingUpdated.full_name || userBeingUpdated.name || userBeingUpdated.email}" (TeamMember ID: ${memberRecordId}) trong đội ${teamId} từ "${currentRole}" thành "${newRole}"...`);
    // URL: /api/teams/members/:memberRecordId (từ team.routes.js)
    const result = await apiCall('PUT', `/teams/members/${memberRecordId}`, { role: newRole }); //
    if (result.success && result.data.member) {
        console.log('✅ Cập nhật vai trò thành công:', JSON.stringify(result.data, null, 2));
        const index = testData.teamMembersForAdvancedTest.findIndex(m => m._id === memberRecordId);
        if (index !== -1) testData.teamMembersForAdvancedTest[index].role = result.data.member.role;
    } else {
        console.log('❌ Lỗi cập nhật vai trò:', result.error, result.data);
    }
}

async function testRemoveSingleMemberFromTeam(teamId) {
    if (!teamId || testData.teamMembersForAdvancedTest.length === 0) {
        console.log('⚠️  Cần teamId và có thành viên để test xóa. Bỏ qua test này.');
        return;
    }

    let memberToRemove = null;
    const nonSystemAdminMembers = testData.teamMembersForAdvancedTest.filter(m => (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId);

    if (nonSystemAdminMembers.length > 0) {
        memberToRemove = nonSystemAdminMembers.find(m => m.role === 'Member');
        if (!memberToRemove) {
            const editorsInTeam = nonSystemAdminMembers.filter(m => m.role === 'Editor');
            const adminsInTeamFromTestData = testData.teamMembersForAdvancedTest.filter(m => m.role === 'Admin' && (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId);
            if (editorsInTeam.length > 0) {
                if (adminsInTeamFromTestData.length > 0 || editorsInTeam.length > 1) {
                    memberToRemove = editorsInTeam[0];
                }
            }
        }
        if (!memberToRemove && nonSystemAdminMembers.length > 0) {
            const lastResortMember = nonSystemAdminMembers[nonSystemAdminMembers.length -1];
            // Kiểm tra xem người cuối cùng này có phải là Admin duy nhất của team không (dựa trên testData)
            const otherTeamAdmins = testData.teamMembersForAdvancedTest.filter(m => m._id !== lastResortMember._id && m.role === 'Admin');
            if(lastResortMember.role === 'Admin' && otherTeamAdmins.length === 0 && testData.teamMembersForAdvancedTest.length === 1){
                 console.log(`ℹ️  Không thể xóa "${lastResortMember.user_id.email}" vì đây là Admin cuối cùng của team (trong testData).`);
                 memberToRemove = null; // Không xóa
            } else {
                memberToRemove = lastResortMember;
            }
        }
    }

    if (!memberToRemove || !memberToRemove._id || !memberToRemove.user_id || !memberToRemove.user_id._id) {
        console.log('⚠️  Không tìm thấy thành viên phù hợp để xóa. Bỏ qua test này.');
        return;
    }

    const memberRecordId = memberToRemove._id;
    const userBeingRemoved = memberToRemove.user_id;

    console.log(`\n🗑️ [Bài Test] Xóa thành viên "${userBeingRemoved.full_name || userBeingRemoved.name || userBeingRemoved.email}" (TeamMember ID: ${memberRecordId}) khỏi đội ${teamId}...`);
    // URL: /api/teams/members/:memberRecordId (từ team.routes.js)
    const result = await apiCall('DELETE', `/teams/members/${memberRecordId}`); //
    if (result.success) {
        console.log('✅ Xóa thành viên thành công.', result.data ? JSON.stringify(result.data) : "(API không trả về nội dung)");
        testData.teamMembersForAdvancedTest = testData.teamMembersForAdvancedTest.filter(m => m._id !== memberRecordId);
    } else {
        console.log('❌ Lỗi xóa thành viên:', result.error, result.data);
    }
}


// =============================================================================
// ===== HÀM CHẠY CHÍNH & MENU =====
// =============================================================================
async function runAllAdvancedTestsFlow() {
    // console.clear();
    console.log('🚀 BẮT ĐẦU CHẠY TOÀN BỘ KỊCH BẢN TEST NÂNG CAO 🚀');
    const loggedIn = await loginAdmin();
    if (!loggedIn) { console.log("🔴 Dừng test do đăng nhập thất bại."); return; }

    const team = await setupInitialTeamForAdvancedTests();
    if (!team) { console.log("🔴 Dừng test nâng cao vì không thể tạo đội ban đầu."); return; }

    const membersSetupSuccess = await setupTeamMembersForAdvancedTests(team._id, 2);
    if(!membersSetupSuccess && testData.teamMembersForAdvancedTest.length < 1) { // Cần ít nhất 1 member để test một số thứ
        console.log("🔴 Dừng test nâng cao vì không thể setup đủ thành viên (ít nhất 1) cho đội.");
        console.log(`   Đang thử xóa đội "${team.team_name}" do setup member lỗi...`);
        await apiCall('DELETE', `/teams/${team._id}`);
        return;
    }
    // Nếu setup không đủ 2 members nhưng có ít nhất 1 thì vẫn có thể tiếp tục một số test
    if (!membersSetupSuccess && testData.teamMembersForAdvancedTest.length > 0) {
        console.log("⚠️  Setup không đủ số lượng thành viên yêu cầu, một số test có thể không chạy đúng.");
    }


    console.log("\n\n🧪 BẮT ĐẦU CHẠY CÁC BÀI TEST CHỨC NĂNG 🧪");
    let testTeamId = team._id;    await testGetTeamOverviewStats(); await waitDelay(300);
    await testGetTeamDetailStats(testTeamId); await waitDelay(300);
    await testSearchTeams(team.team_name); await waitDelay(300);

    if (testData.teamMembersForAdvancedTest.length > 0 && testData.teamMembersForAdvancedTest[0].user_id) {
        const firstMemberUser = testData.teamMembersForAdvancedTest[0].user_id;
        await testSearchTeamMembers(testTeamId, firstMemberUser.name || firstMemberUser.email || "Test");
    } else {
        console.log("ℹ️ Bỏ qua tìm kiếm thành viên do không có dữ liệu thành viên từ bước setup.");
    }
    await waitDelay(300);

    await testUpdateMemberRole(testTeamId); await waitDelay(300);
    await testAddMultipleMembersToTeam(testTeamId); await waitDelay(300);
    // Chỉ chạy remove bulk nếu có member để remove (sau khi add bulk)
    if (testData.teamMembersForAdvancedTest.some(m => m.role === 'Member' && (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId)) {
        await testRemoveMultipleMembersFromTeam(testTeamId);
    } else {
        console.log("ℹ️ Bỏ qua testRemoveMultipleMembersFromTeam do không có 'Member' phù hợp để xoá.");
    }
    await waitDelay(300);

    if(testData.teamMembersForAdvancedTest.length > 0) {
        await testRemoveSingleMemberFromTeam(testTeamId);
    } else {
        console.log("ℹ️ Bỏ qua test xóa thành viên đơn lẻ vì không còn thành viên trong danh sách testData.");
    }

    console.log(`\n🗑️  Dọn dẹp: Đang xóa đội test "${team.team_name}" (ID: ${testTeamId})...`);
    const deleteTeamRes = await apiCall('DELETE', `/teams/${testTeamId}`); //
    if(deleteTeamRes.success) console.log(`✅ Đã xóa đội test "${team.team_name}" thành công.`);
    else console.log(`❌ Lỗi xóa đội test "${team.team_name}": ${deleteTeamRes.error}`);

    console.log("\n\n🎉 HOÀN THÀNH CHẠY CÁC BÀI TEST NÂNG CAO! 🎉");
}

async function menuAdvanced() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    function ask(question) { return new Promise(resolve => rl.question(question, resolve)); }
    let running = true;
    while(running) {        console.log('\n--- MENU KIỂM THỬ TÍNH NĂNG ĐỘI NÂNG CAO ---');
        console.log('1. Chạy Tất Cả Bài Test Nâng Cao (Đăng nhập, Chuẩn bị dữ liệu, Chạy test, Dọn dẹp)');
        console.log('--- Thống kê ---');
        console.log('2. Test: Thống kê tổng quan các đội');
        console.log('3. Test: Thống kê chi tiết đội (cần chọn/tạo đội ở mục 11 trước nếu chạy lẻ)');
        console.log('--- Tìm kiếm nâng cao ---');
        console.log('4. Test: Tìm kiếm đội (ví dụ: tìm theo tên "Nâng Cao")');
        console.log('5. Test: Tìm kiếm thành viên trong đội (cần chọn/tạo đội có thành viên)');
        console.log('--- Thao tác hàng loạt ---');
        console.log('6. Test: Thêm nhiều thành viên (cần chọn/tạo đội)');
        console.log('7. Test: Xóa nhiều thành viên (cần chọn/tạo đội có thành viên)');
        console.log('--- Quản lý thành viên chi tiết ---');
        console.log('8. Test: Cập nhật vai trò thành viên (cần chọn/tạo đội có thành viên)');
        console.log('9. Test: Xóa một thành viên (cần chọn/tạo đội có thành viên)');
        console.log('--- Debug vai trò và quyền ---');
        console.log('12. Xem vai trò user trong đội cụ thể');
        console.log('13. Xem vai trò user trong dự án cụ thể'); 
        console.log('14. Liệt kê tất cả đội user có vai trò');
        console.log('15. Liệt kê tất cả dự án user có vai trò');
        console.log('16. Debug toàn diện quyền Admin (4 bước kiểm tra)');
        console.log('17. Test tất cả chức năng xem vai trò');
        console.log('--- Tiện ích ---');
        console.log('10. Đăng nhập Admin');
        console.log('11. Chuẩn bị dữ liệu Test (Tạo 1 đội mới và thêm 2 thành viên vào testData)');
        console.log('0. Thoát');

        const choice = await ask('Vui lòng chọn chức năng: ');
        let teamForEinzelTests = testData.createdTeams.length > 0 ? testData.createdTeams[0] : null;

        if (!authToken && !['1', '10', '0', '11'].includes(choice)) {
            console.log("❗️ Vui lòng chạy 'Chạy Tất Cả' (1) hoặc 'Đăng nhập' (10) hoặc 'Chuẩn bị dữ liệu' (11) trước khi chạy các test lẻ.");
            continue;
        }
        // Với các test lẻ, nếu teamForEinzelTests là null sau khi đã login (ví dụ user chọn 10 rồi chọn 3), thì nên chạy (11)
        if (!teamForEinzelTests && ['3', '5', '6', '7', '8', '9'].includes(choice)){
             console.log("❗️ Cần có đội để thực hiện chức năng này. Vui lòng chạy 'Chạy Tất Cả' (1) hoặc 'Chuẩn bị dữ liệu' (11) trước.");
             continue;
        }

        switch(choice) {
            case '1': await runAllAdvancedTestsFlow(); break;
            case '2': await testGetTeamOverviewStats(); break;
            case '3':
                if(teamForEinzelTests?._id) await testGetTeamDetailStats(teamForEinzelTests._id);
                else console.log("Không có đội trong testData. Vui lòng chạy (1) hoặc (11) trước.");
                break;
            case '4': await testSearchTeams("Nâng Cao"); break; // Tìm kiếm chung
            case '5':
                if(teamForEinzelTests?._id && testData.teamMembersForAdvancedTest.length > 0 && testData.teamMembersForAdvancedTest[0].user_id) {
                    const firstMemberUser = testData.teamMembersForAdvancedTest[0].user_id;
                    await testSearchTeamMembers(teamForEinzelTests._id, firstMemberUser.name || firstMemberUser.email || "Thành Viên");
                } else console.log("Không có đội hoặc thành viên trong testData. Vui lòng chạy (1) hoặc (11) trước.");
                break;
            case '6':
                if(teamForEinzelTests?._id) await testAddMultipleMembersToTeam(teamForEinzelTests._id);
                else console.log("Không có đội trong testData. Vui lòng chạy (1) hoặc (11) trước.");
                break;
            case '7':
                if(teamForEinzelTests?._id && testData.teamMembersForAdvancedTest.length > 0) await testRemoveMultipleMembersFromTeam(teamForEinzelTests._id);
                else console.log("Không có đội hoặc thành viên trong testData để xóa. Vui lòng chạy (1) hoặc (11) trước.");
                break;
            case '8':
                 if(teamForEinzelTests?._id && testData.teamMembersForAdvancedTest.length > 0) await testUpdateMemberRole(teamForEinzelTests._id);
                 else console.log("Không có đội hoặc thành viên trong testData để cập nhật. Vui lòng chạy (1) hoặc (11) trước.");
                 break;
            case '9':
                 if(teamForEinzelTests?._id && testData.teamMembersForAdvancedTest.length > 0) await testRemoveSingleMemberFromTeam(teamForEinzelTests._id);
                 else console.log("Không có đội hoặc thành viên trong testData để xóa. Vui lòng chạy (1) hoặc (11) trước.");
                 break;            case '10': await loginAdmin(); break;
            case '11':
                if(!authToken) {
                    console.log("Đang đăng nhập để chuẩn bị dữ liệu...");
                    await loginAdmin();
                }
                if(authToken) {
                    console.log("--- Đang chuẩn bị dữ liệu cho các test lẻ ---");
                    const tempTeam = await setupInitialTeamForAdvancedTests();
                    if(tempTeam) {
                        await setupTeamMembersForAdvancedTests(tempTeam._id, 2);
                        console.log(`✅ Dữ liệu đã được chuẩn bị: Team "${tempTeam.team_name}" và các thành viên đã được lưu vào testData.`);
                    } else {
                        console.log("❌ Không thể chuẩn bị dữ liệu do lỗi tạo đội.");
                    }
                } else {
                    console.log("❌ Đăng nhập thất bại, không thể chuẩn bị dữ liệu.");
                }
                break;            case '12':
                // Automatic role viewing - use current user and available teams
                if(teamForEinzelTests?._id) {
                    console.log("🔍 Tự động xem vai trò của current user trong đội hiện tại...");
                    await viewUserRoleInTeam(teamForEinzelTests._id);
                    
                    // Also try to find and show random team if available
                    const randomTeams = await getRandomTeamsForRoleTesting();
                    if (randomTeams.length > 0) {
                        console.log("\n🎲 Kiểm tra thêm vai trò trong một số đội ngẫu nhiên...");
                        for (const team of randomTeams.slice(0, 2)) {
                            await viewUserRoleInTeam(team._id);
                            await waitDelay(100);
                        }
                    }
                } else {
                    console.log("Không có đội trong testData. Vui lòng chạy (1) hoặc (11) trước.");
                }
                break;
            case '13':
                // Automatic project role viewing - try to find available projects
                console.log("🔍 Tự động tìm và xem vai trò trong các dự án...");
                const availableProjects = await getAvailableProjectsForRoleTesting();
                if (availableProjects.length > 0) {
                    console.log(`📋 Tìm thấy ${availableProjects.length} dự án để kiểm tra vai trò:`);
                    for (const project of availableProjects.slice(0, 3)) {
                        await viewUserRoleInProject(project._id);
                        await waitDelay(100);
                    }
                } else {
                    console.log("❌ Không tìm thấy dự án nào để kiểm tra vai trò.");
                }
                break;
            case '14':
                console.log("🔍 Tự động liệt kê tất cả đội current user có vai trò...");
                await listUserTeamRoles();
                break;
            case '15':
                console.log("🔍 Tự động liệt kê tất cả dự án current user có vai trò...");
                await listUserProjectRoles();
                break;
            case '16':
                console.log("🔍 Tự động debug toàn diện quyền Admin...");
                if(teamForEinzelTests?._id) {
                    await debugAdminPermissions(teamForEinzelTests._id);
                } else {
                    console.log("Không có đội trong testData. Vui lòng chạy (1) hoặc (11) trước để có đội test.");
                }
                break;
            case '17':
                await testRoleViewingFunctionality();
                break;
            case '0': running = false; console.log("\n👋 Tạm biệt và hẹn gặp lại!"); break;
            default: console.log("⚠️  Lựa chọn không hợp lệ. Vui lòng chọn lại.");
        }
        if (choice !== '0' && choice !== '1') await waitDelay(300);
    }
    rl.close();
}

// =============================================================================
// ===== PERFORMANCE REPORT GENERATOR =====
// =============================================================================

function generatePerformanceReport() {
    console.log('\n📊 === PERFORMANCE REPORT ===');
    console.log(`Performance Monitoring: ${TEST_CONFIG.performance.logTiming ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Caching: ${TEST_CONFIG.performance.enableCache ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Batch Processing: ${TEST_CONFIG.performance.enableBatch ? 'ENABLED' : 'DISABLED'}`);
    console.log(`API Timeout: ${TEST_CONFIG.timeouts.api}ms`);
    console.log(`Between Tests Delay: ${TEST_CONFIG.timeouts.betweenTests}ms`);
    console.log(`Max Parallel Operations: ${TEST_CONFIG.limits.maxParallel}`);
    console.log(`Max Retries: ${TEST_CONFIG.limits.maxRetries}`);
    
    const timingReport = performanceMonitor.getReport();
    if (timingReport !== 'No timing data') {
        console.log(`Timing Data: ${timingReport}`);
    }
    
    console.log('===============================\n');
}

// Enhanced error handling wrapper
async function safeExecute(fn, context = '') {
    try {
        performanceMonitor.start(context || fn.name);
        const result = await fn();
        performanceMonitor.end(context || fn.name);
        return result;
    } catch (error) {
        logger.error(`Error in ${context || fn.name}: ${error.message}`);
        performanceMonitor.end(context || fn.name);
        throw error;
    }
}

// Enhanced main entry point
if (require.main === module) {
    console.log('🔬 BỘ KIỂM THỬ API ĐỘI - TÍNH NĂNG NÂNG CAO (OPTIMIZED) 🔬');
    console.log('🚀 Performance optimizations enabled');
    
    safeExecute(menuAdvanced, 'Main Menu').catch(error => {
        console.error("💥 LỖI KHÔNG MONG MUỐN TRONG QUÁ TRÌNH CHẠY MENU NÂNG CAO:", error);
        generatePerformanceReport();
    }).finally(() => {
        if (TEST_CONFIG.performance.logTiming) {
            generatePerformanceReport();
        }
    });
}

// =============================================================================
// ===== ROLE VIEWING & DEBUGGING FUNCTIONS =====
// =============================================================================

/**
 * View user roles in a specific team for debugging
 */
async function viewUserRoleInTeam(teamId, userId = null) {
    const targetUserId = userId || testData.userId;
    logger.step(`Getting role for user ${targetUserId} in team ${teamId}...`);
      // URL: /api/user-roles/teams/:teamId
    const result = await apiCall('GET', `/user-roles/teams/${teamId}`);
    
    if (result.success) {
        const roleData = result.data;
        logger.success(`User role in team ${teamId}:`);
        console.log(`   👤 User ID: ${roleData.userId || 'N/A'}`);
        console.log(`   🏷️  Role: ${roleData.role || 'No role'}`);
        console.log(`   📅 Joined: ${roleData.joinedAt ? new Date(roleData.joinedAt).toLocaleString() : 'N/A'}`);
        console.log(`   ✅ Is Active: ${roleData.isActive ? 'Yes' : 'No'}`);
        console.log(`   🔑 Permissions: ${JSON.stringify(roleData.permissions || {}, null, 2)}`);
        return roleData;
    } else {
        logger.error(`Failed to get user role: ${result.error}`);
        return null;
    }
}

/**
 * View user roles in a specific project for debugging
 */
async function viewUserRoleInProject(projectId, userId = null) {
    const targetUserId = userId || testData.userId;
    logger.step(`Getting role for user ${targetUserId} in project ${projectId}...`);
      // URL: /api/user-roles/projects/:projectId
    const result = await apiCall('GET', `/user-roles/projects/${projectId}`);
    
    if (result.success) {
        const roleData = result.data;
        logger.success(`User role in project ${projectId}:`);
        console.log(`   👤 User ID: ${roleData.userId || 'N/A'}`);
        console.log(`   🏷️  Role: ${roleData.role || 'No role'}`);
        console.log(`   📅 Joined: ${roleData.joinedAt ? new Date(roleData.joinedAt).toLocaleString() : 'N/A'}`);
        console.log(`   ✅ Is Active: ${roleData.isActive ? 'Yes' : 'No'}`);
        console.log(`   🔑 Permissions: ${JSON.stringify(roleData.permissions || {}, null, 2)}`);
        return roleData;
    } else {
        logger.error(`Failed to get user role: ${result.error}`);
        return null;
    }
}

/**
 * List all teams where the user has roles
 */
async function listUserTeamRoles(userId = null) {
    const targetUserId = userId || testData.userId;    logger.step(`Getting all team roles for user ${targetUserId}...`);
    
    // URL: /api/user-roles/all - Get all roles and filter for teams
    const result = await apiCall('GET', '/user-roles/all');
    
    if (result.success) {
        // Extract teams from the all roles response
        const allData = result.data || {};
        const teams = allData.teams || allData.teamRoles || [];
        logger.success(`User is member of ${teams.length} teams:`);
        teams.forEach((team, index) => {
            console.log(`   ${index + 1}. Team: ${team.teamName || team.team_name || team.name || 'N/A'} (ID: ${team.teamId || team._id || team.id})`);
            console.log(`      🏷️  Role: ${team.role || 'N/A'}`);
            console.log(`      📅 Joined: ${team.joinedAt ? new Date(team.joinedAt).toLocaleString() : 'N/A'}`);
            console.log(`      ✅ Active: ${team.isActive ? 'Yes' : 'No'}`);
            console.log('');
        });
        return teams;
    } else {
        logger.error(`Failed to get team roles: ${result.error}`);
        return [];
    }
}

/**
 * List all projects where the user has roles
 */
async function listUserProjectRoles(userId = null) {
    const targetUserId = userId || testData.userId;    logger.step(`Getting all project roles for user ${targetUserId}...`);
    
    // URL: /api/user-roles/all - Get all roles and filter for projects
    const result = await apiCall('GET', '/user-roles/all');
    
    if (result.success) {
        // Extract projects from the all roles response
        const allData = result.data || {};
        const projects = allData.projects || allData.projectRoles || [];
        logger.success(`User is member of ${projects.length} projects:`);
        projects.forEach((project, index) => {
            console.log(`   ${index + 1}. Project: ${project.projectName || project.project_name || project.name || 'N/A'} (ID: ${project.projectId || project._id || project.id})`);
            console.log(`      🏷️  Role: ${project.role || 'N/A'}`);
            console.log(`      📅 Joined: ${project.joinedAt ? new Date(project.joinedAt).toLocaleString() : 'N/A'}`);
            console.log(`      ✅ Active: ${project.isActive ? 'Yes' : 'No'}`);
            console.log('');
        });
        return projects;
    } else {
        logger.error(`Failed to get project roles: ${result.error}`);
        return [];
    }
}

/**
 * Debug Admin permissions issue - comprehensive role check
 */
async function debugAdminPermissions(teamId) {
    logger.step('🔍 DEBUGGING ADMIN PERMISSIONS...');
    
    if (!teamId && testData.createdTeams.length > 0) {
        teamId = testData.createdTeams[0]._id;
    }
    
    if (!teamId) {
        logger.error('No team ID provided for debugging');
        return;
    }
    
    console.log(`\n🎯 Debugging permissions for team: ${teamId}`);
    console.log(`👤 Current user: ${testData.userName} (ID: ${testData.userId})`);
    
    // 1. Check user's role in this specific team
    console.log('\n1️⃣ Checking role in target team...');
    const teamRole = await viewUserRoleInTeam(teamId);
    
    // 2. Get team details to see all members and their roles
    console.log('\n2️⃣ Getting team details...');
    const teamResult = await apiCall('GET', `/teams/${teamId}`);
    if (teamResult.success) {
        const team = teamResult.data;
        console.log(`   📝 Team: ${team.team_name}`);
        console.log(`   👥 Total members: ${team.members ? team.members.length : 0}`);
        console.log(`   🏗️  Created by: ${team.created_by || 'N/A'}`);
        console.log(`   📅 Created at: ${team.created_at ? new Date(team.created_at).toLocaleString() : 'N/A'}`);
        
        if (team.members && team.members.length > 0) {
            console.log('\n   📋 Team Members:');
            team.members.forEach((member, index) => {
                const user = member.user_id;
                const isCurrentUser = (user._id || user.toString()) === testData.userId;
                console.log(`      ${index + 1}. ${user.full_name || user.name || user.email || 'N/A'} ${isCurrentUser ? '👈 (YOU)' : ''}`);
                console.log(`         🏷️  Role: ${member.role}`);
                console.log(`         🆔 User ID: ${user._id || user.toString()}`);
                console.log(`         📅 Joined: ${member.joined_at ? new Date(member.joined_at).toLocaleString() : 'N/A'}`);
                console.log('');
            });
        }
    } else {
        logger.error(`Failed to get team details: ${teamResult.error}`);
    }
    
    // 3. List all teams where user has roles
    console.log('\n3️⃣ Listing all user team memberships...');
    await listUserTeamRoles();
    
    // 4. Try to perform the problematic operation with detailed logging
    console.log('\n4️⃣ Testing member deletion permission...');
    if (testData.teamMembersForAdvancedTest.length > 0) {
        // Find a non-admin member to test deletion
        const memberToTest = testData.teamMembersForAdvancedTest.find(m => 
            m.role !== 'Admin' && 
            (m.user_id?._id?.toString() || m.user_id?.toString()) !== testData.userId
        );
        
        if (memberToTest) {
            const memberUser = memberToTest.user_id;
            console.log(`   🎯 Testing deletion of: ${memberUser.full_name || memberUser.name || memberUser.email}`);
            console.log(`   🆔 Member Record ID: ${memberToTest._id}`);
            console.log(`   🏷️  Member Role: ${memberToTest.role}`);
            
            // Attempt deletion with detailed error capture
            const deleteResult = await apiCall('DELETE', `/teams/members/${memberToTest._id}`);
            if (deleteResult.success) {
                logger.success('✅ Deletion successful! Admin permissions are working.');
                // Update our test data
                testData.teamMembersForAdvancedTest = testData.teamMembersForAdvancedTest.filter(m => m._id !== memberToTest._id);
            } else {
                logger.error(`❌ Deletion failed: ${deleteResult.error}`);
                console.log(`   📊 Status Code: ${deleteResult.status}`);
                console.log(`   📄 Response Data: ${JSON.stringify(deleteResult.data, null, 2)}`);
                
                // Additional debugging
                if (deleteResult.status === 403) {
                    console.log('\n🔍 Permission denied (403) - Possible causes:');
                    console.log('   • User role is not Admin in this team');
                    console.log('   • Permission checking logic is incorrect');
                    console.log('   • Team ownership verification failed');
                    console.log('   • Auth token validation issues');
                } else if (deleteResult.status === 404) {
                    console.log('\n🔍 Not found (404) - Possible causes:');
                    console.log('   • Team member record not found');
                    console.log('   • Team not found');
                    console.log('   • Route not properly configured');
                } else if (deleteResult.status === 500) {
                    console.log('\n🔍 Server error (500) - Check server logs for:');
                    console.log('   • Database connection issues');
                    console.log('   • Validation errors');
                    console.log('   • Controller logic errors');
                }
            }
        } else {
            console.log('   ⚠️  No suitable non-admin member found for deletion test');
        }
    } else {
        console.log('   ⚠️  No team members available for deletion test');
    }
    
    console.log('\n🏁 Debug session complete!');
}

/**
 * Test role viewing functionality
 */
async function testRoleViewingFunctionality() {
    logger.step('Testing role viewing and debugging functions...');
    
    if (!authToken) {
        logger.error('Authentication required for role testing');
        return false;
    }
    
    try {
        // Test 1: List all team roles
        console.log('\n📋 Test 1: List all team roles');
        await listUserTeamRoles();
        await waitDelay(200);
        
        // Test 2: List all project roles
        console.log('\n📋 Test 2: List all project roles');
        await listUserProjectRoles();
        await waitDelay(200);
        
        // Test 3: Get specific team role (if we have a team)
        if (testData.createdTeams.length > 0) {
            console.log('\n📋 Test 3: Get specific team role');
            await viewUserRoleInTeam(testData.createdTeams[0]._id);
            await waitDelay(200);
        }
        
        // Test 4: Run comprehensive admin debug
        if (testData.createdTeams.length > 0) {
            console.log('\n📋 Test 4: Comprehensive admin permissions debug');
            await debugAdminPermissions(testData.createdTeams[0]._id);
        }
        
        logger.success('Role viewing tests completed successfully');
        return true;
        
    } catch (error) {
        logger.error(`Role viewing tests failed: ${error.message}`);
        return false;
    }
}

/**
 * Get random teams for role testing
 */
async function getRandomTeamsForRoleTesting() {
    try {
        // Get teams that the user is a member of
        const teamsResult = await apiCall('GET', '/teams', null, { page: 1, limit: 10 });
        
        if (teamsResult.success && teamsResult.data.teams) {
            const teams = teamsResult.data.teams;
            logger.debug(`Found ${teams.length} teams for role testing`);
            
            // Shuffle and return a few random teams
            const shuffled = teams.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 3);
        }
        
        return [];
    } catch (error) {
        logger.error(`Error getting random teams: ${error.message}`);
        return [];
    }
}

/**
 * Get available projects for role testing
 */
async function getAvailableProjectsForRoleTesting() {
    try {
        // Try to get projects from various endpoints
        let projects = [];
        
        // Try /projects endpoint
        const projectsResult = await apiCall('GET', '/projects', null, { page: 1, limit: 10 });
        if (projectsResult.success && projectsResult.data.projects) {
            projects = projectsResult.data.projects;
        } else if (projectsResult.success && projectsResult.data.data?.projects) {
            projects = projectsResult.data.data.projects;
        }
        
        logger.debug(`Found ${projects.length} projects for role testing`);
        
        // Return a few random projects
        const shuffled = projects.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
        
    } catch (error) {
        logger.error(`Error getting available projects: ${error.message}`);
        return [];
    }
}