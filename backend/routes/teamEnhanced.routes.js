const express = require('express');
const router = express.Router();

// Import controllers
const teamStatsController = require('../controllers/teamStats.controller');
const teamSearchController = require('../controllers/teamSearch.controller');
const teamBulkController = require('../controllers/teamBulk.controller');

// Import middleware
const auth = require('../middleware/auth');
const {
  validateCreateTeam,
  validateUpdateTeam,
  validateAddMember,
  validateAddMultipleMembers,
  validateAssignProject,
  validateSearchAndFilter,
  handleValidationErrors,
  checkTeamAccess,
  checkTeamLeader,
  checkTeamAdminOrLeader
} = require('../middleware/teamValidation');

const {
  generalRateLimit,
  createTeamRateLimit,
  addMemberRateLimit,
  bulkOperationRateLimit,
  searchRateLimit,
  updateTeamRateLimit,
  deleteTeamRateLimit,
  statsRateLimit,
  logRateLimitViolation
} = require('../middleware/rateLimiting');

// =============================================================================
// PUBLIC ROUTES (No Authentication Required)
// =============================================================================

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Enhanced Team API is running',
    timestamp: new Date().toISOString(),
    features: [
      'Team Statistics',
      'Advanced Search',
      'Bulk Operations',
      'Rate Limiting',
      'Activity Logging'
    ]
  });
});

// =============================================================================
// PROTECTED ROUTES (Authentication Required)
// =============================================================================

// Apply authentication and general middleware to all routes below
router.use(auth);
router.use(generalRateLimit);
router.use(logRateLimitViolation);

// =============================================================================
// STATISTICS ROUTES
// =============================================================================

// GET /api/teams/stats/overview - Lấy thống kê tổng quan
router.get('/stats/overview', 
  statsRateLimit,
  teamStatsController.getTeamOverviewStats
);

// GET /api/teams/:teamId/stats/detail - Lấy thống kê chi tiết của một team
router.get('/:teamId/stats/detail',
  statsRateLimit,
  checkTeamAccess(['member', 'admin', 'leader']),
  teamStatsController.getTeamDetailStats
);

// GET /api/teams/stats/comparison - So sánh thống kê giữa các teams
router.get('/stats/comparison',
  statsRateLimit,
  teamStatsController.getTeamComparisonStats
);

// GET /api/teams/stats/projects - Thống kê team có/chưa có dự án
router.get('/stats/projects',
  statsRateLimit,
  teamStatsController.getTeamProjectStats
);

// GET /api/teams/:teamId/stats/activity - Thống kê hoạt động theo thời gian
router.get('/:teamId/stats/activity',
  statsRateLimit,
  checkTeamAccess(['member', 'admin', 'leader']),
  teamStatsController.getTeamActivityStats
);

// =============================================================================
// SEARCH ROUTES (Moved before parameterized routes to avoid conflicts)
// =============================================================================

// GET /api/teams/search - Tìm kiếm teams của user
router.get('/search',
  auth, // Fix: add authentication middleware
  searchRateLimit,
  teamSearchController.searchTeams
);

// GET /api/teams/search/public - Tìm kiếm teams công khai
router.get('/search/public',
  auth, // Fix: add authentication middleware
  searchRateLimit,
  teamSearchController.searchPublicTeams
);

// GET /api/teams/recommendations - Gợi ý teams phù hợp
router.get('/recommendations',
  auth, // Fix: add authentication middleware
  searchRateLimit,
  teamSearchController.getTeamRecommendations
);

// GET /api/teams/:teamId/members/search - Tìm kiếm thành viên trong team
router.get('/:teamId/members/search',
  auth, // Fix: add authentication middleware
  searchRateLimit,
  checkTeamAccess(['member', 'admin', 'leader']),
  teamSearchController.searchTeamMembers
);

// =============================================================================
// BULK OPERATIONS ROUTES (Enhanced with timeout handling)
// =============================================================================

// POST /api/teams/:teamId/members/bulk/add - Thêm nhiều thành viên
router.post('/:teamId/members/bulk/add',
  auth, // Fix: add authentication middleware
  bulkOperationRateLimit,
  validateAddMultipleMembers,
  handleValidationErrors,
  checkTeamAdminOrLeader,
  // Enhanced timeout wrapper
  (req, res, next) => {
    req.timeout = 10000; // 10 seconds for bulk operations
    next();
  },
  teamBulkController.addMultipleMembers
);

// DELETE /api/teams/:teamId/members/bulk/remove - Xóa nhiều thành viên
router.delete('/:teamId/members/bulk/remove',
  auth, // Fix: add authentication middleware
  bulkOperationRateLimit,
  checkTeamAdminOrLeader,
  // Enhanced timeout wrapper
  (req, res, next) => {
    req.timeout = 10000; // 10 seconds for bulk operations
    next();
  },
  teamBulkController.removeMultipleMembers
);

// PUT /api/teams/:teamId/members/bulk/roles - Cập nhật role cho nhiều thành viên
router.put('/:teamId/members/bulk/roles',
  bulkOperationRateLimit,
  checkTeamAdminOrLeader,
  // Enhanced timeout wrapper
  (req, res, next) => {
    req.timeout = 8000; // 8 seconds for role updates
    next();
  },
  teamBulkController.updateMultipleMemberRoles
);

// POST /api/teams/:teamId/projects/bulk/assign - Gán nhiều projects
router.post('/:teamId/projects/bulk/assign',
  bulkOperationRateLimit,
  checkTeamAdminOrLeader,
  // Enhanced timeout wrapper
  (req, res, next) => {
    req.timeout = 10000; // 10 seconds for project assignments
    next();
  },
  teamBulkController.assignMultipleProjects
);

// DELETE /api/teams/bulk/delete - Xóa nhiều teams
router.delete('/bulk/delete',
  deleteTeamRateLimit,
  // Enhanced timeout wrapper
  (req, res, next) => {
    req.timeout = 15000; // 15 seconds for team deletions
    next();
  },
  teamBulkController.deleteMultipleTeams
);

// =============================================================================
// ENHANCED TEAM MANAGEMENT ROUTES (with validation)
// =============================================================================

// POST /api/teams/enhanced/create - Tạo team với validation đầy đủ
router.post('/enhanced/create',
  createTeamRateLimit,
  validateCreateTeam,
  handleValidationErrors,
  require('../controllers/team.controller').createTeam // Sử dụng controller hiện có
);

// PUT /api/teams/:teamId/enhanced/update - Cập nhật team với validation
router.put('/:teamId/enhanced/update',
  updateTeamRateLimit,
  validateUpdateTeam,
  handleValidationErrors,
  checkTeamAdminOrLeader,
  require('../controllers/team.controller').updateTeam
);

// POST /api/teams/:teamId/members/enhanced/add - Thêm thành viên với validation
router.post('/:teamId/members/enhanced/add',
  addMemberRateLimit,
  validateAddMember,
  handleValidationErrors,
  checkTeamAdminOrLeader,
  require('../controllers/teamMember.controller').addMember
);

// =============================================================================
// TEAM ACTIVITY ROUTES
// =============================================================================

// GET /api/teams/:teamId/activities - Lấy lịch sử hoạt động của team
router.get('/:teamId/activities',
  checkTeamAccess(['member', 'admin', 'leader']),
  async (req, res) => {
    try {
      const { teamId } = req.params;
      const {
        limit = 50,
        skip = 0,
        activityType,
        performedBy,
        dateRange,
        severity,
        status
      } = req.query;

      const TeamActivity = require('../models/teamActivity.model');
      
      const options = {
        limit: parseInt(limit),
        skip: parseInt(skip),
        activityType,
        performedBy,
        dateRange: dateRange ? JSON.parse(dateRange) : null,
        severity,
        status
      };

      const result = await TeamActivity.getTeamActivities(teamId, options);
      
      const responseHelper = require('../utils/responseHelper');
      return responseHelper.successResponse(res, result, 'Lấy lịch sử hoạt động thành công');
    } catch (error) {
      console.error('Error getting team activities:', error);
      const responseHelper = require('../utils/responseHelper');
      return responseHelper.errorResponse(res, 'Lỗi lấy lịch sử hoạt động', 500);
    }
  }
);

// GET /api/teams/:teamId/activities/stats - Thống kê hoạt động
router.get('/:teamId/activities/stats',
  statsRateLimit,
  checkTeamAccess(['member', 'admin', 'leader']),
  async (req, res) => {
    try {
      const { teamId } = req.params;
      const { days = 30 } = req.query;

      const TeamActivity = require('../models/teamActivity.model');
      const stats = await TeamActivity.getActivityStats(teamId, parseInt(days));
      
      const responseHelper = require('../utils/responseHelper');
      return responseHelper.successResponse(res, stats, 'Thống kê hoạt động thành công');
    } catch (error) {
      console.error('Error getting activity stats:', error);
      const responseHelper = require('../utils/responseHelper');
      return responseHelper.errorResponse(res, 'Lỗi thống kê hoạt động', 500);
    }
  }
);

// =============================================================================
// TEAM HEALTH CHECK ROUTES
// =============================================================================

// GET /api/teams/:teamId/health - Kiểm tra tình trạng team
router.get('/:teamId/health',
  checkTeamAccess(['admin', 'leader']),
  async (req, res) => {
    try {
      const { teamId } = req.params;
      
      const Team = require('../models/team.model');
      const TeamMember = require('../models/teamMember.model');
      const Project = require('../models/project.model');
      
      // Lấy thông tin team
      const team = await Team.findById(teamId);
      if (!team) {
        const responseHelper = require('../utils/responseHelper');
        return responseHelper.notFoundResponse(res, 'Không tìm thấy nhóm');
      }
      
      // Kiểm tra các chỉ số sức khỏe
      const members = await TeamMember.find({ teamId });
      const projects = await Project.find({ assignedTeam: teamId });
      
      const healthChecks = {
        hasLeader: members.some(m => m.role === 'leader'),
        hasMembers: members.length > 1,
        hasProjects: projects.length > 0,
        hasActiveProjects: projects.some(p => p.status === 'active'),
        withinMemberLimit: !team.maxMembers || members.length <= team.maxMembers,
        recentActivity: false // Sẽ được tính từ TeamActivity
      };
      
      // Kiểm tra hoạt động gần đây (7 ngày)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentMembers = await TeamMember.countDocuments({
        teamId,
        joinedAt: { $gte: sevenDaysAgo }
      });
      
      healthChecks.recentActivity = recentMembers > 0;
      
      // Tính điểm sức khỏe
      const healthScore = Object.values(healthChecks).filter(Boolean).length;
      const maxScore = Object.keys(healthChecks).length;
      const healthPercentage = Math.round((healthScore / maxScore) * 100);
      
      let healthStatus = 'poor';
      if (healthPercentage >= 80) healthStatus = 'excellent';
      else if (healthPercentage >= 60) healthStatus = 'good';
      else if (healthPercentage >= 40) healthStatus = 'fair';
      
      const healthReport = {
        teamId,
        teamName: team.name,
        healthScore,
        maxScore,
        healthPercentage,
        healthStatus,
        checks: healthChecks,
        recommendations: []
      };
      
      // Thêm gợi ý cải thiện
      if (!healthChecks.hasLeader) {
        healthReport.recommendations.push('Cần chỉ định trưởng nhóm');
      }
      if (!healthChecks.hasMembers) {
        healthReport.recommendations.push('Cần thêm thành viên vào nhóm');
      }
      if (!healthChecks.hasProjects) {
        healthReport.recommendations.push('Cần gán dự án cho nhóm');
      }
      if (!healthChecks.recentActivity) {
        healthReport.recommendations.push('Nhóm cần có hoạt động gần đây');
      }
      
      const responseHelper = require('../utils/responseHelper');
      return responseHelper.successResponse(res, healthReport, 'Kiểm tra sức khỏe nhóm thành công');
    } catch (error) {
      console.error('Error checking team health:', error);
      const responseHelper = require('../utils/responseHelper');
      return responseHelper.errorResponse(res, 'Lỗi kiểm tra sức khỏe nhóm', 500);
    }
  }
);

// GET /api/teams/health - Kiểm tra tình trạng tổng quát của tất cả các teams (không cần auth)
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Enhanced Team API is running',
    timestamp: new Date().toISOString(),
    features: [
      'Team Statistics',
      'Advanced Search',
      'Bulk Operations',
      'Rate Limiting',
      'Activity Logging'
    ]
  });
});

// =============================================================================
// ENHANCED FEATURES ENDPOINTS (Requires Authentication)
// =============================================================================

// Team Activity Feed endpoints
router.get('/activity', 
  generalRateLimit,
  async (req, res) => {
    try {
      const { 
        type, 
        limit = 50, 
        offset = 0, 
        startDate, 
        endDate,
        teamId 
      } = req.query;

      // Mock activity data for now
      const activities = [
        {
          id: '1',
          type: 'team_created',
          teamId: 'team1',
          teamName: 'Development Team',
          user: {
            id: req.user.id,
            name: 'John Doe',
            avatar: null
          },
          description: 'Nhóm phát triển đã được tạo',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          metadata: {
            teamColor: '#3B82F6',
            memberCount: 5
          }
        },
        {
          id: '2',
          type: 'member_added',
          teamId: 'team1',
          teamName: 'Development Team',
          user: {
            id: 'user2',
            name: 'Jane Smith',
            avatar: null
          },
          description: 'Thành viên mới đã được thêm vào nhóm',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          metadata: {
            addedMember: 'Alice Johnson'
          }
        },
        {
          id: '3',
          type: 'project_assigned',
          teamId: 'team2',
          teamName: 'Design Team',
          user: {
            id: 'user3',
            name: 'Bob Wilson',
            avatar: null
          },
          description: 'Dự án mới đã được giao cho nhóm',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          metadata: {
            projectName: 'UI/UX Redesign',
            priority: 'high'
          }
        }
      ];

      // Filter by type if specified
      let filteredActivities = activities;
      if (type && type !== 'all') {
        filteredActivities = activities.filter(activity => activity.type === type);
      }

      // Filter by team if specified
      if (teamId) {
        filteredActivities = filteredActivities.filter(activity => activity.teamId === teamId);
      }

      // Apply pagination
      const paginatedActivities = filteredActivities.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      res.json({
        status: 'success',
        message: 'Lấy dữ liệu hoạt động thành công',
        data: {
          activities: paginatedActivities,
          total: filteredActivities.length,
          hasMore: (parseInt(offset) + parseInt(limit)) < filteredActivities.length
        }
      });
    } catch (error) {
      console.error('Error fetching team activities:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi lấy dữ liệu hoạt động',
        error: error.message
      });
    }
  }
);

// Team Health Check endpoints
router.get('/health/:teamId', 
  
  generalRateLimit,
  async (req, res) => {
    try {
      const { teamId } = req.params;

      // Mock health data for now
      const healthData = {
        teamId,
        teamName: 'Development Team',
        overallScore: 85,
        lastUpdated: new Date().toISOString(),
        metrics: {
          communication: {
            score: 88,
            trend: 'increasing',
            details: {
              messagesPerDay: 45,
              responseTime: '2 giờ',
              meetingFrequency: 'Hàng ngày'
            }
          },
          productivity: {
            score: 82,
            trend: 'stable',
            details: {
              tasksCompleted: 23,
              deadlinesMet: '95%',
              velocity: 'Cao'
            }
          },
          collaboration: {
            score: 90,
            trend: 'increasing',
            details: {
              sharedProjects: 8,
              crossFunctionalWork: '75%',
              knowledgeSharing: 'Tốt'
            }
          },
          engagement: {
            score: 78,
            trend: 'decreasing',
            details: {
              activeMembers: '90%',
              participation: 'Trung bình',
              feedback: 'Tích cực'
            }
          },
          goalAlignment: {
            score: 85,
            trend: 'stable',
            details: {
              goalsSet: 12,
              goalsAchieved: 10,
              alignment: 'Tốt'
            }
          },
          workloadBalance: {
            score: 80,
            trend: 'stable',
            details: {
              averageWorkload: '85%',
              distribution: 'Cân bằng',
              burnout: 'Thấp'
            }
          }
        },
        recommendations: [
          {
            type: 'engagement',
            priority: 'medium',
            title: 'Cải thiện sự tham gia',
            description: 'Tổ chức các hoạt động team building để tăng cường sự gắn kết',
            actions: [
              'Lên kế hoạch team building hàng tháng',
              'Tạo channel chat không chính thức',
              'Khuyến khích chia sẻ ý tưởng'
            ]
          },
          {
            type: 'productivity',
            priority: 'low',
            title: 'Tối ưu quy trình',
            description: 'Đánh giá và cải thiện quy trình làm việc hiện tại',
            actions: [
              'Review quy trình hàng tuần',
              'Tự động hóa các tác vụ lặp lại',
              'Đào tạo công cụ mới'
            ]
          }
        ],
        members: [
          {
            id: 'user1',
            name: 'John Doe',
            satisfaction: 85,
            workload: 80,
            engagement: 90
          },
          {
            id: 'user2',
            name: 'Jane Smith',
            satisfaction: 78,
            workload: 75,
            engagement: 85
          }
        ]
      };

      res.json({
        status: 'success',
        message: 'Lấy dữ liệu sức khỏe nhóm thành công',
        data: healthData
      });
    } catch (error) {
      console.error('Error fetching team health:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi lấy dữ liệu sức khỏe nhóm',
        error: error.message
      });
    }
  }
);

// Team Recommendations endpoints
router.get('/recommendations', 
  
  generalRateLimit,
  async (req, res) => {
    try {
      const { type, limit = 10 } = req.query;

      // Mock recommendations data
      const recommendations = [
        {
          id: '1',
          type: 'team_formation',
          title: 'Nhóm phát triển frontend',
          description: 'Dựa trên kỹ năng và kinh nghiệm, bạn phù hợp để tham gia nhóm này',
          confidence: 92,
          reasoning: 'Bạn có kinh nghiệm 3 năm với React và đã hoàn thành 5 dự án tương tự',
          suggestedTeam: {
            id: 'team3',
            name: 'Frontend Specialists',
            memberCount: 4,
            description: 'Nhóm chuyên về phát triển giao diện người dùng'
          },
          actions: [
            {
              type: 'join',
              label: 'Tham gia nhóm',
              primary: true
            },
            {
              type: 'learn_more',
              label: 'Tìm hiểu thêm',
              primary: false
            }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '2',
          type: 'skill_development',
          title: 'Khóa học Node.js nâng cao',
          description: 'Nâng cao kỹ năng backend để bổ sung cho portfolio của bạn',
          confidence: 85,
          reasoning: 'Bạn đã thành thạo JavaScript và có kinh nghiệm với Express.js',
          suggestedCourse: {
            name: 'Advanced Node.js Development',
            duration: '6 tuần',
            level: 'Intermediate'
          },
          actions: [
            {
              type: 'enroll',
              label: 'Đăng ký học',
              primary: true
            },
            {
              type: 'save',
              label: 'Lưu để sau',
              primary: false
            }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
        },
        {
          id: '3',
          type: 'collaboration',
          title: 'Cộng tác với nhóm Design',
          description: 'Tăng cường hợp tác liên chức năng để cải thiện sản phẩm',
          confidence: 78,
          reasoning: 'Dự án hiện tại của bạn sẽ hưởng lợi từ góc nhìn thiết kế',
          suggestedCollaboration: {
            teamName: 'UX/UI Team',
            projectName: 'Product Redesign',
            expectedBenefit: 'Cải thiện trải nghiệm người dùng 40%'
          },
          actions: [
            {
              type: 'initiate',
              label: 'Bắt đầu cộng tác',
              primary: true
            },
            {
              type: 'schedule_meeting',
              label: 'Lên lịch họp',
              primary: false
            }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        }
      ];

      // Filter by type if specified
      let filteredRecommendations = recommendations;
      if (type && type !== 'all') {
        filteredRecommendations = recommendations.filter(rec => rec.type === type);
      }

      // Apply limit
      const limitedRecommendations = filteredRecommendations.slice(0, parseInt(limit));

      res.json({
        status: 'success',
        message: 'Lấy gợi ý thành công',
        data: {
          recommendations: limitedRecommendations,
          total: filteredRecommendations.length
        }
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi lấy gợi ý',
        error: error.message
      });
    }
  }
);

// Recommendation feedback endpoint
router.post('/recommendations/:id/feedback', 
  
  generalRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { helpful, rating, comment } = req.body;

      // Mock saving feedback
      console.log(`Feedback for recommendation ${id}:`, { helpful, rating, comment });

      res.json({
        status: 'success',
        message: 'Cảm ơn phản hồi của bạn! Điều này giúp chúng tôi cải thiện gợi ý.'
      });
    } catch (error) {
      console.error('Error saving recommendation feedback:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi lưu phản hồi',
        error: error.message
      });
    }
  }
);

// Notifications endpoints
router.get('/notifications', 
  
  generalRateLimit,
  async (req, res) => {
    try {
      const { 
        type, 
        status = 'all',
        limit = 20, 
        offset = 0,
        starred
      } = req.query;

      // Mock notifications data
      const notifications = [
        {
          id: '1',
          type: 'team_invitation',
          title: 'Lời mời tham gia nhóm',
          message: 'Bạn được mời tham gia nhóm "Frontend Development"',
          isRead: false,
          isStarred: true,
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          actionRequired: true,
          actions: [
            {
              type: 'accept',
              label: 'Chấp nhận',
              variant: 'primary'
            },
            {
              type: 'decline',
              label: 'Từ chối',
              variant: 'secondary'
            }
          ],
          team: {
            id: 'team1',
            name: 'Frontend Development',
            color: '#3B82F6'
          }
        },
        {
          id: '2',
          type: 'project_deadline',
          title: 'Deadline dự án sắp tới',
          message: 'Dự án "E-commerce Website" sẽ hết hạn trong 2 ngày',
          isRead: false,
          isStarred: false,
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          actionRequired: true,
          actions: [
            {
              type: 'view_project',
              label: 'Xem dự án',
              variant: 'primary'
            },
            {
              type: 'request_extension',
              label: 'Xin gia hạn',
              variant: 'secondary'
            }
          ],
          project: {
            id: 'proj1',
            name: 'E-commerce Website',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
          }
        },
        {
          id: '3',
          type: 'team_achievement',
          title: 'Thành tích nhóm',
          message: 'Nhóm "Backend Team" đã hoàn thành 50 tasks trong tháng này!',
          isRead: true,
          isStarred: false,
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          actionRequired: false,
          actions: [
            {
              type: 'view_stats',
              label: 'Xem thống kê',
              variant: 'secondary'
            }
          ],
          team: {
            id: 'team2',
            name: 'Backend Team',
            color: '#10B981'
          }
        }
      ];

      // Apply filters
      let filteredNotifications = notifications;

      if (type && type !== 'all') {
        filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
      }

      if (status !== 'all') {
        if (status === 'unread') {
          filteredNotifications = filteredNotifications.filter(notif => !notif.isRead);
        } else if (status === 'read') {
          filteredNotifications = filteredNotifications.filter(notif => notif.isRead);
        }
      }

      if (starred === 'true') {
        filteredNotifications = filteredNotifications.filter(notif => notif.isStarred);
      }

      // Apply pagination
      const paginatedNotifications = filteredNotifications.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      res.json({
        status: 'success',
        message: 'Lấy thông báo thành công',
        data: {
          notifications: paginatedNotifications,
          total: filteredNotifications.length,
          unreadCount: notifications.filter(n => !n.isRead).length,
          hasMore: (parseInt(offset) + parseInt(limit)) < filteredNotifications.length
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi lấy thông báo',
        error: error.message
      });
    }
  }
);

// Mark notifications as read
router.patch('/notifications/read', 
  
  generalRateLimit,
  async (req, res) => {
    try {
      const { notificationIds } = req.body;

      // Mock marking as read
      console.log(`Marking notifications as read:`, notificationIds);

      res.json({
        status: 'success',
        message: `Đã đánh dấu ${notificationIds.length} thông báo là đã đọc`
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi đánh dấu thông báo',
        error: error.message
      });
    }
  }
);

// Toggle star notification
router.patch('/notifications/:id/star', 
  
  generalRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { starred } = req.body;

      // Mock toggling star
      console.log(`Toggling star for notification ${id}:`, starred);

      res.json({
        status: 'success',
        message: starred ? 'Đã đánh dấu sao' : 'Đã bỏ đánh dấu sao'
      });
    } catch (error) {
      console.error('Error toggling notification star:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server khi đánh dấu sao',
        error: error.message
      });
    }
  }
);

// =============================================================================
// EXISTING PROTECTED ROUTES
// =============================================================================

module.exports = router;
