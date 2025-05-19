const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth');

// API: Lấy danh sách dự án của user hiện tại
router.get('/projects', auth, projectController.getMyProjects);

// API: Tạo dự án mới cho user hiện tại
router.post('/projects', auth, projectController.createProject);

// API: Cập nhật dự án
router.put('/projects/:projectId', auth, projectController.updateProject);

// Xóa mềm dự án
router.delete('/projects/:id', auth, projectController.softDeleteProject);

// Khôi phục dự án
router.put('/projects/:id/restore', auth, projectController.restoreProject);

// API: Lấy chi tiết dự án
router.get('/projects/:id', auth, projectController.getProjectById);

module.exports = router;