const Team = require('../models/team.model');
const TeamMember = require('../models/teamMember.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');
const responseHelper = require('../utils/responseHelper');

// Tìm kiếm teams với nhiều bộ lọc
const searchTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      searchTerm = '',
      isPublic,
      memberCount,
      createdDateRange,
      hasProjects,
      myRole,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Xây dựng query cơ bản - chỉ tìm teams mà user tham gia
    const userTeamMemberships = await TeamMember.find({ userId }).select('teamId role');
    const userTeamIds = userTeamMemberships.map(m => m.teamId);
    
    let matchQuery = {
      _id: { $in: userTeamIds }
    };

    // Bộ lọc theo từ khóa tìm kiếm
    if (searchTerm.trim()) {
      matchQuery.$or = [
        { name: { $regex: searchTerm.trim(), $options: 'i' } },
        { description: { $regex: searchTerm.trim(), $options: 'i' } }
      ];
    }

    // Bộ lọc theo trạng thái công khai
    if (isPublic !== undefined) {
      matchQuery.isPublic = isPublic === 'true';
    }

    // Bộ lọc theo ngày tạo
    if (createdDateRange) {
      const dateFilter = {};
      if (createdDateRange.from) {
        dateFilter.$gte = new Date(createdDateRange.from);
      }
      if (createdDateRange.to) {
        dateFilter.$lte = new Date(createdDateRange.to);
      }
      if (Object.keys(dateFilter).length > 0) {
        matchQuery.createdAt = dateFilter;
      }
    }

    // Tìm teams theo query cơ bản
    let teamsQuery = Team.find(matchQuery);

    // Áp dụng sorting
    const sortOptions = {};
    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // Default sort
    }
    teamsQuery = teamsQuery.sort(sortOptions);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    teamsQuery = teamsQuery.skip(skip).limit(parseInt(limit));

    const teams = await teamsQuery;
    const totalTeams = await Team.countDocuments(matchQuery);

    // Lấy thông tin bổ sung cho mỗi team
    const enrichedTeams = await Promise.all(teams.map(async (team) => {
      // Đếm số thành viên
      const memberCountResult = await TeamMember.countDocuments({ teamId: team._id });
      
      // Lấy role của user trong team này
      const userMembership = userTeamMemberships.find(m => m.teamId.toString() === team._id.toString());
      
      // Đếm số projects
      const projectCount = await Project.countDocuments({ assignedTeam: team._id });
      
      // Lấy một vài thành viên mẫu
      const sampleMembers = await TeamMember.find({ teamId: team._id })
        .populate('userId', 'name email avatar')
        .limit(3)
        .sort({ joinedAt: -1 });

      return {
        ...team.toObject(),
        memberCount: memberCountResult,
        userRole: userMembership ? userMembership.role : null,
        projectCount,
        sampleMembers: sampleMembers.map(m => ({
          user: m.userId,
          role: m.role,
          joinedAt: m.joinedAt
        }))
      };
    }));

    // Áp dụng các bộ lọc phức tạp sau khi có dữ liệu đầy đủ
    let filteredTeams = enrichedTeams;

    // Bộ lọc theo số lượng thành viên
    if (memberCount) {
      filteredTeams = filteredTeams.filter(team => {
        if (memberCount.min !== undefined && team.memberCount < parseInt(memberCount.min)) {
          return false;
        }
        if (memberCount.max !== undefined && team.memberCount > parseInt(memberCount.max)) {
          return false;
        }
        return true;
      });
    }

    // Bộ lọc theo có projects hay không
    if (hasProjects !== undefined) {
      const shouldHaveProjects = hasProjects === 'true';
      filteredTeams = filteredTeams.filter(team => {
        return shouldHaveProjects ? team.projectCount > 0 : team.projectCount === 0;
      });
    }

    // Bộ lọc theo role của user
    if (myRole) {
      filteredTeams = filteredTeams.filter(team => team.userRole === myRole);
    }

    // Cập nhật pagination cho kết quả đã lọc
    const filteredTotal = filteredTeams.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredTotal / parseInt(limit)),
      totalItems: filteredTotal,
      itemsPerPage: parseInt(limit),
      hasNextPage: endIndex < filteredTotal,
      hasPrevPage: parseInt(page) > 1
    };

    return responseHelper.paginationResponse(res, paginatedTeams, paginationInfo, 'Tìm kiếm teams thành công');
  } catch (error) {
    console.error('Error searching teams:', error);
    return responseHelper.errorResponse(res, 'Lỗi tìm kiếm teams', 500);
  }
};

// Tìm kiếm teams công khai (cho việc tham gia mới)
const searchPublicTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      searchTerm = '',
      memberCount,
      hasAvailableSlots = true,
      excludeJoined = true,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Lấy danh sách teams mà user đã tham gia
    const userTeamIds = [];
    if (excludeJoined === 'true') {
      const userMemberships = await TeamMember.find({ userId }).select('teamId');
      userTeamIds.push(...userMemberships.map(m => m.teamId));
    }

    // Xây dựng query cho teams công khai
    let matchQuery = {
      isPublic: true
    };

    // Loại trừ teams đã tham gia
    if (userTeamIds.length > 0) {
      matchQuery._id = { $nin: userTeamIds };
    }

    // Bộ lọc theo từ khóa
    if (searchTerm.trim()) {
      matchQuery.$or = [
        { name: { $regex: searchTerm.trim(), $options: 'i' } },
        { description: { $regex: searchTerm.trim(), $options: 'i' } }
      ];
    }

    // Tìm teams
    let teamsQuery = Team.find(matchQuery);

    // Sorting
    const sortOptions = {};
    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1;
    }
    teamsQuery = teamsQuery.sort(sortOptions);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    teamsQuery = teamsQuery.skip(skip).limit(parseInt(limit));

    const teams = await teamsQuery;

    // Thêm thông tin bổ sung
    const enrichedTeams = await Promise.all(teams.map(async (team) => {
      const memberCountResult = await TeamMember.countDocuments({ teamId: team._id });
      const projectCount = await Project.countDocuments({ assignedTeam: team._id });
      
      // Lấy một vài thành viên mẫu
      const sampleMembers = await TeamMember.find({ teamId: team._id })
        .populate('userId', 'name email avatar')
        .limit(3)
        .sort({ role: 1 }); // Hiển thị leader/admin trước

      const hasSlots = !team.maxMembers || memberCountResult < team.maxMembers;

      return {
        ...team.toObject(),
        memberCount: memberCountResult,
        projectCount,
        hasAvailableSlots: hasSlots,
        availableSlots: team.maxMembers ? Math.max(0, team.maxMembers - memberCountResult) : null,
        sampleMembers: sampleMembers.map(m => ({
          user: m.userId,
          role: m.role,
          joinedAt: m.joinedAt
        }))
      };
    }));

    // Áp dụng bộ lọc phức tạp
    let filteredTeams = enrichedTeams;

    // Bộ lọc theo số lượng thành viên
    if (memberCount) {
      filteredTeams = filteredTeams.filter(team => {
        if (memberCount.min !== undefined && team.memberCount < parseInt(memberCount.min)) {
          return false;
        }
        if (memberCount.max !== undefined && team.memberCount > parseInt(memberCount.max)) {
          return false;
        }
        return true;
      });
    }

    // Bộ lọc theo có slot trống
    if (hasAvailableSlots === 'true') {
      filteredTeams = filteredTeams.filter(team => team.hasAvailableSlots);
    }

    const totalFiltered = filteredTeams.length;
    const totalAll = await Team.countDocuments(matchQuery);

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFiltered / parseInt(limit)),
      totalItems: totalFiltered,
      itemsPerPage: parseInt(limit),
      hasNextPage: (parseInt(page) * parseInt(limit)) < totalFiltered,
      hasPrevPage: parseInt(page) > 1
    };

    return responseHelper.paginationResponse(res, filteredTeams, paginationInfo, 'Tìm kiếm teams công khai thành công');
  } catch (error) {
    console.error('Error searching public teams:', error);
    return responseHelper.errorResponse(res, 'Lỗi tìm kiếm teams công khai', 500);
  }
};

// Tìm kiếm thành viên trong teams
const searchTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const {
      searchTerm = '',
      role,
      joinedDateRange,
      sortBy = 'joinedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Kiểm tra quyền truy cập team
    const membership = await TeamMember.findOne({ teamId, userId });
    if (!membership) {
      return responseHelper.forbiddenResponse(res, 'Bạn không có quyền truy cập nhóm này');
    }

    // Xây dựng query
    let matchQuery = { teamId };

    // Bộ lọc theo role
    if (role) {
      matchQuery.role = role;
    }

    // Bộ lọc theo ngày tham gia
    if (joinedDateRange) {
      const dateFilter = {};
      if (joinedDateRange.from) {
        dateFilter.$gte = new Date(joinedDateRange.from);
      }
      if (joinedDateRange.to) {
        dateFilter.$lte = new Date(joinedDateRange.to);
      }
      if (Object.keys(dateFilter).length > 0) {
        matchQuery.joinedAt = dateFilter;
      }
    }

    // Tìm members
    let membersQuery = TeamMember.find(matchQuery)
      .populate('userId', 'name email avatar phone department');

    // Sorting
    const validSortFields = ['joinedAt', 'role'];
    const sortOptions = {};
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.joinedAt = -1;
    }
    membersQuery = membersQuery.sort(sortOptions);

    const members = await membersQuery;

    // Lọc theo tên/email nếu có tìm kiếm
    let filteredMembers = members;
    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      filteredMembers = members.filter(member => {
        const user = member.userId;
        return searchRegex.test(user.name) || 
               searchRegex.test(user.email) ||
               (user.department && searchRegex.test(user.department));
      });
    }

    // Pagination
    const totalMembers = filteredMembers.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Format kết quả
    const formattedMembers = paginatedMembers.map(member => ({
      memberId: member._id,
      user: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      permissions: member.permissions
    }));

    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMembers / parseInt(limit)),
      totalItems: totalMembers,
      itemsPerPage: parseInt(limit),
      hasNextPage: endIndex < totalMembers,
      hasPrevPage: parseInt(page) > 1
    };

    return responseHelper.paginationResponse(res, formattedMembers, paginationInfo, 'Tìm kiếm thành viên thành công');
  } catch (error) {
    console.error('Error searching team members:', error);
    return responseHelper.errorResponse(res, 'Lỗi tìm kiếm thành viên', 500);
  }
};

// Gợi ý teams dựa trên hoạt động của user
const getTeamRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return responseHelper.notFoundResponse(res, 'Không tìm thấy thông tin người dùng');
    }

    // Lấy danh sách teams user đã tham gia
    const userTeamIds = await TeamMember.find({ userId }).distinct('teamId');

    // Lấy teams công khai mà user chưa tham gia
    const availableTeams = await Team.find({
      _id: { $nin: userTeamIds },
      isPublic: true
    });

    // Tính điểm phù hợp cho mỗi team
    const teamScores = await Promise.all(availableTeams.map(async (team) => {
      let score = 0;
      
      // Điểm dựa trên tên/mô tả có từ khóa liên quan đến user
      if (user.department) {
        const departmentRegex = new RegExp(user.department, 'i');
        if (departmentRegex.test(team.name) || departmentRegex.test(team.description)) {
          score += 30;
        }
      }

      // Điểm dựa trên số lượng thành viên (teams có 3-10 thành viên được ưu tiên)
      const memberCount = await TeamMember.countDocuments({ teamId: team._id });
      if (memberCount >= 3 && memberCount <= 10) {
        score += 20;
      } else if (memberCount > 10) {
        score += 10;
      }

      // Điểm dựa trên hoạt động gần đây
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = await TeamMember.countDocuments({
        teamId: team._id,
        joinedAt: { $gte: thirtyDaysAgo }
      });
      
      if (recentActivity > 0) {
        score += 15;
      }

      // Điểm dựa trên có projects active
      const activeProjects = await Project.countDocuments({
        assignedTeam: team._id,
        status: 'active'
      });
      
      if (activeProjects > 0) {
        score += 25;
      }

      // Điểm dựa trên còn slot trống
      const hasSlots = !team.maxMembers || memberCount < team.maxMembers;
      if (hasSlots) {
        score += 10;
      }

      return {
        team,
        score,
        memberCount,
        activeProjects,
        recentActivity,
        hasSlots
      };
    }));

    // Sắp xếp theo điểm và lấy top teams
    const recommendations = teamScores
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(item => ({
        ...item.team.toObject(),
        recommendationScore: item.score,
        memberCount: item.memberCount,
        activeProjects: item.activeProjects,
        recentActivity: item.recentActivity,
        hasAvailableSlots: item.hasSlots,
        reasons: getRecommendationReasons(item, user)
      }));

    return responseHelper.successResponse(res, {
      recommendations,
      totalAvailable: availableTeams.length
    }, 'Gợi ý teams thành công');
  } catch (error) {
    console.error('Error getting team recommendations:', error);
    return responseHelper.errorResponse(res, 'Lỗi lấy gợi ý teams', 500);
  }
};

// Helper function để tạo lý do gợi ý
const getRecommendationReasons = (teamScore, user) => {
  const reasons = [];
  
  if (user.department) {
    const departmentRegex = new RegExp(user.department, 'i');
    if (departmentRegex.test(teamScore.team.name) || departmentRegex.test(teamScore.team.description)) {
      reasons.push('Phù hợp với khoa/bộ phận của bạn');
    }
  }
  
  if (teamScore.memberCount >= 3 && teamScore.memberCount <= 10) {
    reasons.push('Kích thước nhóm lý tưởng');
  }
  
  if (teamScore.recentActivity > 0) {
    reasons.push('Nhóm có hoạt động gần đây');
  }
  
  if (teamScore.activeProjects > 0) {
    reasons.push('Nhóm đang có dự án đang thực hiện');
  }
  
  if (teamScore.hasSlots) {
    reasons.push('Còn chỗ trống trong nhóm');
  }
  
  return reasons;
};

module.exports = {
  searchTeams,
  searchPublicTeams,
  searchTeamMembers,
  getTeamRecommendations
};
