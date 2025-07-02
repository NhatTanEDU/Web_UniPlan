const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Thông tin người nhận
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Nội dung thông báo
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    
    // Loại thông báo (mở rộng từ version cũ)
    type: {
        type: String,
        enum: [
            // Subscription related
            'trial_expiry_warning',
            'trial_expired',
            'subscription_expiry_warning',
            'subscription_expired',
            'payment_reminder',
            'payment_successful',
            'payment_failed',
            'upgrade_promotion',
            'welcome',
            // Project related (từ version cũ)
            'project_invitation',
            'project_update',
            // System
            'system',
            'feature_update',
            // AI risk warning
            'task_risk_alert'
        ],
        required: true,
        index: true
    },
    
    // Mức độ ưu tiên
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    
    // Trạng thái (cải tiến từ read boolean)
    status: {
        type: String,
        enum: ['unread', 'read', 'archived'],
        default: 'unread',
        index: true
    },
    
    // Legacy field (để tương thích ngược)
    read: {
        type: Boolean,
        default: false
    },
    
    // References
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    
    // Metadata cho subscription notifications
    metadata: {
        payment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null
        },
        subscription_type: {
            type: String,
            default: null
        },
        action_url: {
            type: String,
            default: null
        },
        action_text: {
            type: String,
            default: null
        },
        extra_data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    
    // Thời gian
    read_at: {
        type: Date,
        default: null
    },
    expires_at: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
        }
    },
    
    // Channels đã gửi
    sent_channels: {
        in_app: {
            type: Boolean,
            default: true
        },
        email: {
            type: Boolean,
            default: false
        },
        email_sent_at: {
            type: Date,
            default: null
        }
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ user_id: 1, status: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, type: 1 });
notificationSchema.index({ expires_at: 1 });

// Methods
notificationSchema.methods.markAsRead = function() {
    this.status = 'read';
    this.read = true; // Tương thích ngược
    this.read_at = new Date();
    return this.save();
};

notificationSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

notificationSchema.methods.isExpired = function() {
    return new Date() > this.expires_at;
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({
        user_id: userId,
        status: 'unread',
        expires_at: { $gt: new Date() }
    });
};

notificationSchema.statics.createNotification = function(data) {
    return this.create({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'normal',
        project_id: data.project_id || null,
        metadata: data.metadata || {},
        sent_channels: data.channels || { in_app: true, email: false }
    });
};

notificationSchema.statics.cleanupExpired = function() {
    return this.deleteMany({
        expires_at: { $lt: new Date() },
        status: { $ne: 'unread' }
    });
};

module.exports = mongoose.model('Notification', notificationSchema);