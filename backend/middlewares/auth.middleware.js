const jwt = require("jsonwebtoken");

/**
 * Middleware verify token JWT
 * Gắn req.user = { userId, email }
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token truy cập" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra id
    if (!decoded.id || typeof decoded.id !== 'string') {
      throw new Error("ID trong token không hợp lệ");
    }

    // Kiểm tra email nếu có
    if (decoded.email && typeof decoded.email !== 'string') {
      throw new Error("Email trong token không hợp lệ");
    }

    req.user = {
      userId: decoded.id,
      email: decoded.email || null,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "Token đã hết hạn" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Token không hợp lệ" });
    } else {
      return res.status(403).json({ message: err.message || "Token không hợp lệ hoặc hết hạn" });
    }
  }
};

module.exports = verifyToken;
