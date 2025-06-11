const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// 👇 Hàm xử lý reset mật khẩu
exports.resetPassword = async(req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        if (!token) return res.status(400).json({ message: "Token không hợp lệ." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại." });

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "🔐 Mật khẩu đã được cập nhật thành công." });
    } catch (err) {
        console.error("[RESET PASSWORD]", err.message);
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};