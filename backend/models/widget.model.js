const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên widget: "Lịch", "Thành viên", v.v.
    type: { type: String, required: true }, // Loại widget: "calendar", "member", v.v.
    icon: { type: String }, // Đường dẫn icon hoặc tên biểu tượng
    description: { type: String }, // Mô tả widget
    isDefault: { type: Boolean, default: false } // Widget mặc định hay không
});

module.exports = mongoose.model('Widget', WidgetSchema); 