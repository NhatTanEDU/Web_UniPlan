// backend/controllers/subscriptionController.js
const subscriptionService = require('../services/subscriptionService');
const notificationService = require('../services/notificationService');
const User = require('../models/user.model');
const SubscriptionHistory = require('../models/subscriptionHistory.model');

const subscriptionController = {
    
    /**
     * Lấy trạng thái gói hiện tại
     * GET /api/subscription/status
     */    getSubscriptionStatus: async (req, res) => {
        try {
            // 🔍 THÊM LOG CHI TIẾT CHO DEBUG TOKEN
            const authHeader = req.headers.authorization;
            console.log('🔍 [getSubscriptionStatus] Raw auth header:', authHeader?.substring(0, 50) + '...');
            console.log('🔍 [getSubscriptionStatus] req.user:', req.user);
            const userId = req.user.userId; // Sử dụng req.user.userId
            console.log('🔍 [getSubscriptionStatus] userId:', userId);
            
            const user = await User.findById(userId);
            console.log('🔍 [getSubscriptionStatus] user found:', !!user);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }
            
            // 🔍 THÊM LOG CHI TIẾT CHO USER
            console.log('🔍 [getSubscriptionStatus] User details:');
            console.log('  - email:', user.email);
            console.log('  - current_plan_type:', user.current_plan_type);
            console.log('  - trial_start_date:', user.trial_start_date);
            console.log('  - trial_end_date:', user.trial_end_date);
            console.log('  - subscription_start_date:', user.subscription_start_date);
            console.log('  - subscription_end_date:', user.subscription_end_date);
            console.log('  - createdAt:', user.createdAt);
            
            const planInfo = user.getPlanDisplayInfo();
            const remainingDays = subscriptionService.calculateRemainingDays(user);
            
            console.log('🔍 [getSubscriptionStatus] Calculated values:');
            console.log('  - planInfo:', planInfo);
            console.log('  - remainingDays:', remainingDays);
            console.log('  - canAccessService:', user.canAccessService());
            
            // Logic xác định subscription type
            let subscriptionType = user.current_plan_type;
            if (!subscriptionType || subscriptionType === null || subscriptionType === undefined) {
                subscriptionType = 'free_trial';
                console.log('🔍 [getSubscriptionStatus] No plan type, defaulting to free_trial');
            }
            
            // Logic xác định isPremium
            const isPremium = ['monthly', 'yearly'].includes(subscriptionType);
            console.log('🔍 [getSubscriptionStatus] isPremium calculation:', {
                subscriptionType,
                isPremium,
                includes: ['monthly', 'yearly'].includes(subscriptionType)
            });
              // Response đơn giản hóa để frontend dễ sử dụng
            const response = {
                subscriptionType: subscriptionType,
                current_plan_type: subscriptionType, // Thêm field này để tương thích với frontend
                subscriptionStart: user.subscription_start_date,
                subscriptionEnd: user.subscription_end_date,
                daysRemaining: remainingDays,
                isActive: user.canAccessService(),
                isPremium: isPremium,
                trialUsed: user.trial_start_date ? true : false
            };
            console.log('✅ [getSubscriptionStatus] Final response:', response);
            res.json(response);
        } catch (error) {
            console.error('❌ [getSubscriptionStatus] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy trạng thái gói dịch vụ'
            });
        }
    },
    
    /**
     * Nâng cấp gói (through direct admin action)
     * POST /api/subscription/upgrade
     */
    upgradeSubscription: async (req, res) => {
        try {
            const { planType, paymentId, reason } = req.body;
            const userId = req.user.id;
            
            // Validate input
            if (!planType || !['monthly', 'yearly'].includes(planType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Loại gói không hợp lệ'
                });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }
            
            // Get payment info if paymentId provided
            let paymentInfo = null;
            if (paymentId) {
                const Payment = require('../models/payment.model');
                const payment = await Payment.findById(paymentId);
                if (payment) {
                    paymentInfo = {
                        paymentId: payment._id,
                        amount: payment.amount,
                        reason: reason || 'User upgrade subscription'
                    };
                }
            }
            
            // Trigger upgrade
            const result = await subscriptionService.upgradeSubscription(
                userId, 
                planType, 
                paymentInfo,
                {
                    userId: userId,
                    userType: 'user',
                    ipAddress: req.ip
                }
            );
            
            res.json({
                success: true,
                message: 'Nâng cấp gói thành công',
                data: {
                    oldPlan: result.oldPlan,
                    newPlan: result.newPlan,
                    planInfo: result.user.getPlanDisplayInfo()
                }
            });
            
        } catch (error) {
            console.error('❌ Error upgrading subscription:', error);
            res.status(500).json({
                success: false,
                message: `Lỗi nâng cấp gói: ${error.message}`
            });
        }
    },
    
    /**
     * Hủy gói
     * POST /api/subscription/cancel
     */
    cancelSubscription: async (req, res) => {
        try {
            const { reason } = req.body;
            const userId = req.user.id;
            
            const result = await subscriptionService.cancelSubscription(
                userId,
                reason || 'User cancelled subscription',
                {
                    userId: userId,
                    userType: 'user',
                    ipAddress: req.ip
                }
            );
            
            res.json({
                success: true,
                message: 'Hủy gói thành công',
                data: {
                    oldPlan: result.oldPlan,
                    planInfo: result.user.getPlanDisplayInfo()
                }
            });
            
        } catch (error) {
            console.error('❌ Error cancelling subscription:', error);
            res.status(500).json({
                success: false,
                message: `Lỗi hủy gói: ${error.message}`
            });
        }
    },
    
    /**
     * Lấy lịch sử thay đổi gói
     * GET /api/subscription/history
     */
    getSubscriptionHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 20 } = req.query;
            
            const result = await subscriptionService.getSubscriptionHistory(userId, parseInt(limit));
            
            res.json({
                success: true,
                data: result.history
            });
            
        } catch (error) {
            console.error('❌ Error getting subscription history:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy lịch sử gói'
            });
        }
    },
    
    /**
     * Kiểm tra users sắp hết hạn (Admin only)
     * GET /api/subscription/expiring
     */
    getExpiringSubscriptions: async (req, res) => {
        try {
            // Check if user is admin
            const user = await User.findById(req.user.id);
            if (!user || user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ admin mới có quyền truy cập'
                });
            }
            
            const expiringUsers = await subscriptionService.checkExpiringSubscriptions();
            
            const result = expiringUsers.map(user => ({
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                currentPlan: user.current_plan_type,
                planInfo: user.getPlanDisplayInfo(),
                remainingDays: subscriptionService.calculateRemainingDays(user),
                trialEndDate: user.trial_end_date,
                subscriptionEndDate: user.subscription_end_date
            }));
            
            res.json({
                success: true,
                data: {
                    count: result.length,
                    users: result
                }
            });
            
        } catch (error) {
            console.error('❌ Error getting expiring subscriptions:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy danh sách gói sắp hết hạn'
            });
        }
    },
    
    /**
     * Gửi thông báo cảnh báo thủ công (Admin only)
     * POST /api/subscription/send-warning
     */
    sendExpiryWarning: async (req, res) => {
        try {
            const { userId } = req.body;
            
            // Check if user is admin
            const adminUser = await User.findById(req.user.id);
            if (!adminUser || adminUser.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ admin mới có quyền thực hiện'
                });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }
            
            const remainingDays = subscriptionService.calculateRemainingDays(user);
            
            let result;
            if (user.current_plan_type === 'free_trial') {
                result = await notificationService.sendTrialExpiryWarning(userId, remainingDays);
            } else if (['monthly', 'yearly'].includes(user.current_plan_type)) {
                result = await notificationService.sendSubscriptionExpiryWarning(userId, remainingDays, user.current_plan_type);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'User không có gói active để gửi cảnh báo'
                });
            }
            
            res.json({
                success: true,
                message: 'Đã gửi cảnh báo thành công',
                data: {
                    userId: userId,
                    userEmail: user.email,
                    remainingDays: remainingDays,
                    notificationId: result.notification._id
                }
            });
            
        } catch (error) {
            console.error('❌ Error sending expiry warning:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi gửi cảnh báo'
            });
        }
    },
    
    /**
     * Lấy thống kê subscription (Admin only)
     * GET /api/subscription/stats
     */
    getSubscriptionStats: async (req, res) => {
        try {
            // Check if user is admin
            const user = await User.findById(req.user.id);
            if (!user || user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ admin mới có quyền truy cập'
                });
            }
            
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: '$current_plan_type',
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            const totalUsers = await User.countDocuments();
            const activeSubscriptions = await User.countDocuments({
                current_plan_type: { $in: ['free_trial', 'monthly', 'yearly'] }
            });
            
            // Revenue calculation (basic)
            const monthlyRevenue = await User.countDocuments({ current_plan_type: 'monthly' }) * 500000;
            const yearlyRevenue = await User.countDocuments({ current_plan_type: 'yearly' }) * 3000000;
            
            res.json({
                success: true,
                data: {
                    totalUsers: totalUsers,
                    activeSubscriptions: activeSubscriptions,
                    planDistribution: stats.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    revenue: {
                        monthly: monthlyRevenue,
                        yearly: yearlyRevenue,
                        total: monthlyRevenue + yearlyRevenue
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error getting subscription stats:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy thống kê'
            });
        }
    },    /**
     * @desc Lấy tất cả thông báo cho người dùng hiện tại
     */
    getNotifications: async (req, res) => {
        try {
            if (!req.user || (!req.user.id && !req.user.userId)) {
                return res.status(401).json({ message: "Không có thông tin người dùng. Vui lòng đăng nhập lại." });
            }
            const userId = req.user.id || req.user.userId;
            const notifications = await notificationService.getNotifications(userId);
            res.status(200).json(notifications);
        } catch (error) {
            console.error("Error in getNotifications controller:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: "Lỗi khi lấy danh sách thông báo.", error: error.message });
            }
        }
    },    /**
     * @desc Đánh dấu một thông báo là đã đọc
     */
    markNotificationAsRead: async (req, res) => {
        try {
            if (!req.user || (!req.user.id && !req.user.userId)) {
                return res.status(401).json({ message: "Không có thông tin người dùng. Vui lòng đăng nhập lại." });
            }

            const { notificationId } = req.body;
            const userId = req.user.id || req.user.userId;

            if (!notificationId) {
                return res.status(400).json({ message: 'Thiếu ID của thông báo.' });
            }

            await notificationService.markNotificationAsRead(notificationId, userId);
            res.status(200).json({ message: "Đã đánh dấu thông báo là đã đọc." });
        } catch (error) {
            console.error("Error in markNotificationAsRead controller:", error);
            res.status(500).json({ message: "Lỗi khi đánh dấu thông báo.", error: error.message });
        }
    },    /**
     * @desc Đánh dấu tất cả thông báo là đã đọc
     */
    markAllNotificationsAsRead: async (req, res) => {
        try {
            if (!req.user || (!req.user.id && !req.user.userId)) {
                return res.status(401).json({ message: "Không có thông tin người dùng. Vui lòng đăng nhập lại." });
            }
            
            const userId = req.user.id || req.user.userId;
            await notificationService.markAllNotificationsAsRead(userId);
            res.status(200).json({ message: "Đã đánh dấu tất cả thông báo là đã đọc." });
        } catch (error) {
            console.error("Error in markAllNotificationsAsRead controller:", error);
            res.status(500).json({ message: "Lỗi khi đánh dấu tất cả thông báo.", error: error.message });
        }
    }
};

module.exports = subscriptionController;
