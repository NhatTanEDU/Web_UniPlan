// teamSimpleSearch.controller.js - Simplified and lightweight search API
// Focus on reliability over features

const mongoose = require('mongoose');
const Team = require('../models/team.model');
const TeamMember = require('../models/teamMember.model');
const User = require('../models/user.model');
const responseHelper = require('../utils/responseHelper');

/**
 * 1. Search teams by name only (simple and fast)
 * GET /api/teams/search?name=teamName
 */
async function searchTeamsByName(req, res) {
  try {
    const startTime = Date.now();
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User information required'
      });
    }    const { name = '', page = 1, limit = 10 } = req.query;

    console.log(`[searchTeamsByName] User ${userId} searching for teams with name: "${name}"`);

    // Validate input - allow empty name to search all teams user belongs to
    if (name.trim() && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Team name must be at least 2 characters'
      });
    }

    // Convert userId to ObjectId for database query
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Step 1: Find teams where user is a member (fast query with lean)
    const userTeamMemberships = await TeamMember.find({ 
      user_id: userObjectId,
      is_active: true 
    })
    .select('team_id')
    .lean();

    if (userTeamMemberships.length === 0) {
      console.log(`[searchTeamsByName] User ${userId} is not a member of any teams`);
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        },
        message: 'You are not a member of any teams'
      });
    }

    const userTeamIds = userTeamMemberships.map(m => m.team_id);    // Step 2: Search teams by name or get all teams user belongs to
    const searchQuery = {
      _id: { $in: userTeamIds },
      is_deleted: { $ne: true }
    };

    // Only add name filter if name is provided
    if (name.trim()) {
      const searchRegex = new RegExp(name.trim(), 'i');
      searchQuery.team_name = searchRegex;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    // Execute search with basic info only
    const [teams, totalCount] = await Promise.all([
      Team.find(searchQuery)
        .select('team_name description created_at created_by')
        .populate('created_by', 'full_name email')
        .sort({ team_name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      
      Team.countDocuments(searchQuery)
    ]);

    // Add member count for each team (optional enhancement)
    const enrichedTeams = await Promise.all(
      teams.map(async (team) => {
        const memberCount = await TeamMember.countDocuments({
          team_id: team._id,
          is_active: true
        });

        return {
          id: team._id,
          name: team.team_name,
          description: team.description,
          createdAt: team.created_at,
          createdBy: team.created_by,
          memberCount
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limitNum);
    const duration = Date.now() - startTime;

    console.log(`[searchTeamsByName] Found ${totalCount} teams matching "${name}" (${duration}ms)`);

    return res.json({
      success: true,
      data: enrichedTeams,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      message: `Found ${totalCount} teams matching "${name}"`
    });

  } catch (error) {
    console.error('[searchTeamsByName] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching teams',
      error: error.message
    });
  }
}

/**
 * 2. Search members in team by name/email (simple and fast)
 * GET /api/teams/:teamId/members/search?query=nameOrEmail
 */
async function searchMembersInTeam(req, res) {
  try {
    const startTime = Date.now();
    const { teamId } = req.params;
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User information required'
      });
    }

    const { query = '', page = 1, limit = 10 } = req.query;

    console.log(`[searchMembersInTeam] User ${userId} searching members in team ${teamId} with query: "${query}"`);

    // Validate teamId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    // Validate search query
    if (!query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    if (query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Convert IDs to ObjectId
    const teamObjectId = new mongoose.Types.ObjectId(teamId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Step 1: Check if user has access to this team
    const userMembership = await TeamMember.findOne({
      team_id: teamObjectId,
      user_id: userObjectId,
      is_active: true
    }).lean();

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this team'
      });
    }

    // Step 2: Search members by name or email (simple aggregation)
    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    // Use aggregation for better performance
    const pipeline = [
      // Match team members in this team
      {
        $match: {
          team_id: teamObjectId,
          is_active: true
        }
      },
      // Join with users collection
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',          pipeline: [
            {
              $project: {
                full_name: 1,
                email: 1,
                avatar_url: 1
              }
            }
          ]
        }
      },
      // Unwind user data
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false
        }
      },
      // Filter by search query (name or email)
      {
        $match: {
          $or: [
            { 'user.full_name': { $regex: searchRegex } },
            { 'user.email': { $regex: searchRegex } }
          ]
        }
      },
      // Sort by name
      { $sort: { 'user.full_name': 1 } }
    ];

    // Get total count and paginated results
    const [countResult, paginatedResult] = await Promise.all([
      TeamMember.aggregate([...pipeline, { $count: 'total' }]),
      TeamMember.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            memberId: '$_id',
            user: '$user',
            role: 1,
            joinedAt: '$joined_at'
          }
        }
      ])
    ]);

    const totalCount = countResult[0]?.total || 0;
    const members = paginatedResult || [];
    const totalPages = Math.ceil(totalCount / limitNum);
    const duration = Date.now() - startTime;

    console.log(`[searchMembersInTeam] Found ${totalCount} members matching "${query}" in team ${teamId} (${duration}ms)`);

    return res.json({
      success: true,
      data: members,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      message: `Found ${totalCount} members matching "${query}"`
    });

  } catch (error) {
    console.error('[searchMembersInTeam] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching team members',
      error: error.message
    });
  }
}

module.exports = {
  searchTeamsByName,
  searchMembersInTeam
};
