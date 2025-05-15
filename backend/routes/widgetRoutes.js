const express = require('express');
const router = express.Router();
const widgetController = require('../controllers/widgetController');

router.get('/', widgetController.getWidgets);
router.get('/widgets', widgetController.getWidgets);

// Lấy danh sách widget theo userId
router.get("/user/:userId", widgetController.getUserWidgets);

// Thêm widget cho user
router.post("/user", widgetController.addUserWidget);

// Cập nhật widget người dùng
router.put("/user/:id", widgetController.updateUserWidget);

// Xóa widget của user
router.delete("/user/:id", widgetController.deleteUserWidget);

module.exports = router;