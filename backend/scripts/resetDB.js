// scripts/resetDB.js

const mongoose = require('mongoose');

const DB_URI = 'mongodb://localhost/uniplan';

async function resetDB() {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ Kết nối database thành công");

        // Lấy danh sách các collection
        const collections = await mongoose.connection.db.listCollections().toArray();

        for (let coll of collections) {
            await mongoose.connection.db.dropCollection(coll.name);
            console.log(`🗑️ Đã xóa collection: ${coll.name}`);
        }

        console.log("🎉 Database đã được reset hoàn toàn");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Lỗi khi reset database:", err);
        mongoose.connection.close();
        process.exit(1);
    }
}

resetDB();