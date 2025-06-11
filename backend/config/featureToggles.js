/**
 * Feature Toggle Configuration
 * Use this file to safely enable/disable complex features that might cause errors
 * Set to false to disable features, true to enable them
 */

const FEATURE_TOGGLES = {
  // ===== COMPLEX TEAM FEATURES =====
  ENHANCED_TEAMS: true,               // Enhanced team management with complex analytics
  TEAM_HEALTH_MONITORING: false,     // Team health scoring and analytics
  TEAM_RECOMMENDATIONS: false,       // AI-powered team recommendations
  TEAM_ACTIVITY_FEED: false,         // Real-time activity tracking
  
  // ===== REAL-TIME FEATURES =====
  WEBSOCKETS: false,                  // WebSocket connections
  SOCKET_IO: false,                   // Socket.IO real-time updates
  REAL_TIME_CHAT: false,             // Real-time chat functionality
  REAL_TIME_NOTIFICATIONS: false,    // Real-time notification system
  
  // ===== NOTIFICATION SYSTEM =====
  NOTIFICATION_CENTER: false,        // Complex notification center
  EMAIL_NOTIFICATIONS: false,        // Email notification system
  PUSH_NOTIFICATIONS: false,         // Browser push notifications
    // ===== ADVANCED SEARCH =====
  ADVANCED_SEARCH: true,             // Complex search with filters/sorting
  PAGINATION: false,                 // Advanced pagination features
  SEARCH_SUGGESTIONS: false,         // Search autocomplete/suggestions
  
  // ===== AI FEATURES =====
  AI_FEATURES: false,                // AI-powered features
  AI_RECOMMENDATIONS: false,         // AI recommendations
  AI_ANALYTICS: false,               // AI analytics and insights
  
  // ===== ANALYTICS & MONITORING =====
  ANALYTICS: false,                  // User behavior analytics
  PERFORMANCE_MONITORING: false,    // Performance monitoring
  ERROR_TRACKING: false,             // Advanced error tracking
  
  // ===== WIDGETS & CUSTOMIZATION =====
  CUSTOM_WIDGETS: false,             // Custom dashboard widgets
  DRAG_AND_DROP: false,              // Drag and drop functionality
  WIDGET_POSITIONING: false,         // Dynamic widget positioning
  
  // ===== FILE MANAGEMENT =====
  FILE_UPLOAD: false,                // Complex file upload system
  FILE_SHARING: false,               // File sharing features
  FILE_VERSIONING: false,            // File version control
  
  // ===== REPORTING =====
  ADVANCED_REPORTS: false,           // Complex reporting system
  PDF_GENERATION: false,             // PDF report generation
  CHART_VISUALIZATION: false,        // Complex chart visualizations
  
  // ===== INTEGRATION =====
  THIRD_PARTY_INTEGRATIONS: false,  // External service integrations
  API_WEBHOOKS: false,               // Webhook functionality
  OAUTH_PROVIDERS: false,            // OAuth authentication providers
  
  // ===== BASIC FEATURES (Keep these enabled) =====
  SIMPLE_SEARCH: true,               // Simple team search (our working APIs)
  BASIC_AUTH: true,                  // Basic authentication
  BASIC_CRUD: true,                  // Basic create/read/update/delete operations
  BASIC_API: true,                   // Basic API functionality
  HEALTH_CHECKS: true,               // Simple health check endpoints
};

/**
 * Helper function to check if a feature is enabled
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - Whether the feature is enabled
 */
function isFeatureEnabled(featureName) {
  return FEATURE_TOGGLES[featureName] === true;
}

/**
 * Helper function to get all enabled features
 * @returns {string[]} - Array of enabled feature names
 */
function getEnabledFeatures() {
  return Object.keys(FEATURE_TOGGLES).filter(feature => FEATURE_TOGGLES[feature] === true);
}

/**
 * Helper function to get all disabled features
 * @returns {string[]} - Array of disabled feature names
 */
function getDisabledFeatures() {
  return Object.keys(FEATURE_TOGGLES).filter(feature => FEATURE_TOGGLES[feature] === false);
}

/**
 * Feature toggle middleware for Express.js
 * Use this to conditionally enable/disable routes based on feature toggles
 */
function featureToggleMiddleware(featureName) {
  return (req, res, next) => {
    if (!isFeatureEnabled(featureName)) {
      return res.status(503).json({
        success: false,
        message: `Feature '${featureName}' is currently disabled`,
        error: 'FEATURE_DISABLED',
        availableFeatures: getEnabledFeatures()
      });
    }
    next();
  };
}

/**
 * React hook for feature toggles (Frontend)
 * Usage: const isEnabled = useFeatureToggle('ENHANCED_TEAMS');
 */
function useFeatureToggle(featureName) {
  return isFeatureEnabled(featureName);
}

module.exports = {
  FEATURE_TOGGLES,
  isFeatureEnabled,
  getEnabledFeatures,
  getDisabledFeatures,
  featureToggleMiddleware,
  useFeatureToggle
};
