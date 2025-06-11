const mongoose = require('mongoose');
const Project = require('../models/project.model.js');
const ProjectMember = require('../models/projectMember.model.js');

const checkProjectRole = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    console.log('Received projectId from params:', projectId); // Debug: Kiểm tra giá trị nhận được
    console.log('Received userId from token:', userId);
    // Kiểm tra projectId hợp lệ
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'ID dự án không hợp lệ' });
    }

    const member = await ProjectMember.findOne({ 
      project_id: new mongoose.Types.ObjectId(projectId), 
      user_id: userId 
    });
    const project = await Project.findOne({ 
      _id: new mongoose.Types.ObjectId(projectId) 
    });

    // Debug log
    // console.log('ProjectId:', projectId);
    // console.log('UserId:', userId);
    console.log('Project found:', project);
    console.log('Member found:', member);

    if (!project || project.is_deleted) {
      return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    if (project.created_by.toString() === userId || (member && member.role_in_project === 'Quản trị viên')) {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kiểm tra quyền', error: error.message });
  }
};

module.exports = checkProjectRole;