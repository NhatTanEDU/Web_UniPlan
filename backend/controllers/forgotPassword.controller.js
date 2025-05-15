const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/sendEmail");
const bcrypt = require('bcrypt');

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '15m'
        });

        // ĐẢM BẢO LINK NÀY LÀ LINK FRONTEND
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

        const emailHTML = `
            <h3>Xin chào ${user.name},</h3>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản UniPlan của mình.</p>
            <p>Hãy nhấn vào liên kết sau để tiếp tục:</p>
            <a href="${resetLink}" target="_blank" style="color:blue">${resetLink}</a>
            <p>⚠️ Liên kết này sẽ hết hạn trong 15 phút.</p>
            <br>
            <p>UniPlan Team</p>
        `;

        await sendEmail(email, '🛠 UniPlan - Đặt lại mật khẩu', emailHTML);

        res.status(200).json({ message: '📩 Link khôi phục đã được gửi tới email của bạn.' });

    } catch (error) {
        console.error('[FORGOT PASSWORD]', error.message);
        res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};