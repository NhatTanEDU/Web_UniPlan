const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProjectMember = require('../models/projectMember.model');
const Project = require('../models/project.model');
const TeamMember = require('../models/teamMember.model'); // Require ở đầu file

// Get user permissions for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Get project details (thêm timeout)
    let project;
    try {
      project = await Project.findById(projectId).maxTimeMS(5000);
    } catch (err) {
      console.error('[PERM] Timeout or error khi truy vấn Project:', err);
      return res.status(500).json({ message: 'Lỗi truy vấn dự án', error: err.message });
    }
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    let userRole = 'Người xem'; // Default role
    let permissions = ['move']; // Default permissions

    // Check if user is project owner
    if (project.created_by.toString() === userId.toString()) {
      userRole = 'Quản trị viên';
      permissions = ['create', 'edit', 'delete', 'pin', 'move'];
    } else {
      // Check project member role (thêm timeout)
      let projectMember;
      try {
        projectMember = await ProjectMember.findOne({
          project_id: projectId,
          user_id: userId,
          is_active: true
        }).maxTimeMS(5000);
      } catch (err) {
        console.error('[PERM] Timeout or error khi truy vấn ProjectMember:', err);
        return res.status(500).json({ message: 'Lỗi truy vấn thành viên dự án', error: err.message });
      }

      if (projectMember) {
        userRole = projectMember.role_in_project;
        // Define permissions based on role
        const rolePermissions = {
          'Quản trị viên': ['create', 'edit', 'delete', 'pin', 'move'],
          'Biên tập viên': ['edit', 'delete', 'pin', 'move'],
          'Người xem': ['move']
        };
        permissions = rolePermissions[userRole] || ['move'];
      } else {
        // Check if user has access through team membership
        if (project.team_id) {
          let teamMember;
          try {
            teamMember = await TeamMember.findOne({
              team_id: project.team_id,
              user_id: userId,
              is_active: true
            }).maxTimeMS(5000);
          } catch (err) {
            console.error('[PERM] Timeout or error khi truy vấn TeamMember:', err);
            return res.status(500).json({ message: 'Lỗi truy vấn thành viên team', error: err.message });
          }

          if (teamMember) {
            switch (teamMember.role?.toLowerCase()) {
              case 'admin':
                userRole = 'Quản trị viên';
                permissions = ['create', 'edit', 'delete', 'pin', 'move'];
                break;
              case 'editor':
                userRole = 'Biên tập viên';
                permissions = ['edit', 'delete', 'pin', 'move'];
                break;
              case 'member':
                userRole = 'Người xem';
                permissions = ['move'];
                break;
              default:
                userRole = 'Người xem';
                permissions = ['move'];
            }
          } else {
            // User has no access to this project
            return res.status(403).json({ 
              message: 'Không có quyền truy cập dự án này',
              userRole: 'Không có quyền',
              permissions: []
            });
          }
        } else {
          // Project doesn't belong to a team and user is not a member
          return res.status(403).json({ 
            message: 'Không có quyền truy cập dự án này',
            userRole: 'Không có quyền',
            permissions: []
          });
        }
      }
    }

    res.json({
      userRole,
      permissions,
      projectId,
      userId,
      isOwner: project.created_by.toString() === userId.toString()
    });

  } catch (error) {
    console.error('Error getting user permissions:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
});

module.exports = router;
