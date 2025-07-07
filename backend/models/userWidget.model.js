const mongoose = require('mongoose');

const UserWidgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    widgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Widget', required: true },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    size: {
        width: { type: Number, default: 1 },
        height: { type: Number, default: 1 }
    },
    config: { type: Object, default: {} }, // Cấu hình riêng từng widget, ví dụ màu sắc, biểu đồ,...
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserWidget', UserWidgetSchema); 