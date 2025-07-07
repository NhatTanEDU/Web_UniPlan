// migrateUsers.js

const mongoose = require('mongoose');
const User = require('./backend/models/user.model'); // Đường dẫn đến model User

// Kết nối tới database MongoDB của bạn
const DB_URI = 'mongodb://localhost/uniplan'; // Thay bằng URI của bạn nếu khác

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Kết nối database thành công"))
.catch(err => {
    console.error("❌ Lỗi kết nối database:", err);
    process.exit(1); // Dừng script nếu không kết nối được
});

async function migrate() {
    try {
        // Tìm tất cả người dùng trong database
        const users = await User.find({});

        if (users.length === 0) {
            console.log("👋 Không có người dùng nào để cập nhật.");
            return;
        }

        console.log(`🔁 Đang bắt đầu cập nhật ${users.length} người dùng...`);

        for (let user of users) {
            let isModified = false;

            // Cập nhật role nếu chưa có
            if (!user.role) {
                user.role = 'User';
                isModified = true;
            }

            // Cập nhật current_plan_type nếu chưa có
            if (!user.current_plan_type) {
                user.current_plan_type = 'Free';
                isModified = true;
            }

            // Cập nhật online_status nếu chưa có
            if (!user.online_status) {
                user.online_status = 'Offline';
                isModified = true;
            }

            // Cập nhật avatar_url nếu chưa có
            if (user.avatar_url === undefined || user.avatar_url === null) {
                user.avatar_url = null;
                isModified = true;
            }

            // Chỉ lưu lại nếu có thay đổi
            if (isModified) {
                await user.save();
                console.log(`✔️ Đã cập nhật người dùng: ${user._id}`);
            } else {
                console.log(`⏭️ Người dùng không cần cập nhật: ${user._id}`);
            }
        }

        console.log("🎉 Migration hoàn tất thành công!");
        mongoose.connection.close(); // Đóng kết nối khi xong
    } catch (err) {
        console.error("❌ Có lỗi xảy ra trong quá trình migration:", err);
        mongoose.connection.close();
        process.exit(1);
    }
}

migrate();