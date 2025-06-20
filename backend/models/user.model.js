// backend/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    full_name: { 
        type: String, 
        required: [true, 'Tên đầy đủ là bắt buộc'], 
        trim: true 
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Email không hợp lệ']
    },
    password: { 
        type: String, 
        required: [true, 'Mật khẩu là bắt buộc'], 
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'] 
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },    // Thông tin gói dịch vụ
    current_plan_type: {
        type: String,
        enum: ['free_trial', 'expired', 'monthly', 'yearly'],
        default: 'free_trial'
    },
    
    // Thời gian dùng thử
    trial_start_date: {
        type: Date,
        default: Date.now
    },
    trial_end_date: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày từ hiện tại
        }
    },
    
    // Thời gian gói trả phí
    subscription_start_date: {
        type: Date,
        default: null
    },
    subscription_end_date: {
        type: Date,
        default: null
    },
    
    // Thông tin thanh toán
    payment_status: {
        type: String,
        enum: ['none', 'pending', 'completed', 'failed'],
        default: 'none'
    },
    last_payment_date: {
        type: Date,
        default: null
    },
    next_billing_date: {
        type: Date,
        default: null
    },
    
    // Các trường cũ
    online_status: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Offline'
    },
    avatar_url: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Method kiểm tra hết hạn dùng thử
userSchema.methods.isTrialExpired = function() {
    return new Date() > this.trial_end_date;
};

// Method kiểm tra gói trả phí còn hiệu lực
userSchema.methods.isSubscriptionActive = function() {
    if (!this.subscription_end_date) return false;
    return new Date() < this.subscription_end_date && 
           (this.current_plan_type === 'monthly' || this.current_plan_type === 'yearly');
};

// Method kiểm tra có thể sử dụng dịch vụ
userSchema.methods.canAccessService = function() {
    // Nếu đang trong thời gian dùng thử và chưa hết hạn
    if (this.current_plan_type === 'free_trial' && !this.isTrialExpired()) {
        return true;
    }
    
    // Nếu có gói trả phí và còn hiệu lực
    if (this.isSubscriptionActive()) {
        return true;
    }
    
    return false;
};

// Method nâng cấp lên gói trả phí
userSchema.methods.upgradeToSubscription = function(planType) {
    if (planType !== 'monthly' && planType !== 'yearly') {
        throw new Error('Invalid plan type');
    }
    
    this.current_plan_type = planType;
    this.subscription_start_date = new Date();
    
    // Tính ngày hết hạn
    if (planType === 'monthly') {
        this.subscription_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
        this.next_billing_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (planType === 'yearly') {
        this.subscription_end_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 ngày
        this.next_billing_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    
    this.payment_status = 'completed';
    this.last_payment_date = new Date();
};

// Method cập nhật trạng thái hết hạn
userSchema.methods.markAsExpired = function() {
    this.current_plan_type = 'expired';
    this.payment_status = 'none';
};

// Method lấy thông tin gói hiển thị
userSchema.methods.getPlanDisplayInfo = function() {
    const now = new Date();
    
    switch(this.current_plan_type) {
        case 'free_trial':
            const daysLeft = Math.max(0, Math.ceil((this.trial_end_date - now) / (1000 * 60 * 60 * 24)));
            return {
                name: `Gói miễn phí (còn ${daysLeft} ngày)`,
                type: 'free_trial',
                daysLeft: daysLeft,
                isExpired: daysLeft === 0
            };
        case 'monthly':
            const monthlyDaysLeft = Math.max(0, Math.ceil((this.subscription_end_date - now) / (1000 * 60 * 60 * 24)));
            return {
                name: `Gói tháng (còn ${monthlyDaysLeft} ngày)`,
                type: 'monthly',
                daysLeft: monthlyDaysLeft,
                isExpired: monthlyDaysLeft === 0
            };
        case 'yearly':
            const yearlyDaysLeft = Math.max(0, Math.ceil((this.subscription_end_date - now) / (1000 * 60 * 60 * 24)));
            return {
                name: `Gói năm (còn ${yearlyDaysLeft} ngày)`,
                type: 'yearly',
                daysLeft: yearlyDaysLeft,
                isExpired: yearlyDaysLeft === 0
            };
        case 'expired':
            return {
                name: 'Gói đã hết hạn',
                type: 'expired',
                daysLeft: 0,
                isExpired: true
            };
        default:
            return {
                name: 'Chưa xác định',
                type: 'unknown',
                daysLeft: 0,
                isExpired: true
            };
    }
};

const User = mongoose.model("User", userSchema);
module.exports = User;