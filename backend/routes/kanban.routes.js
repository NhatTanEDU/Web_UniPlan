const express = require('express');
const router = express.Router();
const kanbanController = require('../controllers/kanban.controller');
const kanbanTaskController = require('../controllers/kanbanTask.controller');
const auth = require('../middleware/auth');

// Debug: In ra thông tin controller
console.log('📋 Kanban Controller functions:', Object.keys(kanbanController));

// Kanban routes
router.post('/', auth, kanbanController.createKanban);
router.get('/:id', auth, kanbanController.getKanban);
router.put('/:id', auth, kanbanController.updateKanban);
router.delete('/:id', auth, kanbanController.deleteKanban);

// Route mới: tìm Kanban theo Project ID
router.get('/project/:projectId', auth, kanbanController.getKanbanByProjectId);

// Kanban Task routes
router.post('/tasks', auth, kanbanTaskController.createTask);
router.put('/tasks/:id', auth, kanbanTaskController.updateTask);
router.delete('/tasks/:id', auth, kanbanTaskController.deleteTask);
router.put('/tasks/order', auth, kanbanTaskController.updateTaskOrder);

module.exports = router;