const express = require("express");
const router = express.Router();

const { forgotPassword } = require("../controllers/forgotPassword.controller");
const { resetPassword } = require("../controllers/resetPassword.controller");

// Gửi mail khôi phục
router.post("/forgot", forgotPassword);

// Đặt lại mật khẩu
router.post("/reset/:token", resetPassword);

module.exports = router;