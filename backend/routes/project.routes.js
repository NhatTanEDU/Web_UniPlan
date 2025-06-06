const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth');

// API: Lấy danh sách project có thể gán vào team (CỤ THỂ HƠN - ĐẶT LÊN TRƯỚC)
router.get('/projects/available', auth, projectController.getAvailableProjects);

// API: Tìm kiếm project (CỤ THỂ HƠN - ĐẶT LÊN TRƯỚC)
router.get('/projects/search', auth, projectController.searchProjects);

// API: Lấy danh sách dự án của user hiện tại
router.get('/projects', auth, projectController.getMyProjects);

// API: Tạo dự án mới cho user hiện tại
router.post('/projects', auth, projectController.createProject);

// API: Lấy chi tiết dự án (CHUNG HƠN - CÓ THAM SỐ ĐỘNG :id - ĐẶT SAU CÁC ROUTE CỤ THỂ)
router.get('/projects/:id', auth, projectController.getProjectById);

// API: Cập nhật dự án
router.put('/projects/:projectId', auth, projectController.updateProject);

// API: Đồng bộ hóa team members sang project members thủ công
router.post('/projects/:projectId/sync-team-members', auth, projectController.manualSyncTeamMembers);

// Xóa mềm dự án
router.delete('/projects/:id', auth, projectController.softDeleteProject);

// Khôi phục dự án
router.put('/projects/:id/restore', auth, projectController.restoreProject);

module.exports = router;