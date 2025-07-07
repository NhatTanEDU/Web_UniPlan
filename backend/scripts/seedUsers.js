// scripts/seedUsers.js

const mongoose = require('mongoose');
const User = require('../backend/models/user.model'); // Điều chỉnh đường dẫn nếu cần
const bcrypt = require('bcrypt');

const DB_URI = 'mongodb://localhost/uniplan'; // Đổi URI nếu dùng cloud db

// Danh sách user mẫu
const sampleUsers = [
    {
        name: "Admin Tan",
        email: "admin@example.com",
        password: "12345678",
        role: "Admin"
    },
    {
        name: "User Tan",
        email: "user@example.com",
        password: "12345678",
        role: "User"
    },
    {
        name: "Manager Tan",
        email: "manager@example.com",
        password: "12345678",
        role: "Manager"
    }
];

async function seed() {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ Kết nối database thành công");

        // Xóa hết người dùng cũ trước khi seed
        await User.deleteMany({});
        console.log("🗑️ Đã xóa dữ liệu người dùng cũ");

        // Hash mật khẩu và lưu vào database
        for (let user of sampleUsers) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);

            await User.create(user);
            console.log(`➕ Đã thêm người dùng: ${user.email}`);
        }

        console.log("🌱 Seed dữ liệu hoàn tất!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Lỗi khi seeding dữ liệu:", err);
        mongoose.connection.close();
        process.exit(1);
    }
}

seed();