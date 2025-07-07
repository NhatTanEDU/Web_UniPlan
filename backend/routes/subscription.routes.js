// backend/routes/subscription.routes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Sửa lại cách import cho đúng
const authenticateToken = require('../middlewares/auth.middleware'); 
const { checkSubscriptionStatus } = require('../middleware/checkSubscription');
const User = require('../models/user.model');

// Debug imports
console.log('🔍 subscriptionController:', typeof subscriptionController);
console.log('🔍 subscriptionController.getSubscriptionStatus:', typeof subscriptionController.getSubscriptionStatus);
console.log('🔍 authenticateToken:', typeof authenticateToken);
console.log('🔍 checkSubscriptionStatus:', typeof checkSubscriptionStatus);

/**
 * @route   GET /api/subscription/status
 * @desc    Lấy trạng thái gói hiện tại
 * @access  Private
 */
router.get('/status',
    authenticateToken,
    subscriptionController.getSubscriptionStatus
);

/**
 * @route   POST /api/subscription/upgrade
 * @desc    Nâng cấp gói subscription
 * @access  Private
 */
router.post('/upgrade',
    authenticateToken,
    checkSubscriptionStatus,
    subscriptionController.upgradeSubscription
);

/**
 * @route   POST /api/subscription/cancel
 * @desc    Hủy gói subscription
 * @access  Private
 */
router.post('/cancel',
    authenticateToken,
    checkSubscriptionStatus,
    subscriptionController.cancelSubscription
);

/**
 * @route   GET /api/subscription/history
 * @desc    Lấy lịch sử thay đổi gói
 * @access  Private
 */
router.get('/history',
    authenticateToken,
    subscriptionController.getSubscriptionHistory
);

/**
 * @route   GET /api/subscription/expiring
 * @desc    Lấy danh sách users sắp hết hạn (Admin only)
 * @access  Private (Admin)
 */
router.get('/expiring',
    authenticateToken,
    subscriptionController.getExpiringSubscriptions
);

/**
 * @route   POST /api/subscription/send-warning
 * @desc    Gửi cảnh báo hết hạn thủ công (Admin only)
 * @access  Private (Admin)
 */
router.post('/send-warning',
    authenticateToken,
    subscriptionController.sendExpiryWarning
);

/**
 * @route   GET /api/subscription/stats
 * @desc    Lấy thống kê subscription (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats',
    authenticateToken,
    subscriptionController.getSubscriptionStats
);

router.get('/notifications', authenticateToken, subscriptionController.getNotifications);

router.post('/notifications/mark-read', authenticateToken, subscriptionController.markNotificationAsRead);

router.post('/notifications/mark-all-read', authenticateToken, subscriptionController.markAllNotificationsAsRead);

/**
 * @route   POST /api/subscription/upgrade-fake
 * @desc    Fake upgrade user subscription (demo only)
 * @access  Private
 */
router.post('/upgrade-fake',
    authenticateToken,
    async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    // Giả lập nâng cấp gói lên yearly (demo)
    user.current_plan_type = 'yearly';
    user.subscription_start_date = new Date();
    user.subscription_end_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    user.payment_status = 'completed';
    await user.save();
    return res.json({ message: 'Demo upgrade thành công', plan: user.current_plan_type });
  } catch (error) {
    console.error('Lỗi demo upgrade:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
