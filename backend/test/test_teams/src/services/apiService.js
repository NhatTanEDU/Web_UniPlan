const axios = require('axios');
const { BASE_URL } = require('../config/constants');

class ApiService {
    constructor() {
        this.authToken = '';
    }

    setAuthToken(token) {
        this.authToken = token;
    }

    getAuthToken() {
        return this.authToken;
    }

    async apiCall(method, url, data = null, params = null) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${url}`,
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
                },
                ...(data && { data }),
                ...(params && { params })
            };

            console.log(`📡 API Call: ${method} ${config.url}`);
            const response = await axios(config);
            
            return { 
                success: true, 
                data: response.data, 
                status: response.status 
            };
            
        } catch (error) {
            const errorInfo = {
                success: false,
                error: error.response?.data?.message || error.message,
                status: error.response?.status || 500,
                fullError: error.response?.data || null,
                requestData: data,
                url: `${BASE_URL}${url}`,
                method: method
            };

            // Log chi tiết lỗi để debug
            console.log('\n🔍 CHI TIẾT LỖI API:');
            console.log(`   📍 URL: ${errorInfo.url}`);
            console.log(`   🔄 Method: ${errorInfo.method}`);
            console.log(`   📊 Status: ${errorInfo.status}`);
            console.log(`   💬 Message: ${errorInfo.error}`);
            
            if (errorInfo.fullError) {
                console.log(`   📋 Full Error: ${JSON.stringify(errorInfo.fullError, null, 2)}`);
            }
            
            if (errorInfo.requestData) {
                console.log(`   📤 Request Data: ${JSON.stringify(errorInfo.requestData, null, 2)}`);
            }
            
            return errorInfo;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateUniqueTeamName(index) {
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        return `Test Team ${index} - ${timestamp}_${randomSuffix}`;
    }

    generateUniqueProjectName(index) {
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        return `Test Project ${index} - ${timestamp}_${randomSuffix}`;
    }

    generateRandomDescription(type, index) {
        const descriptions = {
            team: [
                `Nhóm test CRUD số ${index} - Tạo lúc ${new Date().toLocaleString()}`,
                `Team kiểm thử chức năng ${index} - Auto generated`,
                `Nhóm thử nghiệm ${index} - Testing purpose only`
            ],
            project: [
                `Dự án test số ${index} - Tạo tự động`,
                `Project kiểm thử ${index} - Auto generated`,
                `Dự án thử nghiệm ${index} - Testing purpose only`
            ]
        };
        
        const typeDescriptions = descriptions[type] || descriptions.team;
        return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
    }

    getCurrentDateTime() {
        return new Date().toLocaleString('vi-VN');
    }

    formatResponse(response, context = '') {
        if (response.success) {
            return {
                ...response,
                formattedMessage: `✅ ${context}: Thành công`,
                timestamp: this.getCurrentDateTime()
            };
        } else {
            return {
                ...response,
                formattedMessage: `❌ ${context}: ${response.error}`,
                timestamp: this.getCurrentDateTime()
            };
        }
    }
}

module.exports = new ApiService();
