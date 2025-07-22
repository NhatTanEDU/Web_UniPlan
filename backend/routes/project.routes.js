const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth');
const { projectsRateLimit } = require('../middleware/rateLimiting'); // 🚀 Import projects rate limit
const { projectsDeduplication } = require('../middleware/requestDeduplication'); // 🚀 Import deduplication

// API: Lấy danh sách project có thể gán vào team (CỤ THỂ HƠN - ĐẶT LÊN TRƯỚC)
router.get('/projects/available', auth, projectsRateLimit, projectController.getAvailableProjects); // 🚀 Add rate limit

// API: Tìm kiếm project (CỤ THỂ HƠN - ĐẶT LÊN TRƯỚC)
router.get('/projects/search', auth, projectController.searchProjects);

// 🚀 API: Lấy danh sách dự án của user hiện tại (WITH RATE LIMITING + DEDUPLICATION)
router.get('/projects', auth, projectsDeduplication, projectsRateLimit, projectController.getMyProjects);

// 🚀 API: Lấy danh sách dự án của user hiện tại (alias cho backward compatibility)
router.get('/projects/my', auth, projectsDeduplication, projectsRateLimit, projectController.getMyProjects);

// API: Tạo dự án mới cho user hiện tại
router.post('/projects', auth, projectController.createProject);

// API: Lấy chi tiết dự án (CHUNG HƠN - CÓ THAM SỐ ĐỘNG :id - ĐẶT SAU CÁC ROUTE CỤ THỂ)
router.get('/projects/:id', auth, projectController.getProjectById);

// API: Cập nhật dự án
router.put('/projects/:projectId', auth, projectController.updateProject);

// API: Đồng bộ hóa team members sang project members thủ công
router.post('/projects/:projectId/sync-team-members', auth, projectController.manualSyncTeamMembers);

// API: Lấy dữ liệu tasks cho Gantt Chart của một dự án
router.get('/projects/:projectId/gantt-tasks', auth, projectController.getGanttTasksForProject);

// API: Cập nhật task từ Gantt Chart
router.put('/projects/:projectId/gantt-tasks/:taskId', auth, projectController.updateGanttTask);

// API: Lấy dependencies cho Gantt Chart
router.get('/projects/:projectId/gantt-dependencies', auth, projectController.getGanttDependencies);

// API: Tạo dependency mới
router.post('/projects/:projectId/gantt-dependencies', auth, projectController.createGanttDependency);

// API: Xóa dependency
router.delete('/projects/:projectId/gantt-dependencies/:dependencyId', auth, projectController.deleteGanttDependency);

// API: Tự động sắp xếp lịch trình dựa trên dependencies
router.post('/projects/:projectId/gantt-auto-schedule', auth, projectController.autoScheduleGanttTasks);

// Xóa mềm dự án
router.delete('/projects/:id', auth, projectController.softDeleteProject);

// Khôi phục dự án
router.put('/projects/:id/restore', auth, projectController.restoreProject);

// Dependencies routes cho Gantt
// ĐÃ XOÁ 3 DÒNG ROUTE TRÙNG LẶP ĐỂ TRÁNH LỖI 404

module.exports = router;