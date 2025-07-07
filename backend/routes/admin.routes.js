const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');


// Lấy danh sách tất cả người dùng
router.get('/users', adminController.getAllUsers);

// Lấy thông tin một người dùng theo ID
router.get('/users/:id', adminController.getUserById);

// Cập nhật thông tin một người dùng theo ID
router.put('/users/:id', adminController.updateUser);

// Xóa một người dùng theo ID
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;