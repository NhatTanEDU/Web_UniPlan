// backend/jobs/subscriptionChecker.js
const cron = require('node-cron');
const subscriptionService = require('../services/subscriptionService');
const notificationService = require('../services/notificationService');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

class SubscriptionChecker {
    constructor() {
        this.isRunning = false;
    }
    
    /**
     * Khởi động cron jobs
     */
    start() {
        console.log('🚀 Starting subscription checker jobs...');
        
        // Job chạy mỗi ngày lúc 9:00 AM
        cron.schedule('0 9 * * *', async () => {
            console.log('⏰ Running daily subscription check...');
            await this.runDailyCheck();
        }, {
            timezone: "Asia/Ho_Chi_Minh"
        });
        
        // Job chạy mỗi giờ để kiểm tra expiry realtime
        cron.schedule('0 * * * *', async () => {
            console.log('⏰ Running hourly expiry check...');
            await this.checkExpiredSubscriptions();
        });
        
        // Job cleanup notifications cũ mỗi tuần
        cron.schedule('0 2 * * 0', async () => {
            console.log('🧹 Running weekly notification cleanup...');
            await this.cleanupOldNotifications();
        });
        
        console.log('✅ Subscription checker jobs started successfully');
    }
    
    /**
     * Kiểm tra hàng ngày
     */
    async runDailyCheck() {
        if (this.isRunning) {
            console.log('⚠️ Daily check is already running, skipping...');
            return;
        }
        
        try {
            this.isRunning = true;
            console.log('🔍 Starting daily subscription check...');
            
            // Tìm users sắp hết hạn
            const expiringUsers = await subscriptionService.checkExpiringSubscriptions();
            
            let warningsSent = 0;
            
            for (const user of expiringUsers) {
                try {
                    const remainingDays = subscriptionService.calculateRemainingDays(user);
                    
                    // Chỉ gửi cảnh báo cho 1-2 ngày trước hết hạn
                    if (remainingDays <= 2 && remainingDays > 0) {
                        
                        // Kiểm tra xem đã gửi cảnh báo hôm nay chưa
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const existingWarning = await Notification.findOne({
                            user_id: user._id,
                            type: user.current_plan_type === 'free_trial' ? 'trial_expiry_warning' : 'subscription_expiry_warning',
                            createdAt: { $gte: today }
                        });
                        
                        if (!existingWarning) {
                            if (user.current_plan_type === 'free_trial') {
                                await notificationService.sendTrialExpiryWarning(user._id, remainingDays);
                            } else {
                                await notificationService.sendSubscriptionExpiryWarning(user._id, remainingDays, user.current_plan_type);
                            }
                            
                            warningsSent++;
                            console.log(`📨 Warning sent to ${user.email} (${remainingDays} days left)`);
                        }
                    }
                    
                } catch (userError) {
                    console.error(`❌ Error processing user ${user.email}:`, userError.message);
                }
            }
            
            console.log(`✅ Daily check completed. Warnings sent: ${warningsSent}`);
            
        } catch (error) {
            console.error('❌ Error in daily subscription check:', error);
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * Kiểm tra subscription đã hết hạn
     */
    async checkExpiredSubscriptions() {
        try {
            console.log('🔍 Checking for expired subscriptions...');
            
            const now = new Date();
            
            // Tìm trial users đã hết hạn
            const expiredTrialUsers = await User.find({
                current_plan_type: 'free_trial',
                trial_end_date: { $lt: now }
            });
            
            // Tìm paid users đã hết hạn
            const expiredPaidUsers = await User.find({
                current_plan_type: { $in: ['monthly', 'yearly'] },
                subscription_end_date: { $lt: now }
            });
            
            let expiredCount = 0;
            
            // Xử lý trial users
            for (const user of expiredTrialUsers) {
                try {
                    await subscriptionService.handleTrialExpiry(user._id);
                    expiredCount++;
                    console.log(`⏰ Trial expired for ${user.email}`);
                } catch (error) {
                    console.error(`❌ Error handling trial expiry for ${user.email}:`, error.message);
                }
            }
            
            // Xử lý paid users
            for (const user of expiredPaidUsers) {
                try {
                    await subscriptionService.cancelSubscription(
                        user._id,
                        'Subscription expired automatically',
                        { userType: 'system' }
                    );
                    expiredCount++;
                    console.log(`⏰ Subscription expired for ${user.email}`);
                } catch (error) {
                    console.error(`❌ Error handling subscription expiry for ${user.email}:`, error.message);
                }
            }
            
            if (expiredCount > 0) {
                console.log(`✅ Processed ${expiredCount} expired subscriptions`);
            }
            
        } catch (error) {
            console.error('❌ Error checking expired subscriptions:', error);
        }
    }
    
    /**
     * Cleanup notifications cũ
     */
    async cleanupOldNotifications() {
        try {
            console.log('🧹 Starting notification cleanup...');
            
            const result = await Notification.cleanupExpired();
            
            console.log(`✅ Cleanup completed. Removed ${result.deletedCount} old notifications`);
            
        } catch (error) {
            console.error('❌ Error in notification cleanup:', error);
        }
    }
    
    /**
     * Manual trigger cho testing
     */
    async runManualCheck() {
        console.log('🔧 Running manual subscription check...');
        await this.runDailyCheck();
        await this.checkExpiredSubscriptions();
    }
    
    /**
     * Dừng all jobs
     */
    stop() {
        console.log('🛑 Stopping subscription checker jobs...');
        cron.getTasks().forEach(task => task.stop());
        console.log('✅ Subscription checker jobs stopped');
    }
}

// Export singleton instance
const subscriptionChecker = new SubscriptionChecker();

module.exports = subscriptionChecker;
