const express = require('express');
const router = express.Router();
const kanbanTaskController = require('../controllers/kanbanTask.controller');
const auth = require('../middleware/auth');

// Tạo task mới
router.post('/', auth, kanbanTaskController.createTask);

// Cập nhật task
router.put('/:id', auth, kanbanTaskController.updateTask);

// Xóa task
router.delete('/:id', auth, kanbanTaskController.deleteTask);

// Cập nhật vị trí task (kéo thả)
router.put('/:id/order', auth, kanbanTaskController.updateTaskOrder);

module.exports = router; 