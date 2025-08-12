// backend/routes/avatar.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user.model');
const verifyToken = require('../middlewares/auth.middleware');

// Cấu hình Multer để xử lý upload file
const storage = multer.memoryStorage(); // Lưu file trong bộ nhớ để đưa vào MongoDB
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra định dạng file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Chỉ cho phép định dạng JPEG, PNG, GIF và WEBP!'));
    }
  }
});

// Route để upload avatar - yêu cầu đăng nhập
router.post('/upload', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    // Kiểm tra xem có file được upload không
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
    }

    // Lấy thông tin user từ token
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Lưu avatar vào user
    user.setAvatar(req.file.buffer, req.file.mimetype);
    await user.save();

    // Trả về thông tin avatar đã lưu
    return res.status(200).json({
      success: true,
      message: 'Cập nhật avatar thành công',
      data: {
        avatar_url: user.avatar_url,
        uploaded_at: user.avatar.uploaded_at
      }
    });
  } catch (err) {
    console.error('Lỗi khi upload avatar:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload avatar',
      error: err.message
    });
  }
});

// Route để lấy avatar của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Nếu không có avatar hoặc không có dữ liệu
    if (!user.avatar || !user.avatar.data) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng chưa có avatar'
      });
    }

    // Thiết lập header và trả về dữ liệu nhị phân của avatar
    res.set({
      'Content-Type': user.avatar.contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });
    res.send(user.avatar.data);
  } catch (err) {
    console.error('Lỗi khi lấy avatar:', err);
    console.error('Chi tiết người dùng yêu cầu:', req.params.userId);
    
    // Chi tiết lỗi để debug
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy avatar từ server',
      error: err.message,
      userId: req.params.userId
    });
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy avatar',
      error: err.message
    });
  }
});

// Route để xóa avatar
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa avatar
    user.avatar = {
      data: null,
      contentType: null,
      uploaded_at: null
    };
    user.avatar_url = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Xóa avatar thành công'
    });
  } catch (err) {
    console.error('Lỗi khi xóa avatar:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa avatar',
      error: err.message
    });
  }
});

module.exports = router;
