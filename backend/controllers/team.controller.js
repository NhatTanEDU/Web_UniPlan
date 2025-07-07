const Team = require('../models/team.model');
const TeamMember = require('../models/teamMember.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');

// Tạo nhóm mới
exports.createTeam = async (req, res) => {
  try {
    const { team_name, name, description, type, members = [], project_data } = req.body;
    const userId = req.user.userId; // Thay đổi từ req.user._id thành req.user.userId

    // Support both 'team_name' and 'name' fields for backward compatibility
    const finalTeamName = team_name || name;
    
    if (!finalTeamName) {
      return res.status(400).json({ message: 'Tên nhóm là bắt buộc (team_name hoặc name)' });
    }

    // Validate project_data (nếu có)
    let project = null;
    if (project_data) {
      project = await Project.findById(project_data);
      if (!project) {
        return res.status(400).json({ message: 'Dự án không tồn tại' });
      }
    }

    // Tạo nhóm
    const team = await Team.create({
      team_name: finalTeamName, // Use the resolved name
      description,
      type, // Add type field
      created_by: userId,
      project_data: project ? project._id : null
    });

    // Thêm người tạo nhóm làm Admin
    const adminMember = new TeamMember({
      team_id: team._id,
      user_id: userId,
      role: 'Admin'
    });
    await adminMember.save();

    // Thêm các thành viên khác
    const memberPromises = members.map(async (member) => {
      // Kiểm tra user có tồn tại
      const userExists = await User.findById(member.user_id);
      if (!userExists) {
        throw new Error(`Không tìm thấy người dùng với ID: ${member.user_id}`);
      }

      const teamMember = new TeamMember({
        team_id: team._id,
        user_id: member.user_id,
        role: member.role || 'Member'
      });
      return teamMember.save();
    });

    await Promise.all(memberPromises);

    // Tạo dự án nhanh nếu có
    if (project_data) {
      project = new Project({
        ...project_data,
        team_id: team._id,
        created_by: userId
      });
      await project.save();
    }

    // Trả về thông tin nhóm với số lượng thành viên
    const teamWithMembers = await Team.findById(team._id)
      .populate('created_by', 'full_name email')
      .populate('project_data', 'project_name description')
      .populate({
        path: 'memberCount'
      });

    res.status(201).json({
      message: 'Tạo nhóm thành công',
      team: teamWithMembers,
      project: project
    });

  } catch (error) {
    console.error('Error creating team:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Thành viên đã tồn tại trong nhóm' });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách nhóm
exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.userId; // Thay đổi từ req.user._id thành req.user.userId
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'team_name', 
      sortOrder = 'asc',
      type = '', // Filter theo loại nhóm
      status = '' // Filter theo trạng thái: 'active', 'with_projects', 'empty'
    } = req.query;

    // Tìm các nhóm mà user là thành viên
    const userTeams = await TeamMember.find({ 
      user_id: userId, 
      is_active: true 
    }).select('team_id role');

    const teamIds = userTeams.map(tm => tm.team_id);

    // Query conditions
    const conditions = {
      _id: { $in: teamIds },
      is_deleted: false
    };

    if (search) {
      conditions.$or = [
        { team_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter theo loại nhóm
    if (type) {
      conditions.type = type;
    }    // Sorting - ensure consistent ordering
    const sort = {};
    const validSortFields = ['team_name', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'team_name';
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;
    
    // Add secondary sort by team_name for consistency when sorting by other fields
    if (sortField !== 'team_name') {
      sort['team_name'] = 1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline cho status filtering
    let pipeline = [
      { $match: conditions },
      {
        $lookup: {
          from: 'teammembers',
          localField: '_id',
          foreignField: 'team_id',
          as: 'members',
          pipeline: [
            { $match: { is_active: true } }
          ]
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'team_id',
          as: 'projects',
          pipeline: [
            { $match: { is_deleted: false } }
          ]
        }
      },
      {
        $addFields: {
          memberCount: { $size: '$members' },
          projectCount: { $size: '$projects' },
          hasMultipleMembers: { $gt: [{ $size: '$members' }, 1] },
          hasProjects: { $gt: [{ $size: '$projects' }, 0] }
        }
      }
    ];    // Apply status filtering
    if (status) {
      let statusCondition;
      switch (status) {
        case 'active':
          statusCondition = { hasMultipleMembers: true };
          break;
        case 'with_projects':
          statusCondition = { hasProjects: true };
          break;
        case 'empty':
          statusCondition = { 
            $and: [
              { hasMultipleMembers: false },
              { hasProjects: false }
            ]
          };
          break;
        default:
          statusCondition = {};
      }
      if (Object.keys(statusCondition).length > 0) {
        pipeline.push({ $match: statusCondition });
      }
    }

    // Apply sorting - THIS WAS MISSING!
    pipeline.push({ $sort: sort });

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Execute aggregation
    const teams = await Team.aggregate(pipeline);

    // Populate created_by field
    await Team.populate(teams, { path: 'created_by', select: 'full_name email' });

    // Enhance teams with user role and project info
    const teamsWithDetails = teams.map(team => {
      const userRole = userTeams.find(ut => ut.team_id.toString() === team._id.toString())?.role;
      const relatedProject = team.projects[0] ? {
        _id: team.projects[0]._id,
        project_name: team.projects[0].project_name,
        status: team.projects[0].status
      } : null;

      return {
        ...team,
        memberCount: team.memberCount,
        relatedProject,
        userRole
      };
    });    // Count total for pagination (without pagination pipeline stages)
    const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const totalResult = await Team.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      teams: teamsWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        type,
        status,
        search
      }
    });

  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết nhóm
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Thay đổi từ req.user._id thành req.user.userId

    // Kiểm tra user có quyền truy cập nhóm không
    const teamMember = await TeamMember.findOne({
      team_id: id,
      user_id: userId,
      is_active: true
    });

    if (!teamMember) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập nhóm này' });
    }

    const team = await Team.findOne({ _id: id, is_deleted: false })
      .populate('created_by', 'full_name email');    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Lấy danh sách thành viên
    const members = await TeamMember.find({ 
      team_id: id, 
      is_active: true 
    })
      .populate('user_id', 'full_name email avatar_url')
      .sort({ role: 1, joined_at: 1 });

    // Lấy dự án liên quan
    const relatedProjects = await Project.find({ 
      team_id: id, 
      is_deleted: false 
    }).select('project_name description status priority start_date end_date');

    res.json({
      team: {
        ...team.toObject(),
        userRole: teamMember.role
      },
      members,
      relatedProjects
    });

  } catch (error) {
    console.error('Error getting team by id:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin nhóm
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, description, type } = req.body;
    const userId = req.user.userId; // Thay đổi từ req.user._id thành req.user.userId

    // Kiểm tra quyền (chỉ Admin mới được cập nhật)
    const teamMember = await TeamMember.findOne({
      team_id: id,
      user_id: userId,
      role: 'Admin',
      is_active: true
    });

    if (!teamMember) {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền cập nhật thông tin nhóm' });
    }

    const team = await Team.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { team_name, description, type },
      { new: true, runValidators: true }
    ).populate('created_by', 'full_name email');

    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    res.json({
      message: 'Cập nhật thông tin nhóm thành công',
      team
    });

  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa nhóm (soft delete)
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Thay đổi từ req.user._id thành req.user.userId

    // Kiểm tra quyền (chỉ Admin mới được xóa)
    const teamMember = await TeamMember.findOne({
      team_id: id,
      user_id: userId,
      role: 'Admin',
      is_active: true
    });

    if (!teamMember) {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền xóa nhóm' });
    }

    const team = await Team.findOne({ _id: id, is_deleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Soft delete nhóm
    await team.softDelete();

    // Deactivate tất cả thành viên
    await TeamMember.updateMany(
      { team_id: id },
      { is_active: false }
    );

    // Gỡ liên kết với các dự án
    await Project.updateMany(
      { team_id: id },
      { team_id: null }
    );

    res.json({ message: 'Xóa nhóm thành công' });

  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thống kê tổng quan về nhóm
exports.getTeamStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Tìm tất cả nhóm mà user là thành viên
    const userTeams = await TeamMember.find({ 
      user_id: userId, 
      is_active: true 
    }).select('team_id');

    const teamIds = userTeams.map(tm => tm.team_id);

    // Thống kê cơ bản
    const totalTeams = await Team.countDocuments({
      _id: { $in: teamIds },
      is_deleted: false
    });

    // Nhóm có thành viên (> 1 thành viên)
    const teamsWithMembers = await Team.aggregate([
      {
        $match: {
          _id: { $in: teamIds },
          is_deleted: false
        }
      },
      {
        $lookup: {
          from: 'teammembers',
          localField: '_id',
          foreignField: 'team_id',
          as: 'members',
          pipeline: [
            { $match: { is_active: true } }
          ]
        }
      },
      {
        $match: {
          'members.1': { $exists: true } // Có ít nhất 2 thành viên
        }
      },
      {
        $count: 'count'
      }
    ]);

    // Nhóm có dự án
    const teamsWithProjects = await Team.aggregate([
      {
        $match: {
          _id: { $in: teamIds },
          is_deleted: false
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'team_id',
          as: 'projects',
          pipeline: [
            { $match: { is_deleted: false } }
          ]
        }
      },
      {
        $match: {
          'projects.0': { $exists: true } // Có ít nhất 1 dự án
        }
      },
      {
        $count: 'count'
      }
    ]);

    // Nhóm trống (chỉ có 1 thành viên và không có dự án)
    const emptyTeams = await Team.aggregate([
      {
        $match: {
          _id: { $in: teamIds },
          is_deleted: false
        }
      },
      {
        $lookup: {
          from: 'teammembers',
          localField: '_id',
          foreignField: 'team_id',
          as: 'members',
          pipeline: [
            { $match: { is_active: true } }
          ]
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'team_id',
          as: 'projects',
          pipeline: [
            { $match: { is_deleted: false } }
          ]
        }
      },
      {
        $match: {
          $and: [
            { 'members.1': { $exists: false } }, // Chỉ có 1 thành viên
            { 'projects.0': { $exists: false } } // Không có dự án
          ]
        }
      },
      {
        $count: 'count'
      }
    ]);

    // Thống kê theo loại nhóm
    const teamsByType = await Team.aggregate([
      {
        $match: {
          _id: { $in: teamIds },
          is_deleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Nhóm được tạo gần đây (trong 30 ngày)
    const recentTeams = await Team.countDocuments({
      _id: { $in: teamIds },
      is_deleted: false,
      created_at: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 ngày trước
      }
    });

    res.json({
      statistics: {
        totalTeams,
        teamsWithMembers: teamsWithMembers[0]?.count || 0,
        teamsWithProjects: teamsWithProjects[0]?.count || 0,
        emptyTeams: emptyTeams[0]?.count || 0,
        recentTeams,
        teamsByType: teamsByType.reduce((acc, item) => {
          acc[item._id || 'other'] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error getting team statistics:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};