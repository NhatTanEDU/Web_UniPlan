const KanbanTask = require('../models/kanbanTask.model');
const Kanban = require('../models/kanban.model');
const ProjectMember = require('../models/projectMember.model');
const Project = require('../models/project.model');
const Counter = require('../models/counter.model');
const Notification = require('../models/notification.model');
const { predictTaskRisk } = require('../../services/ai.service');

// Helper function to check user permissions for kanban tasks
const canModifyTask = async (userId, kanbanId, requiredPermission = 'edit') => {
  try {
    const kanban = await Kanban.findById(kanbanId);
    if (!kanban) {
      return { hasPermission: false, error: 'Không tìm thấy bảng Kanban' };
    }

    const project = await Project.findById(kanban.project_id);
    if (!project) {
      return { hasPermission: false, error: 'Không tìm thấy dự án' };
    }

    // Check if user is project owner - full permissions
    if (project.created_by.toString() === userId.toString()) {
      return { hasPermission: true, role: 'Quản trị viên', project };
    }

    // Check project member role
    const projectMember = await ProjectMember.findOne({
      project_id: kanban.project_id,
      user_id: userId,
      is_active: true
    });

    if (!projectMember) {
      return { hasPermission: false, error: 'Không có quyền truy cập dự án' };
    }

    const userRole = projectMember.role_in_project;

    // Define permissions based on role and required action
    const permissions = {
      'Quản trị viên': ['create', 'edit', 'delete', 'pin', 'move'],
      'Biên tập viên': ['edit', 'delete', 'pin', 'move'],
      'Người xem': ['move'] // Only can move tasks (change status)
    };

    const userPermissions = permissions[userRole] || [];
    const hasPermission = userPermissions.includes(requiredPermission);

    return { 
      hasPermission, 
      role: userRole, 
      project,
      availablePermissions: userPermissions 
    };
  } catch (error) {
    console.error('Error checking task permissions:', error);
    return { hasPermission: false, error: 'Lỗi kiểm tra quyền truy cập' };
  }
};

// Toggle pin/unpin task
exports.toggleTaskPin = async (req, res) => {
  try {
    console.log('Toggle Task Pin request:', req.params);
    console.log('User:', req.user);

    const { id } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    const task = await KanbanTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }

    // Check pin permission
    const permissionCheck = await canModifyTask(userId, task.kanban_id, 'pin');
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({ 
        message: permissionCheck.error || 'Không có quyền ghim/bỏ ghim task',
        userRole: permissionCheck.role 
      });
    }

    // Toggle pin status
    task.is_pinned = !task.is_pinned;
    await task.save();

    // Populate task info
    const populatedTask = await KanbanTask.findById(task._id)
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents');

    // Emit socket event với toàn bộ danh sách task
    if (req.io) {
      const allTasksInKanban = await KanbanTask.find({ kanban_id: task.kanban_id })
        .populate('assigned_to', 'name email avatar')
        .populate('created_by', 'name email avatar')
        .populate('documents') // <-- **THÊM DÒNG NÀY**
        .sort({ is_pinned: -1, order: 1 });

      req.io.to(task.kanban_id.toString()).emit('kanban:updated', allTasksInKanban);
    }

    res.json(populatedTask);
  } catch (error) {
    console.error('Error toggling task pin:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo task mới
exports.createTask = async (req, res) => {
  try {
    console.log('Create Task request:', req.body);
    console.log('User:', req.user);

    const { kanban_id, title, description, status, start_date, due_date, priority, assigned_to, color, is_pinned } = req.body;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Check create permission
    const permissionCheck = await canModifyTask(userId, kanban_id, 'create');
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({ 
        message: permissionCheck.error || 'Không có quyền tạo task mới. Chỉ Admin và Editor mới có thể tạo task.',
        userRole: permissionCheck.role 
      });
    }

    const project = permissionCheck.project;

    // Validation ngày tháng
    if (start_date && due_date) {
      const startDate = new Date(start_date);
      const dueDate = new Date(due_date);
      
      if (startDate > dueDate) {
        return res.status(400).json({ 
          message: 'Ngày bắt đầu không thể sau ngày kết thúc' 
        });
      }
    }

    // Validation với ngày dự án
    if (start_date && project.start_date) {
      const taskStartDate = new Date(start_date);
      const projectStartDate = new Date(project.start_date);
      
      if (taskStartDate < projectStartDate) {
        return res.status(400).json({ 
          message: 'Ngày bắt đầu task không thể trước ngày bắt đầu dự án' 
        });
      }
    }

    if (due_date && project.end_date) {
      const taskDueDate = new Date(due_date);
      const projectEndDate = new Date(project.end_date);
      
      if (taskDueDate > projectEndDate) {
        return res.status(400).json({ 
          message: 'Ngày kết thúc task không thể sau ngày kết thúc dự án' 
        });
      }
    }

    // Lấy thông tin kanban
    const kanban = await Kanban.findById(kanban_id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy Kanban' });
    }

    // Validation assigned_to phải là thành viên dự án hoặc team
    if (assigned_to) {
      // Kiểm tra null/undefined safety
      const isCreator = project && project.created_by && 
                       project.created_by.toString() === assigned_to.toString();
      
      if (!isCreator) {
        let hasAccess = false;
        
        // Kiểm tra trong ProjectMember trước
        const projectMember = await ProjectMember.findOne({
          project_id: kanban.project_id,
          user_id: assigned_to,
          is_active: true
        });

        if (projectMember) {
          hasAccess = true;
        }
        
        // Nếu không có trong ProjectMember và project có team_id, kiểm tra TeamMember
        if (!hasAccess && project.team_id) {
          const TeamMember = require('../models/teamMember.model');
          const teamMember = await TeamMember.findOne({
            team_id: project.team_id,
            user_id: assigned_to,
            is_active: true
          });
          
          if (teamMember) {
            hasAccess = true;
            console.log(`📋 User ${assigned_to} found in team ${project.team_id}, allowing assignment`);
              // Đồng bộ hóa team member này vào project member để tránh lỗi tương lai
            try {
              const existingProjectMember = await ProjectMember.findOne({
                project_id: kanban.project_id,
                user_id: assigned_to
              });
              
              if (!existingProjectMember) {
                // Map team role to project role (using correct Vietnamese enum values)
                let projectRole;
                switch (teamMember.role.toLowerCase()) { // dùng toLowerCase() để tránh lỗi
                    case 'admin':
                        projectRole = 'Quản trị viên';
                        break;
                    case 'editor':
                        projectRole = 'Biên tập viên';
                        break;
                    case 'member':
                        projectRole = 'Người xem';
                        break;
                    default:
                        projectRole = 'Người xem';
                }
                
                const newProjectMember = new ProjectMember({
                  project_id: kanban.project_id,
                  user_id: assigned_to,
                  role_in_project: projectRole,
                  joined_at: new Date(),
                  is_active: true
                });
                
                await newProjectMember.save();
                console.log(`✅ Auto-synced team member ${assigned_to} to project members with role ${projectRole}`);
              }
            } catch (syncError) {
              console.error('⚠️ Error auto-syncing team member to project:', syncError);
              // Không fail task assignment nếu sync lỗi
            }
          }
        }

        if (!hasAccess) {
          return res.status(400).json({ 
            message: 'Người được giao phải là thành viên của dự án hoặc thành viên của team được gán dự án' 
          });
        }
      }
    }

    // Kiểm tra quyền: Nếu là người tạo dự án thì cho phép
    if (project && project.created_by && userId && project.created_by.toString() === userId.toString()) {
      // Sử dụng Counter để lấy order tiếp theo (atomic operation)
      const taskStatus = status || 'Cần làm';
      const counterName = `${kanban_id}_${taskStatus}`;
      const newOrder = await Counter.getNextSequence(counterName);
      
      // Tạo task mới
      const task = new KanbanTask({
        kanban_id,
        title,
        description,
        status: taskStatus,
        order: newOrder, // Sử dụng order từ counter
        start_date,
        due_date,
        created_by: userId,
        assigned_to,
        priority: priority || 'Trung bình',
        color: color || '#ffffff',
        is_pinned: is_pinned || false
      });

      await task.save();
      console.log('Created task:', task);

      // AI risk prediction
      const riskLevel = predictTaskRisk(task);
      let riskClass = 'low';
      if (riskLevel > 0.7) riskClass = 'high';
      else if (riskLevel > 0.4) riskClass = 'medium';
      // Gửi notification nếu rủi ro cao
      if (riskLevel > 0.7 && task.assigned_to) {
        await Notification.createNotification({
          userId: task.assigned_to,
          title: 'Cảnh báo rủi ro công việc',
          message: `Công việc "${task.title}" có nguy cơ trễ hạn cao. Vui lòng kiểm tra và cập nhật tiến độ!`,
          type: 'task_risk_alert',
          priority: 'high',
          project_id: kanban.project_id,
          metadata: { taskId: task._id, riskLevel }
        });
      }

      // Populate thông tin assigned_to và created_by
      const populatedTask = await KanbanTask.findById(task._id)
        .populate('assigned_to', 'name email')
        .populate('created_by', 'name email')
        .populate('documents');
      // Thêm riskLevel/riskClass vào response
      const responseTask = populatedTask.toObject();
      responseTask.riskLevel = riskLevel;
      responseTask.riskClass = riskClass;

      // Emit socket event với toàn bộ danh sách task
      if (req.io) {
        const allTasksInKanban = await KanbanTask.find({ kanban_id })
          .populate('assigned_to', 'name email avatar')
          .populate('created_by', 'name email avatar')
          .populate('documents') // THÊM DÒNG NÀY
          .sort({ is_pinned: -1, order: 1 });

        req.io.to(kanban_id.toString()).emit('kanban:updated', allTasksInKanban);
      }

      return res.status(201).json(responseTask);
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

    // Sử dụng Counter để lấy order tiếp theo (atomic operation)
    const taskStatus = status || 'Cần làm';
    const counterName = `${kanban_id}_${taskStatus}`;
    const newOrder = await Counter.getNextSequence(counterName);
    
    // Tạo task mới
    const task = new KanbanTask({
      kanban_id,
      title,
      description,
      status: taskStatus,
      order: newOrder,
      start_date,
      due_date,
      created_by: userId,
      assigned_to,
      priority: priority || 'Trung bình',
      color: color || '#ffffff',
      is_pinned: is_pinned || false
    });

    await task.save();
    console.log('Created task:', task);

    // AI risk prediction
    const riskLevel = predictTaskRisk(task);
    let riskClass = 'low';
    if (riskLevel > 0.7) riskClass = 'high';
    else if (riskLevel > 0.4) riskClass = 'medium';
    // Gửi notification nếu rủi ro cao
    if (riskLevel > 0.7 && task.assigned_to) {
      await Notification.createNotification({
        userId: task.assigned_to,
        title: 'Cảnh báo rủi ro công việc',
        message: `Công việc "${task.title}" có nguy cơ trễ hạn cao. Vui lòng kiểm tra và cập nhật tiến độ!`,
        type: 'task_risk_alert',
        priority: 'high',
        project_id: kanban.project_id,
        metadata: { taskId: task._id, riskLevel }
      });
    }

    // Populate thông tin assigned_to và created_by
    const populatedTask = await KanbanTask.findById(task._id)
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents'); // THÊM DÒNG NÀY

    // Thêm riskLevel/riskClass vào response
    const responseTask = populatedTask.toObject();
    responseTask.riskLevel = riskLevel;
    responseTask.riskClass = riskClass;

    // Emit socket event với toàn bộ danh sách task
    if (req.io) {
      const allTasksInKanban = await KanbanTask.find({ kanban_id })
        .populate('assigned_to', 'name email avatar')
        .populate('created_by', 'name email avatar')
        .populate('documents') // <-- **THÊM DÒNG NÀY**
        .sort({ is_pinned: -1, order: 1 });

      req.io.to(kanban_id.toString()).emit('kanban:updated', allTasksInKanban);
    }

    res.status(201).json(responseTask);
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
    const { title, description, status, start_date, due_date, priority, assigned_to, color, is_pinned } = req.body;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    const task = await KanbanTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }

    // Tìm thông tin kanban board liên quan đến task
    const kanban = await Kanban.findById(task.kanban_id);
    if (!kanban) {
      return res.status(404).json({ message: 'Không tìm thấy bảng Kanban liên quan đến task này' });
    }

    // Check edit permission
    const permissionCheck = await canModifyTask(userId, task.kanban_id, 'edit');
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({ 
        message: permissionCheck.error || 'Không có quyền chỉnh sửa task. Chỉ Admin và Editor mới có thể chỉnh sửa task.',
        userRole: permissionCheck.role 
      });
    }

    const project = permissionCheck.project;

    // Validation ngày tháng
    const newStartDate = start_date || task.start_date;
    const newDueDate = due_date || task.due_date;

    if (newStartDate && newDueDate) {
      const startDate = new Date(newStartDate);
      const dueDate = new Date(newDueDate);
      
      if (startDate > dueDate) {
        return res.status(400).json({ 
          message: 'Ngày bắt đầu không thể sau ngày kết thúc' 
        });
      }
    }

    // Validation với ngày dự án
    if (newStartDate && project.start_date) {
      const taskStartDate = new Date(newStartDate);
      const projectStartDate = new Date(project.start_date);
      
      if (taskStartDate < projectStartDate) {
        return res.status(400).json({ 
          message: 'Ngày bắt đầu task không thể trước ngày bắt đầu dự án' 
        });
      }
    }

    if (newDueDate && project.end_date) {
      const taskDueDate = new Date(newDueDate);
      const projectEndDate = new Date(project.end_date);
      
      if (taskDueDate > projectEndDate) {
        return res.status(400).json({ 
          message: 'Ngày kết thúc task không thể sau ngày kết thúc dự án' 
        });
      }
    }

    // Xử lý assigned_to - có thể là string ID hoặc object hoặc null/undefined
    let assignedToId = assigned_to;
    
    // Nếu frontend gửi object thì lấy _id
    if (assigned_to && typeof assigned_to === 'object' && assigned_to._id) {
      assignedToId = assigned_to._id;
    }
    
    // Nếu assigned_to là empty string thì set thành null
    if (assignedToId === '') {
      assignedToId = null;
    }

    // Validation assigned_to phải là thành viên dự án hoặc team (nếu có giá trị và khác với giá trị cũ)
    if (assignedToId && assignedToId !== task.assigned_to?.toString()) {
      const isCreator = project.created_by && project.created_by.toString() === assignedToId.toString();
      
      if (!isCreator) {
        let hasAccess = false;
        
        // Kiểm tra trong ProjectMember trước
        const projectMember = await ProjectMember.findOne({
          project_id: kanban.project_id,
          user_id: assignedToId,
          is_active: true
        });

        if (projectMember) {
          hasAccess = true;
        }
        
        // Nếu không có trong ProjectMember và project có team_id, kiểm tra TeamMember
        if (!hasAccess && project.team_id) {
          const TeamMember = require('../models/teamMember.model');
          const teamMember = await TeamMember.findOne({
            team_id: project.team_id,
            user_id: assignedToId,
            is_active: true
          });
          
          if (teamMember) {
            hasAccess = true;
            console.log(`📋 User ${assignedToId} found in team ${project.team_id}, allowing assignment`);
            
            // Đồng bộ hóa team member này vào project member để tránh lỗi tương lai
            try {
              const existingProjectMember = await ProjectMember.findOne({
                project_id: kanban.project_id,
                user_id: assignedToId
              });
                if (!existingProjectMember) {
                // Map team role to project role (using correct Vietnamese enum values)
                let projectRole;
                switch (teamMember.role.toLowerCase()) { // dùng toLowerCase() để tránh lỗi
                    case 'admin':
                        projectRole = 'Quản trị viên';
                        break;
                    case 'editor':
                        projectRole = 'Biên tập viên';
                        break;
                    case 'member':
                        projectRole = 'Người xem';
                        break;
                    default:
                        projectRole = 'Người xem';
                }
                
                const newProjectMember = new ProjectMember({
                  project_id: kanban.project_id,
                  user_id: assignedToId,
                  role_in_project: projectRole,
                  joined_at: new Date(),
                  is_active: true
                });
                
                await newProjectMember.save();
                console.log(`✅ Auto-synced team member ${assignedToId} to project members with role ${projectRole}`);
              }
            } catch (syncError) {
              console.error('⚠️ Error auto-syncing team member to project:', syncError);
              // Không fail task assignment nếu sync lỗi
            }
          }
        }

        if (!hasAccess) {
          return res.status(400).json({ 
            message: 'Người được giao phải là thành viên của dự án hoặc thành viên của team được gán dự án' 
          });
        }
      }
    }

    // Cập nhật task - chỉ cập nhật các trường được gửi lên (khác undefined)
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (start_date !== undefined) task.start_date = start_date;
    if (due_date !== undefined) task.due_date = due_date;
    if (priority !== undefined) task.priority = priority;
    if (color !== undefined) task.color = color;
    if (is_pinned !== undefined) task.is_pinned = is_pinned;
    
    // Xử lý assigned_to đặc biệt
    if (assigned_to !== undefined) {
      task.assigned_to = assignedToId; // sử dụng assignedToId đã được xử lý ở trên
    }

    await task.save();
    console.log('Updated task:', task);

    // AI risk prediction
    const riskLevel = predictTaskRisk(task);
    let riskClass = 'low';
    if (riskLevel > 0.7) riskClass = 'high';
    else if (riskLevel > 0.4) riskClass = 'medium';
    // Gửi notification nếu rủi ro cao
    if (riskLevel > 0.7 && task.assigned_to) {
      await Notification.createNotification({
        userId: task.assigned_to,
        title: 'Cảnh báo rủi ro công việc',
        message: `Công việc "${task.title}" có nguy cơ trễ hạn cao. Vui lòng kiểm tra và cập nhật tiến độ!`,
        type: 'task_risk_alert',
        priority: 'high',
        project_id: kanban.project_id,
        metadata: { taskId: task._id, riskLevel }
      });
    }

    // Populate thông tin assigned_to và created_by
    const populatedTask = await KanbanTask.findById(task._id)
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents');
    // Thêm riskLevel/riskClass vào response
    const responseTask = populatedTask.toObject();
    responseTask.riskLevel = riskLevel;
    responseTask.riskClass = riskClass;

    // Emit socket event với toàn bộ danh sách task
    if (req.io) {
      const allTasksInKanban = await KanbanTask.find({ kanban_id: task.kanban_id })
        .populate('assigned_to', 'name email avatar')
        .populate('created_by', 'name email avatar')
        .populate('documents') // THÊM DÒNG NÀY
        .sort({ is_pinned: -1, order: 1 });

      req.io.to(task.kanban_id.toString()).emit('kanban:updated', allTasksInKanban);
    }

    res.json(responseTask);
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
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    const task = await KanbanTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }

    // Check delete permission
    const permissionCheck = await canModifyTask(userId, task.kanban_id, 'delete');
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({ 
        message: permissionCheck.error || 'Không có quyền xóa task. Chỉ Admin và Editor mới có thể xóa task.',
        userRole: permissionCheck.role 
      });
    }

    const kanbanId = task.kanban_id; // Lưu lại trước khi xóa
    await KanbanTask.findByIdAndDelete(id);
    console.log('Deleted task:', id);

    // Emit socket event với toàn bộ danh sách task còn lại
    if (req.io) {
      const allTasksInKanban = await KanbanTask.find({ kanban_id: kanbanId })
        .populate('assigned_to', 'name email avatar')
        .populate('created_by', 'name email avatar')
        .populate('documents') // <-- **THÊM DÒNG NÀY**
        .sort({ is_pinned: -1, order: 1 });

      req.io.to(kanbanId.toString()).emit('kanban:updated', allTasksInKanban);
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
    console.log('Update Task Order request:', req.params, req.body);
    console.log('User:', req.user);

    const { id } = req.params; // id có thể undefined nếu gọi bulk update
    const { newStatus, newOrder, tasks: reorderedTasks } = req.body; // tasks array for bulk reordering
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

    // Xử lý bulk update (khi không có id trong params)
    if (!id && reorderedTasks && Array.isArray(reorderedTasks) && reorderedTasks.length > 0) {
      // Lấy kanban_id từ task đầu tiên để kiểm tra quyền
      const sampleTask = await KanbanTask.findById(reorderedTasks[0]._id);
      if (!sampleTask) {
        return res.status(404).json({ message: 'Task không tồn tại để kiểm tra quyền' });
      }

      // Check move permission (all users including viewers can move tasks to change status)
      const permissionCheck = await canModifyTask(userId, sampleTask.kanban_id, 'move');
      if (!permissionCheck.hasPermission) {
        return res.status(403).json({ 
          message: permissionCheck.error || 'Không có quyền di chuyển task.',
          userRole: permissionCheck.role 
        });
      }

      // Thực hiện bulk update
      const bulkOps = reorderedTasks.map(taskUpdate => ({
        updateOne: {
          filter: { _id: taskUpdate._id, kanban_id: sampleTask.kanban_id }, // Thêm kanban_id để bảo mật
          update: { 
            $set: {
              status: taskUpdate.status, 
              order: taskUpdate.order 
            }
          }
        }
      }));

      const result = await KanbanTask.bulkWrite(bulkOps);
      console.log('Bulk update result:', result);
      
      // Lấy lại toàn bộ danh sách task mới nhất từ CSDL sử dụng sampleTask đã có
      if (sampleTask && req.io) {
        const kanbanId = sampleTask.kanban_id;

        // Lấy lại toàn bộ task của Kanban board đó
        const allTasksInKanban = await KanbanTask.find({ kanban_id: kanbanId })
          .populate('assigned_to', 'name email avatar')
          .populate('created_by', 'name email avatar')
          .populate('documents') // <-- **THÊM DÒNG NÀY**
          .sort({ is_pinned: -1, order: 1 });

        // Phát sự kiện đi với dữ liệu đầy đủ
        req.io.to(kanbanId.toString()).emit('kanban:updated', allTasksInKanban);
      }

      return res.json({ 
        message: 'Cập nhật vị trí tasks thành công', 
        modifiedCount: result.modifiedCount 
      });
    }

    // Xử lý single task update (khi có id trong params)
    if (!id) {
      return res.status(400).json({ message: 'Thiếu thông tin task để cập nhật' });
    }

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

    // Kiểm tra quyền truy cập
    let hasAccess = project.created_by && project.created_by.toString() === userId.toString();

    if (!hasAccess) {
      const projectMember = await ProjectMember.findOne({
        project_id: kanban.project_id,
        user_id: userId,
        is_active: true
      });

      if (!projectMember) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
      hasAccess = true;
    }

    // Cập nhật task đơn lẻ
    const oldStatus = task.status;
    task.status = newStatus || task.status;
    task.order = newOrder !== undefined ? newOrder : task.order;
    await task.save();

    console.log('Updated task order:', task);

    // Lấy lại toàn bộ danh sách task mới nhất từ CSDL
    if (req.io) {
      const allTasksInKanban = await KanbanTask.find({ kanban_id: task.kanban_id })
        .populate('assigned_to', 'name email avatar')
        .populate('created_by', 'name email avatar')
        .populate('documents') // <-- **THÊM DÒNG NÀY**
        .sort({ is_pinned: -1, order: 1 });

      req.io.to(task.kanban_id.toString()).emit('kanban:updated', allTasksInKanban);
    }

    // Populate thông tin cho response
    const populatedTask = await KanbanTask.findById(task._id)
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents'); // THÊM DÒNG NÀY

    res.json(populatedTask);
  } catch (error) {
    console.error('Error updating task order:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tasks với sắp xếp phù hợp
exports.getTasks = async (req, res) => {
  try {
    console.log('Get Tasks request:', req.params, req.query);
    console.log('User:', req.user);

    const { kanban_id } = req.params;
    
    // Handle different auth middleware formats
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

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
    let hasAccess = false;
    if (project.created_by && userId) {
      hasAccess = project.created_by.toString() === userId.toString();
    }

    if (!hasAccess) {
      // Kiểm tra quyền thành viên
      const projectMember = await ProjectMember.findOne({
        project_id: kanban.project_id,
        user_id: userId,
        is_active: true
      });

      if (!projectMember) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
      hasAccess = true;
    }

    // Lấy danh sách tasks với sắp xếp: pinned tasks trước, sau đó theo order
    const tasks = await KanbanTask.find({ kanban_id })
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents') // THÊM DÒNG NÀY
      .sort({ 
        is_pinned: -1,  // pinned tasks trước (true = 1, false = 0, descending = true trước)
        order: 1,       // sau đó sắp xếp theo order tăng dần
        created_at: 1   // cuối cùng theo thời gian tạo
      });

    console.log('Retrieved tasks:', tasks.length);

    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách thành viên dự án để assign task
exports.getProjectMembers = async (req, res) => {
  try {
    console.log('Get Project Members request:', req.params);
    console.log('User:', req.user);

    const { kanban_id } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

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
    let hasAccess = project.created_by.toString() === userId.toString();

    if (!hasAccess) {
      // Kiểm tra quyền thành viên
      const projectMember = await ProjectMember.findOne({
        project_id: kanban.project_id,
        user_id: userId,
        is_active: true
      });

      if (!projectMember) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
      hasAccess = true;
    }

    // Lấy danh sách thành viên dự án
    const projectMembers = await ProjectMember.find({
      project_id: kanban.project_id,
      is_active: true
    }).populate('user_id', 'name email avatar');

    // Thêm người tạo dự án vào danh sách nếu chưa có
    const creatorMember = projectMembers.find(member => 
      member.user_id._id.toString() === project.created_by.toString()
    );

    let members = projectMembers.map(member => ({
      _id: member.user_id._id,
      name: member.user_id.name,
      email: member.user_id.email,
      avatar: member.user_id.avatar,
      role: member.role_in_project
    }));

    if (!creatorMember) {
      // Lấy thông tin người tạo dự án
      const creator = await require('../models/user.model').findById(project.created_by);
      if (creator) {
        members.unshift({
          _id: creator._id,
          name: creator.name,
          email: creator.email,
          avatar: creator.avatar,
          role: 'Người tạo'
        });
      }
    }

    console.log('Retrieved project members:', members.length);

    res.json(members);
  } catch (error) {
    console.error('Error getting project members:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tài liệu của một task
exports.getTaskDocuments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    const task = await KanbanTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy công việc.' });
    }

    // Kiểm tra quyền truy cập - chỉ cần quyền move (tối thiểu)
    const permissionCheck = await canModifyTask(userId, task.kanban_id, 'move');
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({ message: 'Bạn không có quyền xem tài liệu này.' });
    }

    const Document = require('../models/document.model');
    const documents = await Document.find({ taskId })
      .populate('uploadedBy', 'name email'); // Lấy thông tin người upload

    res.json(documents || []);
  } catch (error) {
    console.error('Error getting task documents:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy tài liệu.' });
  }
};

// Xóa một tài liệu khỏi task
exports.deleteTaskDocument = async (req, res) => {
  try {
    const { taskId, documentId } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    const task = await KanbanTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy công việc.' });
    }

    // Kiểm tra quyền edit để xóa tài liệu
    const permissionCheck = await canModifyTask(userId, task.kanban_id, 'edit');
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tài liệu này.' });
    }

    const Document = require('../models/document.model');
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    }

    // TODO: Thêm logic xóa file trên Cloud Storage (Supabase) ở đây nếu cần
    // Ví dụ: await supabase.storage.from('documents').remove([document.storagePath]);

    // Xóa khỏi CSDL
    await Document.findByIdAndDelete(documentId);

    // Cập nhật lại task, xóa documentId khỏi mảng
    await KanbanTask.findByIdAndUpdate(taskId, { $pull: { documents: documentId } });

    res.json({ message: 'Xóa tài liệu thành công.' });

  } catch (error) {
    console.error('Error deleting task document:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa tài liệu.' });
  }
};

// Cập nhật trạng thái pin của task
exports.toggleTaskPin = async (req, res) => {
  try {
    console.log('Toggle Task Pin request:', req.params);
    console.log('User:', req.user);

    const { id } = req.params;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Không thể xác định người dùng' });
    }

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

    // Kiểm tra quyền truy cập
    let hasAccess = project.created_by.toString() === userId.toString();

    if (!hasAccess) {
      const projectMember = await ProjectMember.findOne({
        project_id: kanban.project_id,
        user_id: userId,
        is_active: true
      });

      if (!projectMember) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
      hasAccess = true;
    }

    // Toggle pin status
    task.is_pinned = !task.is_pinned;
    await task.save();

    console.log('Updated task pin status:', task);

    // Populate thông tin
    const populatedTask = await KanbanTask.findById(task._id)
      .populate('assigned_to', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .populate('documents'); // THÊM DÒNG NÀY

    // Emit socket event
    if (req.io) {
      req.io.to(task.kanban_id.toString()).emit('task:pinned', populatedTask);
    }

    res.json(populatedTask);
  } catch (error) {
    console.error('Error toggling task pin:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};