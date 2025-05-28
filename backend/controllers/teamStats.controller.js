const Team = require('../models/team.model');
const TeamMember = require('../models/teamMember.model');
const Project = require('../models/project.model');
const responseHelper = require('../utils/responseHelper');
const mongoose = require('mongoose');

// Lấy thống kê tổng quan của teams
const getTeamOverviewStats = async (req, res) => {
  try {
    console.log('🔍 [DEBUG] getTeamOverviewStats started');
    const userId = req.user.userId || req.user.id || req.user._id;
    console.log('🔍 [DEBUG] User ID:', userId);
    
    // Lấy danh sách teams mà user tham gia
    console.log('🔍 [DEBUG] Querying TeamMember...');
    const userTeamMemberships = await TeamMember.find({ user_id: userId })
      .populate('team_id');
    console.log('🔍 [DEBUG] Found memberships:', userTeamMemberships.length);
    
    const userTeamIds = userTeamMemberships
      .map(membership => membership.team_id?._id)
      .filter(Boolean);
    console.log('🔍 [DEBUG] User team IDs:', userTeamIds.length);
    
    // Thống kê cơ bản
    const totalTeams = userTeamIds.length;
    const teamsAsAdmin = userTeamMemberships.filter(m => m.role === 'Admin').length;
    const teamsAsEditor = userTeamMemberships.filter(m => m.role === 'Editor').length;
    const teamsAsMember = userTeamMemberships.filter(m => m.role === 'Member').length;
    
    console.log('🔍 [DEBUG] Basic stats calculated');
    
    // Thống kê projects được gán cho các teams
    console.log('🔍 [DEBUG] Querying Projects...');
    const teamProjects = await Project.find({
      team_id: { $in: userTeamIds }
    });
    console.log('🔍 [DEBUG] Found projects:', teamProjects.length);
    
    const totalProjects = teamProjects.length;
    const completedProjects = teamProjects.filter(p => p.status === 'Archived').length;
    const activeProjects = teamProjects.filter(p => p.status === 'Active').length;
    
    // Thống kê thành viên
    const allTeamMembers = await TeamMember.find({
      team_id: { $in: userTeamIds }
    });
    
    const totalMembers = allTeamMembers.length;
    const averageTeamSize = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;
    
    // Teams hoạt động gần đây (có thành viên được thêm trong 30 ngày qua)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyActiveTeams = await TeamMember.distinct('team_id', {
      team_id: { $in: userTeamIds },
      joined_at: { $gte: thirtyDaysAgo }
    });
    
    const stats = {
      overview: {
        totalTeams,
        teamsAsAdmin,
        teamsAsEditor,
        teamsAsMember
      },
      projects: {
        totalProjects,
        completedProjects,
        activeProjects
      },
      members: {
        totalMembers,
        averageTeamSize
      },      activity: {
        recentlyActiveTeams: recentlyActiveTeams.length
      }
    };
    
    const response = responseHelper.successResponse(stats, 'Thống kê teams thành công');
    return responseHelper.sendResponse(res, response);
  } catch (error) {
    console.error('Error getting team overview stats:', error);
    const errorResp = responseHelper.errorResponse('Lỗi lấy thống kê teams', 500);
    return responseHelper.sendResponse(res, errorResp);
  }
};

// Lấy thống kê chi tiết của một team cụ thể
const getTeamDetailStats = async (req, res) => {
  try {
    console.log('🔍 [DETAIL STATS] Function called!');
    console.log('🔍 getTeamDetailStats called with:', req.params);
    const { teamId } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    console.log('🔍 Debug - User ID:', userId, 'Team ID:', teamId);
    
    // Kiểm tra quyền truy cập
    console.log('🔍 Checking membership...');
    const membership = await TeamMember.findOne({
      team_id: teamId,
      user_id: userId
    });
      if (!membership) {
      const forbiddenResp = responseHelper.errorResponse('Bạn không có quyền truy cập nhóm này', 403);
      return responseHelper.sendResponse(res, forbiddenResp);
    }
    
    // Lấy thông tin team
    const team = await Team.findById(teamId);
    if (!team) {
      const notFoundResp = responseHelper.errorResponse('Không tìm thấy nhóm', 404);
      return responseHelper.sendResponse(res, notFoundResp);
    }
    
    // Thống kê thành viên
    const teamMembers = await TeamMember.find({ team_id: teamId })
      .populate('user_id', 'name email avatar');
    
    const memberStats = {
      total: teamMembers.length,
      admins: teamMembers.filter(m => m.role === 'Admin').length,
      editors: teamMembers.filter(m => m.role === 'Editor').length,
      members: teamMembers.filter(m => m.role === 'Member').length,
      recentJoins: teamMembers.filter(m => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return m.joined_at >= thirtyDaysAgo;
      }).length
    };
    
    // Thống kê projects
    const teamProjects = await Project.find({ team_id: teamId });
    const projectStats = {
      total: teamProjects.length,
      completed: teamProjects.filter(p => p.status === 'Archived').length,
      active: teamProjects.filter(p => p.status === 'Active').length,
      overdue: teamProjects.filter(p => {
        return p.end_date && new Date(p.end_date) < new Date() && p.status !== 'Archived';
      }).length
    };
    
    // Tính tỷ lệ hoàn thành project
    const completionRate = teamProjects.length > 0 
      ? Math.round((projectStats.completed / teamProjects.length) * 100) 
      : 0;
    
    // Hoạt động gần đây (thành viên mới tham gia trong 7 ngày)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMembers = await TeamMember.find({
      team_id: teamId,
      joined_at: { $gte: sevenDaysAgo }
    }).populate('user_id', 'name email avatar');
    
    const stats = {
      teamInfo: {
        id: team._id,
        name: team.team_name,
        description: team.description,
        createdBy: team.created_by,
        createdAt: team.created_at
      },      memberStats,
      projectStats: {
        ...projectStats,
        completionRate
      },
      recentActivity: {
        newMembers: recentMembers.map(m => ({
          user: m.user_id,
          role: m.role,
          joinedAt: m.joined_at
        }))
      }
    };
    
    const response = responseHelper.successResponse(stats, 'Thống kê chi tiết team thành công');
    return responseHelper.sendResponse(res, response);
  } catch (error) {
    console.error('Error getting team detail stats:', error);
    const errorResp = responseHelper.errorResponse('Lỗi lấy thống kê chi tiết team', 500);
    return responseHelper.sendResponse(res, errorResp);
  }
};

// Lấy thống kê so sánh giữa các teams
const getTeamComparisonStats = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    // Lấy danh sách teams mà user tham gia
    const userTeamMemberships = await TeamMember.find({ user_id: userId })
      .populate('team_id');
    
    const teamComparisons = [];
    
    for (const membership of userTeamMemberships) {
      const team = membership.team_id;
      if (!team) continue;
      
      // Đếm thành viên
      const memberCount = await TeamMember.countDocuments({ team_id: team._id });
      
      // Đếm projects
      const teamProjects = await Project.find({ team_id: team._id });
      const completedProjects = teamProjects.filter(p => p.status === 'Archived').length;
      
      // Tính hoạt động gần đây
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = await TeamMember.countDocuments({
        team_id: team._id,
        joined_at: { $gte: thirtyDaysAgo }
      });
      
      teamComparisons.push({
        teamId: team._id,
        teamName: team.team_name,
        userRole: membership.role,
        memberCount,
        projectCount: teamProjects.length,
        completedProjects,
        completionRate: teamProjects.length > 0 ? Math.round((completedProjects / teamProjects.length) * 100) : 0,
        recentActivity,
        createdAt: team.created_at
      });
    }
    
    // Sắp xếp theo các tiêu chí khác nhau
    const sortedByMembers = [...teamComparisons].sort((a, b) => b.memberCount - a.memberCount);
    const sortedByProjects = [...teamComparisons].sort((a, b) => b.projectCount - a.projectCount);
    const sortedByCompletion = [...teamComparisons].sort((a, b) => b.completionRate - a.completionRate);
    const sortedByActivity = [...teamComparisons].sort((a, b) => b.recentActivity - a.recentActivity);
    
    const comparisonStats = {
      allTeams: teamComparisons,
      rankings: {
        byMembers: sortedByMembers.slice(0, 5),
        byProjects: sortedByProjects.slice(0, 5),
        byCompletion: sortedByCompletion.slice(0, 5),
        byActivity: sortedByActivity.slice(0, 5)
      },
      summary: {
        totalTeams: teamComparisons.length,
        averageMembers: teamComparisons.length > 0 
          ? Math.round(teamComparisons.reduce((sum, t) => sum + t.memberCount, 0) / teamComparisons.length) 
          : 0,
        averageProjects: teamComparisons.length > 0 
          ? Math.round(teamComparisons.reduce((sum, t) => sum + t.projectCount, 0) / teamComparisons.length) 
          : 0,
        averageCompletion: teamComparisons.length > 0 
          ? Math.round(teamComparisons.reduce((sum, t) => sum + t.completionRate, 0) / teamComparisons.length) 
          : 0      }
    };
    
    const response = responseHelper.successResponse(comparisonStats, 'So sánh thống kê teams thành công');
    return responseHelper.sendResponse(res, response);
  } catch (error) {
    console.error('Error getting team comparison stats:', error);
    const errorResp = responseHelper.errorResponse('Lỗi so sánh thống kê teams', 500);
    return responseHelper.sendResponse(res, errorResp);
  }
};

// Lấy thống kê hoạt động theo thời gian
const getTeamActivityStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { period = '30' } = req.query; // 7, 30, 90 days
    const userId = req.user.userId || req.user.id || req.user._id;
    
    // Kiểm tra quyền truy cập
    const membership = await TeamMember.findOne({
      team_id: teamId,
      user_id: userId
    });
      if (!membership) {
      const forbiddenResp = responseHelper.errorResponse('Bạn không có quyền truy cập nhóm này', 403);
      return responseHelper.sendResponse(res, forbiddenResp);
    }
    
    const daysBack = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
      // Lấy hoạt động thêm thành viên theo ngày
    const memberActivity = await TeamMember.aggregate([
      {
        $match: {
          team_id: new mongoose.Types.ObjectId(teamId),
          joined_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$joined_at"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
      // Lấy hoạt động project theo ngày
    const projectActivity = await Project.aggregate([
      {
        $match: {
          team_id: new mongoose.Types.ObjectId(teamId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Tạo timeline đầy đủ với các ngày không có hoạt động
    const timeline = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const memberCount = memberActivity.find(m => m._id === dateString)?.count || 0;
      const projectCount = projectActivity.find(p => p._id === dateString)?.count || 0;
      
      timeline.push({
        date: dateString,
        newMembers: memberCount,
        newProjects: projectCount,
        totalActivity: memberCount + projectCount
      });
    }
    
    const activityStats = {
      period: `${daysBack} ngày qua`,
      timeline,
      summary: {
        totalNewMembers: memberActivity.reduce((sum, m) => sum + m.count, 0),
        totalNewProjects: projectActivity.reduce((sum, p) => sum + p.count, 0),
        averageDailyActivity: timeline.length > 0 
          ? Math.round(timeline.reduce((sum, t) => sum + t.totalActivity, 0) / timeline.length * 10) / 10
          : 0,
        mostActiveDay: timeline.reduce((max, day) => 
          day.totalActivity > max.totalActivity ? day : max, 
          { totalActivity: 0, date: null }
        )      }
    };
    
    const response = responseHelper.successResponse(activityStats, 'Thống kê hoạt động team thành công');
    return responseHelper.sendResponse(res, response);
  } catch (error) {
    console.error('Error getting team activity stats:', error);
    const errorResp = responseHelper.errorResponse('Lỗi lấy thống kê hoạt động team', 500);
    return responseHelper.sendResponse(res, errorResp);
  }
};

module.exports = {
  getTeamOverviewStats,
  getTeamDetailStats,
  getTeamComparisonStats,
  getTeamActivityStats
};
