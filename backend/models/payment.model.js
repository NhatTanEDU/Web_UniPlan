// backend/models/payment.model.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    // Thông tin người dùng
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Thông tin gói
    plan_type: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    plan_name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'VND'
    },
    
    // Thông tin giao dịch MoMo
    momo_order_id: {
        type: String,
        unique: true,
        required: true
    },
    momo_request_id: {
        type: String,
        required: true
    },
    momo_transaction_id: {
        type: String,
        default: null
    },
    momo_pay_url: {
        type: String,
        default: null
    },
    momo_deeplink: {
        type: String,
        default: null
    },
    momo_qr_code_url: {
        type: String,
        default: null
    },
    
    // Trạng thái thanh toán
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'expired'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        default: 'momo'
    },
    
    // Thời gian
    created_at: {
        type: Date,
        default: Date.now
    },
    completed_at: {
        type: Date,
        default: null
    },
    expired_at: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 15 * 60 * 1000); // 15 phút để thanh toán
        }
    },
    
    // Thông tin callback từ MoMo
    momo_response: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    
    // Ghi chú
    note: {
        type: String,
        default: null
    },
    
    // Metadata
    metadata: {
        ip_address: String,
        user_agent: String,
        device_info: String
    }
}, { 
    timestamps: true 
});

// Index để tìm kiếm nhanh
paymentSchema.index({ user_id: 1 });
paymentSchema.index({ momo_order_id: 1 });
paymentSchema.index({ payment_status: 1 });
paymentSchema.index({ created_at: -1 });

// Method kiểm tra hết hạn thanh toán
paymentSchema.methods.isExpired = function() {
    return new Date() > this.expired_at && this.payment_status === 'pending';
};

// Method cập nhật trạng thái thành công
paymentSchema.methods.markAsCompleted = function(momoResponse) {
    this.payment_status = 'completed';
    this.completed_at = new Date();
    this.momo_response = momoResponse;
    if (momoResponse.transId) {
        this.momo_transaction_id = momoResponse.transId;
    }
};

// Method cập nhật trạng thái thất bại
paymentSchema.methods.markAsFailed = function(momoResponse = null) {
    this.payment_status = 'failed';
    if (momoResponse) {
        this.momo_response = momoResponse;
    }
};

// Method lấy thông tin hiển thị
paymentSchema.methods.getDisplayInfo = function() {
    return {
        orderId: this.momo_order_id,
        planName: this.plan_name,
        amount: this.amount.toLocaleString('vi-VN'),
        status: this.getStatusText(),
        createdAt: this.created_at.toLocaleString('vi-VN'),
        completedAt: this.completed_at ? this.completed_at.toLocaleString('vi-VN') : null
    };
};

// Method lấy text trạng thái
paymentSchema.methods.getStatusText = function() {
    switch(this.payment_status) {
        case 'pending': return 'Đang chờ thanh toán';
        case 'completed': return 'Đã thanh toán';
        case 'failed': return 'Thanh toán thất bại';
        case 'cancelled': return 'Đã hủy';
        case 'expired': return 'Hết hạn';
        default: return 'Không xác định';
    }
};

// Static method tạo order ID duy nhất
paymentSchema.statics.generateOrderId = function() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `UNIPLAN_${timestamp}_${random}`;
};

// Static method lấy thông tin gói
paymentSchema.statics.getPlanInfo = function(planType) {
    const plans = {
        monthly: {
            name: 'Gói 1 tháng',
            amount: 500000,
            duration: 30
        },
        yearly: {
            name: 'Gói 1 năm',
            amount: 3000000,
            duration: 365
        }
    };
    
    return plans[planType] || null;
};

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
