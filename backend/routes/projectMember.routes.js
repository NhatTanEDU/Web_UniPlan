const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkProjectRole = require('../middlewares/checkProjectRole');
const checkOwnerRole = require('../middlewares/checkOwnerRole');
const projectMemberController = require('../controllers/projectMember.controller');
const auth = require('../middleware/auth');

// Thêm thành viên vào dự án (chỉ Owner)
router.post(
  '/projects/:projectId/members',
  verifyToken,
  checkOwnerRole,
  projectMemberController.addMember
);

// Xóa thành viên khỏi dự án (chỉ Owner)
router.delete(
  '/projects/:projectId/members/:userId',
  verifyToken,
  checkOwnerRole,
  projectMemberController.removeMember
);

// Chỉnh sửa vai trò thành viên (chỉ Owner)
router.put(
  '/projects/:projectId/members/:userId/role',
  verifyToken,
  checkOwnerRole,
  projectMemberController.updateMemberRole
);

// Xem danh sách thành viên trong dự án (Owner, Editor, Viewer)
router.get(
  '/projects/:projectId/members',
  verifyToken,
  checkProjectRole,
  projectMemberController.getMembers
);

// Thêm thành viên vào project
router.post('/', auth, projectMemberController.addProjectMember);

// Lấy danh sách thành viên của project
router.get('/:project_id', auth, projectMemberController.getProjectMembers);

module.exports = router;