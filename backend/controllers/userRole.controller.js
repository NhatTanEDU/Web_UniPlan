const TeamMember = require('../models/teamMember.model');
const ProjectMember = require('../models/projectMember.model');
const Team = require('../models/team.model');
const Project = require('../models/project.model');
const responseHelper = require('../utils/responseHelper');

// Lấy role của user trong một team cụ thể
exports.getUserTeamRole = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Getting user role for team:', { teamId, userId });

    // Kiểm tra team có tồn tại
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy nhóm' 
      });
    }

    // Tìm role của user trong team
    const membership = await TeamMember.findOne({
      team_id: teamId,
      user_id: userId,
      is_active: true
    }).populate('user_id', 'full_name email avatar');

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của nhóm này'
      });
    }

    const response = {
      success: true,
      data: {
        teamId,
        teamName: team.team_name,
        userId,
        userRole: membership.role,
        joinedAt: membership.joined_at,
        isActive: membership.is_active,
        user: membership.user_id,
        permissions: getTeamPermissions(membership.role)
      }
    };

    console.log('✅ [DEBUG] User role found:', response.data);
    res.json(response);

  } catch (error) {
    console.error('❌ [ERROR] Getting user team role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin vai trò',
      error: error.message
    });
  }
};

// Lấy role của user trong một project cụ thể
exports.getUserProjectRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Getting user role for project:', { projectId, userId });

    // Kiểm tra project có tồn tại
    const project = await Project.findOne({ _id: projectId, is_deleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Tìm role của user trong project
    const membership = await ProjectMember.findOne({
      project_id: projectId,
      user_id: userId,
      is_active: true
    }).populate('user_id', 'name email avatar_url');

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của dự án này'
      });
    }

    const response = {
      success: true,
      data: {
        projectId,
        projectName: project.project_name,
        userId,
        userRole: membership.role_in_project,
        joinedAt: membership.joined_at,
        isActive: membership.is_active,
        user: membership.user_id,
        permissions: getProjectPermissions(membership.role_in_project)
      }
    };

    console.log('✅ [DEBUG] User project role found:', response.data);
    res.json(response);

  } catch (error) {
    console.error('❌ [ERROR] Getting user project role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin vai trò',
      error: error.message
    });
  }
};

// Lấy tất cả roles của user trong tất cả teams và projects
exports.getAllUserRoles = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Getting all roles for user:', userId);

    // Lấy tất cả team memberships
    const teamMemberships = await TeamMember.find({
      user_id: userId,
      is_active: true
    })
    .populate('team_id', 'team_name description created_by')
    .populate('user_id', 'full_name email avatar');

    // Lấy tất cả project memberships
    const projectMemberships = await ProjectMember.find({
      user_id: userId,
      is_active: true
    })
    .populate('project_id', 'project_name description created_by')
    .populate('user_id', 'name email avatar_url');

    const response = {
      success: true,
      data: {
        userId,
        teams: teamMemberships.map(membership => ({
          teamId: membership.team_id._id,
          teamName: membership.team_id.team_name,
          role: membership.role,
          joinedAt: membership.joined_at,
          permissions: getTeamPermissions(membership.role),
          isCreator: membership.team_id.created_by.toString() === userId.toString()
        })),
        projects: projectMemberships.map(membership => ({
          projectId: membership.project_id._id,
          projectName: membership.project_id.project_name,
          role: membership.role_in_project,
          joinedAt: membership.joined_at,
          permissions: getProjectPermissions(membership.role_in_project),
          isCreator: membership.project_id.created_by.toString() === userId.toString()
        }))
      }
    };

    console.log('✅ [DEBUG] All user roles found:', {
      teams: response.data.teams.length,
      projects: response.data.projects.length
    });

    res.json(response);

  } catch (error) {
    console.error('❌ [ERROR] Getting all user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin vai trò',
      error: error.message
    });
  }
};

// Kiểm tra quyền xóa thành viên cụ thể
exports.checkDeletePermission = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Checking delete permission:', { teamId, memberId, currentUserId });

    // Lấy thông tin membership của user hiện tại
    const currentMembership = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      is_active: true
    });

    if (!currentMembership) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của nhóm này',
        canDelete: false
      });
    }

    // Lấy thông tin member cần xóa
    const targetMember = await TeamMember.findById(memberId)
      .populate('user_id', 'full_name email avatar');

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành viên',
        canDelete: false
      });
    }

    // Kiểm tra logic quyền
    let canDelete = false;
    let reason = '';

    if (currentMembership.role === 'Admin') {
      if (targetMember.user_id._id.toString() === currentUserId.toString()) {
        canDelete = false;
        reason = 'Admin không thể tự xóa khỏi nhóm';
      } else {
        canDelete = true;
        reason = 'Admin có quyền xóa thành viên khác';
      }
    } else if (currentMembership.role === 'Editor') {
      if (targetMember.role === 'Member') {
        canDelete = true;
        reason = 'Editor có quyền xóa Member';
      } else {
        canDelete = false;
        reason = 'Editor không thể xóa Admin hoặc Editor khác';
      }
    } else {
      canDelete = false;
      reason = 'Member không có quyền xóa thành viên';
    }

    const response = {
      success: true,
      data: {
        canDelete,
        reason,
        currentUser: {
          id: currentUserId,
          role: currentMembership.role
        },
        targetMember: {
          id: targetMember._id,
          userId: targetMember.user_id._id,
          name: targetMember.user_id.full_name,
          role: targetMember.role
        }
      }
    };

    console.log('✅ [DEBUG] Delete permission check result:', response.data);
    res.json(response);

  } catch (error) {
    console.error('❌ [ERROR] Checking delete permission:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra quyền',
      error: error.message
    });
  }
};

// Hàm helper để lấy permissions của team role
function getTeamPermissions(role) {
  const permissions = {
    Admin: [
      'view_team',
      'edit_team',
      'delete_team',
      'add_member',
      'edit_member_role',
      'delete_member',
      'manage_projects'
    ],
    Editor: [
      'view_team',
      'add_member',
      'edit_member_role_limited', // chỉ có thể sửa Member
      'delete_member_limited' // chỉ có thể xóa Member
    ],
    Member: [
      'view_team'
    ]
  };

  return permissions[role] || [];
}

// Hàm helper để lấy permissions của project role
function getProjectPermissions(role) {
  const permissions = {
    Owner: [
      'view_project',
      'edit_project',
      'delete_project',
      'add_member',
      'edit_member_role',
      'delete_member',
      'manage_kanban'
    ],
    'Quản trị viên': [
      'view_project',
      'edit_project',
      'add_member',
      'edit_member_role',
      'delete_member',
      'manage_kanban'
    ],
    'Biên tập viên': [
      'view_project',
      'edit_project_limited',
      'manage_kanban_limited'
    ],
    'Người xem': [
      'view_project'
    ]
  };
  return permissions[role] || [];
}
