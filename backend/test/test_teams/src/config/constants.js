// Cấu hình và hằng số cho hệ thống test teams
const BASE_URL = 'http://localhost:5000/api';

// Tài khoản Admin cố định
const ADMIN_ACCOUNT = {
    email: 'Admin1@gmail.com',
    password: '123456',
    name: 'Admin1'
};

// Số lượng file .txt tối đa được giữ lại
const MAX_TXT_FILES = 3;

// Đường dẫn file
const FILE_PATHS = {
    RESULTS_DIRECTORY: '../ketquathongke',
    LOG_FILE: 'logs/app.log',
    STATS_FILE: 'ketquathongke/statistics.txt'
};

// Thông báo tiếng Việt
const MESSAGES = {
    // Đăng nhập
    LOGIN_SUCCESS: '✅ Đăng nhập thành công!',
    LOGIN_FAILURE: '❌ Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.',
    
    // Teams
    TEAM_CREATED: '✅ Tạo team thành công!',
    TEAM_DELETED: '✅ Xóa team thành công!',
    TEAM_UPDATED: '✅ Cập nhật team thành công!',
    TEAM_FOUND: '✅ Tìm thấy team!',
    TEAM_NOT_FOUND: '❌ Không tìm thấy team!',
    
    // Members
    MEMBER_ADDED: '✅ Thêm thành viên thành công!',
    MEMBER_REMOVED: '✅ Xóa thành viên thành công!',
    MEMBER_FOUND: '✅ Tìm thấy thành viên!',
    MEMBER_NOT_FOUND: '❌ Không tìm thấy thành viên!',
    ROLE_UPDATED: '✅ Cập nhật vai trò thành công!',
    
    // Projects
    PROJECT_ASSIGNED: '✅ Gán dự án thành công!',
    PROJECT_REMOVED: '✅ Gỡ dự án thành công!',
    PROJECT_CREATED: '✅ Tạo dự án thành công!',
    PROJECT_DELETED: '✅ Xóa dự án thành công!',
    PROJECT_FOUND: '✅ Tìm thấy dự án!',
    PROJECT_NOT_FOUND: '❌ Không tìm thấy dự án!',
    
    // General
    ERROR: '💥 Đã xảy ra lỗi: ',
    PROCESSING: '⏳ Đang xử lý...',
    COMPLETED: '🎉 Hoàn thành!',
    CANCELLED: '⏪ Đã hủy!',
    CONFIRM_DELETE: '⚠️ Bạn có chắc chắn muốn xóa? Nhập "DELETE" để xác nhận:',
    
    // Statistics
    STATS_SAVED: '💾 Đã lưu kết quả thống kê!',
    STATS_ERROR: '❌ Lỗi khi lưu thống kê!',
    FILE_CLEANUP: '🧹 Đã dọn dẹp file cũ!',
    
    // Member Removal (Menu 5)
    MEMBER_REMOVAL: {
        START: '🗑️ Bắt đầu quá trình xóa thành viên khỏi teams...',
        NO_TEAMS: '⚠️ Không có teams với thành viên để thực hiện xóa!',
        REMOVE_SUCCESS: 'Xóa thành viên thành công',
        REMOVE_FAILED: 'Xóa thành viên thất bại'
    },
    
    // Project Management (Menu 6)
    PROJECT_MANAGEMENT: {
        START: '📋 Bắt đầu quản lý dự án trong teams...',
        CREATE_SUCCESS: 'Tạo dự án thành công',
        CREATE_FAILED: 'Tạo dự án thất bại',
        UPDATE_SUCCESS: 'Cập nhật dự án thành công',
        DELETE_SUCCESS: 'Xóa dự án thành công'
    },
    
    // Role Management (Menu 4)
    ROLE_MANAGEMENT: {
        START: '🔄 Bắt đầu quản lý vai trò thành viên...',
        NO_TEAMS: '⚠️ Không có teams với thành viên để thay đổi vai trò!',
        CHANGE_SUCCESS: 'Thay đổi vai trò thành công',
        CHANGE_FAILED: 'Thay đổi vai trò thất bại'
    }
};

// Cấu hình menu
const MENU_CONFIG = {
    MAIN_TITLE: '🎯 HỆ THỐNG TEST TEAMS - UNIPLAN',
    MENU_ITEMS: {
        AUTH: { icon: '🔐', title: 'Đăng nhập Admin' },
        TEAM_CRUD: { icon: '👥', title: 'Quản lý Teams (CRUD)' },
        MEMBER_MGMT: { icon: '👤', title: 'Quản lý thành viên' },
        ROLE_MGMT: { icon: '🔄', title: 'Thay đổi vai trò' },
        MEMBER_REMOVAL: { icon: '🗑️', title: 'Xóa thành viên' },
        PROJECT_MGMT: { icon: '📁', title: 'Quản lý dự án' },
        AUTO_RUN: { icon: '⚡', title: 'Chạy tất cả (Tự động)' },
        STATISTICS: { icon: '📊', title: 'Thống kê kết quả' },
        EXIT: { icon: '❌', title: 'Thoát' }
    }
};

// Cấu hình delay
const DELAYS = {
    SHORT: 500,
    MEDIUM: 1000,
    LONG: 2000,
    API_CALL: 300,
    USER_INPUT: 1000,
    DISPLAY: 500
};

// API Endpoints
const ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    TEAMS_LIST: '/teams',
    TEAM_CREATE: '/teams',
    TEAM_UPDATE: '/teams',
    TEAM_DELETE: '/teams',
    MEMBERS_LIST: '/members',
    MEMBER_ADD: '/teams',
    MEMBER_REMOVE: '/teams',
    PROJECTS: '/projects',
    PROJECT_CREATE: '/projects',
    PROJECT_UPDATE: '/projects',
    PROJECT_DELETE: '/projects'
};

// Vai trò thành viên
const MEMBER_ROLES = {
    MEMBER: 'Member',
    EDITOR: 'Editor',
    ADMIN: 'Admin'
};

// Trạng thái dự án
const PROJECT_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    COMPLETED: 'Completed',
    PENDING: 'Pending'
};

// Độ ưu tiên dự án
const PROJECT_PRIORITY = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low'
};

module.exports = {
    BASE_URL,
    ADMIN_ACCOUNT,
    MAX_TXT_FILES,
    FILE_PATHS,
    MESSAGES,
    MENU_CONFIG,
    DELAYS,
    ENDPOINTS,
    MEMBER_ROLES,
    PROJECT_STATUS,
    PROJECT_PRIORITY
};
