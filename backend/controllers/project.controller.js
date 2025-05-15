const Project = require("../models/project.model.js");
const ProjectType = require('../models/projectType.model.js');

// Tạo dự án mới
exports.createProject = async (req, res) => {
  try {
    const { project_name, description, start_date, end_date, status, priority, project_type_id } = req.body;
    const userId = req.user.userId;

    if (!project_name) {
      return res.status(400).json({ message: 'Tên dự án là bắt buộc' });
    }

    // Tìm hoặc tạo phân loại mặc định
    let finalProjectTypeId = project_type_id;
    if (!project_type_id) {
      try {
        let defaultType = await ProjectType.findOne({ name: "Không phân loại", userId });
        if (!defaultType) {
          defaultType = await ProjectType.create({
            name: "Không phân loại",
            userId,
            description: "Phân loại mặc định cho các dự án"
          });
        }
        finalProjectTypeId = defaultType._id;
      } catch (error) {
        console.error('Lỗi khi tạo phân loại mặc định:', error);
      }
    }

    const project = new Project({
      project_name,
      description,
      start_date: start_date || new Date(),
      end_date: end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: status || 'Active',
      priority: priority || 'Medium',
      project_type_id: finalProjectTypeId,
      created_by: userId,
      is_deleted: false,
      deleted_at: null
    });

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
    const { project_name, description, status, priority, start_date, end_date, project_type_id } = req.body;
    const userId = req.user.userId;

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

    project.project_name = project_name || project.project_name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.priority = priority || project.priority;
    project.start_date = start_date || project.start_date;
    project.end_date = end_date || project.end_date;
    project.project_type_id = project_type_id || project.project_type_id;
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
