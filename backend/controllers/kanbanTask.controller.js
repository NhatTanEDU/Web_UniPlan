const KanbanTask = require('../models/kanbanTask.model');
const Kanban = require('../models/kanban.model');
const ProjectMember = require('../models/projectMember.model');
const Project = require('../models/project.model');

// Tạo task mới
exports.createTask = async (req, res) => {
  try {
    console.log('Create Task request:', req.body);
    console.log('User:', req.user);

    const { kanban_id, title, description, status, due_date, priority } = req.body;
    const userId = req.user._id;

    // Kiểm tra kanban có tồn tại
    const kanban = await Kanban.findById(kanban_id);
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
      // Lấy số lượng task hiện tại để set order
      const taskCount = await KanbanTask.countDocuments({ kanban_id });
      
      // Tạo task mới
      const task = new KanbanTask({
        kanban_id,
        title,
        description,
        status: status || 'Cần làm',
        order: taskCount + 1,
        due_date,
        created_by: userId,
        priority: priority || 'Trung bình'
      });

      await task.save();
      console.log('Created task:', task);

      // Emit socket event
      if (req.io) {
        req.io.to(kanban_id.toString()).emit('task:created', task);
      }

      return res.status(201).json(task);
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

    // Lấy số lượng task hiện tại để set order
    const taskCount = await KanbanTask.countDocuments({ kanban_id });
    
    // Tạo task mới
    const task = new KanbanTask({
      kanban_id,
      title,
      description,
      status: status || 'Cần làm',
      order: taskCount + 1,
      due_date,
      created_by: userId,
      priority: priority || 'Trung bình'
    });

    await task.save();
    console.log('Created task:', task);

    // Emit socket event
    if (req.io) {
      req.io.to(kanban_id.toString()).emit('task:created', task);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật task
exports.updateTask = async (req, res) => {
  try {
    console.log('Update Task request:', req.params, req.body);
    console.log('User:', req.user);

    const { id } = req.params;
    const { title, description, status, due_date, priority, assigned_to } = req.body;
    const userId = req.user._id;

    const task = await KanbanTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }

    // Kiểm tra quyền truy cập
    const kanban = await Kanban.findById(task.kanban_id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban' });
    }

    const project = await Project.findById(kanban.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Nếu là người tạo dự án thì cho phép
    if (project.created_by.toString() === userId.toString()) {
      // Cập nhật task
      task.title = title || task.title;
      task.description = description || task.description;
      task.status = status || task.status;
      task.due_date = due_date || task.due_date;
      task.priority = priority || task.priority;
      task.assigned_to = assigned_to || task.assigned_to;

      await task.save();
      console.log('Updated task:', task);

      // Emit socket event
      if (req.io) {
        req.io.to(task.kanban_id.toString()).emit('task:updated', task);
      }

      return res.json(task);
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
      return res.status(403).json({ message: 'Chỉ Quản trị viên mới có quyền cập nhật task' });
    }

    // Cập nhật task
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.due_date = due_date || task.due_date;
    task.priority = priority || task.priority;
    task.assigned_to = assigned_to || task.assigned_to;

    await task.save();
    console.log('Updated task:', task);

    // Emit socket event
    if (req.io) {
      req.io.to(task.kanban_id.toString()).emit('task:updated', task);
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa task
exports.deleteTask = async (req, res) => {
  try {
    console.log('Delete Task request:', req.params);
    console.log('User:', req.user);

    const { id } = req.params;
    const userId = req.user._id;

    const task = await KanbanTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }

    // Kiểm tra quyền truy cập
    const kanban = await Kanban.findById(task.kanban_id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban' });
    }

    const project = await Project.findById(kanban.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Nếu là người tạo dự án thì cho phép
    if (project.created_by.toString() === userId.toString()) {
      await task.remove();
      console.log('Deleted task:', id);

      // Emit socket event
      if (req.io) {
        req.io.to(task.kanban_id.toString()).emit('task:deleted', { id });
      }

      return res.json({ message: 'Xóa task thành công' });
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
      return res.status(403).json({ message: 'Chỉ Quản trị viên mới có quyền xóa task' });
    }

    await task.remove();
    console.log('Deleted task:', id);

    // Emit socket event
    if (req.io) {
      req.io.to(task.kanban_id.toString()).emit('task:deleted', { id });
    }

    res.json({ message: 'Xóa task thành công' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật vị trí task (kéo thả)
exports.updateTaskOrder = async (req, res) => {
  try {
    console.log('Update Task Order request:', req.body);
    console.log('User:', req.user);

    const { taskId, newStatus, newOrder } = req.body;
    const userId = req.user._id;

    const task = await KanbanTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }

    // Kiểm tra quyền truy cập
    const kanban = await Kanban.findById(task.kanban_id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban' });
    }

    const project = await Project.findById(kanban.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    // Nếu là người tạo dự án thì cho phép
    if (project.created_by.toString() === userId.toString()) {
      // Cập nhật vị trí và trạng thái
      task.status = newStatus;
      task.order = newOrder;
      await task.save();

      console.log('Updated task order:', task);

      // Emit socket event
      if (req.io) {
        req.io.to(task.kanban_id.toString()).emit('task:reordered', task);
      }

      return res.json(task);
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

    // Cập nhật vị trí và trạng thái
    task.status = newStatus;
    task.order = newOrder;
    await task.save();

    console.log('Updated task order:', task);

    // Emit socket event
    if (req.io) {
      req.io.to(task.kanban_id.toString()).emit('task:reordered', task);
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task order:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 