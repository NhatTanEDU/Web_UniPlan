// backend/models/personalMemberList.model.js
const mongoose = require('mongoose');

const personalMemberListSchema = new mongoose.Schema({
    owner_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    member_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    added_at: {
        type: Date,
        default: Date.now
    },
    custom_role: {
        type: String,
        trim: true,
        default: null // Tùy chọn: vai trò tùy chỉnh như "Trưởng nhóm nhỏ", "CTV"
    },
    notes: {
        type: String,
        trim: true,
        default: null // Ghi chú về thành viên này
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Tạo index unique để đảm bảo một thành viên chỉ được thêm một lần vào danh sách của một chủ
personalMemberListSchema.index({ owner_user_id: 1, member_user_id: 1 }, { unique: true });

// Index cho owner_user_id để tìm kiếm nhanh
personalMemberListSchema.index({ owner_user_id: 1 });

// Middleware để kiểm tra không cho phép thêm chính mình vào danh sách
personalMemberListSchema.pre('save', function(next) {
    if (this.owner_user_id.equals(this.member_user_id)) {
        const error = new Error('Không thể thêm chính mình vào danh sách thành viên');
        return next(error);
    }
    next();
});

const PersonalMemberList = mongoose.model('PersonalMemberList', personalMemberListSchema);

module.exports = PersonalMemberList;
