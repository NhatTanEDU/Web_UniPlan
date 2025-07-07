const nodemailer = require('nodemailer');
require("dotenv").config();

console.log('EMAIL_USER:', process.env.EMAIL_USER); // 👈 kiểm tra giá trị
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const sendEmail = async(to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"UniPlan" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;