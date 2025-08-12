const rateLimit = require('express-rate-limit');
const responseHelper = require('../utils/responseHelper');

// Rate limiter cơ bản cho tất cả API calls
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests mỗi 15 phút
  message: {
    error: 'Quá nhiều yêu cầu',
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
    retryAfter: '15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', 429);
  }
});

// Rate limiter nghiêm ngặt cho việc tạo teams
const createTeamRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // Chỉ cho phép tạo 5 teams mỗi giờ
  message: {
    error: 'Quá nhiều yêu cầu tạo nhóm',
    message: 'Bạn đã tạo quá nhiều nhóm. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 giờ'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã tạo quá nhiều nhóm. Vui lòng thử lại sau 1 giờ.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip; // Rate limit theo user ID
  }
});

// Rate limiter cho việc thêm thành viên
const addMemberRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 20, // Cho phép thêm 20 thành viên mỗi 10 phút
  message: {
    error: 'Quá nhiều yêu cầu thêm thành viên',
    message: 'Bạn đã thêm quá nhiều thành viên. Vui lòng thử lại sau 10 phút.',
    retryAfter: '10 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã thêm quá nhiều thành viên. Vui lòng thử lại sau 10 phút.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter cho bulk operations
const bulkOperationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // Cho phép 10 bulk operations mỗi giờ
  message: {
    error: 'Quá nhiều thao tác hàng loạt',
    message: 'Bạn đã thực hiện quá nhiều thao tác hàng loạt. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 giờ'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã thực hiện quá nhiều thao tác hàng loạt. Vui lòng thử lại sau 1 giờ.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter cho tìm kiếm
const searchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 50, // Cho phép 50 tìm kiếm mỗi 5 phút
  message: {
    error: 'Quá nhiều yêu cầu tìm kiếm',
    message: 'Bạn đã tìm kiếm quá nhiều. Vui lòng thử lại sau 5 phút.',
    retryAfter: '5 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã tìm kiếm quá nhiều. Vui lòng thử lại sau 5 phút.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter cho việc gán/hủy gán projects
const projectAssignmentRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 phút
  max: 30, // Cho phép 30 thao tác gán/hủy gán mỗi 30 phút
  message: {
    error: 'Quá nhiều thao tác gán dự án',
    message: 'Bạn đã thực hiện quá nhiều thao tác gán dự án. Vui lòng thử lại sau 30 phút.',
    retryAfter: '30 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã thực hiện quá nhiều thao tác gán dự án. Vui lòng thử lại sau 30 phút.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter cho việc cập nhật thông tin team
const updateTeamRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // Cho phép 20 cập nhật mỗi 15 phút
  message: {
    error: 'Quá nhiều yêu cầu cập nhật',
    message: 'Bạn đã cập nhật quá nhiều. Vui lòng thử lại sau 15 phút.',
    retryAfter: '15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã cập nhật quá nhiều. Vui lòng thử lại sau 15 phút.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter cho việc xóa teams
const deleteTeamRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Chỉ cho phép xóa 3 teams mỗi giờ
  message: {
    error: 'Quá nhiều yêu cầu xóa nhóm',
    message: 'Bạn đã xóa quá nhiều nhóm. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 giờ'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã xóa quá nhiều nhóm. Vui lòng thử lại sau 1 giờ.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter cho lấy thống kê
const statsRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 30, // Cho phép 30 request thống kê mỗi 5 phút
  message: {
    error: 'Quá nhiều yêu cầu thống kê',
    message: 'Bạn đã yêu cầu thống kê quá nhiều. Vui lòng thử lại sau 5 phút.',
    retryAfter: '5 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHelper.errorResponse(res, 'Bạn đã yêu cầu thống kê quá nhiều. Vui lòng thử lại sau 5 phút.', 429);
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

// 🚀 SPECIAL RATE LIMITING FOR PROJECTS API - Prevent concurrent requests
const projectsRateLimit = rateLimit({
  windowMs: 200, // 200ms - giảm xuống để ít nghiêm khắc hơn
  max: 5, // Tăng lên 5 request mỗi 200ms để test được
  message: {
    error: 'Quá nhiều yêu cầu đến API dự án. Vui lòng đợi 200ms trước khi thử lại.',
    retryAfter: 0.2
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user, not per IP
    return req.user?.userId || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting cho admin trong development
    return process.env.NODE_ENV === 'development' && req.user?.role === 'Admin';
  },
  handler: (req, res) => {
    console.warn(`🚫 Projects API rate limited for user: ${req.user?.userId || req.ip}`);
    res.status(429).json({
      error: 'Quá nhiều yêu cầu đến API dự án. Vui lòng đợi 200ms trước khi thử lại.',
      retryAfter: 0.2
    });
  }
});

// Middleware tùy chỉnh để áp dụng rate limiting linh hoạt
const createCustomRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    standardHeaders: true,
    legacyHeaders: false
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    handler: (req, res) => {
      return responseHelper.errorResponse(res, options.message || defaultOptions.message, 429);
    },
    keyGenerator: (req) => {
      return req.user ? req.user.id : req.ip;
    }
  };

  return rateLimit(mergedOptions);
};

// Helper function để kiểm tra rate limit status
const getRateLimitStatus = (req, res, next) => {
  // Thêm thông tin rate limit vào response headers
  res.setHeader('X-RateLimit-Remaining', res.getHeaders()['x-ratelimit-remaining'] || 'Unknown');
  res.setHeader('X-RateLimit-Reset', res.getHeaders()['x-ratelimit-reset'] || 'Unknown');
  next();
};

// Middleware để log rate limit violations
const logRateLimitViolation = (req, res, next) => {
  // Override handler để log violations
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode === 429) {
      console.warn(`Rate limit violation:`, {
        userId: req.user?.id || 'Anonymous',
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    return originalSend.call(this, data);
  };
  next();
};

module.exports = {
  generalRateLimit,
  projectsRateLimit, // 🚀 EXPORT projects rate limit
  createTeamRateLimit,
  addMemberRateLimit,
  bulkOperationRateLimit,
  searchRateLimit,
  projectAssignmentRateLimit,
  updateTeamRateLimit,
  deleteTeamRateLimit,
  statsRateLimit,
  createCustomRateLimit,
  getRateLimitStatus,
  logRateLimitViolation
};
