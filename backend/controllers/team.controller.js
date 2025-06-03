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
exports.getTeams = async (req, res) => {  try {
    const userId = req.user.userId; // Thay đổi từ req.user._id thành req.user.userId
    const { page = 1, limit = 10, search = '', sortBy = 'team_name', sortOrder = 'asc' } = req.query;

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

    // Sorting - ensure consistent ordering
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

    const teams = await Team.find(conditions)
      .populate('created_by', 'full_name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm số thành viên cho mỗi nhóm
    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const memberCount = await TeamMember.countDocuments({ 
          team_id: team._id, 
          is_active: true 
        });
        
        // Lấy dự án liên quan
        const relatedProject = await Project.findOne({ 
          team_id: team._id, 
          is_deleted: false 
        }).select('project_name status');

        // Lấy vai trò của user hiện tại trong nhóm
        const userRole = userTeams.find(ut => ut.team_id.toString() === team._id.toString())?.role;

        return {
          ...team.toObject(),
          memberCount,
          relatedProject,
          userRole
        };
      })
    );

    const total = await Team.countDocuments(conditions);

    res.json({
      teams: teamsWithMemberCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
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
      .populate('created_by', 'full_name email');

    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Lấy danh sách thành viên
    const members = await TeamMember.find({ 
      team_id: id, 
      is_active: true 
    })
      .populate('user_id', 'full_name email avatar')
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
    const { team_name, description } = req.body;
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
      { team_name, description },
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