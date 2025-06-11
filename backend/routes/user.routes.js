const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Import model từ file riêng
const verifyToken = require('../middlewares/verifyToken');

// Route lấy danh sách tất cả users
router.get('/', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = { isActive: true };
        if (search) {
            searchQuery.$or = [
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get users with pagination
        const users = await User.find(searchQuery)
            .select('-password') // Exclude password
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get total count
        const total = await User.countDocuments(searchQuery);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách users',
            error: error.message
        });
    }
});

// Route lấy thông tin user hiện tại
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin user'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin user',
            error: error.message
        });
    }
});

// Route lấy thông tin user theo ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin user',
            error: error.message
        });
    }
});

// Route cập nhật thông tin user
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { full_name, email, role, current_plan_type, online_status, avatar_url } = req.body;
        
        // Chỉ admin mới được cập nhật role và plan
        if ((role || current_plan_type) && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật role hoặc plan'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { full_name, email, role, current_plan_type, online_status, avatar_url },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin user thành công',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật user',
            error: error.message
        });
    }
});

// Route xóa user (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Chỉ admin mới được xóa user
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa user'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa user thành công',
            data: { user }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa user',
            error: error.message
        });
    }
});

module.exports = router;