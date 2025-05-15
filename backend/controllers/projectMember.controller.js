const mongoose = require('mongoose');
const ProjectMember = require('../models/projectMember.model.js');
const Project = require('../models/project.model.js');
const Notification = require('../models/notification.model.js');
const { addMemberSchema, updateMemberRoleSchema } = require('../utils/validation');

// Thêm thành viên vào dự án
exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role_in_project } = req.body;

    const { error } = addMemberSchema.validate({ user_id, role_in_project });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const project = await Project.findOne({ _id: projectId, is_deleted: false });
    if (!project) {
      return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const existingMember = await ProjectMember.findOne({ project_id: projectId, user_id });
    if (existingMember) {
      return res.status(400).json({ message: 'Người dùng đã là thành viên của dự án' });
    }

    const newMember = await ProjectMember.create({
      project_id: projectId,
      user_id,
      role_in_project,
    });

    // Populate user_id để lấy name và email
    const populatedMember = await ProjectMember.findById(newMember._id).populate('user_id', 'name email');

    // Tạo thông báo
    const notification = new Notification({
      user_id,
      type: 'Project', // <-- sửa thành đúng enum trong schema
      content: `Bạn đã được thêm vào dự án ${project.project_name} với vai trò ${role_in_project}`,
      sent_at: new Date(),
      is_read: false,
    });
    await notification.save();

    const io = require('../server').io;
    io.emit('notification', notification);

    // Định dạng phản hồi dễ đọc
    const response = {
      message: 'Thêm thành viên thành công',
      member: {
        _id: populatedMember._id,
        project_id: populatedMember.project_id,
        project_name: project.project_name,
        user_id: populatedMember.user_id._id,
        user_name: populatedMember.user_id.name,
        user_email: populatedMember.user_id.email,
        role_in_project: populatedMember.role_in_project,
        joined_at: populatedMember.joined_at,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm thành viên', error: error.message });
  }
};

// Xóa thành viên khỏi dự án
exports.removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findOne({ _id: projectId, is_deleted: false });
    if (!project) {
      return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const member = await ProjectMember.findOne({ project_id: projectId, user_id: userId });
    if (!member) {
      return res.status(404).json({ message: 'Thành viên không tồn tại trong dự án' });
    }

    if (member.role_in_project === 'Owner' && member.user_id.toString() === req.user.userId) {
      return res.status(403).json({ message: 'Owner không thể tự xóa mình khỏi dự án' });
    }

    // Lấy thông tin member trước khi xóa để populate
    const populatedMember = await ProjectMember.findOne({ project_id: projectId, user_id: userId }).populate('user_id', 'name email');

    await ProjectMember.deleteOne({ project_id: projectId, user_id: userId });

    const notification = new Notification({
      user_id: userId,
      type: { type: String, enum: ['Project', 'Task', 'System'], required: true },
      content: `Bạn đã bị xóa khỏi dự án ${project.project_name}`,
      sent_at: new Date(),
      is_read: false,
    });
    await notification.save();

    const io = require('../server').io;
    io.emit('notification', notification);

    // Định dạng phản hồi dễ đọc
    const response = {
      message: 'Xóa thành viên thành công',
      deleted_member: {
        _id: populatedMember._id,
        project_id: populatedMember.project_id,
        project_name: project.project_name,
        user_id: populatedMember.user_id._id,
        user_name: populatedMember.user_id.name,
        user_email: populatedMember.user_id.email,
        role_in_project: populatedMember.role_in_project,
        joined_at: populatedMember.joined_at,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa thành viên', error: error.message });
  }
};

// Chỉnh sửa vai trò thành viên
exports.updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role_in_project } = req.body;

    const { error } = updateMemberRoleSchema.validate({ role_in_project });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const project = await Project.findOne({ _id: projectId, is_deleted: false });
    if (!project) {
      return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const member = await ProjectMember.findOne({ project_id: projectId, user_id: userId });
    if (!member) {
      return res.status(404).json({ message: 'Thành viên không tồn tại trong dự án' });
    }

    if (member.role_in_project === 'Owner' && member.user_id.toString() === req.user.userId) {
      return res.status(403).json({ message: 'Không thể chỉnh sửa vai trò của Owner' });
    }

    member.role_in_project = role_in_project;
    await member.save();

    // Populate member sau khi cập nhật để lấy thông tin user
    const populatedMember = await ProjectMember.findById(member._id).populate('user_id', 'name email');

    const notification = new Notification({
      user_id: userId,
      type: { type: String, enum: ['Project', 'Task', 'System'], required: true },
      content: `Vai trò của bạn trong dự án ${project.project_name} đã được thay đổi thành ${role_in_project}`,
      sent_at: new Date(),
      is_read: false,
    });
    await notification.save();

    const io = require('../server').io;
    io.emit('notification', notification);

    // Định dạng phản hồi dễ đọc
    const response = {
      message: 'Cập nhật vai trò thành công',
      member: {
        _id: populatedMember._id,
        project_id: populatedMember.project_id,
        project_name: project.project_name,
        user_id: populatedMember.user_id._id,
        user_name: populatedMember.user_id.name,
        user_email: populatedMember.user_id.email,
        role_in_project: populatedMember.role_in_project,
        joined_at: populatedMember.joined_at,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật vai trò', error: error.message });
  }
};

// Xem danh sách thành viên trong dự án (GIỮ NGUYÊN)
exports.getMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('Project ID:', projectId);

    const objectProjectId = new mongoose.Types.ObjectId(projectId);

    const project = await Project.findOne({ _id: objectProjectId, is_deleted: false });
    console.log('Found project:', project);
    if (!project) {
      return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const members = await ProjectMember.find({ project_id: objectProjectId })
      .populate('user_id', 'email name')
      .catch(err => {
        throw new Error('Lỗi khi lấy danh sách thành viên: ' + err.message);
      });
    console.log('Found members:', members);

    const response = members.map(member => ({
      _id: member._id,
      project_id: member.project_id,
      project_name: project.project_name,
      user_id: member.user_id._id,
      user_name: member.user_id.name,
      user_email: member.user_id.email,
      role_in_project: member.role_in_project,
      joined_at: member.joined_at,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getMembers:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thành viên', error: error.message });
  }
};

// Thêm thành viên vào project
exports.addProjectMember = async (req, res) => {
  try {
    const { project_id, user_id, role_in_project } = req.body;
    const currentUser = req.user;

    // Kiểm tra project có tồn tại
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy project' });
    }

    // Kiểm tra người thêm có quyền không
    const currentMember = await ProjectMember.findOne({
      project_id,
      user_id: currentUser._id,
      is_active: true
    });

    if (!currentMember || !['Admin', 'Owner'].includes(currentMember.role_in_project)) {
      return res.status(403).json({ message: 'Không có quyền thêm thành viên' });
    }

    // Tạo thành viên mới
    const projectMember = new ProjectMember({
      project_id,
      user_id,
      role_in_project: role_in_project || 'Viewer',
      is_active: true,
      approval_status: true
    });

    await projectMember.save();

    res.status(201).json(projectMember);
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách thành viên của project
exports.getProjectMembers = async (req, res) => {
  try {
    const { project_id } = req.params;
    const currentUser = req.user;

    // Kiểm tra quyền truy cập
    const currentMember = await ProjectMember.findOne({
      project_id,
      user_id: currentUser._id,
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const members = await ProjectMember.find({ project_id })
      .populate('user_id', 'name email avatar_url')
      .sort('createdAt');

    res.json(members);
  } catch (error) {
    console.error('Error getting project members:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};