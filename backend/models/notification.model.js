const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['project_invitation', 'project_update', 'system'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 