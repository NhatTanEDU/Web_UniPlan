// backend/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/auth.middleware'); // Sửa đường dẫn đúng
const { checkSubscriptionStatus } = require('../middleware/checkSubscription');

console.log('🔍 Debug payment routes imports:');
console.log('paymentController.createPayment:', typeof paymentController.createPayment);
console.log('authenticateToken:', typeof authenticateToken);
console.log('checkSubscriptionStatus:', typeof checkSubscriptionStatus);

// Middleware rate limiting cho payment endpoints
const rateLimit = require('express-rate-limit');

// Rate limit cho tạo thanh toán (5 requests per 15 minutes)
const createPaymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu tạo thanh toán. Vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit cho kiểm tra status (30 requests per 15 minutes)
const statusCheckLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu kiểm tra trạng thái. Vui lòng thử lại sau.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @route   POST /api/payment/create
 * @desc    Tạo thanh toán MoMo
 * @access  Private
 */
// Test route không có rate limiter
router.post('/test-no-limit', (req, res) => {
    console.log('🧪 [Payment Test] No rate limit route reached!');
    console.log('🧪 [Payment Test] Headers:', req.headers.authorization?.substring(0, 50) + '...');
    
    res.json({
        success: true,
        message: 'Payment test route works - no rate limit!',
        timestamp: Date.now()
    });
});

router.post('/create', 
    // Add back proper authentication middleware
    authenticateToken,
    checkSubscriptionStatus,
    createPaymentLimiter,
    paymentController.createPayment
);

/**
 * @route   POST /api/payment/momo/ipn
 * @desc    Webhook IPN từ MoMo
 * @access  Public (but verified by signature)
 */
router.post('/momo/ipn', paymentController.handleMoMoIPN);

/**
 * @route   GET /api/payment/momo/return
 * @desc    Redirect sau khi thanh toán MoMo
 * @access  Public
 */
router.get('/momo/return', paymentController.handleMoMoReturn);

/**
 * @route   GET /api/payment/status/:orderId
 * @desc    Kiểm tra trạng thái thanh toán
 * @access  Private
 */
router.get('/status/:orderId',
    statusCheckLimiter,
    authenticateToken,
    paymentController.getPaymentStatus
);

/**
 * @route   GET /api/payment/history
 * @desc    Lấy lịch sử thanh toán
 * @access  Private
 */
router.get('/history',
    authenticateToken,
    paymentController.getPaymentHistory
);

/**
 * @route   POST /api/payment/cancel/:orderId
 * @desc    Hủy thanh toán
 * @access  Private
 */
router.post('/cancel/:orderId',
    authenticateToken,
    paymentController.cancelPayment
);

/**
 * @route   GET /api/payment/plans
 * @desc    Lấy thông tin các gói thanh toán
 * @access  Public
 */
router.get('/plans', (req, res) => {
    const momoConfig = require('../config/momo.config');
    
    const plans = [
        {
            id: 'monthly',
            name: 'Gói 1 tháng',
            ...momoConfig.getPaymentInfo('monthly'),
            duration: '30 ngày',
            features: [
                'Tất cả tính năng UniPlan',
                'Hỗ trợ qua email',
                'Tạo project không giới hạn',
                'Quản lý team'
            ]
        },
        {
            id: 'yearly',
            name: 'Gói 1 năm',
            ...momoConfig.getPaymentInfo('yearly'),
            duration: '365 ngày',
            discount: '50%',
            features: [
                'Tất cả tính năng UniPlan',
                'Hỗ trợ ưu tiên',
                'Tạo project không giới hạn',
                'Quản lý team nâng cao',
                'Backup tự động',
                'Tiết kiệm 50% so với gói tháng'
            ]
        }
    ];
    
    res.json({
        success: true,
        data: plans
    });
});

module.exports = router;
