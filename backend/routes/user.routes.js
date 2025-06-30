const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Import model từ file riêng
const verifyToken = require('../middlewares/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer cho upload avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/avatars');
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique với timestamp và user ID
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

// File filter cho avatar
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

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
    if (req.timedout) return; // Kiểm tra timeout NGAY ĐẦU
    try {
        console.time('findUser');
        const user = await User.findById(req.user.id).select('-password');
        console.timeEnd('findUser');
        if (req.timedout) return; // Nếu đã timeout thì không gửi response nữa
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
        if (req.timedout) return; // Nếu đã timeout thì không gửi response nữa
        console.error('Error fetching user info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin user',
            error: error.message
        });
    }
});

// Route cập nhật profile user hiện tại
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { full_name, email, phone, address, bio, avatar_url } = req.body;
        
        // Validation
        if (!full_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên và email là bắt buộc'
            });
        }

        // Kiểm tra email đã tồn tại chưa (ngoại trừ user hiện tại)
        const existingUser = await User.findOne({ 
            email: email, 
            _id: { $ne: req.user.id },
            isActive: true 
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng bởi tài khoản khác'
            });
        }

        // Cập nhật thông tin profile
        const updateData = {
            full_name,
            email,
            phone,
            address,
            bio
        };

        // Chỉ cập nhật avatar_url nếu có
        if (avatar_url) {
            updateData.avatar_url = avatar_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
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
            message: 'Cập nhật profile thành công',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật profile',
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

// Route upload avatar
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        // Tạo URL cho avatar
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Cập nhật avatar URL vào database
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar_url: avatarUrl },
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
            message: 'Upload avatar thành công',
            data: {
                avatar_url: avatarUrl
            }
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        
        // Xóa file nếu có lỗi
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload avatar',
            error: error.message
        });
    }
});

// Route cập nhật thông tin user hiện tại (PUT /me)
router.put('/me', verifyToken, async (req, res) => {
    try {
        const { full_name, email, phone, address, bio, avatar_url } = req.body;
        
        const updateData = {
            full_name,
            email,
            phone,
            address,
            bio
        };

        // Chỉ cập nhật avatar_url nếu có
        if (avatar_url) {
            updateData.avatar_url = avatar_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
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
            message: 'Cập nhật thông tin thành công',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thông tin',
            error: error.message
        });
    }
});

module.exports = router;