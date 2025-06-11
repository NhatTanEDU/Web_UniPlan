const express = require('express');
const router = express.Router();
const userRoleController = require('../controllers/userRole.controller');
const auth = require('../middleware/auth');

// Middleware xác thực cho tất cả routes
router.use(auth);

// GET /api/user-roles/teams/:teamId - Lấy role của user trong team cụ thể
router.get('/teams/:teamId', userRoleController.getUserTeamRole);

// GET /api/user-roles/projects/:projectId - Lấy role của user trong project cụ thể
router.get('/projects/:projectId', userRoleController.getUserProjectRole);

// GET /api/user-roles/all - Lấy tất cả roles của user
router.get('/all', userRoleController.getAllUserRoles);

// GET /api/user-roles/teams/:teamId/delete-permission/:memberId - Kiểm tra quyền xóa thành viên
router.get('/teams/:teamId/delete-permission/:memberId', userRoleController.checkDeletePermission);

module.exports = router;
