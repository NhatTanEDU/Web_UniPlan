const Kanban = require('../models/kanban.model');
const KanbanTask = require('../models/kanbanTask.model');
const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');

// Tạo bảng Kanban mới
exports.createKanban = async (req, res) => {
  try {
    console.log('Create Kanban request:', req.body);
    console.log('User:', req.user);

    const { project_id, name, description } = req.body;
    const userId = req.user._id;

    // Kiểm tra quyền truy cập
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Nếu là người tạo dự án thì cho phép
    if (project.created_by.toString() === userId.toString()) {
      const kanban = new Kanban({
        project_id,
        name,
        description,
        created_by: userId
      });

      await kanban.save();
      console.log('Created kanban:', kanban);

      // Emit socket event
      if (req.io) {
        req.io.to(project_id.toString()).emit('kanban:created', kanban);
      }

      return res.status(201).json(kanban);
    }

    // Kiểm tra quyền thành viên
    const projectMember = await ProjectMember.findOne({
      project_id,
      user_id: userId,
      is_active: true
    });

    if (!projectMember) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Chỉ Admin mới có quyền tạo
    if (projectMember.role_in_project !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ Quản trị viên mới có quyền tạo bảng Kanban' });
    }

    const kanban = new Kanban({
      project_id,
      name,
      description,
      created_by: userId
    });

    await kanban.save();
    console.log('Created kanban:', kanban);

    // Emit socket event
    if (req.io) {
      req.io.to(project_id.toString()).emit('kanban:created', kanban);
    }

    res.status(201).json(kanban);
  } catch (error) {
    console.error('Error creating kanban:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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

    // Lấy tất cả tasks của bảng này
    const tasks = await KanbanTask.find({ kanban_id: id })
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email')
      .populate('tags', 'name color')
      .sort('order');

    console.log('Found tasks:', tasks);

    res.json({ kanban, tasks });
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