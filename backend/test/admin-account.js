// Tài khoản Admin cố định cho testing
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

// Thông tin cấu hình cho testing
const TEST_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',    ENDPOINTS: {
        login: '/auth/login',
        register: '/auth/register',
        teams: '/teams',
        teamStats: '/teams-enhanced/stats/overview',
        personalMembers: '/personal-members'
    }
};

module.exports = {
    ADMIN_ACCOUNT,
    TEST_CONFIG
};
