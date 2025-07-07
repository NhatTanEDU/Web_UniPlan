const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role_in_project: {
        type: String,
        enum: ['Quản trị viên', 'Biên tập viên', 'Người xem'],
        default: 'Người xem'
    },
    kanban_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kanban'
    },
    role_in_kanban: {
        type: String,
        enum: ['Quản trị viên', 'Biên tập viên', 'Người xem'],
        default: 'Người xem'
    },
    joined_at: {
        type: Date,
        default: Date.now
    },
    is_active: {
        type: Boolean,
        default: true
    },
    approval_status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Tạo index cho cặp project_id và user_id để tránh trùng lặp
projectMemberSchema.index({ project_id: 1, user_id: 1 }, { unique: true });

// Thêm chỉ mục để tối ưu hiệu năng truy vấn
projectMemberSchema.index({ user_id: 1 });

const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

module.exports = ProjectMember; 