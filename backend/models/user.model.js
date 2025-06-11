// backend/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    full_name: { 
        type: String, 
        required: [true, 'Tên đầy đủ là bắt buộc'], 
        trim: true 
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Email không hợp lệ']
    },
    password: { 
        type: String, 
        required: [true, 'Mật khẩu là bắt buộc'], 
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'] 
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    current_plan_type: {
        type: String,
        enum: ['Free', 'Basic', 'Premium'],
        default: 'Free'
    },
    online_status: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Offline'
    },
    avatar_url: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;