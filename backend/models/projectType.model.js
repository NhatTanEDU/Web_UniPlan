const mongoose = require('mongoose');

const projectTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const ProjectType = mongoose.model('ProjectType', projectTypeSchema);

module.exports = ProjectType; 