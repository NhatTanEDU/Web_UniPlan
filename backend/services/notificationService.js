// backend/services/notificationService.js
const nodemailer = require('nodemailer');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

class NotificationService {
    constructor() {
        // Setup email transporter (skip trong test mode)
        try {
            this.emailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } catch (error) {
            console.warn('⚠️ Email transporter setup failed, email features disabled:', error.message);
            this.emailTransporter = null;
        }
    }

    /**
     * Lấy danh sách thông báo của người dùng
     * @param {String} userId ID của người dùng
     * @returns {Promise<Array>} Danh sách thông báo
     */
    async getNotifications(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required to get notifications.');
            }
            // Thêm timeout cho truy vấn
            const notifications = await Notification.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50)
                .maxTimeMS(5000); // Giới hạn 50 thông báo mới nhất, timeout 5s
            return notifications;
        } catch (error) {
            console.error('❌ Error in getNotifications service:', error);
            throw error;
        }
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     * @param {String} notificationId ID của thông báo
     * @param {String} userId ID của người dùng (để xác thực)
     * @returns {Promise<Object>} Thông báo đã được cập nhật
     */
    async markNotificationAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId: userId },
                { read: true, readAt: new Date() },
                { new: true }
            );
            if (!notification) {
                throw new Error('Notification not found or user not authorized.');
            }
            return notification;
        } catch (error) {
            console.error('❌ Error in markNotificationAsRead service:', error);
            throw error;
        }
    }

    /**
     * Đánh dấu tất cả thông báo của người dùng là đã đọc
     * @param {String} userId ID của người dùng
     * @returns {Promise<Object>} Kết quả của thao tác
     */
    async markAllNotificationsAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId: userId, read: false },
                { $set: { read: true, readAt: new Date() } }
            );
            return { success: true, modifiedCount: result.nModified };
        } catch (error) {
            console.error('❌ Error in markAllNotificationsAsRead service:', error);
            throw error;
        }
    }
    
    /**
     * Gửi cảnh báo hết hạn trial
     */
    async sendTrialExpiryWarning(userId, daysLeft) {
        try {
            console.log(`📨 Sending trial expiry warning to user ${userId}, ${daysLeft} days left`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const title = `Gói dùng thử sắp hết hạn (${daysLeft} ngày)`;
            const message = `Gói dùng thử 7 ngày của bạn sẽ hết hạn trong ${daysLeft} ngày. Hãy nâng cấp để tiếp tục sử dụng tất cả tính năng UniPlan!`;
            
            // Create in-app notification
            const notification = await Notification.createNotification({
                userId: userId,
                title: title,
                message: message,
                type: 'trial_expiry_warning',
                priority: daysLeft <= 1 ? 'urgent' : 'high',
                metadata: {
                    days_left: daysLeft,
                    action_url: '/plans',
                    action_text: 'Xem gói nâng cấp'
                },
                channels: { in_app: true, email: true }
            });
            
            // Send email
            await this.sendEmail({
                to: user.email,
                subject: title,
                html: this.generateTrialExpiryEmailTemplate(user, daysLeft),
                notificationId: notification._id
            });
            
            console.log(`✅ Trial expiry warning sent to ${user.email}`);
            
            return { success: true, notification };
            
        } catch (error) {
            console.error('❌ Error sending trial expiry warning:', error);
            throw error;
        }
    }
    
    /**
     * Gửi cảnh báo hết hạn gói trả phí
     */
    async sendSubscriptionExpiryWarning(userId, daysLeft, planType) {
        try {
            console.log(`📨 Sending subscription expiry warning to user ${userId}, ${daysLeft} days left`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const planName = planType === 'monthly' ? 'Gói tháng' : 'Gói năm';
            const title = `${planName} sắp hết hạn (${daysLeft} ngày)`;
            const message = `${planName} của bạn sẽ hết hạn trong ${daysLeft} ngày. Hãy gia hạn để tiếp tục sử dụng UniPlan!`;
            
            // Create notification
            const notification = await Notification.createNotification({
                userId: userId,
                title: title,
                message: message,
                type: 'subscription_expiry_warning',
                priority: daysLeft <= 1 ? 'urgent' : 'high',
                metadata: {
                    days_left: daysLeft,
                    subscription_type: planType,
                    action_url: '/plans',
                    action_text: 'Gia hạn ngay'
                },
                channels: { in_app: true, email: true }
            });
            
            // Send email
            await this.sendEmail({
                to: user.email,
                subject: title,
                html: this.generateSubscriptionExpiryEmailTemplate(user, daysLeft, planName),
                notificationId: notification._id
            });
            
            console.log(`✅ Subscription expiry warning sent to ${user.email}`);
            
            return { success: true, notification };
            
        } catch (error) {
            console.error('❌ Error sending subscription expiry warning:', error);
            throw error;
        }
    }
    
    /**
     * Gửi thông báo thanh toán thành công
     */
    async sendPaymentSuccessNotification(userId, paymentInfo) {
        try {
            console.log(`📨 Sending payment success notification to user ${userId}`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const title = 'Thanh toán thành công!';
            const message = `Thanh toán ${paymentInfo.planName} (${paymentInfo.amount.toLocaleString('vi-VN')} VND) đã thành công. Cảm ơn bạn đã sử dụng UniPlan!`;
            
            // Create notification
            const notification = await Notification.createNotification({
                userId: userId,
                title: title,
                message: message,
                type: 'payment_successful',
                priority: 'normal',
                metadata: {
                    payment_id: paymentInfo.paymentId,
                    subscription_type: paymentInfo.planType,
                    amount: paymentInfo.amount
                },
                channels: { in_app: true, email: true }
            });
            
            // Send email
            await this.sendEmail({
                to: user.email,
                subject: title,
                html: this.generatePaymentSuccessEmailTemplate(user, paymentInfo),
                notificationId: notification._id
            });
            
            console.log(`✅ Payment success notification sent to ${user.email}`);
            
            return { success: true, notification };
            
        } catch (error) {
            console.error('❌ Error sending payment success notification:', error);
            throw error;
        }
    }
    
    /**
     * Gửi thông báo thanh toán thất bại
     */
    async sendPaymentFailedNotification(userId, paymentInfo, reason) {
        try {
            console.log(`📨 Sending payment failed notification to user ${userId}`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const title = 'Thanh toán thất bại';
            const message = `Thanh toán ${paymentInfo.planName} không thành công. Lý do: ${reason}. Vui lòng thử lại!`;
            
            // Create notification
            const notification = await Notification.createNotification({
                userId: userId,
                title: title,
                message: message,
                type: 'payment_failed',
                priority: 'high',
                metadata: {
                    payment_id: paymentInfo.paymentId,
                    subscription_type: paymentInfo.planType,
                    failure_reason: reason,
                    action_url: '/plans',
                    action_text: 'Thử lại'
                },
                channels: { in_app: true, email: true }
            });
            
            // Send email
            await this.sendEmail({
                to: user.email,
                subject: title,
                html: this.generatePaymentFailedEmailTemplate(user, paymentInfo, reason),
                notificationId: notification._id
            });
            
            console.log(`✅ Payment failed notification sent to ${user.email}`);
            
            return { success: true, notification };
            
        } catch (error) {
            console.error('❌ Error sending payment failed notification:', error);
            throw error;
        }
    }
    
    /**
     * Gửi thông báo chào mừng
     */
    async sendWelcomeMessage(userId) {
        try {
            console.log(`📨 Sending welcome message to user ${userId}`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const title = 'Chào mừng đến với UniPlan!';
            const message = 'Bạn đã đăng ký thành công và nhận được 7 ngày dùng thử miễn phí. Hãy khám phá tất cả tính năng của UniPlan!';
            
            // Create notification
            const notification = await Notification.createNotification({
                userId: userId,
                title: title,
                message: message,
                type: 'welcome',
                priority: 'normal',
                metadata: {
                    action_url: '/dashboard',
                    action_text: 'Bắt đầu'
                },
                channels: { in_app: true, email: true }
            });
            
            // Send email
            await this.sendEmail({
                to: user.email,
                subject: title,
                html: this.generateWelcomeEmailTemplate(user),
                notificationId: notification._id
            });
            
            console.log(`✅ Welcome message sent to ${user.email}`);
            
            return { success: true, notification };
            
        } catch (error) {
            console.error('❌ Error sending welcome message:', error);
            throw error;
        }
    }
    
    /**
     * Gửi email
     */    async sendEmail({ to, subject, html, notificationId }) {
        try {
            if (!this.emailTransporter) {
                console.warn('⚠️ Email transporter not available, skipping email send');
                return { success: false, reason: 'Email transporter not configured' };
            }
            
            const mailOptions = {
                from: `"UniPlan" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html
            };
            
            const result = await this.emailTransporter.sendMail(mailOptions);
            
            // Update notification
            if (notificationId) {
                await Notification.findByIdAndUpdate(notificationId, {
                    'sent_channels.email': true,
                    'sent_channels.email_sent_at': new Date()
                });
            }
            
            console.log(`📧 Email sent successfully to ${to}`);
            return result;
            
        } catch (error) {
            console.error('❌ Error sending email:', error);
            throw error;
        }
    }
    
    /**
     * Email templates
     */
    generateTrialExpiryEmailTemplate(user, daysLeft) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b35;">⏰ Gói dùng thử sắp hết hạn!</h2>
            <p>Xin chào <strong>${user.fullname || user.email}</strong>,</p>
            <p>Gói dùng thử 7 ngày của bạn tại UniPlan sẽ hết hạn trong <strong>${daysLeft} ngày</strong>.</p>
            <p>Để tiếp tục sử dụng tất cả tính năng tuyệt vời của UniPlan, hãy nâng cấp gói ngay hôm nay!</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/plans" 
                   style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Nâng cấp ngay
                </a>
            </div>
            <p><em>Đội ngũ UniPlan</em></p>
        </div>
        `;
    }
    
    generateSubscriptionExpiryEmailTemplate(user, daysLeft, planName) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b35;">⏰ ${planName} sắp hết hạn!</h2>
            <p>Xin chào <strong>${user.fullname || user.email}</strong>,</p>
            <p>${planName} của bạn tại UniPlan sẽ hết hạn trong <strong>${daysLeft} ngày</strong>.</p>
            <p>Hãy gia hạn để tiếp tục sử dụng UniPlan mà không bị gián đoạn!</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/plans" 
                   style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Gia hạn ngay
                </a>
            </div>
            <p><em>Đội ngũ UniPlan</em></p>
        </div>
        `;
    }
    
    generatePaymentSuccessEmailTemplate(user, paymentInfo) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">✅ Thanh toán thành công!</h2>
            <p>Xin chào <strong>${user.fullname || user.email}</strong>,</p>
            <p>Cảm ơn bạn đã thanh toán thành công!</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Chi tiết thanh toán:</strong></p>
                <ul>
                    <li>Gói: ${paymentInfo.planName}</li>
                    <li>Số tiền: ${paymentInfo.amount.toLocaleString('vi-VN')} VND</li>
                    <li>Mã đơn hàng: ${paymentInfo.orderId}</li>
                </ul>
            </div>
            <p>Bạn có thể bắt đầu sử dụng tất cả tính năng ngay bây giờ!</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Vào Dashboard
                </a>
            </div>
            <p><em>Đội ngũ UniPlan</em></p>
        </div>
        `;
    }
    
    generatePaymentFailedEmailTemplate(user, paymentInfo, reason) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">❌ Thanh toán thất bại</h2>
            <p>Xin chào <strong>${user.fullname || user.email}</strong>,</p>
            <p>Thanh toán của bạn không thành công.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Chi tiết:</strong></p>
                <ul>
                    <li>Gói: ${paymentInfo.planName}</li>
                    <li>Lý do: ${reason}</li>
                    <li>Mã đơn hàng: ${paymentInfo.orderId}</li>
                </ul>
            </div>
            <p>Vui lòng thử lại hoặc liên hệ với chúng tôi nếu cần hỗ trợ.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/plans" 
                   style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Thử lại
                </a>
            </div>
            <p><em>Đội ngũ UniPlan</em></p>
        </div>
        `;
    }
    
    generateWelcomeEmailTemplate(user) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">🎉 Chào mừng đến với UniPlan!</h2>
            <p>Xin chào <strong>${user.fullname || user.email}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký UniPlan! Bạn đã nhận được <strong>7 ngày dùng thử miễn phí</strong>.</p>
            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Những gì bạn có thể làm:</strong></p>
                <ul>
                    <li>Tạo và quản lý project</li>
                    <li>Làm việc nhóm hiệu quả</li>
                    <li>Theo dõi tiến độ công việc</li>
                    <li>Và nhiều tính năng khác...</li>
                </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Bắt đầu ngay
                </a>
            </div>
            <p><em>Chúc bạn có trải nghiệm tuyệt vời!<br>Đội ngũ UniPlan</em></p>
        </div>
        `;
    }
}

module.exports = new NotificationService();
