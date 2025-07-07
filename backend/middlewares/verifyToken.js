const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Không có token truy cập" });
    return; // Đảm bảo không chạy tiếp
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token payload:", decoded);    // Kiểm tra id (nới lỏng điều kiện, chỉ cần là string và không rỗng)
    if (!decoded.id || typeof decoded.id !== 'string') {
      res.status(403).json({ message: "ID trong token không hợp lệ" });
      return;
    }
    
    // Kiểm tra email (nếu có)
    if (decoded.email && typeof decoded.email !== 'string') {
      res.status(403).json({ message: "Email trong token không hợp lệ" });
      return;
    }

    req.user = {
      id: decoded.id, // Đảm bảo có trường 'id'
      userId: decoded.id, // Một số controller dùng 'userId'
      email: decoded.email || null,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(403).json({ message: "Token đã hết hạn" });
      return;
    } else if (err.name === 'JsonWebTokenError') {
      res.status(403).json({ message: "Token không hợp lệ" });
      return;
    } else {
      res.status(403).json({ message: err.message || "Token không hợp lệ hoặc hết hạn" });
      return;
    }
  }
};

module.exports = verifyToken;