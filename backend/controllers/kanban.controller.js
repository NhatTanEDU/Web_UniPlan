const Kanban = require('../models/kanban.model');
const KanbanTask = require('../models/kanbanTask.model');
const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');
const mongoose = require('mongoose');

// Tạo bảng Kanban mới
exports.createKanban = async (req, res) => {
  const { project_id, name, description } = req.body;
  const userId = req.user.userId || req.user.id;
  const reqId = `[createKanban-${project_id?.slice(-4) || 'unknown'}-${Date.now()}]`;

  console.log(`${reqId} [1] Bắt đầu tạo Kanban cho project: ${project_id}`);
  try {
    // Validate ObjectId format for project_id
    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      console.warn(`${reqId} [FAIL] Invalid project_id format: ${project_id}`);
      return res.status(400).json({ message: 'ID dự án không hợp lệ' });
    }

    // Validate ObjectId format for userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn(`${reqId} [FAIL] Invalid userId format: ${userId}`);
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    // Convert to proper ObjectId instances
    const projectObjectId = new mongoose.Types.ObjectId(project_id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Bước 1: Kiểm tra dự án tồn tại
    console.log(`${reqId} [2] Đang kiểm tra project tồn tại...`);
    const project = await Project.findById(projectObjectId);
    if (!project) {
      console.warn(`${reqId} [FAIL] Không tìm thấy dự án với ID: ${project_id}`);
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }
    console.log(`${reqId} [3] Project tồn tại: ${project.project_name}`);

    // Bước 2: Kiểm tra xem người dùng có phải là thành viên của dự án không
    console.log(`${reqId} [4] Đang kiểm tra quyền thành viên của user ${userId} trong project ${project_id}...`);
    
    // Kiểm tra nếu là người tạo dự án
    const isOwner = project.created_by.toString() === userObjectId.toString();
    
    let isMember = false;
    let membershipRole = null;
    if (!isOwner) {
      const membership = await ProjectMember.findOne({
        project_id: projectObjectId,
        user_id: userObjectId,
        is_active: true
      });
      isMember = !!membership;
      membershipRole = membership?.role_in_project;
    }

    // Nếu không phải là owner và cũng không phải member, từ chối ngay
    if (!isOwner && !isMember) {
      console.warn(`${reqId} [FAIL] User không phải là thành viên của dự án.`);
      return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này để có thể tạo bảng Kanban.' });
    }
    console.log(`${reqId} [5] User có quyền truy cập. Owner: ${isOwner}, Member: ${isMember}, Role: ${membershipRole}`);

    // Bước 3: Kiểm tra xem dự án đã có bảng Kanban chưa để tránh tạo trùng
    console.log(`${reqId} [6] Đang kiểm tra Kanban đã tồn tại cho dự án chưa...`);
    const existingKanban = await Kanban.findOne({ project_id: projectObjectId });
    if (existingKanban) {
      console.warn(`${reqId} [FAIL] Dự án đã có bảng Kanban.`);
      return res.status(409).json({ message: 'Mỗi dự án chỉ có thể có một bảng Kanban.' });
    }
    console.log(`${reqId} [7] Dự án chưa có Kanban. Tiến hành tạo mới.`);

    // Bước 4: Tạo bảng Kanban mới
    const newKanban = new Kanban({
      project_id: projectObjectId,
      name: name || `Kanban - ${project.project_name}`,
      description: description || 'Bảng quản lý công việc chính',
      created_by: userObjectId,
      status: 'Active',
      columns: [ // Thêm các cột mặc định
        { name: 'Cần làm', taskIds: [] },
        { name: 'Đang làm', taskIds: [] },
        { name: 'Hoàn thành', taskIds: [] }
      ]
    });

    const savedKanban = await newKanban.save();
    console.log(`${reqId} [FINAL] Đã tạo Kanban thành công với ID: ${savedKanban._id}`);
    
    // Emit socket event
    if (req.io) {
      req.io.to(project_id.toString()).emit('kanban:created', savedKanban);
    }
    
    res.status(201).json(savedKanban);

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server khi tạo bảng Kanban', error: error.message });
    }
  }
};

// Lấy thông tin bảng Kanban
exports.getKanban = async (req, res) => {
  try {
    console.log('Get Kanban request:', req.params);
    console.log('User:', req.user);

    const { id } = req.params;
    const userId = req.user._id;

    const kanban = await Kanban.findById(id);
    console.log('Found kanban:', kanban);

    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban' });
    }

    // Lấy tên dự án từ project_id
    const project = await Project.findById(kanban.project_id);
    let project_name = '';
    if (project) {
      project_name = project.project_name;
    }

    // Lấy tất cả tasks của bảng này
    const tasks = await KanbanTask.find({ kanban_id: id })
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email')
      .populate('tags', 'name color')
      .populate('documents')
      .sort('order');

    console.log('Found tasks:', tasks);

    res.json({ kanban, tasks, project_name });
  } catch (error) {
    console.error('Error getting kanban:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật bảng Kanban
exports.updateKanban = async (req, res) => {
  try {
    console.log('Update Kanban request:', req.params, req.body);
    console.log('User:', req.user);

    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const kanban = await Kanban.findById(id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban' });
    }

    // Kiểm tra quyền truy cập
    const project = await Project.findById(kanban.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Nếu là người tạo dự án thì cho phép
    if (project.created_by.toString() === userId.toString()) {
      kanban.name = name || kanban.name;
      kanban.description = description || kanban.description;

      await kanban.save();
      console.log('Updated kanban:', kanban);

      // Emit socket event
      if (req.io) {
        req.io.to(kanban.project_id.toString()).emit('kanban:updated', kanban);
      }

      return res.json(kanban);
    }

    // Kiểm tra quyền thành viên
    const projectMember = await ProjectMember.findOne({
      project_id: kanban.project_id,
      user_id: userId,
      is_active: true
    });

    if (!projectMember) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Chỉ Admin mới có quyền cập nhật
    if (projectMember.role_in_project !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ Quản trị viên mới có quyền cập nhật bảng Kanban' });
    }

    kanban.name = name || kanban.name;
    kanban.description = description || kanban.description;

    await kanban.save();
    console.log('Updated kanban:', kanban);

    // Emit socket event
    if (req.io) {
      req.io.to(kanban.project_id.toString()).emit('kanban:updated', kanban);
    }

    res.json(kanban);
  } catch (error) {
    console.error('Error updating kanban:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa bảng Kanban
exports.deleteKanban = async (req, res) => {
  try {
    console.log('Delete Kanban request:', req.params);
    console.log('User:', req.user);

    const { id } = req.params;
    const userId = req.user._id;

    const kanban = await Kanban.findById(id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban' });
    }

    // Kiểm tra quyền truy cập
    const project = await Project.findById(kanban.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Nếu là người tạo dự án thì cho phép
    if (project.created_by.toString() === userId.toString()) {
      await kanban.remove();
      console.log('Deleted kanban:', id);

      // Emit socket event
      if (req.io) {
        req.io.to(kanban.project_id.toString()).emit('kanban:deleted', { id });
      }

      return res.json({ message: 'Xóa bảng Kanban thành công' });
    }

    // Kiểm tra quyền thành viên
    const projectMember = await ProjectMember.findOne({
      project_id: kanban.project_id,
      user_id: userId,
      is_active: true
    });

    if (!projectMember) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Chỉ Admin mới có quyền xóa
    if (projectMember.role_in_project !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ Quản trị viên mới có quyền xóa bảng Kanban' });
    }

    await kanban.remove();
    console.log('Deleted kanban:', id);

    // Emit socket event
    if (req.io) {
      req.io.to(kanban.project_id.toString()).emit('kanban:deleted', { id });
    }

    res.json({ message: 'Xóa bảng Kanban thành công' });
  } catch (error) {
    console.error('Error deleting kanban:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tìm bảng Kanban theo project ID
exports.findKanbanByProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId || req.user.id || req.user._id;
  const reqId = `[findKanban-${projectId?.slice(-4) || 'unknown'}-${Date.now()}]`;

  console.log(`${reqId} [1] Tìm Kanban cho project: ${projectId}, user: ${userId}`);
  
  try {
    // Validate ObjectId format for project_id
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.warn(`${reqId} [FAIL] Invalid projectId format: ${projectId}`);
      return res.status(400).json({ message: 'ID dự án không hợp lệ' });
    }

    // Validate ObjectId format for userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn(`${reqId} [FAIL] Invalid userId format: ${userId}`);
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    // Convert to proper ObjectId instances
    const projectObjectId = new mongoose.Types.ObjectId(projectId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Bước 1: Kiểm tra dự án tồn tại và quyền truy cập
    console.log(`${reqId} [2] Đang kiểm tra project tồn tại và quyền truy cập...`);
    const project = await Project.findById(projectObjectId);
    if (!project) {
      console.warn(`${reqId} [FAIL] Không tìm thấy dự án với ID: ${projectId}`);
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Bước 2: Kiểm tra quyền truy cập của user
    const isOwner = project.created_by.toString() === userObjectId.toString();
    let isMember = false;
    
    if (!isOwner) {
      const membership = await ProjectMember.findOne({
        project_id: projectObjectId,
        user_id: userObjectId,
        is_active: true
      });
      isMember = !!membership;
    }

    if (!isOwner && !isMember) {
      console.warn(`${reqId} [FAIL] User không có quyền truy cập dự án.`);
      return res.status(403).json({ message: 'Bạn không có quyền truy cập dự án này.' });
    }
    
    console.log(`${reqId} [3] User có quyền truy cập. Owner: ${isOwner}, Member: ${isMember}`);

    // Bước 3: Tìm Kanban cho dự án
    console.log(`${reqId} [4] Đang tìm Kanban cho project...`);
    const kanban = await Kanban.findOne({ project_id: projectObjectId });
    
    if (!kanban) {
      console.log(`${reqId} [RESULT] Không tìm thấy Kanban cho dự án.`);
      return res.status(404).json({ 
        message: 'Chưa có bảng Kanban cho dự án này',
        found: false
      });
    }

    // Bước 4: Lấy thêm thông tin chi tiết nếu cần
    const tasks = await KanbanTask.find({ kanban_id: kanban._id })
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email')
      .populate('tags', 'name color')
      .populate('documents') // <-- **THÊM DÒNG NÀY**
      .sort({ is_pinned: -1, order: 1 }); // Dùng cách sort mới cho nhất quán

    console.log(`${reqId} [SUCCESS] Tìm thấy Kanban với ID: ${kanban._id}, có ${tasks.length} tasks`);
    
    res.status(200).json({
      found: true,
      kanban,
      tasks,
      project_name: project.project_name
    });

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Lỗi server khi tìm bảng Kanban', 
        error: error.message 
      });
    }
  }
};

// Tìm bảng Kanban theo Project ID
exports.getKanbanByProjectId = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId || req.user.id;
  const reqId = `[getKanbanByProject-${projectId?.slice(-4) || 'unknown'}-${Date.now()}]`;

  console.log(`${reqId} [1] Đang tìm Kanban cho project: ${projectId}`);
  try {
    // Bước 1: Kiểm tra dự án tồn tại và quyền truy cập
    console.log(`${reqId} [2] Đang kiểm tra project tồn tại và quyền truy cập...`);
    const project = await Project.findById(projectId);
    if (!project) {
      console.warn(`${reqId} [FAIL] Không tìm thấy dự án với ID: ${projectId}`);
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Bước 2: Kiểm tra quyền truy cập (giống logic trong createKanban)
    const isOwner = project.created_by.toString() === userId.toString();
    let isMember = false;
    
    if (!isOwner) {
      const membership = await ProjectMember.findOne({
        project_id: new mongoose.Types.ObjectId(projectId),
        user_id: new mongoose.Types.ObjectId(userId),
        is_active: true
      });
      isMember = !!membership;
    }

    if (!isOwner && !isMember) {
      console.warn(`${reqId} [FAIL] User không có quyền truy cập dự án.`);
      return res.status(403).json({ message: 'Bạn không có quyền truy cập dự án này.' });
    }
    console.log(`${reqId} [3] User có quyền truy cập. Owner: ${isOwner}, Member: ${isMember}`);

    // Bước 3: Tìm Kanban cho dự án
    console.log(`${reqId} [4] Đang tìm Kanban cho dự án...`);
    let kanban = await Kanban.findOne({ project_id: projectId });

    if (!kanban) {
      console.log(`${reqId} [RESULT] Không tìm thấy Kanban cho dự án này. Tự động tạo mới!`);
      // Tạo Kanban mới cho project này
      kanban = new Kanban({
        project_id: projectId,
        name: `Bảng Kanban cho ${project.project_name}`,
        created_by: userId
      });
      await kanban.save();
      // Cập nhật lại project.kanban_id
      project.kanban_id = kanban._id;
      await project.save();
      // Tasks sẽ là mảng rỗng
      const tasks = [];
      return res.status(201).json({
        kanban,
        tasks,
        project_name: project.project_name,
        found: true,
        autoCreated: true
      });
    }

    // Bước 4: Lấy thêm thông tin tasks nếu có
    console.log(`${reqId} [5] Tìm thấy Kanban, đang lấy tasks...`);
    const tasks = await KanbanTask.find({ kanban_id: kanban._id })
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email')
      .populate('tags', 'name color')
      .populate('documents')
      .sort('order');

    console.log(`${reqId} [FINAL] Đã tìm thấy Kanban với ${tasks.length} tasks`);
    res.status(200).json({ 
      kanban, 
      tasks, 
      project_name: project.project_name,
      found: true 
    });

  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng trong ${reqId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server khi tìm bảng Kanban', error: error.message });
    }
  }
};