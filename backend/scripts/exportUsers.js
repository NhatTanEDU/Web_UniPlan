// scripts/exportUsers.js

const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../backend/models/user.model');

const DB_URI = 'mongodb://localhost/uniplan';
const OUTPUT_FILE = './backup/users.json';

async function exportData() {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const users = await User.find({}).lean(); // lấy raw data

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(users, null, 2));
        console.log(`💾 Đã xuất ${users.length} bản ghi ra file: ${OUTPUT_FILE}`);

        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Lỗi khi export dữ liệu:", err);
        mongoose.connection.close();
        process.exit(1);
    }
}

exportData();