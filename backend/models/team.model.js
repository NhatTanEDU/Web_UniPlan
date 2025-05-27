const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: [true, 'Tên nhóm là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên nhóm không được vượt quá 100 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người tạo nhóm là bắt buộc']
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  project_data: { // 🆕 Thêm trường này
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Tham chiếu đến model Project
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
teamSchema.index({ team_name: 'text', description: 'text' });
teamSchema.index({ created_by: 1 });
teamSchema.index({ is_deleted: 1 });

// Virtual để đếm số thành viên
teamSchema.virtual('memberCount', {
  ref: 'TeamMember',
  localField: '_id',
  foreignField: 'team_id',
  count: true
});

// Middleware để cập nhật updated_at
teamSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Soft delete method
teamSchema.methods.softDelete = function() {
  this.is_deleted = true;
  return this.save();
};

module.exports = mongoose.model('Team', teamSchema);