const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const notificationController = require('../controllers/notification.controller');

router.get('/notifications', verifyToken, notificationController.getNotifications);
router.post('/notifications', verifyToken, notificationController.createNotification);
router.put('/notifications/:id', verifyToken, notificationController.markAsRead);

module.exports = router;