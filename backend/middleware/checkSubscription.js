// backend/middleware/checkSubscription.js
const User = require('../models/user.model');
const subscriptionService = require('../services/subscriptionService');
const notificationService = require('../services/notificationService');

// Cache để tối ưu performance
const subscriptionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Middleware kiểm tra trạng thái gói của user
const checkSubscriptionStatus = async (req, res, next) => {
    try {
        console.log('🔍 [checkSubscriptionStatus] Starting middleware...');
        console.log('🔍 [checkSubscriptionStatus] req.user:', req.user);
        console.log('🔍 [checkSubscriptionStatus] req.user.id:', req.user?.id);
        console.log('🔍 [checkSubscriptionStatus] req.user.userId:', req.user?.userId);
        
        // Kiểm tra xem user đã được authenticate chưa - sử dụng userId thay vì id
        if (!req.user || (!req.user.id && !req.user.userId)) {
            console.log('❌ [checkSubscriptionStatus] No user or user.id/userId found');
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục'
            });
        }

        // Sử dụng userId nếu có, fallback về id
        const userId = req.user.userId || req.user.id;
        console.log('🔍 [checkSubscriptionStatus] Using userId:', userId);
        
        const cacheKey = `subscription_${userId}`;
        
        // Kiểm tra cache
        const cached = subscriptionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            console.log('📦 [checkSubscriptionStatus] Using cached data');
            req.userSubscription = cached.data;
            return next();
        }

        console.log('🔍 [checkSubscriptionStatus] Fetching user from database...');
        // Lấy thông tin user từ database
        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ [checkSubscriptionStatus] User not found in database');
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng'
            });
        }

        console.log('✅ [checkSubscriptionStatus] User found:', { id: user._id, email: user.email, current_plan_type: user.current_plan_type });

        // Cập nhật trạng thái hết hạn nếu cần
        let needUpdate = false;
        let shouldNotify = false;
        
        // Kiểm tra gói dùng thử hết hạn
        if (user.current_plan_type === 'free_trial' && user.isTrialExpired()) {
            await subscriptionService.handleTrialExpiry(userId);
            needUpdate = true;
            shouldNotify = true;
        }
        
        // Kiểm tra gói trả phí hết hạn
        if ((user.current_plan_type === 'monthly' || user.current_plan_type === 'yearly') && 
            user.subscription_end_date && new Date() > user.subscription_end_date) {
            
            await subscriptionService.cancelSubscription(userId, 'Subscription expired automatically', { userType: 'system' });
            needUpdate = true;
            shouldNotify = true;
        }
        
        // Reload user nếu có cập nhật
        if (needUpdate) {
            await user.reload();
        }
        
        // Kiểm tra cảnh báo hết hạn (1-2 ngày trước)
        const remainingDays = subscriptionService.calculateRemainingDays(user);
        if (remainingDays <= 2 && remainingDays > 0 && user.canAccessService()) {
            // Gửi cảnh báo (throttle để tránh spam)
            const lastWarningKey = `warning_${userId}_${remainingDays}`;
            if (!subscriptionCache.has(lastWarningKey)) {
                if (user.current_plan_type === 'free_trial') {
                    await notificationService.sendTrialExpiryWarning(userId, remainingDays);
                } else {
                    await notificationService.sendSubscriptionExpiryWarning(userId, remainingDays, user.current_plan_type);
                }
                
                // Cache để tránh gửi lại trong 24h
                subscriptionCache.set(lastWarningKey, { timestamp: Date.now() });
                setTimeout(() => subscriptionCache.delete(lastWarningKey), 24 * 60 * 60 * 1000);
            }
        }

        // Tạo subscription info
        const subscriptionInfo = {
            canAccess: user.canAccessService(),
            planInfo: user.getPlanDisplayInfo(),
            remainingDays: remainingDays,
            user: user,
            features: getAvailableFeatures(user.current_plan_type),
            limits: getSubscriptionLimits(user.current_plan_type)
        };

        // Cache kết quả
        subscriptionCache.set(cacheKey, {
            data: subscriptionInfo,
            timestamp: Date.now()
        });

        // Thêm thông tin gói vào request
        req.userSubscription = subscriptionInfo;

        next();
    } catch (error) {
        console.error('Lỗi kiểm tra trạng thái gói:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi kiểm tra trạng thái gói'
        });
    }
};

// Middleware yêu cầu gói hợp lệ
const requireActiveSubscription = (req, res, next) => {
    if (!req.userSubscription || !req.userSubscription.canAccess) {
        const planInfo = req.userSubscription ? req.userSubscription.planInfo : null;
        
        return res.status(403).json({
            success: false,
            message: 'Tài khoản của bạn đã hết hạn. Vui lòng nâng cấp gói để tiếp tục sử dụng.',
            requireUpgrade: true,
            currentPlan: planInfo,
            remainingDays: req.userSubscription ? req.userSubscription.remainingDays : 0,
            availablePlans: [
                {
                    type: 'monthly',
                    name: 'Gói 1 tháng',
                    price: 500000,
                    currency: 'VND'
                },
                {
                    type: 'yearly',
                    name: 'Gói 1 năm',
                    price: 3000000,
                    currency: 'VND'
                }
            ]
        });
    }
    
    next();
};

// Middleware cho premium features
const requirePremiumSubscription = (req, res, next) => {
    if (!req.userSubscription || 
        !['monthly', 'yearly'].includes(req.userSubscription.user.current_plan_type)) {
        
        return res.status(403).json({
            success: false,
            message: 'Tính năng này chỉ dành cho gói trả phí. Vui lòng nâng cấp để sử dụng.',
            requireUpgrade: true,
            featureType: 'premium',
            currentPlan: req.userSubscription ? req.userSubscription.planInfo : null
        });
    }
    
    next();
};

// Middleware chỉ cảnh báo không chặn
const warnSubscriptionStatus = (req, res, next) => {
    if (req.userSubscription && !req.userSubscription.canAccess) {
        // Thêm warning vào response headers
        res.set('X-Subscription-Warning', 'true');
        res.set('X-Subscription-Status', req.userSubscription.planInfo.type);
        res.set('X-Days-Left', req.userSubscription.remainingDays.toString());
    }
    
    next();
};

// Middleware kiểm tra thời gian cảnh báo (trước khi hết hạn 2 ngày)
const checkSubscriptionWarning = (req, res, next) => {
    if (req.userSubscription && req.userSubscription.canAccess) {
        const remainingDays = req.userSubscription.remainingDays;
        
        // Cảnh báo khi còn 2 ngày hoặc ít hơn
        if (remainingDays <= 2 && remainingDays > 0) {
            res.set('X-Subscription-Warning', 'expiring-soon');
            res.set('X-Days-Left', remainingDays.toString());
        }
    }
    
    next();
};

// Middleware kiểm tra limits
const checkSubscriptionLimits = (limitType) => {
    return (req, res, next) => {
        if (!req.userSubscription) {
            return next();
        }
        
        const limits = req.userSubscription.limits;
        const exceeded = checkLimitExceeded(limitType, limits, req);
        
        if (exceeded) {
            return res.status(429).json({
                success: false,
                message: `Bạn đã vượt quá giới hạn ${limitType}. Vui lòng nâng cấp gói để tăng giới hạn.`,
                limitType: limitType,
                currentLimit: limits[limitType],
                requireUpgrade: true
            });
        }
        
        next();
    };
};

// Helper functions
function getAvailableFeatures(planType) {
    const features = {
        free_trial: [
            'basic_project_management',
            'team_collaboration',
            'file_upload',
            'basic_notifications'
        ],
        expired: [],
        monthly: [
            'basic_project_management',
            'team_collaboration', 
            'file_upload',
            'advanced_notifications',
            'priority_support',
            'advanced_analytics'
        ],
        yearly: [
            'basic_project_management',
            'team_collaboration',
            'file_upload', 
            'advanced_notifications',
            'priority_support',
            'advanced_analytics',
            'auto_backup',
            'api_access'
        ]
    };
    
    return features[planType] || [];
}

function getSubscriptionLimits(planType) {
    const limits = {
        free_trial: {
            projects: 3,
            team_members: 5,
            storage_mb: 100,
            api_calls_per_day: 100
        },
        expired: {
            projects: 0,
            team_members: 0,
            storage_mb: 0,
            api_calls_per_day: 0
        },
        monthly: {
            projects: 50,
            team_members: 20,
            storage_mb: 5000,
            api_calls_per_day: 1000
        },
        yearly: {
            projects: -1, // unlimited
            team_members: -1, // unlimited
            storage_mb: 20000,
            api_calls_per_day: 5000
        }
    };
    
    return limits[planType] || limits.expired;
}

function checkLimitExceeded(limitType, limits, req) {
    const limit = limits[limitType];
    if (limit === -1) return false; // unlimited
    if (limit === 0) return true; // no access
    
    // Implement actual limit checking logic based on limitType
    // This would query database to count current usage
    // For now, return false (not exceeded)
    return false;
}

// Clear cache periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of subscriptionCache.entries()) {
        if ((now - value.timestamp) > CACHE_TTL) {
            subscriptionCache.delete(key);
        }
    }
}, CACHE_TTL);

module.exports = {
    checkSubscriptionStatus,
    requireActiveSubscription,
    requirePremiumSubscription,
    warnSubscriptionStatus,
    checkSubscriptionWarning,
    checkSubscriptionLimits
};
