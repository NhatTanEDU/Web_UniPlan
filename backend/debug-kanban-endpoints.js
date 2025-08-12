const axios = require('axios');

// Cấu hình
const API_BASE = 'http://localhost:5000/api';
const USER_CREDENTIALS = {
    email: 'admin1@gmail.com',
    password: '123456'
};

const KANBAN_ID = '68700d62598889d1be8f6742';

async function debugKanbanEndpoints() {
    try {
        console.log('🔍 Debug Kanban Endpoints...\n');

        // 1. Đăng nhập để lấy token
        console.log('1️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, USER_CREDENTIALS);
        const token = loginResponse.data.token;
        console.log('✅ Đăng nhập thành công');

        const headers = { 'Authorization': `Bearer ${token}` };

        // 2. Test các endpoint có thể
        const endpointsToTest = [
            { name: 'kanban-tasks/:id/tasks', url: `${API_BASE}/kanban-tasks/${KANBAN_ID}/tasks` },
            { name: 'kanbanTask/:id/tasks', url: `${API_BASE}/kanbanTask/${KANBAN_ID}/tasks` },
            { name: 'kanban/:id', url: `${API_BASE}/kanban/${KANBAN_ID}` },
            { name: 'kanban/project/:projectId', url: `${API_BASE}/kanban/project/68700d62598889d1be8f673e` }
        ];

        console.log('\n2️⃣ Test các endpoints...');
        
        for (const endpoint of endpointsToTest) {
            try {
                console.log(`\n🔍 Testing: ${endpoint.name}`);
                console.log(`   URL: ${endpoint.url}`);
                
                const response = await axios.get(endpoint.url, { headers });
                
                console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
                
                if (endpoint.name.includes('tasks')) {
                    if (Array.isArray(response.data)) {
                        console.log(`   Found ${response.data.length} tasks`);
                    } else if (response.data.tasks) {
                        console.log(`   Found ${response.data.tasks.length} tasks`);
                    } else {
                        console.log('   Response structure:', Object.keys(response.data));
                    }
                } else {
                    console.log('   Response structure:', Object.keys(response.data));
                }
                
            } catch (error) {
                if (error.response) {
                    console.log(`❌ ${endpoint.name} - Status: ${error.response.status}`);
                    if (error.response.status === 404) {
                        console.log('   Endpoint không tồn tại');
                    } else {
                        console.log('   Error:', error.response.data.message || 'Unknown error');
                    }
                } else {
                    console.log(`❌ ${endpoint.name} - Network error:`, error.message);
                }
            }
        }

        // 3. Kiểm tra feature toggles
        console.log('\n3️⃣ Kiểm tra system status...');
        try {
            const statusResponse = await axios.get(`${API_BASE}/system/status`);
            console.log('✅ System status:', statusResponse.data.status);
            console.log('   Features enabled:', statusResponse.data.features.enabled);
            console.log('   Features disabled:', statusResponse.data.features.disabled);
            
            // Kiểm tra ADVANCED_SEARCH feature
            const advancedSearchEnabled = statusResponse.data.features.enabled.includes('ADVANCED_SEARCH');
            console.log(`   ADVANCED_SEARCH feature: ${advancedSearchEnabled ? 'ENABLED' : 'DISABLED'}`);
            
            if (!advancedSearchEnabled) {
                console.log('⚠️  Kanban routes có thể bị tắt do ADVANCED_SEARCH feature bị disable');
            }
            
        } catch (error) {
            console.log('❌ Không thể lấy system status');
        }

    } catch (error) {
        console.error('\n❌ Debug thất bại:', error.message);
    }
}

// Chạy debug
if (require.main === module) {
    debugKanbanEndpoints();
}

module.exports = debugKanbanEndpoints;
