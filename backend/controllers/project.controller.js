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
    
    return res.status(201).json({ 
        message: 'Tạo dự án và bảng Kanban thành công',
        project: populatedProject,
        kanban: savedKanban 
    });

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Lỗi server khi tạo dự án', error: error.message });
    }
  }
};

// Lấy danh sách dự án của user (bao gồm cả dự án được mời vào và dự án đã tạo) - WITH PAGINATION
exports.getMyProjects = async (req, res) => {
  const reqId = `[getMyProjects-${req.user.userId.slice(-4)}-${Date.now()}]`;
  const startTime = Date.now();
  
  console.log(`${reqId} [1] Bắt đầu lấy danh sách dự án (OPTIMIZED với pagination)...`);
  
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    
    // 🚀 PAGINATION PARAMETERS
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Giảm xuống 20 thay vì unlimited
    const skip = (page - 1) * limit;
    
    console.log(`${reqId} [2] Pagination: page=${page}, limit=${limit}, skip=${skip}`);

    // 🚀 SIMPLE CACHE for ProjectMember queries (1 minute cache)
    const cacheKey = `project_members_${userId}`;
    const now = Date.now();
    if (!global.projectMemberCache) global.projectMemberCache = {};
    
    let memberProjectIds;
    if (global.projectMemberCache[cacheKey] && (now - global.projectMemberCache[cacheKey].timestamp < 60000)) {
      console.log(`${reqId} [3] Using cached ProjectMember data...`);
      memberProjectIds = global.projectMemberCache[cacheKey].data;
    } else {
      console.log(`${reqId} [3] Đang truy vấn ProjectMember (lightweight)...`);
      const memberStart = Date.now();

      // Import ProjectMember model
      const ProjectMember = require('../models/projectMember.model');
      
      const userMemberships = await ProjectMember.find({ user_id: userId })
        .select('project_id') // CHỈ lấy project_id
        .lean(); // Sử dụng lean() để tăng performance
      
      console.log(`${reqId} [3] ProjectMember query completed in ${Date.now() - memberStart}ms. Found ${userMemberships.length} memberships.`);
      
      // Bước 2: Lấy danh sách project_id từ membership
      memberProjectIds = userMemberships.map(member => member.project_id);
      console.log(`${reqId} [4] Người dùng là thành viên của ${memberProjectIds.length} dự án.`);

      // Cache the result
      global.projectMemberCache[cacheKey] = {
        data: memberProjectIds,
        timestamp: now
      };
    }
    const totalCount = await Project.countDocuments({
      $or: [
        { '_id': { $in: memberProjectIds } }, // Dự án mà user là thành viên
        { 'created_by': userId } // Dự án mà user là người tạo
      ],
      'is_deleted': false // Chỉ lấy các dự án chưa bị xóa
    });

    console.log(`${reqId} [5] Total projects available: ${totalCount}. Getting page ${page} (${limit} items)`);

    // 🚀 OPTIMIZED QUERY với pagination và minimal populate
    console.log(`${reqId} [6] Đang truy vấn chi tiết các dự án (paginated)...`);
    const projectsStart = Date.now();
    
    const projects = await Project.find({
      $or: [
        { '_id': { $in: memberProjectIds } }, // Dự án mà user là thành viên
        { 'created_by': userId } // Dự án mà user là người tạo
      ],
      'is_deleted': false // Chỉ lấy các dự án chưa bị xóa
    })
    .select('project_name description status priority start_date end_date created_by project_type_id created_at updated_at') // CHỈ lấy fields cần thiết
    .populate('created_by', 'full_name email') // Minimal populate
    .populate('project_type_id', 'name') // Minimal populate
    .sort({ created_at: -1 }) // Sắp xếp theo ngày tạo mới nhất
    .skip(skip)
    .limit(limit)
    .lean(); // Sử dụng lean() để tăng performance

    console.log(`${reqId} [6] Projects query completed in ${Date.now() - projectsStart}ms. Found ${projects.length} projects for page ${page}.`);

    // 🚀 BACKWARD COMPATIBILITY: Trả về array trực tiếp nhưng với pagination headers
    // Frontend hiện tại expect projects là array, nên ta trả về array
    
    console.log(`${reqId} [FINAL] Chuẩn bị gửi response. Total time: ${Date.now() - startTime}ms`);
    
    // 🚀 PROTECTION: Kiểm tra response đã được gửi chưa
    if (!res.headersSent) {
      // Thêm pagination info vào headers để frontend có thể sử dụng
      res.set({
        'X-Current-Page': page.toString(),
        'X-Total-Pages': Math.ceil(totalCount / limit).toString(),
        'X-Total-Projects': totalCount.toString(),
        'X-Projects-Per-Page': limit.toString(),
        'X-Has-Next-Page': (page < Math.ceil(totalCount / limit)).toString(),
        'X-Has-Previous-Page': (page > 1).toString()
      });
      
      return res.status(200).json(projects); // Trả về array trực tiếp như trước
    } else {
      console.warn(`🚨 ${reqId} Headers already sent - skipping response`);
    }

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, {
      error: error.message,
      stack: error.stack,
      totalTime: Date.now() - startTime + 'ms'
    });
    
    // 🚀 PROTECTION: Kiểm tra response đã được gửi chưa trước khi gửi error
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: "Lỗi khi lấy danh sách dự án", 
        error: error.message,
        requestId: reqId
      });
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
    
    return res.status(200).json(project);

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Lỗi server khi lấy chi tiết dự án' });
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
    return res.status(500).json({ message: "Lỗi khi xóa dự án", error: error.message });
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

    return res.status(200).json({ message: 'Cập nhật dự án thành công', project: populatedProject });
  } catch (error) {
    console.error('Lỗi cập nhật dự án:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID dự án không hợp lệ' });
    }
    return res.status(500).json({ message: 'Lỗi khi cập nhật dự án', error: error.message });
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

// ==== GANTT CHART METHODS ====

// Lấy dữ liệu tasks cho Gantt Chart của một dự án cụ thể
exports.getGanttTasksForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // 1. Kiểm tra quyền truy cập dự án của người dùng
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án.' });
    }

    const isOwner = project.created_by.toString() === userId.toString();
    const ProjectMember = require('../models/projectMember.model');
    const member = await ProjectMember.findOne({ 
      project_id: projectId, 
      user_id: userId, 
      is_active: true 
    });

    if (!isOwner && !member) {
      // Kiểm tra quyền thông qua team nếu project thuộc về team
      if (project.team_id) {
        const TeamMember = require('../models/teamMember.model');
        const teamMember = await TeamMember.findOne({
          team_id: project.team_id,
          user_id: userId,
          is_active: true
        });
        
        if (!teamMember) {
          return res.status(403).json({ message: 'Bạn không có quyền xem dự án này.' });
        }
      } else {
        return res.status(403).json({ message: 'Bạn không có quyền xem dự án này.' });
      }
    }

    // 2. Tìm Kanban board của dự án này
    const Kanban = require('../models/kanban.model');
    const kanban = await Kanban.findOne({ project_id: projectId });
    
    if (!kanban) {
      return res.json({ 
        data: [], 
        links: [],
        project: {
          _id: project._id,
          project_name: project.project_name,
          start_date: project.start_date,
          end_date: project.end_date
        }
      });
    }

    // 3. Lấy tất cả các Task thuộc Kanban của dự án này
    const KanbanTask = require('../models/kanbanTask.model');
    const tasks = await KanbanTask.find({ kanban_id: kanban._id })
                                   .populate('assigned_to', 'full_name name')
                                   .populate('created_by', 'full_name name');

    // 4. Chuyển đổi dữ liệu sang định dạng mà thư viện Gantt Chart yêu cầu
    const ganttData = tasks.map(task => {
      let progress = 0;
      switch (task.status) {
        case 'Đang làm':
          progress = 0.5; // 50%
          break;
        case 'Hoàn thành':
          progress = 1; // 100%
          break;
        case 'Cần làm':
        default:
          progress = 0; // 0%
          break;
      }

      // Đảm bảo có ngày bắt đầu và kết thúc
      const startDate = task.start_date || project.start_date || new Date();
      const endDate = task.due_date || project.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 ngày

      return {
        id: task._id.toString(),
        text: task.title,
        start_date: startDate,
        end_date: endDate,
        progress: progress,
        status: task.status,
        priority: task.priority,
        assignee: task.assigned_to ? (task.assigned_to.full_name || task.assigned_to.name) : 'Chưa giao',
        created_by: task.created_by ? (task.created_by.full_name || task.created_by.name) : 'Unknown',
        color: task.color || '#ffffff',
        is_pinned: task.is_pinned || false,
        description: task.description || ''
      };
    });

    // 5. Lấy dependencies cho Gantt Chart
    const TaskDependency = require('../models/taskDependency.model');
    const dependencies = await TaskDependency.find({
      project_id: projectId,
      is_active: true
    });

    const ganttLinks = dependencies.map(dep => ({
      id: dep._id.toString(),
      source: dep.source_task_id.toString(),
      target: dep.target_task_id.toString(),
      type: getDependencyTypeNumber(dep.dependency_type),
      lag: dep.lag_days || 0
    }));

    res.status(200).json({
      data: ganttData,
      links: ganttLinks, // Giai đoạn 3: Trả về dependencies
      project: {
        _id: project._id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date
      }
    });

  } catch (error) {
    console.error('Error fetching Gantt tasks:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy dữ liệu Gantt.',
      error: error.message 
    });
  }
};

// API: Cập nhật task từ Gantt Chart
exports.updateGanttTask = async (req, res) => {
  try {
    console.log('Update Gantt Task request:', req.params, req.body);
    
    const { projectId, taskId } = req.params;
    const { 
      text, 
      start_date, 
      end_date, 
      progress, 
      status,
      priority,
      assignee 
    } = req.body;
    
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // 1. Kiểm tra quyền truy cập project
    const Project = require('../models/project.model');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Kiểm tra quyền sửa đổi
    const isOwner = project.created_by.toString() === userId.toString();
    
    let hasEditPermission = isOwner;
    
    if (!hasEditPermission) {
      const ProjectMember = require('../models/projectMember.model');
      const member = await ProjectMember.findOne({ 
        project_id: projectId, 
        user_id: userId, 
        is_active: true 
      });
      
      // Chỉ Admin và Editor mới có quyền chỉnh sửa từ Gantt
      if (member && ['Quản trị viên', 'Biên tập viên'].includes(member.role_in_project)) {
        hasEditPermission = true;
      }
      
      // Kiểm tra quyền thông qua team nếu cần
      if (!hasEditPermission && project.team_id) {
        const TeamMember = require('../models/teamMember.model');
        const teamMember = await TeamMember.findOne({
          team_id: project.team_id,
          user_id: userId,
          is_active: true
        });
        
        if (teamMember && ['admin', 'editor'].includes(teamMember.role.toLowerCase())) {
          hasEditPermission = true;
        }
      }
    }
    
    if (!hasEditPermission) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền chỉnh sửa task này. Chỉ Admin và Editor mới có quyền chỉnh sửa từ Gantt Chart.' 
      });
    }

    // 2. Tìm và cập nhật task
    const KanbanTask = require('../models/kanbanTask.model');
    const task = await KanbanTask.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }

    // 3. Validation dữ liệu
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate > endDate) {
        return res.status(400).json({ 
          message: 'Ngày bắt đầu không thể sau ngày kết thúc' 
        });
      }
      
      // Kiểm tra với ngày dự án
      if (project.start_date && startDate < new Date(project.start_date)) {
        return res.status(400).json({ 
          message: 'Ngày bắt đầu công việc không thể trước ngày bắt đầu dự án' 
        });
      }
      
      if (project.end_date && endDate > new Date(project.end_date)) {
        return res.status(400).json({ 
          message: 'Ngày kết thúc công việc không thể sau ngày kết thúc dự án' 
        });
      }
    }

    // 4. Chuyển đổi progress thành status
    let newStatus = task.status;
    if (progress !== undefined) {
      if (progress === 0) {
        newStatus = 'Cần làm';
      } else if (progress > 0 && progress < 1) {
        newStatus = 'Đang làm';
      } else if (progress === 1) {
        newStatus = 'Hoàn thành';
      }
    }
    
    // Override status nếu được cung cấp trực tiếp
    if (status) {
      newStatus = status;
    }

    // 5. Cập nhật task
    const updateData = {};
    if (text) updateData.title = text;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.due_date = new Date(end_date);
    if (newStatus) updateData.status = newStatus;
    if (priority) updateData.priority = priority;
    if (assignee) {
      // Tìm user bằng tên để lấy ID
      const User = require('../models/user.model');
      const assignedUser = await User.findOne({
        $or: [
          { name: assignee },
          { full_name: assignee }
        ]
      });
      if (assignedUser) {
        updateData.assigned_to = assignedUser._id;
      }
    }

    Object.assign(task, updateData);
    await task.save();

    // 6. Populate task để trả về thông tin đầy đủ
    const populatedTask = await KanbanTask.findById(task._id)
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents');

    // 7. Emit socket event để đồng bộ với Kanban board
    if (req.io) {
      const Kanban = require('../models/kanban.model');
      const kanban = await Kanban.findOne({ project_id: projectId });
      
      if (kanban) {
        // Lấy tất cả tasks để emit
        const allTasks = await KanbanTask.find({ kanban_id: kanban._id })
          .populate('assigned_to', 'name email avatar')
          .populate('created_by', 'name email avatar')
          .populate('documents')
          .sort({ is_pinned: -1, order: 1 });

        req.io.to(kanban._id.toString()).emit('kanban:updated', allTasks);
        req.io.to(projectId.toString()).emit('gantt:task_updated', populatedTask);
      }
    }

    console.log('✅ Task updated from Gantt Chart:', populatedTask.title);
    res.json({
      message: 'Cập nhật công việc thành công từ Gantt Chart',
      task: populatedTask
    });

  } catch (error) {
    console.error('Error updating Gantt task:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật công việc', 
      error: error.message 
    });
  }
};

// ==== GANTT DEPENDENCIES METHODS ====

// Lấy danh sách dependencies cho một dự án
exports.getGanttDependencies = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Kiểm tra quyền truy cập project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Kiểm tra quyền (tương tự như getGanttTasksForProject)
    const isOwner = project.created_by.toString() === userId.toString();
    const ProjectMember = require('../models/projectMember.model');
    const member = await ProjectMember.findOne({ 
      project_id: projectId, 
      user_id: userId, 
      is_active: true 
    });

    if (!isOwner && !member) {
      if (project.team_id) {
        const TeamMember = require('../models/teamMember.model');
        const teamMember = await TeamMember.findOne({
          team_id: project.team_id,
          user_id: userId,
          is_active: true
        });
        
        if (!teamMember) {
          return res.status(403).json({ message: 'Bạn không có quyền xem dự án này.' });
        }
      } else {
        return res.status(403).json({ message: 'Bạn không có quyền xem dự án này.' });
      }
    }

    // Lấy dependencies
    const TaskDependency = require('../models/taskDependency.model');
    const dependencies = await TaskDependency.find({
      project_id: projectId,
      is_active: true
    })
    .populate('source_task_id', '_id title')
    .populate('target_task_id', '_id title');

    // Chuyển đổi sang format cho dhtmlx-gantt
    const ganttLinks = dependencies.map(dep => ({
      id: dep._id.toString(),
      source: dep.source_task_id._id.toString(),
      target: dep.target_task_id._id.toString(),
      type: getDependencyTypeNumber(dep.dependency_type),
      lag: dep.lag_days
    }));

    res.json({
      links: ganttLinks,
      total: ganttLinks.length
    });

  } catch (error) {
    console.error('Error fetching Gantt dependencies:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy dependencies', 
      error: error.message 
    });
  }
};

// Tạo dependency mới
exports.createGanttDependency = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { source, target, type, lag } = req.body;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Kiểm tra quyền sửa đổi (tương tự updateGanttTask)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    const isOwner = project.created_by.toString() === userId.toString();
    let hasEditPermission = isOwner;
    
    if (!hasEditPermission) {
      const ProjectMember = require('../models/projectMember.model');
      const member = await ProjectMember.findOne({ 
        project_id: projectId, 
        user_id: userId, 
        is_active: true 
      });
      
      if (member && ['Quản trị viên', 'Biên tập viên'].includes(member.role_in_project)) {
        hasEditPermission = true;
      }
      
      if (!hasEditPermission && project.team_id) {
        const TeamMember = require('../models/teamMember.model');
        const teamMember = await TeamMember.findOne({
          team_id: project.team_id,
          user_id: userId,
          is_active: true
        });
        
        if (teamMember && ['admin', 'editor'].includes(teamMember.role.toLowerCase())) {
          hasEditPermission = true;
        }
      }
    }
    
    if (!hasEditPermission) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền tạo dependency' 
      });
    }

    // Validation
    if (!source || !target) {
      return res.status(400).json({ 
        message: 'Source và target task là bắt buộc' 
      });
    }

    if (source === target) {
      return res.status(400).json({ 
        message: 'Task không thể phụ thuộc vào chính nó' 
      });
    }

    // Kiểm tra tasks tồn tại
    const KanbanTask = require('../models/kanbanTask.model');
    const sourceTask = await KanbanTask.findById(source);
    const targetTask = await KanbanTask.findById(target);
    
    if (!sourceTask || !targetTask) {
      return res.status(404).json({ 
        message: 'Không tìm thấy task' 
      });
    }

    // Kiểm tra circular dependency
    const TaskDependency = require('../models/taskDependency.model');
    const existingPath = await checkCircularDependency(source, target, projectId);
    if (existingPath) {
      return res.status(400).json({ 
        message: 'Tạo dependency này sẽ gây ra vòng lặp phụ thuộc' 
      });
    }

    // Tạo dependency
    const dependency = new TaskDependency({
      project_id: projectId,
      source_task_id: source,
      target_task_id: target,
      dependency_type: getDependencyTypeString(type) || 'finish-to-start',
      lag_days: lag || 0,
      created_by: userId
    });

    await dependency.save();

    // Populate để trả về
    const populatedDep = await TaskDependency.findById(dependency._id)
      .populate('source_task_id', '_id title')
      .populate('target_task_id', '_id title');

    // Emit socket event
    if (req.io) {
      req.io.to(projectId.toString()).emit('gantt:dependency_created', {
        id: populatedDep._id.toString(),
        source: populatedDep.source_task_id._id.toString(),
        target: populatedDep.target_task_id._id.toString(),
        type: getDependencyTypeNumber(populatedDep.dependency_type)
      });
    }

    res.status(201).json({
      message: 'Tạo dependency thành công',
      dependency: {
        id: populatedDep._id.toString(),
        source: populatedDep.source_task_id._id.toString(),
        target: populatedDep.target_task_id._id.toString(),
        type: getDependencyTypeNumber(populatedDep.dependency_type),
        lag: populatedDep.lag_days
      }
    });

  } catch (error) {
    console.error('Error creating Gantt dependency:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi tạo dependency', 
      error: error.message 
    });
  }
};

// Xóa dependency
exports.deleteGanttDependency = async (req, res) => {
  try {
    const { projectId, dependencyId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Kiểm tra quyền (tương tự createGanttDependency)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    const isOwner = project.created_by.toString() === userId.toString();
    let hasEditPermission = isOwner;
    
    if (!hasEditPermission) {
      const ProjectMember = require('../models/projectMember.model');
      const member = await ProjectMember.findOne({ 
        project_id: projectId, 
        user_id: userId, 
        is_active: true 
      });
      
      if (member && ['Quản trị viên', 'Biên tập viên'].includes(member.role_in_project)) {
        hasEditPermission = true;
      }
      
      if (!hasEditPermission && project.team_id) {
        const TeamMember = require('../models/teamMember.model');
        const teamMember = await TeamMember.findOne({
          team_id: project.team_id,
          user_id: userId,
          is_active: true
        });
        
        if (teamMember && ['admin', 'editor'].includes(teamMember.role.toLowerCase())) {
          hasEditPermission = true;
        }
      }
    }
    
    if (!hasEditPermission) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền xóa dependency' 
      });
    }

    // Tìm và xóa dependency
    const TaskDependency = require('../models/taskDependency.model');
    const dependency = await TaskDependency.findOne({
      _id: dependencyId,
      project_id: projectId,
      is_active: true
    });

    if (!dependency) {
      return res.status(404).json({ 
        message: 'Không tìm thấy dependency' 
      });
    }

    dependency.is_active = false;
    await dependency.save();

    // Emit socket event
    if (req.io) {
      req.io.to(projectId.toString()).emit('gantt:dependency_deleted', {
        id: dependencyId
      });
    }

    res.json({
      message: 'Xóa dependency thành công'
    });

  } catch (error) {
    console.error('Error deleting Gantt dependency:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi xóa dependency', 
      error: error.message 
    });
  }
};

// Helper functions
function getDependencyTypeNumber(typeString) {
  const typeMap = {
    'finish-to-start': 0,
    'start-to-start': 1,
    'finish-to-finish': 2,
    'start-to-finish': 3
  };
  return typeMap[typeString] || 0;
}

function getDependencyTypeString(typeNumber) {
  const typeMap = {
    0: 'finish-to-start',
    1: 'start-to-start',
    2: 'finish-to-finish',
    3: 'start-to-finish'
  };
  return typeMap[typeNumber] || 'finish-to-start';
}

// Kiểm tra circular dependency
async function checkCircularDependency(sourceId, targetId, projectId) {
  const TaskDependency = require('../models/taskDependency.model');
  
  // BFS để tìm đường từ target về source
  const visited = new Set();
  const queue = [targetId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    if (currentId === sourceId) {
      return true; // Tìm thấy vòng lặp
    }
    
    // Tìm tất cả dependencies có target là currentId
    const dependencies = await TaskDependency.find({
      project_id: projectId,
      target_task_id: currentId,
      is_active: true
    });
    
    for (const dep of dependencies) {
      if (!visited.has(dep.source_task_id.toString())) {
        queue.push(dep.source_task_id.toString());
      }
    }
  }
  
  return false;
}

// API: Tự động sắp xếp lại thời gian tasks dựa trên dependencies
exports.autoScheduleGanttTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Kiểm tra quyền sửa đổi (tương tự updateGanttTask)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    const isOwner = project.created_by.toString() === userId.toString();
    let hasEditPermission = isOwner;
    
    if (!hasEditPermission) {
      const ProjectMember = require('../models/projectMember.model');
      const projectMember = await ProjectMember.findOne({
        project_id: projectId,
        user_id: userId,
        is_active: true
      });
      if (projectMember && ['Quản trị viên', 'Biên tập viên'].includes(projectMember.role_in_project)) {
        hasEditPermission = true;
      } else if (project.team_id) {
        const TeamMember = require('../models/teamMember.model');
        const teamMember = await TeamMember.findOne({
          team_id: project.team_id,
          user_id: userId,
          is_active: true
        });
        if (teamMember && ['admin', 'editor'].includes(teamMember.role.toLowerCase())) {
          hasEditPermission = true;
        }
      }
    }
    
    if (!hasEditPermission) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền tự động sắp xếp lịch trình' 
      });
    }

    // Lấy tất cả tasks và dependencies
    const KanbanTask = require('../models/kanbanTask.model');
    const TaskDependency = require('../models/taskDependency.model');
    
    const tasks = await KanbanTask.find({
      project_id: projectId,
      is_active: true
    }).sort({ created_at: 1 });

    const dependencies = await TaskDependency.find({
      project_id: projectId,
      is_active: true
    });

    // Tạo map để truy cập task nhanh bằng ID
    const taskMap = new Map(tasks.map(task => [task._id.toString(), task]));

    // Tạo graph và inDegree
    const graph = new Map(); // key: source_task_id, value: array of { target, type, lag }
    const inDegree = new Map(); // key: task_id, value: count of incoming dependencies
    tasks.forEach(task => {
      const taskId = task._id.toString();
      graph.set(taskId, []);
      inDegree.set(taskId, 0);
    });
    dependencies.forEach(dep => {
      const source = dep.source_task_id.toString();
      const target = dep.target_task_id.toString();
      if (taskMap.has(source) && taskMap.has(target)) {
        graph.get(source).push({
          target: target,
          type: dep.dependency_type, // 'finish-to-start', ...
          lag: dep.lag_days || 0
        });
        inDegree.set(target, inDegree.get(target) + 1);
      }
    });

    // Topological sort (Kahn's algorithm)
    const queue = [];
    inDegree.forEach((degree, taskId) => {
      if (degree === 0) queue.push(taskId);
    });
    const sortedTasks = [];
    while (queue.length > 0) {
      const currentTaskId = queue.shift();
      sortedTasks.push(currentTaskId);
      const dependentTasks = graph.get(currentTaskId) || [];
      dependentTasks.forEach(dep => {
        inDegree.set(dep.target, inDegree.get(dep.target) - 1);
        if (inDegree.get(dep.target) === 0) {
          queue.push(dep.target);
        }
      });
    }

    // Khởi tạo ngày bắt đầu/kết thúc sớm nhất cho mỗi task
    const earliestStartDates = new Map();
    const earliestEndDates = new Map();
    tasks.forEach(task => {
      const initialStartDate = task.start_date ? new Date(task.start_date) : new Date(project.start_date || new Date());
      initialStartDate.setHours(0,0,0,0);
      earliestStartDates.set(task._id.toString(), initialStartDate);
      const taskDuration = task.due_date && task.start_date 
        ? Math.ceil((new Date(task.due_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24)) 
        : 1;
      const initialEndDate = new Date(initialStartDate);
      initialEndDate.setDate(initialEndDate.getDate() + Math.max(taskDuration, 1));
      earliestEndDates.set(task._id.toString(), initialEndDate);
    });

    // Lặp qua các task theo thứ tự topological
    let head = 0;
    while (head < sortedTasks.length) {
      const currentTaskId = sortedTasks[head++];
      const currentTask = taskMap.get(currentTaskId);
      if (!currentTask) continue;
      let currentTaskEarliestStart = earliestStartDates.get(currentTaskId);
      let currentTaskEarliestEnd = earliestEndDates.get(currentTaskId);
      const dependentTasks = graph.get(currentTaskId) || [];
      for (const dep of dependentTasks) {
        const dependentTask = taskMap.get(dep.target);
        if (!dependentTask) continue;
        let potentialStartDateForDependent;
        if (dep.type === 'finish-to-start') {
          potentialStartDateForDependent = new Date(currentTaskEarliestEnd);
          potentialStartDateForDependent.setDate(potentialStartDateForDependent.getDate() + (dep.lag || 0));
        } else if (dep.type === 'start-to-start') {
          potentialStartDateForDependent = new Date(currentTaskEarliestStart);
          potentialStartDateForDependent.setDate(potentialStartDateForDependent.getDate() + (dep.lag || 0));
        } else if (dep.type === 'finish-to-finish') {
          const sourceFinishDate = new Date(currentTaskEarliestEnd);
          sourceFinishDate.setDate(sourceFinishDate.getDate() + (dep.lag || 0));
          const dependentTaskDuration = dependentTask.due_date && dependentTask.start_date
            ? Math.ceil((new Date(dependentTask.due_date).getTime() - new Date(dependentTask.start_date).getTime()) / (1000 * 60 * 60 * 24))
            : 1;
          potentialStartDateForDependent = new Date(sourceFinishDate);
          potentialStartDateForDependent.setDate(potentialStartDateForDependent.getDate() - Math.max(dependentTaskDuration, 1));
        } else if (dep.type === 'start-to-finish') {
          const sourceStartDate = new Date(currentTaskEarliestStart);
          sourceStartDate.setDate(sourceStartDate.getDate() + (dep.lag || 0));
          const dependentTaskDuration = dependentTask.due_date && dependentTask.start_date
            ? Math.ceil((new Date(dependentTask.due_date).getTime() - new Date(dependentTask.start_date).getTime()) / (1000 * 60 * 60 * 24))
            : 1;
          potentialStartDateForDependent = new Date(sourceStartDate);
          potentialStartDateForDependent.setDate(potentialStartDateForDependent.getDate() - Math.max(dependentTaskDuration, 1));
        } else {
          potentialStartDateForDependent = new Date(currentTaskEarliestEnd);
          potentialStartDateForDependent.setDate(potentialStartDateForDependent.getDate() + (dep.lag || 0));
        }
        const existingDependentTaskStartDate = earliestStartDates.get(dependentTask._id.toString());
        if (potentialStartDateForDependent > existingDependentTaskStartDate) {
          earliestStartDates.set(dependentTask._id.toString(), potentialStartDateForDependent);
        }
      }
    }

    // Cập nhật ngày tháng của tất cả các task dựa trên earliestStartDates và duration
    const updatedTasks = [];
    for (const taskId of sortedTasks) {
      const task = taskMap.get(taskId);
      if (!task) continue;
      let newStartDate = earliestStartDates.get(taskId) || new Date(task.start_date || project.start_date || new Date());
      newStartDate.setHours(0,0,0,0);
      const taskDuration = task.due_date && task.start_date 
        ? Math.ceil((new Date(task.due_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24)) 
        : 1;
      let newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + Math.max(taskDuration, 1));
      task.start_date = newStartDate;
      task.due_date = newEndDate;
      await task.save();
      updatedTasks.push({
        id: task._id.toString(),
        title: task.title,
        start_date: newStartDate,
        due_date: newEndDate,
        progress: task.progress,
        status: task.status
      });
    }

    console.log(`✅ Auto-scheduled ${updatedTasks.length} tasks for project ${projectId}`);
    if (req.io) {
      req.io.to(projectId.toString()).emit('gantt:auto_scheduled', {
        projectId,
        updatedTasks: updatedTasks.length,
        message: 'Lịch trình đã được tự động sắp xếp',
        tasks: updatedTasks
      });
    }
    res.json({
      message: `Tự động sắp xếp thành công ${updatedTasks.length} công việc`,
      updatedTasks: updatedTasks.length,
      tasks: updatedTasks
    });
  } catch (error) {
    console.error('Error auto-scheduling Gantt tasks:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi tự động sắp xếp lịch trình', 
      error: error.message 
    });
  }
};
