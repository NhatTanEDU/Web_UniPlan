// 🚀 REQUEST DEDUPLICATION MIDDLEWARE
// Ngăn chặn multiple requests cùng lúc từ cùng user đến cùng endpoint

const activeRequests = new Map(); // Store active requests per user+endpoint

const requestDeduplication = (options = {}) => {
  const { 
    windowMs = 2000, // 2 seconds default
    keyGenerator = (req) => `${req.user?.userId || req.ip}:${req.method}:${req.path}`,
    message = 'Request đang được xử lý. Vui lòng đợi...'
  } = options;

  return (req, res, next) => {
    const requestKey = keyGenerator(req);
    const now = Date.now();
    
    // Cleanup expired requests
    for (const [key, timestamp] of activeRequests.entries()) {
      if (now - timestamp > windowMs) {
        activeRequests.delete(key);
      }
    }
    
    // Check if request is already active
    if (activeRequests.has(requestKey)) {
      console.warn(`🔄 Duplicate request detected: ${requestKey}`);
      return res.status(429).json({
        error: message,
        requestKey: requestKey,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Mark request as active
    activeRequests.set(requestKey, now);
    console.log(`🚀 Request started: ${requestKey}`);
    
    // Cleanup when request completes
    const originalSend = res.send;
    res.send = function(data) {
      activeRequests.delete(requestKey);
      console.log(`✅ Request completed: ${requestKey}`);
      return originalSend.call(this, data);
    };
    
    // Cleanup on error
    const originalStatus = res.status;
    res.status = function(statusCode) {
      if (statusCode >= 400) {
        activeRequests.delete(requestKey);
        console.log(`❌ Request failed: ${requestKey} (${statusCode})`);
      }
      return originalStatus.call(this, statusCode);
    };
    
    next();
  };
};

module.exports = {
  requestDeduplication,
  // Specific deduplication for projects API
  projectsDeduplication: requestDeduplication({
    windowMs: 3000, // 3 seconds for projects
    keyGenerator: (req) => `${req.user?.userId || req.ip}:projects`,
    message: 'Đang lấy danh sách dự án. Vui lòng đợi...'
  })
};
