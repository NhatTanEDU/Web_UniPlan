const ProjectMember = require('../models/projectMember.model.js');

const checkOwnerRole = async (req, res, next) => {
  try {
    const { projectId } = req.params; // projectId từ params
    const userId = req.user.userId; // Từ verifyToken middleware

    const member = await ProjectMember.findOne({ project_id: projectId, user_id: userId });
    if (!member) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
    }    if (member.role_in_project !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ Quản trị viên mới có quyền thực hiện hành động này' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kiểm tra quyền', error: error.message });
  }
};

module.exports = checkOwnerRole;