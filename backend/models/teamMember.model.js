const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'ID nhóm là bắt buộc']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng là bắt buộc']
  },
  role: {
    type: String,
    enum: ['Admin', 'Editor', 'Member'],
    default: 'Member'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  approval_status: {
    type: Boolean,
    default: true
  },
  joined_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique constraint: Mỗi user chỉ là thành viên một lần trong mỗi nhóm
teamMemberSchema.index({ team_id: 1, user_id: 1 }, { unique: true });
teamMemberSchema.index({ team_id: 1 });
teamMemberSchema.index({ user_id: 1 });
teamMemberSchema.index({ role: 1 });

// Virtual để populate user info
teamMemberSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual để populate team info
teamMemberSchema.virtual('team', {
  ref: 'Team',
  localField: 'team_id',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);