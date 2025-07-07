// backend/routes/personalMemberList.routes.js
const express = require('express');
const router = express.Router();
const personalMemberListController = require('../controllers/personalMemberList.controller');
const verifyToken = require('../middlewares/verifyToken');

// Middleware: Tất cả routes đều yêu cầu authentication
router.use(verifyToken);

// GET /api/personal-members - Lấy danh sách thành viên cá nhân
router.get('/', personalMemberListController.getPersonalMembers);

// GET /api/personal-members/search - Tìm kiếm người dùng để thêm vào danh sách
router.get('/search', personalMemberListController.searchUsersToAdd);

// GET /api/personal-members/:id - Lấy chi tiết một thành viên
router.get('/:id', personalMemberListController.getPersonalMemberDetail);

// POST /api/personal-members - Thêm thành viên mới vào danh sách
router.post('/', personalMemberListController.addPersonalMember);

// PUT /api/personal-members/:id - Cập nhật thông tin thành viên
router.put('/:id', personalMemberListController.updatePersonalMember);

// DELETE /api/personal-members/:id - Xóa thành viên (soft delete)
router.delete('/:id', personalMemberListController.removePersonalMember);

// DELETE /api/personal-members/:id/permanent - Xóa vĩnh viễn thành viên
router.delete('/:id/permanent', personalMemberListController.permanentDeletePersonalMember);

module.exports = router;
