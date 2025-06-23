// backend/config/momo.config.js
require('dotenv').config();

const momoConfig = {
    // Thông tin đối tác MoMo (sử dụng chính xác credentials từ mẫu GitHub thành công)
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    
    // API endpoints
    apiHostname: process.env.MOMO_API_HOSTNAME || 'test-payment.momo.vn',
    apiPath: process.env.MOMO_API_PATH || '/v2/gateway/api/create',
    
    // Callback URLs
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,    // Cấu hình thanh toán (theo format MoMo sample thành công)
    requestType: 'captureWallet',
    extraData: '',
    autoCapture: true,
    lang: 'vi',
    
    // Timeout settings
    timeout: 30000, // 30 seconds
    
    // Validation
    validate() {
        const required = [
            'partnerCode',
            'accessKey', 
            'secretKey',
            'redirectUrl',
            'ipnUrl'
        ];
        
        const missing = required.filter(key => !this[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required MoMo configuration: ${missing.join(', ')}`);
        }
        
        // Validate URLs
        try {
            new URL(this.redirectUrl);
            new URL(this.ipnUrl);
        } catch (error) {
            throw new Error('Invalid MoMo callback URLs format');
        }
        
        console.log('✅ MoMo configuration validated successfully');
        return true;
    },
    
    // Get full API URL
    getApiUrl() {
        return `https://${this.apiHostname}${this.apiPath}`;
    },
    
    // Get payment info display
    getPaymentInfo(planType) {
        const plans = {
            monthly: {
                name: 'Gói UniPlan 1 tháng',
                amount: 500000,
                description: 'Sử dụng tất cả tính năng UniPlan trong 1 tháng'
            },
            yearly: {
                name: 'Gói UniPlan 1 năm',  
                amount: 3000000,
                description: 'Sử dụng tất cả tính năng UniPlan trong 1 năm (Tiết kiệm 50%)'
            }
        };
        
        return plans[planType] || null;
    }
};

// Validate config on import
try {
    momoConfig.validate();
} catch (error) {
    console.error('❌ MoMo Configuration Error:', error.message);
    process.exit(1);
}

module.exports = momoConfig;
