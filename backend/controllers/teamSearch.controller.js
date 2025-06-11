// teamSearch.controller.js - Simplified and reliable implementation

const mongoose = require('mongoose');
const Team = require('../models/team.model');
const TeamMember = require('../models/teamMember.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');
const responseHelper = require('../utils/responseHelper');

// Tìm kiếm đội dựa trên nhiều tiêu chí, dành cho người dùng đã đăng nhập
// Chỉ trả về các đội mà người dùng hiện tại là thành viên - Optimized version
async function searchTeams(req, res) {
  try {
    // Extract user information safely
    const userId = req.user?.userId || req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId) {
      return responseHelper.errorResponse(res, 'Thông tin người dùng không hợp lệ', 401);
    }

    // Extract query parameters with defaults
    const {
      searchTerm = '',
      myRole,
      sortBy = 'team_name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    console.log(`[searchTeams] User ${userEmail || userId} searching teams with term: "${searchTerm}"`);
    console.log(`[searchTeams] Query params: myRole=${myRole}, sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, limit=${limit}`);    // Step 1: Find teams where user is a member using optimized aggregation
    const startTime = Date.now();
    
    // Convert userId to ObjectId for database query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Use aggregation for better performance
    const userMembershipsAgg = await TeamMember.aggregate([
      { 
        $match: { 
          user_id: userObjectId, // Fix: use ObjectId instead of string
          is_active: true 
        } 
      },
      {
        $project: {
          team_id: 1,
          role: 1
        }
      }
    ]);

    if (userMembershipsAgg.length === 0) {
      console.log(`[searchTeams] No teams found for user ${userId}`);
      return responseHelper.paginationResponse(res, [], 0, parseInt(page), parseInt(limit), 'Bạn chưa tham gia đội nào');
    }

    const userTeamIds = userMembershipsAgg.map(m => m.team_id);
    const userRoleMap = {};
    userMembershipsAgg.forEach(m => {
      userRoleMap[m.team_id.toString()] = m.role;
    });

    console.log(`[searchTeams] Found ${userTeamIds.length} teams for user (${Date.now() - startTime}ms)`);

    // Step 2: Build optimized aggregation pipeline
    let matchStage = {
      _id: { $in: userTeamIds },
      is_deleted: { $ne: true }
    };

    // Filter by role first if specified (reduces dataset early)
    if (myRole) {
      const teamsWithRole = userMembershipsAgg
        .filter(m => m.role === myRole)
        .map(m => m.team_id);
      matchStage._id = { $in: teamsWithRole };
      console.log(`[searchTeams] Filtered by role '${myRole}': ${teamsWithRole.length} teams`);
    }

    // Add search term filter
    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      matchStage.$or = [
        { team_name: searchRegex },
        { description: searchRegex }
      ];
      console.log(`[searchTeams] Added search term filter: "${searchTerm.trim()}"`);
    }

    // Step 3: Use aggregation for counting and fetching in one go for better performance
    const aggregationPipeline = [
      { $match: matchStage },
      {
        $facet: {
          teams: [
            // Sort
            { $sort: { [sortBy === 'team_name' ? 'team_name' : sortBy]: sortOrder === 'desc' ? -1 : 1 } },
            // Pagination
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            // Populate created_by
            {
              $lookup: {
                from: 'users',
                localField: 'created_by',
                foreignField: '_id',
                as: 'created_by',
                pipeline: [
                  { $project: { name: 1, full_name: 1, email: 1 } }
                ]
              }
            },
            {
              $addFields: {
                created_by: { $arrayElemAt: ['$created_by', 0] }
              }
            }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    console.log(`[searchTeams] Starting optimized aggregation...`);
    const queryStartTime = Date.now();
    
    const [result] = await Team.aggregate(aggregationPipeline);
    const teams = result.teams || [];
    const totalTeams = result.totalCount[0]?.count || 0;
    
    console.log(`[searchTeams] Aggregation query took: ${Date.now() - queryStartTime}ms`);

    // Step 4: Add user role to each team (fast lookup using Map)
    const enhancedTeams = teams.map(team => ({
      ...team,
      myRole: userRoleMap[team._id.toString()] || 'unknown'
    }));

    console.log(`[searchTeams] Total processing time: ${Date.now() - startTime}ms`);    return responseHelper.paginationResponse(
      res,
      enhancedTeams,
      totalTeams,
      parseInt(page),
      parseInt(limit),
      'Tìm kiếm teams thành công'
    );

  } catch (error) {
    console.error('[searchTeams] Critical error:', error);
    return responseHelper.errorResponse(res, 'Lỗi máy chủ khi tìm kiếm đội', 500);
  }
};

/**
 * Tìm kiếm các đội công khai mà người dùng có thể tham gia
 */
async function searchPublicTeams(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId) {
      return responseHelper.errorResponse(res, 'Thông tin người dùng không hợp lệ', 401);
    }

    const {
      searchTerm = '',
      excludeJoined = 'true',
      sortBy = 'team_name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    console.log(`[searchPublicTeams] User ${userEmail || userId} searching public teams: "${searchTerm}"`);    // Get teams user already joined to exclude them
    let userTeamIds = [];
    if (excludeJoined === 'true') {
      const userObjectId = new mongoose.Types.ObjectId(userId); // Fix: convert to ObjectId
      const userMemberships = await TeamMember.find({ 
        user_id: userObjectId, // Fix: use ObjectId
        is_active: true 
      }).select('team_id').lean();
      userTeamIds = userMemberships.map(m => m.team_id);
    }

    // Build search query for public teams
    let matchQuery = {
      is_deleted: { $ne: true }
    };

    if (userTeamIds.length > 0) {
      matchQuery._id = { $nin: userTeamIds };
    }

    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      matchQuery.$or = [
        { team_name: searchRegex },
        { description: searchRegex }
      ];
    }

    // Apply sorting
    const sortOptions = {};
    const validSortFields = ['team_name', 'created_at', 'updated_at'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.team_name = 1;
    }

    // Get total count and paginated results
    const totalTeams = await Team.countDocuments(matchQuery);
    
    const teams = await Team.find(matchQuery)
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('created_by', 'name full_name email')
      .lean();    console.log(`[searchPublicTeams] Found ${teams.length} public teams on page ${page}`);

    // Quick enrichment - skip complex queries for speed
    const enrichedTeams = teams.map(team => ({
      ...team,
      memberCount: 0, // Skip for speed
      projectCount: 0, // Skip for speed
      sampleMembers: [] // Skip for speed
    }));

    console.log(`[searchPublicTeams] Returning ${enrichedTeams.length} enriched teams`);

    return responseHelper.paginationResponse(
      res, 
      enrichedTeams, 
      totalTeams, 
      parseInt(page), 
      parseInt(limit), 
      'Tìm kiếm đội công khai thành công'
    );

  } catch (error) {
    console.error('[searchPublicTeams] Critical error:', error);
    return responseHelper.errorResponse(res, 'Lỗi máy chủ khi tìm kiếm đội công khai', 500);
  }
};

/**
 * Tìm kiếm thành viên của đội với phân trang (Optimized with aggregation pipeline)
 */
async function searchTeamMembers(req, res) {
  try {
    const startTime = Date.now();
    const { teamId } = req.params;
    const userId = req.user?.userId || req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId) {
      return responseHelper.errorResponse(res, 'Thông tin người dùng không hợp lệ', 401);
    }

    const {
      searchTerm = '',
      role,
      sortBy = 'joined_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    console.log(`[searchTeamMembers] User ${userEmail || userId} searching members in team ${teamId} - Start`);    // Check if user has access to this team with lean query
    const membership = await TeamMember.exists({
      team_id: teamId,
      user_id: new mongoose.Types.ObjectId(userId), // Fix: convert to ObjectId
      is_active: true
    });

    if (!membership) {
      return responseHelper.errorResponse(res, 'Bạn không có quyền truy cập vào đội này', 403);
    }

    // Build optimized aggregation pipeline
    const pipeline = [];

    // Match stage - filter by team and active status
    const matchStage = { 
      team_id: new mongoose.Types.ObjectId(teamId), 
      is_active: true 
    };

    // Add role filter if specified
    if (role && ['captain', 'admin', 'member'].includes(role)) {
      matchStage.role = role;
    }

    pipeline.push({ $match: matchStage });

    // Lookup stage - join with users collection with projection
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',        pipeline: [
          {
            $project: {
              name: 1,
              full_name: 1,
              email: 1,
              avatar_url: 1,
              phone: 1,
              department: 1
            }
          }
        ]
      }
    });

    // Unwind user data
    pipeline.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: false
      }
    });

    // Add search filter if provided
    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: searchRegex } },
            { 'user.full_name': { $regex: searchRegex } },
            { 'user.email': { $regex: searchRegex } },
            { 'user.department': { $regex: searchRegex } }
          ]
        }
      });
    }

    // Build sort stage
    const sortStage = {};
    if (sortBy && ['joined_at', 'role'].includes(sortBy)) {
      sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortStage.joined_at = -1;
    }
    pipeline.push({ $sort: sortStage });

    // Use facet to get both count and paginated results in one query
    pipeline.push({
      $facet: {
        totalCount: [{ $count: 'count' }],
        paginatedResults: [
          { $skip: (parseInt(page) - 1) * parseInt(limit) },
          { $limit: parseInt(limit) },
          {
            $project: {
              memberId: '$_id',
              user: '$user',
              role: 1,
              joinedAt: '$joined_at'
            }
          }
        ]
      }
    });

    console.log(`[searchTeamMembers] Executing optimized aggregation pipeline...`);
    
    // Execute aggregation
    const [result] = await TeamMember.aggregate(pipeline);
    
    const totalMembers = result.totalCount[0]?.count || 0;
    const formattedMembers = result.paginatedResults || [];

    const duration = Date.now() - startTime;
    console.log(`[searchTeamMembers] Found ${totalMembers} total members, returned ${formattedMembers.length} (${duration}ms)`);

    return responseHelper.paginationResponse(
      res,
      formattedMembers,
      totalMembers,
      parseInt(page),
      parseInt(limit),
      'Tìm kiếm thành viên thành công'
    );

  } catch (error) {
    console.error('[searchTeamMembers] Critical error:', error);
    return responseHelper.errorResponse(res, 'Lỗi máy chủ khi tìm kiếm thành viên', 500);
  }
};

/**
 * Gợi ý các đội dựa trên thông tin và hoạt động của người dùng
 */
async function getTeamRecommendations(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId) {
      return responseHelper.errorResponse(res, 'Thông tin người dùng không hợp lệ', 401);
    }

    const { limit = 5 } = req.query;

    console.log(`[getTeamRecommendations] Getting recommendations for user ${userEmail || userId}`);

    // Get user information
    const user = await User.findById(userId).lean();
    if (!user) {
      return responseHelper.errorResponse(res, 'Không tìm thấy thông tin người dùng', 404);
    }

    // Get teams user already joined
    const userMemberships = await TeamMember.find({ 
      user_id: userId, 
      is_active: true 
    }).select('team_id').lean();
    const joinedTeamIds = userMemberships.map(m => m.team_id);

    // Find available teams for recommendations
    const availableTeamsQuery = {
      _id: { $nin: joinedTeamIds },
      is_deleted: { $ne: true }
    };
    const availableTeams = await Team.find(availableTeamsQuery).lean();

    if (availableTeams.length === 0) {
      return responseHelper.successResponse(res, {
        recommendations: [],
        totalAvailable: 0
      }, 'Không có đội nào để gợi ý');
    }    // Calculate recommendation scores (simplified for speed)
    const teamScores = availableTeams.map((team) => {
      let score = 0;
      const reasons = [];

      // Score based on team name/description match with user info
      if (user.department || user.name || user.email) {
        const userKeywords = [user.department, user.name?.split(' ')[0], user.email?.split('@')[0]]
          .filter(Boolean)
          .join('|');
        
        if (userKeywords) {
          const keywordRegex = new RegExp(userKeywords, 'i');
          if ((team.team_name && keywordRegex.test(team.team_name)) || 
              (team.description && keywordRegex.test(team.description))) {
            score += 30;
            reasons.push('Phù hợp với thông tin cá nhân');
          }
        }
      }

      // Score based on team creation time (newer teams get bonus)
      const teamAge = Date.now() - new Date(team.created_at).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (teamAge < thirtyDays) {
        score += 20;
        reasons.push('Đội mới tạo, cơ hội tham gia tốt');
      }

      // Simple baseline score for all teams
      score += 10;
      reasons.push('Đội phù hợp để tham gia');

      return {
        team,
        score,
        memberCount: 0, // Skip for speed
        activeProjects: 0, // Skip for speed
        recentJoins: 0, // Skip for speed
        reasons
      };
    });

    // Sort by score and get top recommendations
    const recommendations = teamScores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(item => ({
        ...item.team,
        recommendationScore: item.score,
        memberCount: item.memberCount,
        activeProjectCount: item.activeProjects,
        recentMemberJoinCount: item.recentJoins,
        reasonsForRecommendation: item.reasons
      }));

    console.log(`[getTeamRecommendations] Generated ${recommendations.length} recommendations`);

    return responseHelper.successResponse(res, {
      recommendations,
      totalAvailable: availableTeams.length
    }, 'Lấy gợi ý đội thành công');

  } catch (error) {
    console.error('[getTeamRecommendations] Critical error:', error);
    return responseHelper.errorResponse(res, 'Lỗi máy chủ khi lấy gợi ý đội', 500);
  }
};

module.exports = {
  searchTeams,
  searchPublicTeams,
  searchTeamMembers,
  getTeamRecommendations
};