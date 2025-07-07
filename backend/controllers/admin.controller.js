const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find();
        console.log("Lấy danh sách người dùng thành công:", users);
        res.status(200).json(users);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách người dùng:", err);
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

// Lấy thông tin một người dùng theo ID
exports.getUserById = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log(`Không tìm thấy người dùng với ID: ${req.params.id}`);
            return res.status(404).json({ message: "User not found" });
        }
        console.log(`Lấy thông tin người dùng thành công cho ID: ${req.params.id}`, user);
        res.status(200).json(user);
    } catch (err) {
        console.error(`Lỗi khi lấy thông tin người dùng cho ID: ${req.params.id}`, err);
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
};

// Cập nhật thông tin một người dùng theo ID
exports.updateUser = async(req, res) => {
    try {
        console.log("Cập nhật người dùng với ID:", req.params.id);
        console.log("Dữ liệu cập nhật:", req.body);
        const { name, email, password } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        console.log("Kết quả cập nhật:", updatedUser);
        if (!updatedUser) {
            console.log(`Không tìm thấy người dùng để cập nhật với ID: ${req.params.id}`);
            return res.status(404).json({ message: "User not found" });
        }
        console.log(`Cập nhật người dùng thành công cho ID: ${req.params.id}`, updatedUser);
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(`Lỗi khi cập nhật người dùng cho ID: ${req.params.id}`, err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error", errors: err.errors });
        }
        res.status(500).json({ message: "Error updating user", error: err.message });
    }
};

// Xóa một người dùng theo ID
exports.deleteUser = async(req, res) => {
    try {
        console.log("Xóa người dùng với ID:", req.params.id);
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        console.log("Kết quả xóa:", deletedUser);
        if (!deletedUser) {
            console.log(`Không tìm thấy người dùng để xóa với ID: ${req.params.id}`);
            return res.status(404).json({ message: "User not found" });
        }
        console.log(`Xóa người dùng thành công cho ID: ${req.params.id}`);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(`Lỗi khi xóa người dùng cho ID: ${req.params.id}`, err);
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};