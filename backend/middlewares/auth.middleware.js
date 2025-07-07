const jwt = require("jsonwebtoken");

/**
 * Middleware verify token JWT
 * Gắn req.user = { userId, email }
 */
const verifyToken = (req, res, next) => {
  console.log('🔐 [Auth Middleware] Headers:', req.headers.authorization?.substring(0, 50) + '...');
  console.log('🔐 [Auth Middleware] JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('❌ [Auth Middleware] No valid Authorization header');
    return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để tiếp tục" });
  }

  const token = authHeader.split(" ")[1];
  console.log('🔐 [Auth Middleware] Token extracted:', token.substring(0, 30) + '...');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [Auth Middleware] Token decoded successfully:', { id: decoded.id, email: decoded.email });

    // Kiểm tra id
    if (!decoded.id || typeof decoded.id !== 'string') {
      throw new Error("ID trong token không hợp lệ");
    }

    // Kiểm tra email nếu có
    if (decoded.email && typeof decoded.email !== 'string') {
      throw new Error("Email trong token không hợp lệ");
    }

    req.user = {
      id: decoded.id,  // Thay userId bằng id để consistent với checkSubscriptionStatus
      userId: decoded.id,  // Giữ userId để backward compatibility
      email: decoded.email || null,
    };
    console.log('✅ [Auth Middleware] req.user set:', req.user);
    console.log('🚀 [Auth Middleware] Calling next() to proceed to controller...');
    next();
  } catch (err) {
    console.error('❌ [Auth Middleware] Token verification failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: "Token đã hết hạn" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ success: false, message: "Token không hợp lệ" });
    } else {
      return res.status(403).json({ success: false, message: err.message || "Token không hợp lệ hoặc hết hạn" });
    }
  }
};

module.exports = verifyToken;
