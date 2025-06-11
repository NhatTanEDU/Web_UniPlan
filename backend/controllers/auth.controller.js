const User = require("../models/user.model");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// Đăng ký người dùng mới
exports.registerUser = async(req, res) => {
    try {
        const { name, full_name, email, password } = req.body;
        
        // Use full_name if provided, otherwise fall back to name for backwards compatibility
        const userName = full_name || name;

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" }); // 409 Conflict
        }

        // Tạo người dùng mới
        const user = new User({ full_name: userName, email, password });

        // Lưu người dùng vào database
        await user.save();        // Trả về thông tin user vừa tạo
        res.status(201).json({ 
            message: "User registered successfully", 
            user: { id: user._id, name: user.full_name, email: user.email }
        }); // 201 Created
    } catch (err) {
        console.error("Error during registration:", err);
        if (err.name === 'ValidationError') {
            const errors = {};
            for (const field in err.errors) {
                errors[field] = err.errors[field].message;
            }
            return res.status(400).json({ message: "Validation error", errors }); // 400 Bad Request for validation errors
        }
        res.status(500).json({ message: "Server error", error: err.message }); // 500 Internal Server Error for other errors
    }
};

// Đăng nhập
exports.loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.full_name, full_name: user.full_name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email không tồn tại.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng.' });
        }
        // ...tạo token, trả về user...
        res.status(200).json({ message: 'Đăng nhập thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};