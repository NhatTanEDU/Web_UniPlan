// backend/models/subscriptionHistory.model.js
const mongoose = require("mongoose");

const subscriptionHistorySchema = new mongoose.Schema({
    // Thông tin user
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Thông tin thay đổi
    action: {
        type: String,
        enum: [
            'trial_started',       // Bắt đầu dùng thử
            'trial_expired',       // Hết hạn dùng thử
            'upgraded',            // Nâng cấp gói
            'downgraded',          // Hạ cấp gói
            'renewed',             // Gia hạn gói
            'cancelled',           // Hủy gói
            'payment_success',     // Thanh toán thành công
            'payment_failed',      // Thanh toán thất bại
            'admin_override'       // Admin can thiệp
        ],
        required: true,
        index: true
    },
    
    // Trạng thái gói
    from_plan: {
        type: String,
        enum: ['free', 'free_trial', 'expired', 'monthly', 'yearly'],
        required: true
    },
    to_plan: {
        type: String,
        enum: ['free', 'free_trial', 'expired', 'monthly', 'yearly'],
        required: true
    },
    
    // Thời gian
    from_date: {
        type: Date,
        default: null
    },
    to_date: {
        type: Date,
        default: null
    },
    effective_date: {
        type: Date,
        default: Date.now
    },
    
    // Thông tin thanh toán liên quan
    payment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    amount: {
        type: Number,
        default: 0
    },
    
    // Lý do thay đổi
    reason: {
        type: String,
        maxlength: 500,
        default: null
    },
    
    // Người thực hiện (user hoặc admin)
    triggered_by: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        user_type: {
            type: String,
            enum: ['user', 'admin', 'system'],
            default: 'user'
        },
        ip_address: {
            type: String,
            default: null
        }
    },
    
    // Metadata
    metadata: {
        duration_days: {
            type: Number,
            default: null
        },
        proration_amount: {
            type: Number,
            default: null
        },
        billing_cycle: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: undefined
        },
        notes: {
            type: String,
            default: null
        }
    }
}, { 
    timestamps: true 
});

// Indexes
subscriptionHistorySchema.index({ user_id: 1, createdAt: -1 });
subscriptionHistorySchema.index({ action: 1, createdAt: -1 });
subscriptionHistorySchema.index({ effective_date: -1 });

// Methods
subscriptionHistorySchema.methods.getDisplayInfo = function() {
    const actionTexts = {
        'trial_started': 'Bắt đầu dùng thử miễn phí',
        'trial_expired': 'Hết hạn dùng thử',
        'upgraded': 'Nâng cấp gói',
        'downgraded': 'Hạ cấp gói',
        'renewed': 'Gia hạn gói',
        'cancelled': 'Hủy gói',
        'payment_success': 'Thanh toán thành công',
        'payment_failed': 'Thanh toán thất bại',
        'admin_override': 'Can thiệp bởi Admin'
    };
    
    const planTexts = {
        'free_trial': 'Gói dùng thử',
        'expired': 'Hết hạn',
        'monthly': 'Gói tháng',
        'yearly': 'Gói năm'
    };
    
    return {
        action: actionTexts[this.action] || this.action,
        fromPlan: planTexts[this.from_plan] || this.from_plan,
        toPlan: planTexts[this.to_plan] || this.to_plan,
        effectiveDate: this.effective_date.toLocaleString('vi-VN'),
        amount: this.amount ? this.amount.toLocaleString('vi-VN') + ' VND' : null,
        reason: this.reason,
        triggeredBy: this.triggered_by.user_type
    };
};

// Static methods
subscriptionHistorySchema.statics.logAction = function(data) {
    return this.create({
        user_id: data.userId,
        action: data.action,
        from_plan: data.fromPlan,
        to_plan: data.toPlan,
        from_date: data.fromDate,
        to_date: data.toDate,
        effective_date: data.effectiveDate || new Date(),
        payment_id: data.paymentId || null,
        amount: data.amount || 0,
        reason: data.reason || null,
        triggered_by: {
            user_id: data.triggeredBy?.userId || data.userId,
            user_type: data.triggeredBy?.userType || 'user',
            ip_address: data.triggeredBy?.ipAddress || null
        },
        metadata: data.metadata || {}
    });
};

subscriptionHistorySchema.statics.getUserHistory = function(userId, limit = 10) {
    return this.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('payment_id', 'momo_order_id amount plan_name')
        .populate('triggered_by.user_id', 'email');
};

const SubscriptionHistory = mongoose.model("SubscriptionHistory", subscriptionHistorySchema);
module.exports = SubscriptionHistory;
