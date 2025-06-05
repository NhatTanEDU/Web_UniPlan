const Project = require("../models/project.model.js");
const ProjectType = require('../models/projectType.model.js');
const mongoose = require('mongoose');
const axios = require('axios');

// Helper function to get or create default project type
const getOrCreateDefaultProjectType = async (userId) => {
  try {
    let defaultType = await ProjectType.findOne({ name: "Không phân loại", userId });
    if (!defaultType) {
      try {
        defaultType = await ProjectType.create({
          name: "Không phân loại",
          userId,
          description: "Phân loại mặc định cho các dự án"
        });
        console.log('Created new default project type:', defaultType._id);
      } catch (createError) {
        // Nếu có lỗi duplicate key, thử tìm lại (có thể đã được tạo bởi request khác)
        if (createError.code === 11000) {
          console.log('Project type already exists, finding it...');
          defaultType = await ProjectType.findOne({ name: "Không phân loại", userId });
          if (!defaultType) {
            // Thử tìm global default (không có userId)
            defaultType = await ProjectType.findOne({ name: "Không phân loại" });
            if (!defaultType) {
              throw new Error('Không thể tạo hoặc tìm phân loại mặc định');
            } else {
              console.log('Found global default project type:', defaultType._id);
            }
          } else {
            console.log('Found user-specific default project type:', defaultType._id);
          }
        } else {
          throw createError;
        }
      }
    } else {
      console.log('Found existing default project type:', defaultType._id);
    }
    return defaultType._id;
  } catch (error) {
    console.error('Lỗi khi tạo/tìm phân loại mặc định:', error);
    throw error;
  }
};

// Tạo dự án mới
exports.createProject = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    const { project_name, description, start_date, end_date, status, priority, project_type_id, team_id } = req.body;
    console.log('Extracted team_id:', team_id, 'Type:', typeof team_id); // Debug log
    console.log('team_id value check:', JSON.stringify(team_id)); // Check exact value
    console.log('team_id truthy check:', !!team_id); // Check if truthy
    const userId = req.user.userId;

    if (!project_name) {
      return res.status(400).json({ message: 'Tên dự án là bắt buộc' });
    }

    // Tìm hoặc tạo phân loại mặc định
    let finalProjectTypeId = project_type_id;
    if (!project_type_id) {
      console.log('Project type ID not provided, using helper function...'); // Debug log
      try {
        finalProjectTypeId = await getOrCreateDefaultProjectType(userId);
      } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi tạo phân loại mặc định', error: error.message });
      }
    }

    console.log(`Value of 'team_id' variable before new Project(): [${team_id}]`, typeof team_id);
    
    const project = new Project({
      project_name,
      description,
      start_date: start_date || new Date(),
      end_date: end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: status || 'Planning', // Changed from 'Active' to 'Planning'
      priority: priority || 'Medium',
      project_type_id: finalProjectTypeId,
      team_id: team_id, // Simplified assignment - let Mongoose handle null/undefined
      created_by: userId,
      is_deleted: false,
      deleted_at: null
    });

    console.log('Project before save:', project); // Debug log
    await project.save();

    // Emit socket event khi tạo dự án thành công
    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed', { action: 'create', project });
    }

    res.status(201).json({ message: 'Tạo dự án thành công', project });
  } catch (error) {
    console.error('Lỗi tạo dự án:', error);
    res.status(500).json({ message: 'Lỗi khi tạo dự án', error: error.message });
  }
};

// Lấy danh sách dự án của user
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await Project.find({
      created_by: userId,
      is_deleted: false
    }).populate('project_type_id', 'name');
    res.status(200).json(projects);
  } catch (error) {
    console.error('Lỗi lấy danh sách dự án:', error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách dự án", error: error.message });
  }
};

// Lấy thông tin chi tiết 1 dự án
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await Project.findOne({ _id: id, created_by: userId, is_deleted: false });
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Lỗi lấy chi tiết dự án:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết dự án', error: error.message });
  }
};

// Xóa mềm dự án
exports.softDeleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOneAndUpdate(
      { _id: id, created_by: userId },
      { is_deleted: true, deleted_at: new Date() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án hoặc không có quyền" });
    }

    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed');
    }

    res.json({ message: "Đã xóa dự án (ẩn tạm thời)", project });
  } catch (error) {
    console.error('Lỗi xóa mềm dự án:', error);
    res.status(500).json({ message: "Lỗi khi xóa dự án", error: error.message });
  }
};

// Khôi phục dự án
exports.restoreProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOneAndUpdate(
      { _id: id, created_by: userId, is_deleted: true },
      { is_deleted: false, deleted_at: null },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy hoặc không thể khôi phục" });
    }

    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed');
    }

    res.json({ message: "Đã khôi phục dự án", project });
  } catch (error) {
    console.error('Lỗi khôi phục dự án:', error);
    res.status(500).json({ message: "Lỗi khi khôi phục dự án", error: error.message });
  }
};

// Chỉnh sửa dự án
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { project_name, description, status, priority, start_date, end_date, project_type_id, team_id } = req.body;
    const userId = req.user.userId;

    // Validate projectId
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'ID dự án không hợp lệ hoặc bị thiếu' });
    }

    const project = await Project.findOne({ _id: projectId, is_deleted: false });
    if (!project) {
      return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    if (project.created_by.toString() !== userId) {
      return res.status(403).json({ message: 'Chỉ người tạo dự án mới có quyền chỉnh sửa' });
    }

    if (project_type_id) {
      const type = await ProjectType.findById(project_type_id);
      if (!type) {
        return res.status(400).json({ message: 'Loại dự án không hợp lệ' });
      }
    }

    // Validate team_id if provided
    if (team_id) {
      const Team = require('../models/team.model');
      const team = await Team.findById(team_id);
      if (!team) {
        return res.status(400).json({ message: 'Team không tồn tại' });
      }
    }

    project.project_name = project_name || project.project_name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.priority = priority || project.priority;
    project.start_date = start_date || project.start_date;
    project.end_date = end_date || project.end_date;
    project.project_type_id = project_type_id || project.project_type_id;
    project.team_id = team_id !== undefined ? team_id : project.team_id; // Allow null to unassign team
    project.updated_at = new Date();
    
    await project.save();

    // Emit socket event khi cập nhật dự án thành công
    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed', { action: 'update', project });
    }

    res.status(200).json({ message: 'Cập nhật dự án thành công', project });
  } catch (error) {
    console.error('Lỗi cập nhật dự án:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID dự án không hợp lệ' });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật dự án', error: error.message });
  }
};

// Lấy thông tin chi tiết 1 dự án từ API
exports.getProjectDetailsFromAPI = async (req, res) => {
  try {
    const { projectId } = req.params;
    const response = await axios.get(`/projects/${projectId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Lỗi lấy chi tiết dự án từ API:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết dự án từ API', error: error.message });
  }
};

// ==== TEAM PROJECT METHODS ====

// Lấy danh sách dự án của team - GET /api/teams/:teamId/projects
exports.getTeamProjects = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUserId = req.user.userId;

    // Import TeamMember model
    const TeamMember = require('../models/teamMember.model');
    const Team = require('../models/team.model');

    // Kiểm tra team tồn tại
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Kiểm tra quyền truy cập (phải là thành viên của team)
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền xem dự án của nhóm này' });
    }

    // Lấy danh sách dự án của team
    const projects = await Project.find({ 
      team_id: teamId, 
      is_deleted: false 
    }).populate('project_type_id', 'name description')
      .populate('created_by', 'full_name email')
      .sort({ created_at: -1 });

    res.json({
      message: 'Lấy danh sách dự án thành công',
      team: {
        id: team._id,
        name: team.team_name,
        description: team.description
      },
      projects: projects.map(project => ({
        _id: project._id,
        project_name: project.project_name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date,
        team_id: project.team_id,
        project_type_id: project.project_type_id ? {
          _id: project.project_type_id._id,
          name: project.project_type_id.name
        } : null,
        created_by: project.created_by ? project.created_by._id : null,
        created_at: project.created_at,
        updated_at: project.updated_at
      })),
      total: projects.length
    });

  } catch (error) {
    console.error('Error getting team projects:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Gán dự án vào team - POST /api/teams/:teamId/projects
exports.assignProjectToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { project_id, project_name, description, start_date, end_date, status, priority, project_type_id } = req.body;
    const currentUserId = req.user.userId;

    // Import TeamMember model
    const TeamMember = require('../models/teamMember.model');
    const Team = require('../models/team.model');

    // Kiểm tra quyền (Admin hoặc Editor)
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      role: { $in: ['Admin', 'Editor'] },
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền gán dự án cho nhóm' });
    }

    // Kiểm tra team tồn tại
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    let project;

    if (project_id) {
      // Gán dự án có sẵn vào team
      project = await Project.findOne({ _id: project_id, is_deleted: false });
      if (!project) {
        return res.status(404).json({ message: 'Không tìm thấy dự án' });
      }

      // Kiểm tra dự án đã được gán cho team khác chưa
      if (project.team_id && project.team_id.toString() !== teamId) {
        return res.status(400).json({ message: 'Dự án đã được gán cho nhóm khác' });
      }

      // Gán dự án vào team
      project.team_id = teamId;
      await project.save();

    } else {
      // Tạo dự án mới và gán vào team
      if (!project_name) {
        return res.status(400).json({ message: 'Tên dự án là bắt buộc' });
      }

      // Tìm hoặc tạo phân loại mặc định
      let finalProjectTypeId = project_type_id;
      if (!project_type_id) {
        try {
          finalProjectTypeId = await getOrCreateDefaultProjectType(currentUserId);
        } catch (error) {
          return res.status(500).json({ message: 'Lỗi khi tạo phân loại mặc định', error: error.message });
        }
      }

      project = new Project({
        project_name,
        description,
        start_date: start_date || new Date(),
        end_date: end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: status || 'Planning',
        priority: priority || 'Medium',
        project_type_id: finalProjectTypeId,
        team_id: teamId,
        created_by: currentUserId,
        is_deleted: false
      });

      await project.save();
    }

    // Populate thông tin cần thiết
    const populatedProject = await Project.findById(project._id)
      .populate('project_type_id', 'name description')
      .populate('created_by', 'full_name email');

    res.status(201).json({
      message: project_id ? 'Gán dự án vào nhóm thành công' : 'Tạo và gán dự án vào nhóm thành công',
      project: {
        id: populatedProject._id,
        name: populatedProject.project_name,
        description: populatedProject.description,
        status: populatedProject.status,
        priority: populatedProject.priority,
        start_date: populatedProject.start_date,
        end_date: populatedProject.end_date,
        team_id: populatedProject.team_id,
        project_type: populatedProject.project_type_id ? {
          id: populatedProject.project_type_id._id,
          name: populatedProject.project_type_id.name
        } : null,
        created_by: populatedProject.created_by ? {
          id: populatedProject.created_by._id,
          name: populatedProject.created_by.full_name
        } : null,
        created_at: populatedProject.created_at
      }
    });

  } catch (error) {
    console.error('Error assigning project to team:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Gỡ dự án khỏi team - DELETE /api/teams/:teamId/projects/:projectId
exports.removeProjectFromTeam = async (req, res) => {
  try {
    const { teamId, projectId } = req.params;
    const currentUserId = req.user.userId;

    // Import TeamMember model
    const TeamMember = require('../models/teamMember.model');
    const Team = require('../models/team.model');

    // Kiểm tra quyền (Admin hoặc Editor)
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      role: { $in: ['Admin', 'Editor'] },
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền gỡ dự án khỏi nhóm' });
    }

    // Kiểm tra team tồn tại
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Kiểm tra project tồn tại và đã được gán cho team này
    const project = await Project.findOne({ 
      _id: projectId, 
      team_id: teamId,
      is_deleted: false 
    });

    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án hoặc dự án không thuộc nhóm này' });
    }

    // Gỡ dự án khỏi team (set team_id = null)
    project.team_id = null;
    project.updated_at = new Date();
    await project.save();

    // Emit socket event nếu có
    if (req.server?.io) {
      req.server.io.to(currentUserId).emit('project_changed', { 
        action: 'remove_from_team', 
        project: project,
        teamId: teamId 
      });
    }

    res.json({
      message: 'Gỡ dự án khỏi nhóm thành công',
      project: {
        id: project._id,
        name: project.project_name,
        description: project.description,
        team_id: project.team_id // Should be null now
      }
    });

  } catch (error) {
    console.error('Error removing project from team:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách project có thể gán vào team (projects không thuộc team nào hoặc thuộc user hiện tại)
exports.getAvailableProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Lấy các project mà user tạo và chưa được gán vào team nào
    // hoặc user có quyền truy cập (created_by = userId)
    const projects = await Project.find({
      created_by: userId,
      $or: [
        { team_id: { $exists: false } }, // Projects not assigned to any team
        { team_id: null } // Or team_id is null
      ],
      is_deleted: { $ne: true } // Exclude soft-deleted projects
    })
    .populate('project_type_id', 'name description')
    .sort({ created_at: -1 });

    res.json({
      projects: projects,
      total: projects.length
    });

  } catch (error) {
    console.error('Error getting available projects:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tìm kiếm project theo tên hoặc mô tả
exports.searchProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Tìm kiếm các project mà user tạo và chưa được gán vào team
    const searchRegex = new RegExp(query.trim(), 'i');
    const projects = await Project.find({
      created_by: userId,
      $or: [
        { team_id: { $exists: false } }, // Projects not assigned to any team
        { team_id: null } // Or team_id is null
      ],
      is_deleted: { $ne: true }, // Exclude soft-deleted projects
      $and: [
        {
          $or: [
            { project_name: searchRegex },
            { description: searchRegex }
          ]
        }
      ]
    })
    .populate('project_type_id', 'name description')
    .sort({ created_at: -1 })
    .limit(20); // Limit results to prevent performance issues

    res.json({
      projects: projects,
      total: projects.length,
      query: query
    });

  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
