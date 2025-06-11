const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    // Nếu không có header Authorization hoặc không bắt đầu bằng "Bearer ", trả về lỗi
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yêu cầu token xác thực. Truy cập bị từ chối.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong DB nhưng không lấy trường password để bảo mật
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại hoặc token không hợp lệ.' });
    }

    // --- PHẦN LOGGING NÂNG CẤP ---
    // Ghi lại thông tin chi tiết của người dùng đã được xác thực
    console.log('👤 User Authenticated:', {
      userId: user._id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.online_status || 'Unknown',
      isActive: user.isActive !== undefined ? user.isActive : true,
      requestMethod: req.method,
      requestPath: req.path,
      timestamp: new Date().toISOString()
    });
    // -----------------------------

    // Gắn thông tin user vào đối tượng request để các controller sau có thể sử dụng
    req.user = {
      userId: user._id.toString(),
      name: user.full_name,
      email: user.email,
      role: user.role,
    };

    next(); // Chuyển quyền điều khiển cho controller hoặc middleware tiếp theo

  } catch (error) {
    console.error('❌ Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

module.exports = auth;
