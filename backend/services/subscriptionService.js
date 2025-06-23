// backend/services/subscriptionService.js
const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const SubscriptionHistory = require('../models/subscriptionHistory.model');
const Notification = require('../models/notification.model');

class SubscriptionService {
    
    /**
     * Nâng cấp gói subscription
     */
    async upgradeSubscription(userId, planType, paymentInfo = null, triggeredBy = null) {
        try {
            console.log(`🔄 Upgrading subscription for user ${userId} to ${planType}`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const oldPlan = user.current_plan_type;
            const oldEndDate = user.subscription_end_date || user.trial_end_date;
            
            // Backup old plan info
            const oldPlanInfo = user.getPlanDisplayInfo();
            
            // Upgrade user plan
            user.upgradeToSubscription(planType);
            await user.save();
            
            // Log history
            await SubscriptionHistory.logAction({
                userId: userId,
                action: 'upgraded',
                fromPlan: oldPlan,
                toPlan: planType,
                fromDate: oldEndDate,
                toDate: user.subscription_end_date,
                paymentId: paymentInfo?.paymentId || null,
                amount: paymentInfo?.amount || 0,
                reason: paymentInfo?.reason || 'User upgraded subscription',
                triggeredBy: triggeredBy || { userType: 'user' },
                metadata: {
                    duration_days: planType === 'monthly' ? 30 : 365,
                    billing_cycle: planType
                }
            });
            
            // Create notification
            await Notification.createNotification({
                userId: userId,
                title: 'Nâng cấp gói thành công!',
                message: `Bạn đã nâng cấp từ ${oldPlanInfo.name} lên ${user.getPlanDisplayInfo().name}. Chúc bạn trải nghiệm tốt!`,
                type: 'payment_successful',
                priority: 'high',
                metadata: {
                    subscription_type: planType,
                    payment_id: paymentInfo?.paymentId || null
                }
            });
            
            console.log(`✅ Successfully upgraded user ${userId} from ${oldPlan} to ${planType}`);
            
            return {
                success: true,
                oldPlan: oldPlan,
                newPlan: planType,
                user: user,
                message: 'Subscription upgraded successfully'
            };
            
        } catch (error) {
            console.error('❌ Error upgrading subscription:', error);
            throw new Error(`Failed to upgrade subscription: ${error.message}`);
        }
    }
    
    /**
     * Gia hạn gói hiện tại
     */
    async renewSubscription(userId, paymentInfo = null) {
        try {
            console.log(`🔄 Renewing subscription for user ${userId}`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const currentPlan = user.current_plan_type;
            if (!['monthly', 'yearly'].includes(currentPlan)) {
                throw new Error('No active subscription to renew');
            }
            
            const oldEndDate = user.subscription_end_date;
            
            // Extend subscription
            const extensionDays = currentPlan === 'monthly' ? 30 : 365;
            const newEndDate = new Date(user.subscription_end_date);
            newEndDate.setDate(newEndDate.getDate() + extensionDays);
            
            user.subscription_end_date = newEndDate;
            user.next_billing_date = newEndDate;
            user.last_payment_date = new Date();
            user.payment_status = 'completed';
            
            await user.save();
            
            // Log history
            await SubscriptionHistory.logAction({
                userId: userId,
                action: 'renewed',
                fromPlan: currentPlan,
                toPlan: currentPlan,
                fromDate: oldEndDate,
                toDate: newEndDate,
                paymentId: paymentInfo?.paymentId || null,
                amount: paymentInfo?.amount || 0,
                reason: 'Subscription renewed',
                metadata: {
                    duration_days: extensionDays,
                    billing_cycle: currentPlan
                }
            });
            
            // Create notification
            await Notification.createNotification({
                userId: userId,
                title: 'Gia hạn thành công!',
                message: `Gói ${user.getPlanDisplayInfo().name} đã được gia hạn đến ${newEndDate.toLocaleDateString('vi-VN')}.`,
                type: 'payment_successful',
                priority: 'normal',
                metadata: {
                    subscription_type: currentPlan,
                    payment_id: paymentInfo?.paymentId || null
                }
            });
            
            console.log(`✅ Successfully renewed subscription for user ${userId}`);
            
            return {
                success: true,
                plan: currentPlan,
                oldEndDate: oldEndDate,
                newEndDate: newEndDate,
                user: user
            };
            
        } catch (error) {
            console.error('❌ Error renewing subscription:', error);
            throw new Error(`Failed to renew subscription: ${error.message}`);
        }
    }
    
    /**
     * Hủy gói subscription
     */
    async cancelSubscription(userId, reason = null, triggeredBy = null) {
        try {
            console.log(`🔄 Cancelling subscription for user ${userId}`);
            
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const oldPlan = user.current_plan_type;
            const oldEndDate = user.subscription_end_date;
            
            // Mark as expired but keep end date for grace period
            user.markAsExpired();
            await user.save();
            
            // Log history
            await SubscriptionHistory.logAction({
                userId: userId,
                action: 'cancelled',
                fromPlan: oldPlan,
                toPlan: 'expired',
                fromDate: oldEndDate,
                toDate: new Date(),
                reason: reason || 'User cancelled subscription',
                triggeredBy: triggeredBy || { userType: 'user' }
            });
            
            // Create notification
            await Notification.createNotification({
                userId: userId,
                title: 'Gói đã bị hủy',
                message: reason || 'Gói subscription của bạn đã bị hủy. Bạn có thể nâng cấp lại bất cứ lúc nào.',
                type: 'subscription_expired',
                priority: 'high',
                metadata: {
                    action_url: '/plans',
                    action_text: 'Xem gói'
                }
            });
            
            console.log(`✅ Successfully cancelled subscription for user ${userId}`);
            
            return {
                success: true,
                oldPlan: oldPlan,
                user: user
            };
            
        } catch (error) {
            console.error('❌ Error cancelling subscription:', error);
            throw new Error(`Failed to cancel subscription: ${error.message}`);
        }
    }
    
    /**
     * Tính số ngày còn lại
     */
    calculateRemainingDays(user) {
        try {
            let endDate;
            
            if (user.current_plan_type === 'free_trial') {
                endDate = user.trial_end_date;
            } else if (['monthly', 'yearly'].includes(user.current_plan_type)) {
                endDate = user.subscription_end_date;
            } else {
                return 0; // Expired
            }
            
            if (!endDate) return 0;
            
            const now = new Date();
            const diffTime = endDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return Math.max(0, diffDays);
            
        } catch (error) {
            console.error('Error calculating remaining days:', error);
            return 0;
        }
    }
    
    /**
     * Xử lý hết hạn trial
     */
    async handleTrialExpiry(userId) {
        try {
            console.log(`🔄 Handling trial expiry for user ${userId}`);
            
            const user = await User.findById(userId);
            if (!user || user.current_plan_type !== 'free_trial') {
                return { success: false, message: 'User not in trial' };
            }
            
            // Check if really expired
            if (!user.isTrialExpired()) {
                return { success: false, message: 'Trial not yet expired' };
            }
            
            const oldEndDate = user.trial_end_date;
            
            // Mark as expired
            user.markAsExpired();
            await user.save();
            
            // Log history
            await SubscriptionHistory.logAction({
                userId: userId,
                action: 'trial_expired',
                fromPlan: 'free_trial',
                toPlan: 'expired',
                fromDate: user.trial_start_date,
                toDate: oldEndDate,
                reason: 'Trial period ended',
                triggeredBy: { userType: 'system' }
            });
            
            // Create notification
            await Notification.createNotification({
                userId: userId,
                title: 'Gói dùng thử đã hết hạn',
                message: 'Gói dùng thử 7 ngày của bạn đã hết hạn. Hãy nâng cấp để tiếp tục sử dụng UniPlan!',
                type: 'trial_expired',
                priority: 'urgent',
                metadata: {
                    action_url: '/plans',
                    action_text: 'Nâng cấp ngay'
                }
            });
            
            console.log(`✅ Trial expired for user ${userId}`);
            
            return {
                success: true,
                user: user
            };
            
        } catch (error) {
            console.error('❌ Error handling trial expiry:', error);
            throw new Error(`Failed to handle trial expiry: ${error.message}`);
        }
    }
    
    /**
     * Lấy lịch sử subscription
     */
    async getSubscriptionHistory(userId, limit = 20) {
        try {
            const history = await SubscriptionHistory.getUserHistory(userId, limit);
            
            return {
                success: true,
                history: history.map(item => item.getDisplayInfo())
            };
            
        } catch (error) {
            console.error('❌ Error getting subscription history:', error);
            throw new Error(`Failed to get subscription history: ${error.message}`);
        }
    }
    
    /**
     * Kiểm tra users cần cảnh báo hết hạn
     */
    async checkExpiringSubscriptions() {
        try {
            console.log('🔍 Checking for expiring subscriptions...');
            
            const now = new Date();
            const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
            const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
            
            // Find users with subscriptions expiring in 1-2 days
            const expiringUsers = await User.find({
                $or: [
                    {
                        current_plan_type: 'free_trial',
                        trial_end_date: { $gte: now, $lte: twoDaysFromNow }
                    },
                    {
                        current_plan_type: { $in: ['monthly', 'yearly'] },
                        subscription_end_date: { $gte: now, $lte: twoDaysFromNow }
                    }
                ]
            });
            
            console.log(`📊 Found ${expiringUsers.length} users with expiring subscriptions`);
            
            return expiringUsers;
            
        } catch (error) {
            console.error('❌ Error checking expiring subscriptions:', error);
            throw error;
        }
    }
}

module.exports = new SubscriptionService();