const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho việc ghi lại hoạt động trong teams
const teamActivitySchema = new Schema({
  // Thông tin cơ bản
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  
  // Người thực hiện hành động
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Loại hoạt động
  activityType: {
    type: String,
    required: true,
    enum: [
      // Team management
      'team_created',
      'team_updated',
      'team_deleted',
      'team_settings_changed',
      
      // Member management
      'member_added',
      'member_removed',
      'member_role_changed',
      'member_left',
      'member_joined',
      'bulk_members_added',
      'bulk_members_removed',
      'bulk_roles_updated',
      
      // Project management
      'project_assigned',
      'project_unassigned',
      'project_role_changed',
      'bulk_projects_assigned',
      'bulk_projects_unassigned',
      
      // Team activities
      'team_accessed',
      'team_searched',
      'stats_viewed',
      'export_performed',
      
      // Administrative
      'permissions_changed',
      'team_archived',
      'team_restored'
    ],
    index: true
  },
  
  // Mô tả chi tiết hoạt động
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Dữ liệu chi tiết của hoạt động (JSON)
  details: {
    // Đối với member activities
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Đối với project activities
    targetProjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },
    
    // Đối với bulk operations
    targetUserIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    targetProjectIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
    
    // Thay đổi role
    oldRole: {
      type: String,
      enum: ['member', 'admin', 'leader']
    },
    
    newRole: {
      type: String,
      enum: ['member', 'admin', 'leader']
    },
    
    // Thay đổi settings
    changedFields: [{
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed
    }],
    
    // Metadata bổ sung
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Thông tin request
  requestInfo: {
    ip: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      maxlength: 500
    },
    path: {
      type: String,
      maxlength: 200
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  },
  
  // Trạng thái hoạt động
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success',
    index: true
  },
  
  // Thông tin lỗi nếu có
  errorInfo: {
    code: String,
    message: String,
    stack: String
  },
  
  // Mức độ quan trọng
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  // Tags để phân loại
  tags: [{
    type: String,
    maxlength: 50
  }],
  
  // Thời gian
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Thời gian hết hạn (cho việc tự động xóa log cũ)
  expiresAt: {
    type: Date,
    default: function() {
      // Tự động xóa sau 6 tháng
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      return sixMonthsFromNow;
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: false, // Đã có createdAt custom
  collection: 'team_activities'
});

// Indexes để tối ưu hóa query
teamActivitySchema.index({ teamId: 1, createdAt: -1 });
teamActivitySchema.index({ performedBy: 1, createdAt: -1 });
teamActivitySchema.index({ activityType: 1, createdAt: -1 });
teamActivitySchema.index({ teamId: 1, activityType: 1, createdAt: -1 });
teamActivitySchema.index({ status: 1, severity: 1 });
teamActivitySchema.index({ tags: 1 });

// Virtual để lấy thời gian relative
teamActivitySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  
  return this.createdAt.toLocaleDateString('vi-VN');
});

// Static methods

// Ghi lại hoạt động
teamActivitySchema.statics.logActivity = async function(options) {
  const {
    teamId,
    performedBy,
    activityType,
    description,
    details = {},
    requestInfo = {},
    status = 'success',
    severity = 'medium',
    tags = [],
    errorInfo = null
  } = options;
  
  try {
    const activity = new this({
      teamId,
      performedBy,
      activityType,
      description,
      details,
      requestInfo,
      status,
      severity,
      tags,
      errorInfo
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging team activity:', error);
    // Không throw error để không ảnh hưởng đến business logic
    return null;
  }
};

// Lấy hoạt động của một team
teamActivitySchema.statics.getTeamActivities = async function(teamId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    activityType = null,
    performedBy = null,
    dateRange = null,
    severity = null,
    status = null
  } = options;
  
  let query = { teamId };
  
  if (activityType) {
    if (Array.isArray(activityType)) {
      query.activityType = { $in: activityType };
    } else {
      query.activityType = activityType;
    }
  }
  
  if (performedBy) {
    query.performedBy = performedBy;
  }
  
  if (dateRange) {
    query.createdAt = {};
    if (dateRange.from) query.createdAt.$gte = new Date(dateRange.from);
    if (dateRange.to) query.createdAt.$lte = new Date(dateRange.to);
  }
  
  if (severity) {
    if (Array.isArray(severity)) {
      query.severity = { $in: severity };
    } else {
      query.severity = severity;
    }
  }
  
  if (status) {
    query.status = status;
  }
  
  const activities = await this.find(query)
    .populate('performedBy', 'name email avatar')
    .populate('details.targetUserId', 'name email avatar')
    .populate('details.targetProjectId', 'name description')
    .populate('details.targetUserIds', 'name email avatar')
    .populate('details.targetProjectIds', 'name description')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
  
  const total = await this.countDocuments(query);
  
  return {
    activities,
    total,
    hasMore: (skip + limit) < total
  };
};

// Lấy thống kê hoạt động
teamActivitySchema.statics.getActivityStats = async function(teamId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        teamId: mongoose.Types.ObjectId(teamId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          type: '$activityType',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        totalCount: { $sum: '$count' },
        dailyData: {
          $push: {
            date: '$_id.date',
            count: '$count'
          }
        }
      }
    },
    {
      $sort: { totalCount: -1 }
    }
  ]);
  
  return stats;
};

// Instance methods

// Format hoạt động cho hiển thị
teamActivitySchema.methods.format = function() {
  return {
    id: this._id,
    type: this.activityType,
    description: this.description,
    performer: this.performedBy,
    details: this.details,
    status: this.status,
    severity: this.severity,
    timeAgo: this.timeAgo,
    createdAt: this.createdAt,
    tags: this.tags
  };
};

// Middleware

// Pre-save middleware để validate dữ liệu
teamActivitySchema.pre('save', function(next) {
  // Validate required details based on activity type
  if (this.activityType.includes('member') && this.activityType !== 'bulk_members_added' && this.activityType !== 'bulk_members_removed') {
    if (!this.details.targetUserId && !this.details.targetUserIds) {
      return next(new Error('targetUserId is required for member activities'));
    }
  }
  
  if (this.activityType.includes('project') && !this.activityType.includes('bulk')) {
    if (!this.details.targetProjectId) {
      return next(new Error('targetProjectId is required for project activities'));
    }
  }
  
  // Set tags automatically based on activity type
  if (!this.tags || this.tags.length === 0) {
    this.tags = [this.activityType.split('_')[0]]; // 'team', 'member', 'project'
  }
  
  next();
});

const TeamActivity = mongoose.model('TeamActivity', teamActivitySchema);

module.exports = TeamActivity;
