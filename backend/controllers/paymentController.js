// backend/controllers/paymentController.js
const momoService = require('../services/momoService');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');

const paymentController = {
    
    /**
     * Tạo thanh toán mới
     * POST /api/payment/create
     */    createPayment: async (req, res) => {
        try {
            const { planType } = req.body;
            const userId = req.user.userId; // ✅ Fix: sử dụng userId thay vì id
            
            console.log(`🔄 Creating payment for user ${userId}, plan: ${planType}`);
            console.log('🔍 req.user:', req.user); // Debug log
            
            // Validate input
            if (!planType || !['monthly', 'yearly'].includes(planType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Gói thanh toán không hợp lệ. Chỉ chấp nhận: monthly, yearly'
                });
            }
            
            // Kiểm tra user tồn tại
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }
              // Kiểm tra xem user đã có payment đang pending không
            console.log('🔍 [createPayment] Checking for existing pending payments...');
            console.log('🔍 [createPayment] Query: user_id =', userId);
            console.log('🔍 [createPayment] Query: payment_status = pending');
            console.log('🔍 [createPayment] Query: expired_at > ', new Date());
            
            const existingPayment = await Payment.findOne({
                user_id: userId,
                payment_status: 'pending',
                expired_at: { $gt: new Date() }
            });
            
            console.log('🔍 [createPayment] Existing payment result:', existingPayment);
            
            if (existingPayment) {
                console.log('🚨 [createPayment] Found existing pending payment, blocking new payment');
                return res.status(409).json({
                    success: false,
                    message: 'Bạn đã có một giao dịch đang chờ thanh toán. Vui lòng hoàn tất giao dịch hiện tại hoặc đợi hết hạn.',
                    existingPayment: {
                        orderId: existingPayment.momo_order_id,
                        amount: existingPayment.amount,
                        planName: existingPayment.plan_name,
                        payUrl: existingPayment.momo_pay_url,
                        expiresAt: existingPayment.expired_at
                    }
                });
            }
            
            // Lấy thông tin request
            const userInfo = {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                device: req.get('Device-Type') || 'web'
            };
            
            // Tạo thanh toán
            const paymentResult = await momoService.createPayment(userId, planType, userInfo);
            
            res.status(201).json({
                success: true,
                message: 'Tạo thanh toán thành công',
                data: paymentResult
            });
            
        } catch (error) {
            console.error('❌ Error in createPayment:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi tạo thanh toán',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
    
    /**
     * Xử lý IPN callback từ MoMo
     * POST /api/payment/momo/ipn
     */
    handleMoMoIPN: async (req, res) => {
        try {
            console.log('📨 Received MoMo IPN callback');
            
            const ipnData = req.body;
            
            // Log để debug
            console.log('IPN Data:', JSON.stringify(ipnData, null, 2));
            
            // Xử lý IPN
            const result = await momoService.handleIPN(ipnData);
            
            // Trả về response cho MoMo
            res.status(200).json({
                message: 'IPN processed successfully',
                resultCode: 0
            });
            
        } catch (error) {
            console.error('❌ Error handling MoMo IPN:', error);
            
            // Vẫn phải trả về 200 cho MoMo để tránh retry
            res.status(200).json({
                message: 'IPN processing failed',
                resultCode: -1,
                error: error.message
            });
        }
    },
    
    /**
     * Xử lý redirect sau thanh toán
     * GET /api/payment/momo/return
     */
    handleMoMoReturn: async (req, res) => {
        try {
            const { orderId, resultCode, message } = req.query;
            
            console.log(`📨 MoMo return callback: ${orderId}, result: ${resultCode}`);
            
            // Tìm payment
            const payment = await Payment.findOne({ momo_order_id: orderId })
                .populate('user_id', 'email');
            
            if (!payment) {
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?message=Payment not found`);
            }
            
            let redirectUrl;
            
            if (resultCode === '0') {
                // Thanh toán thành công
                redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`;
            } else {
                // Thanh toán thất bại
                redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}&message=${encodeURIComponent(message || 'Payment failed')}`;
            }
            
            res.redirect(redirectUrl);
            
        } catch (error) {
            console.error('❌ Error handling MoMo return:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?message=${encodeURIComponent('System error')}`);
        }
    },
    
    /**
     * Lấy trạng thái thanh toán
     * GET /api/payment/status/:orderId
     */
    getPaymentStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            console.log(`🔍 Checking payment status: ${orderId} for user ${userId}`);
            
            // Kiểm tra quyền truy cập
            const payment = await Payment.findOne({ 
                momo_order_id: orderId,
                user_id: userId 
            });
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giao dịch hoặc bạn không có quyền truy cập'
                });
            }
            
            const result = await momoService.checkPaymentStatus(orderId);
            
            res.json(result);
            
        } catch (error) {
            console.error('❌ Error getting payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi kiểm tra trạng thái thanh toán'
            });
        }
    },
    
    /**
     * Lấy lịch sử thanh toán của user
     * GET /api/payment/history
     */
    getPaymentHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, status } = req.query;
            
            console.log(`📋 Getting payment history for user ${userId}`);
            
            const query = { user_id: userId };
            if (status) {
                query.payment_status = status;
            }
            
            const payments = await Payment.find(query)
                .sort({ created_at: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .select('-momo_response -metadata');
            
            const total = await Payment.countDocuments(query);
            
            const formattedPayments = payments.map(payment => ({
                orderId: payment.momo_order_id,
                planName: payment.plan_name,
                amount: payment.amount,
                status: payment.payment_status,
                statusText: payment.getStatusText(),
                createdAt: payment.created_at,
                completedAt: payment.completed_at,
                isExpired: payment.isExpired()
            }));
            
            res.json({
                success: true,
                data: {
                    payments: formattedPayments,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total: total
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error getting payment history:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi lấy lịch sử thanh toán'
            });
        }
    },
    
    /**
     * Hủy thanh toán đang pending
     * POST /api/payment/cancel/:orderId
     */
    cancelPayment: async (req, res) => {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            console.log(`❌ Cancelling payment: ${orderId} for user ${userId}`);
            
            const payment = await Payment.findOne({
                momo_order_id: orderId,
                user_id: userId,
                payment_status: 'pending'
            });
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giao dịch hoặc giao dịch không thể hủy'
                });
            }
            
            payment.payment_status = 'cancelled';
            await payment.save();
            
            res.json({
                success: true,
                message: 'Hủy giao dịch thành công'
            });
            
        } catch (error) {
            console.error('❌ Error cancelling payment:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi hủy giao dịch'
            });
        }
    }
};

module.exports = paymentController;
