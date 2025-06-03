const apiService = require('./apiService');
const { ADMIN_ACCOUNT, MESSAGES } = require('../config/constants');

class AuthService {
    constructor() {
        this.isLoggedIn = false;
        this.userData = null;
    }

    async login() {
        console.log('\n🔐 MENU 1: ĐĂNG NHẬP ADMIN');
        console.log('==========================');
        
        try {
            console.log(`⏳ Đang đăng nhập với tài khoản: ${ADMIN_ACCOUNT.email}`);
            
            const result = await apiService.apiCall('POST', '/auth/login', {
                email: ADMIN_ACCOUNT.email,
                password: ADMIN_ACCOUNT.password
            });

            if (result.success) {
                // Lưu token và thông tin user
                apiService.setAuthToken(result.data.token);
                this.userData = result.data.user;
                this.isLoggedIn = true;
                
                console.log(MESSAGES.LOGIN_SUCCESS);
                console.log(`👤 Tên: ${this.userData.full_name || this.userData.name || ADMIN_ACCOUNT.name}`);
                console.log(`📧 Email: ${this.userData.email}`);
                console.log(`🔑 Token: ${result.data.token.substring(0, 20)}...`);
                console.log(`⏰ Thời gian: ${apiService.getCurrentDateTime()}`);
                
                return {
                    success: true,
                    userData: this.userData,
                    message: MESSAGES.LOGIN_SUCCESS
                };
                
            } else {
                this.isLoggedIn = false;
                console.log(MESSAGES.LOGIN_FAILURE);
                console.log(`💥 Chi tiết lỗi: ${result.error}`);
                
                if (result.status) {
                    console.log(`📊 HTTP Status: ${result.status}`);
                }
                
                return {
                    success: false,
                    error: result.error,
                    message: MESSAGES.LOGIN_FAILURE
                };
            }
            
        } catch (error) {
            this.isLoggedIn = false;
            console.log('💥 LỖI NGHIÊM TRỌNG KHI ĐĂNG NHẬP:');
            console.log(`   📍 Message: ${error.message}`);
            console.log(`   📊 Stack: ${error.stack}`);
            
            return {
                success: false,
                error: error.message,
                message: MESSAGES.ERROR + error.message
            };
        }
    }

    checkAuthStatus() {
        if (!this.isLoggedIn || !apiService.getAuthToken()) {
            console.log('❌ Chưa đăng nhập! Vui lòng đăng nhập trước (Menu 1)');
            return false;
        }
        return true;
    }

    getUserData() {
        return this.userData;
    }

    isAuthenticated() {
        return this.isLoggedIn;
    }

    logout() {
        this.isLoggedIn = false;
        this.userData = null;
        apiService.setAuthToken('');
        console.log('👋 Đã đăng xuất thành công!');
    }

    getAuthSummary() {
        return {
            isLoggedIn: this.isLoggedIn,
            userData: this.userData,
            hasToken: !!apiService.getAuthToken(),
            loginTime: this.userData ? apiService.getCurrentDateTime() : null
        };
    }
}

module.exports = new AuthService();
