const express = require('express');
const router = express.Router();
const kanbanTaskController = require('../controllers/kanbanTask.controller');
const auth = require('../middleware/auth');

// Lấy danh sách tasks của một kanban board
router.get('/:kanban_id/tasks', auth, kanbanTaskController.getTasks);

// Lấy danh sách thành viên dự án để assign
router.get('/:kanban_id/members', auth, kanbanTaskController.getProjectMembers);

// Tạo task mới
router.post('/', auth, kanbanTaskController.createTask);

// *** QUAN TRỌNG: Đặt các route cụ thể TRƯỚC các route có tham số động ***

// Cập nhật vị trí task (kéo thả) - bulk update
router.put('/reorder', auth, kanbanTaskController.updateTaskOrder);

// Toggle pin/unpin task
router.put('/:id/pin', auth, kanbanTaskController.toggleTaskPin);

// Lấy danh sách tài liệu của một task
router.get('/:taskId/documents', auth, kanbanTaskController.getTaskDocuments);

// Xóa tài liệu khỏi task
router.delete('/:taskId/documents/:documentId', auth, kanbanTaskController.deleteTaskDocument);

// Cập nhật vị trí task đơn lẻ
router.put('/:id/order', auth, kanbanTaskController.updateTaskOrder);

// Cập nhật task
router.put('/:id', auth, kanbanTaskController.updateTask);

// Xóa task
router.delete('/:id', auth, kanbanTaskController.deleteTask);

module.exports = router;