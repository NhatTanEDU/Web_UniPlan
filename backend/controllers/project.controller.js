const Project = require("../models/project.model.js");
const ProjectType = require('../models/projectType.model.js');
const Kanban = require('../models/kanban.model.js'); // Import Kanban model
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

// THAY THẾ HÀM createProject BẰNG PHIÊN BẢN MỚI CÓ AUTO-MEMBER (KHÔNG DÙNG TRANSACTION)
exports.createProject = async (req, res) => {
  const reqId = `[createProject-${Date.now()}]`;
  console.log(`${reqId} [1] Bắt đầu tạo dự án mới...`);
  
  try {
    const { project_name, description, start_date, end_date, status, priority, project_type_id, team_id } = req.body;
    const userId = req.user.userId;

    console.log(`${reqId} [2] Dữ liệu đầu vào:`, req.body);

    if (!project_name) {
      return res.status(400).json({ message: 'Tên dự án là bắt buộc' });
    }

    // Tìm hoặc tạo phân loại mặc định
    let finalProjectTypeId = project_type_id;
    if (!project_type_id) {
      console.log(`${reqId} [2.1] Project type ID not provided, using helper function...`);
      try {
        finalProjectTypeId = await getOrCreateDefaultProjectType(userId);
      } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi tạo phân loại mặc định', error: error.message });
      }
    }

    // Bước 1: Tạo dự án mới
    console.log(`${reqId} [3] Đang tạo document Project...`);
    const newProject = new Project({
      project_name,
      description,
      start_date: start_date || new Date(),
      end_date: end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: status || 'Planning',
      priority: priority || 'Medium',
      project_type_id: finalProjectTypeId,
      team_id: team_id || null,
      created_by: userId,
      is_deleted: false,
      deleted_at: null
    });
    
    const savedProject = await newProject.save();
    console.log(`${reqId} [4] Đã tạo Project thành công với ID: ${savedProject._id}`);

    // --- LOGIC MỚI QUAN TRỌNG ---
    // Bước 2: Tự động thêm người tạo dự án vào làm thành viên với vai trò Quản trị viên
    console.log(`${reqId} [5] Đang tự động thêm người tạo làm Project Owner...`);
    const ProjectMember = require('../models/projectMember.model');
    
    const projectOwner = new ProjectMember({
        project_id: savedProject._id,
        user_id: userId,
        role_in_project: 'Quản trị viên', // Gán vai trò cao nhất cho người tạo
        is_active: true
    });

    await projectOwner.save();
    console.log(`${reqId} [6] Đã thêm Owner vào ProjectMember thành công.`);
    // ----------------------------

    // Bước 3: Tạo bảng Kanban mặc định cho dự án
    console.log(`${reqId} [7] Đang tạo Kanban mặc định...`);
    const newKanban = new Kanban({
        project_id: savedProject._id,
        name: `Bảng Kanban cho ${savedProject.project_name}`,
        created_by: userId
    });
    
    const savedKanban = await newKanban.save();
    console.log(`${reqId} [8] Đã tạo Kanban thành công với ID: ${savedKanban._id}`);

    // Bước 4: Liên kết Kanban với Project
    savedProject.kanban_id = savedKanban._id;
    await savedProject.save();
    console.log(`${reqId} [9] Đã liên kết Kanban với Project.`);

    // Populate the project before sending it back
    const populatedProject = await Project.findById(savedProject._id)
      .populate('project_type_id', 'name description')
      .populate('created_by', 'full_name email');

    // Emit socket event khi tạo dự án thành công
    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed', { action: 'create', project: populatedProject });
    }
    
    res.status(201).json({ 
        message: 'Tạo dự án và bảng Kanban thành công',
        project: populatedProject,
        kanban: savedKanban 
    });

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server khi tạo dự án', error: error.message });
    }
  }
};

// Lấy danh sách dự án của user (bao gồm cả dự án được mời vào và dự án đã tạo)
exports.getMyProjects = async (req, res) => {
  const reqId = `[getMyProjects-${req.user.userId.slice(-4)}-${Date.now()}]`;
  const startTime = Date.now();
  
  console.log(`${reqId} [1] Bắt đầu lấy danh sách dự án (bao gồm dự án được mời và dự án đã tạo)...`);
  
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    console.log(`${reqId} [2] Đang tìm các dự án mà user ID: ${userId} là thành viên hoặc người tạo...`);

    // Import ProjectMember model
    const ProjectMember = require('../models/projectMember.model');
    
    // Bước 1: Tìm tất cả các bản ghi ProjectMember của người dùng hiện tại
    console.log(`${reqId} [3] Đang truy vấn ProjectMember...`);
    const membershipStart = Date.now();
    
    const userMemberships = await ProjectMember.find({ user_id: userId });
    
    console.log(`${reqId} [3] ProjectMember query completed in ${Date.now() - membershipStart}ms. Found ${userMemberships.length} memberships.`);
    
    // Bước 2: Lấy danh sách project_id từ membership
    const memberProjectIds = userMemberships.map(member => member.project_id);
    console.log(`${reqId} [4] Người dùng là thành viên của ${memberProjectIds.length} dự án.`);

    // Bước 3: Tìm tất cả các dự án mà user có quyền truy cập (thành viên HOẶC người tạo)
    console.log(`${reqId} [5] Đang truy vấn chi tiết các dự án...`);
    const projectsStart = Date.now();
    
    const projects = await Project.find({
      $or: [
        { '_id': { $in: memberProjectIds } }, // Dự án mà user là thành viên
        { 'created_by': userId } // Dự án mà user là người tạo
      ],
      'is_deleted': false // Chỉ lấy các dự án chưa bị xóa
    })
    .populate('created_by', 'full_name email avatar_url') // Lấy thông tin người tạo  
    .populate('project_type_id', 'name') // Lấy thông tin loại dự án
    .sort({ created_at: -1 }); // Sắp xếp theo ngày tạo mới nhất

    console.log(`${reqId} [5] Projects query completed in ${Date.now() - projectsStart}ms. Found ${projects.length} projects.`);

    console.log(`${reqId} [FINAL] Chuẩn bị gửi response. Total time: ${Date.now() - startTime}ms`);
    
    if (!res.headersSent) {
      res.status(200).json(projects);
    }

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, {
      error: error.message,
      stack: error.stack,
      totalTime: Date.now() - startTime + 'ms'
    });
    
    if (!res.headersSent) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách dự án", error: error.message });
    } else {
      console.error(`🚨 ${reqId} Headers already sent - cannot send error response`);
    }
  }
};

// Lấy thông tin chi tiết 1 dự án
exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  const reqId = `[getProjectById-${id.slice(-4)}-${Date.now()}]`;
  
  console.log(`${reqId} [1] Bắt đầu lấy chi tiết dự án ID: ${id}`);
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const projectId = new mongoose.Types.ObjectId(id);

    // Import ProjectMember model
    const ProjectMember = require('../models/projectMember.model');

    // Bước 1: Tìm dự án
    console.log(`${reqId} [2] Đang tìm dự án trong DB...`);
    const project = await Project.findOne({ _id: projectId, is_deleted: false });

    if (!project) {
      console.warn(`${reqId} [FAIL] Không tìm thấy dự án với ID: ${id}`);
      return res.status(404).json({ message: 'Dự án không tồn tại hoặc đã bị xóa.' });
    }
    console.log(`${reqId} [3] Đã tìm thấy dự án: ${project.project_name}`);

    // Bước 2: Kiểm tra quyền truy cập của người dùng
    // Người dùng có quyền nếu:
    // a) Họ là người tạo ra dự án (project.created_by)
    // b) Họ là thành viên trong bảng ProjectMember

    console.log(`${reqId} [4] Đang kiểm tra quyền truy cập của user: ${userId}`);
    const isOwner = project.created_by.equals(userId);
    
    let isMember = false;
    if (!isOwner) {
      const membership = await ProjectMember.findOne({
        project_id: projectId,
        user_id: userId
      });
      isMember = !!membership; // true nếu tìm thấy, false nếu không
    }

    if (!isOwner && !isMember) {
      console.warn(`${reqId} [FAIL] User ${userId} không có quyền truy cập dự án.`);
      return res.status(403).json({ message: 'Bạn không có quyền truy cập dự án này.' });
    }

    console.log(`${reqId} [5] User có quyền truy cập. Owner: ${isOwner}, Member: ${isMember}.`);
    
    // Nếu có quyền, populate thêm thông tin cần thiết và trả về
    console.log(`${reqId} [FINAL] Chuẩn bị gửi response về client.`);
    await project.populate('project_type_id', 'name');
    await project.populate('kanban_id'); // Populate kanban_id để trả về thông tin Kanban
    await project.populate('created_by', 'full_name email avatar_url');
    
    res.status(200).json(project);

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server khi lấy chi tiết dự án' });
    }
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

    // Populate the project before sending response
    const populatedProject = await Project.findById(project._id)
      .populate('project_type_id', 'name description')
      .populate('created_by', 'full_name email');

    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed');
    }

    res.json({ message: "Đã xóa dự án (ẩn tạm thời)", project: populatedProject });
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

    // Populate the project before sending response
    const populatedProject = await Project.findById(project._id)
      .populate('project_type_id', 'name description')
      .populate('created_by', 'full_name email');

    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed');
    }

    res.json({ message: "Đã khôi phục dự án", project: populatedProject });
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

    // --- BẮT ĐẦU LOGGING ---
    console.log(`[DEBUG] Updating Project ID: ${projectId}`);
    // Log dữ liệu gốc trước khi thay đổi
    console.log('[DEBUG] Original Data:', JSON.stringify(project.toObject(), null, 2));
    // Log dữ liệu nhận được từ request
    console.log('[DEBUG] Received Updates:', JSON.stringify({ project_name, description, status, priority, start_date, end_date, project_type_id, team_id }, null, 2));

    const changedFields = {};

    // Gán giá trị và ghi nhận các trường đã thay đổi
    if (project_name && project.project_name !== project_name) {
      changedFields.project_name = { from: project.project_name, to: project_name };
      project.project_name = project_name;
    }
    if (description !== undefined && project.description !== description) {
      changedFields.description = { from: project.description, to: description };
      project.description = description;
    }
    if (status && project.status !== status) {
      changedFields.status = { from: project.status, to: status };
      project.status = status;
    }
    if (priority && project.priority !== priority) {
      changedFields.priority = { from: project.priority, to: priority };
      project.priority = priority;
    }
    if (start_date && project.start_date !== start_date) {
      changedFields.start_date = { from: project.start_date, to: start_date };
      project.start_date = start_date;
    }
    if (end_date && project.end_date !== end_date) {
      changedFields.end_date = { from: project.end_date, to: end_date };
      project.end_date = end_date;
    }
    if (project_type_id && project.project_type_id.toString() !== project_type_id) {
      changedFields.project_type_id = { from: project.project_type_id, to: project_type_id };
      project.project_type_id = project_type_id;
    }
    if (team_id !== undefined && project.team_id?.toString() !== team_id?.toString()) {
      changedFields.team_id = { from: project.team_id, to: team_id };
      project.team_id = team_id;
    }

    if (Object.keys(changedFields).length > 0) {
      console.log('[DEBUG] Fields Changed:', JSON.stringify(changedFields, null, 2));
      project.updated_at = new Date();
      await project.save();
      console.log(`[DEBUG] Project ${projectId} update saved to DB.`);
      
      // 🔄 Sync team members to project members when team_id changes
      if (changedFields.team_id && team_id) {
        try {
          console.log(`🔄 Team ID changed from ${changedFields.team_id.from} to ${changedFields.team_id.to}, syncing team members...`);
          const syncResult = await syncTeamMembersToProject(projectId, team_id);
          console.log('🔄 Team member sync result:', syncResult);
        } catch (syncError) {
          console.error('❌ Error syncing team members to project during update:', syncError);
          // Don't fail the update operation if sync fails, just log the error
        }
      }
    } else {
      console.log(`[DEBUG] No actual changes detected for Project ${projectId}.`);
    }
    // --- KẾT THÚC LOGGING ---

    // IMPORTANT: Repopulate the project before sending it back
    const populatedProject = await Project.findById(project._id)
      .populate('project_type_id', 'name description') // << THIS LINE IS KEY
      .populate('created_by', 'full_name email');

    // Emit socket event khi cập nhật dự án thành công
    if (req.server?.io) {
      req.server.io.to(userId).emit('project_changed', { action: 'update', project: populatedProject });
    }

    res.status(200).json({ message: 'Cập nhật dự án thành công', project: populatedProject });
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
  const reqId = `[getTeamProjects-${Date.now()}]`;
  const startTime = Date.now();
  
  console.log(`${reqId} [1] Bắt đầu xử lý getTeamProjects...`);
  
  try {
    const { teamId } = req.params;
    const currentUserId = req.user.userId;
    
    console.log(`${reqId} [2] Lấy dự án cho team: ${teamId}, user: ${currentUserId}`);

    // Import TeamMember model
    const TeamMember = require('../models/teamMember.model');
    const Team = require('../models/team.model');

    // Kiểm tra team tồn tại
    console.log(`${reqId} [3] Đang kiểm tra team tồn tại...`);
    const teamCheckStart = Date.now();
    
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    
    console.log(`${reqId} [3] Kiểm tra team hoàn thành trong ${Date.now() - teamCheckStart}ms. Team exists: ${!!team}`);
    
    if (!team) {
      if (!res.headersSent) {
        return res.status(404).json({ message: 'Không tìm thấy nhóm' });
      }
      return;
    }

    // Kiểm tra quyền truy cập (phải là thành viên của team)
    console.log(`${reqId} [4] Đang kiểm tra quyền thành viên...`);
    const memberCheckStart = Date.now();
    
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      is_active: true
    });
    
    console.log(`${reqId} [4] Kiểm tra quyền hoàn thành trong ${Date.now() - memberCheckStart}ms. Is member: ${!!currentMember}`);

    if (!currentMember) {
      if (!res.headersSent) {
        return res.status(403).json({ message: 'Bạn không có quyền xem dự án của nhóm này' });
      }
      return;
    }

    // Lấy danh sách dự án của team
    console.log(`${reqId} [5] Đang lấy danh sách dự án của team...`);
    const projectsQueryStart = Date.now();
    
    const projects = await Project.find({ 
      team_id: teamId, 
      is_deleted: false 
    }).populate('project_type_id', 'name description')
      .populate('created_by', 'full_name email')
      .sort({ created_at: -1 });
    
    console.log(`${reqId} [5] Truy vấn dự án hoàn thành trong ${Date.now() - projectsQueryStart}ms. Found ${projects.length} projects`);

    console.log(`${reqId} [FINAL] Chuẩn bị gửi response về client. Total time: ${Date.now() - startTime}ms`);

    if (!res.headersSent) {
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
    }

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, {
      error: error.message,
      stack: error.stack,
      totalTime: Date.now() - startTime + 'ms'
    });
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    } else {
      console.error(`🚨 ${reqId} Headers already sent - cannot send error response`);
    }
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
      
      // Đồng bộ hóa team members sang project members
      await syncTeamMembersToProject(project._id, teamId);

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

    // Sync team members to project members when a project is assigned to a team
    if (teamId) {
      try {
        const syncResult = await syncTeamMembersToProject(project._id, teamId);
        console.log('🔄 Sync result:', syncResult);
      } catch (syncError) {
        console.error('❌ Error syncing team members to project:', syncError);
      }
    }

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

// Helper function to sync team members to project members (exported for reuse)
const syncTeamMembersToProject = async (projectId, teamId) => {
  try {
    console.log('🔄 Syncing team members to project members...', { projectId, teamId });
    
    // Validate input parameters
    if (!projectId || !teamId) {
      throw new Error('projectId and teamId are required for sync operation');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(teamId)) {
      throw new Error('Invalid projectId or teamId format');
    }
    
    const TeamMember = require('../models/teamMember.model');
    const ProjectMember = require('../models/projectMember.model');
    
    // Get all active team members with validation
    const teamMembers = await TeamMember.find({
      team_id: teamId,
      is_active: true
    }).populate('user_id', '_id name email');
    
    console.log(`📋 Found ${teamMembers.length} team members to sync`);
    
    if (teamMembers.length === 0) {
      console.log('ℹ️ No active team members found to sync');
      return {
        success: true,
        teamMembersCount: 0,
        newProjectMembersCount: 0,
        existingProjectMembersCount: 0
      };
    }
    
    // Get existing project members to avoid duplicates
    const existingProjectMembers = await ProjectMember.find({
      project_id: projectId,
      is_active: true
    });
    
    const existingUserIds = existingProjectMembers.map(pm => pm.user_id.toString());
    console.log(`📋 Found ${existingProjectMembers.length} existing project members`);
      // Add team members to project members if they don't already exist
    const newProjectMembers = [];
    const validationErrors = [];
    
    for (const teamMember of teamMembers) {
      try {
        // Validate team member data
        if (!teamMember.user_id || !teamMember.user_id._id) {
          console.warn(`⚠️ Skipping team member with invalid user_id:`, teamMember);
          validationErrors.push(`Team member ${teamMember._id} has invalid user_id`);
          continue;
        }

        const userId = teamMember.user_id._id.toString();
        
        if (!existingUserIds.includes(userId)) {
          // Map team roles to project roles with proper validation
          let projectRole = 'Người xem'; // Default role
          
          // Enhanced role mapping with validation
          switch (teamMember.role) {
            case 'Admin':
              projectRole = 'Quản trị viên';
              break;
            case 'Editor':
              projectRole = 'Biên tập viên';
              break;
            case 'Member':
              projectRole = 'Người xem';
              break;
            default:
              console.warn(`⚠️ Unknown team role: ${teamMember.role}, defaulting to 'Người xem'`);
              projectRole = 'Người xem';
          }
          
          console.log(`👤 Mapping team member: ${teamMember.role} -> ${projectRole}`);
          
          // Create project member with validation
          const projectMemberData = {
            project_id: projectId,
            user_id: teamMember.user_id._id,
            role_in_project: projectRole,
            joined_at: new Date(),
            is_active: true
          };

          // Validate the project member data before creating
          const projectMember = new ProjectMember(projectMemberData);
          
          // Run validation without saving
          const validationError = projectMember.validateSync();
          if (validationError) {
            console.error(`❌ Validation error for team member ${userId}:`, validationError.message);
            validationErrors.push(`Validation failed for user ${userId}: ${validationError.message}`);
            continue;
          }
          
          newProjectMembers.push(projectMember);
        }
      } catch (memberError) {
        console.error(`❌ Error processing team member ${teamMember._id}:`, memberError);
        validationErrors.push(`Error processing team member ${teamMember._id}: ${memberError.message}`);
      }
    }
    
    // Insert new project members with batch validation
    let insertedCount = 0;
    if (newProjectMembers.length > 0) {
      try {
        const insertResult = await ProjectMember.insertMany(newProjectMembers, {
          ordered: false, // Continue inserting even if some fail
          rawResult: true
        });
        insertedCount = insertResult.insertedCount || newProjectMembers.length;
        console.log(`✅ Added ${insertedCount} new project members from team`);
      } catch (insertError) {
        // Handle duplicate key errors gracefully
        if (insertError.code === 11000) {
          console.warn('⚠️ Some duplicate project members detected, continuing...');
          // Count successful inserts from the error details
          const writeErrors = insertError.writeErrors || [];
          insertedCount = newProjectMembers.length - writeErrors.length;
          console.log(`✅ Added ${insertedCount} new project members (${writeErrors.length} duplicates skipped)`);
        } else {
          throw insertError;
        }
      }
    } else {
      console.log('ℹ️ No new project members to add - all team members already exist');
    }
    
    // Log validation errors if any
    if (validationErrors.length > 0) {
      console.warn(`⚠️ Encountered ${validationErrors.length} validation errors during sync:`, validationErrors);
    }
    
    return {
      success: true,
      teamMembersCount: teamMembers.length,
      newProjectMembersCount: insertedCount,
      existingProjectMembersCount: existingProjectMembers.length,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined
    };
  } catch (error) {
    console.error('❌ Error syncing team members to project:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

// Export the sync function for external use
module.exports.syncTeamMembersToProject = syncTeamMembersToProject;

// API endpoint để đồng bộ hóa team members sang project members thủ công
exports.manualSyncTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const currentUserId = req.user.userId;

    // Kiểm tra project tồn tại và user có quyền
    const project = await Project.findOne({ 
      _id: projectId, 
      is_deleted: false 
    }).populate('team_id');

    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Kiểm tra quyền: phải là creator của project hoặc Admin/Editor của team
    let hasPermission = project.created_by.toString() === currentUserId;

    if (!hasPermission && project.team_id) {
      const TeamMember = require('../models/teamMember.model');
      const teamMember = await TeamMember.findOne({
        team_id: project.team_id,
        user_id: currentUserId,
        role: { $in: ['Admin', 'Editor'] },
        is_active: true
      });
      hasPermission = !!teamMember;
    }

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền đồng bộ hóa thành viên cho dự án này' 
      });
    }

    if (!project.team_id) {
      return res.status(400).json({ 
        message: 'Dự án này chưa được gán cho team nào' 
      });
    }

    // Thực hiện đồng bộ
    const syncResult = await syncTeamMembersToProject(projectId, project.team_id);

    if (syncResult.success) {
      res.json({
        message: 'Đồng bộ hóa thành viên thành công',
        syncResult: {
          teamMembersCount: syncResult.teamMembersCount,
          newProjectMembersAdded: syncResult.newProjectMembersCount,
          existingProjectMembers: syncResult.existingProjectMembersCount,
          totalProjectMembersNow: syncResult.existingProjectMembersCount + syncResult.newProjectMembersCount
        }
      });
    } else {
      res.status(500).json({
        message: 'Lỗi khi đồng bộ hóa thành viên',
        error: syncResult.error
      });
    }

  } catch (error) {
    console.error('Error in manual sync team members:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
