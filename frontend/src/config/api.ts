/**
 * API Configuration
 * Handles runtime detection for Railway deployment
 */

// Runtime detection for Railway deployment
const isRailwayProduction = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('railway.app') || 
         window.location.hostname.includes('up.railway.app');
};

// Get API base URL
export const getApiUrl = () => {
  if (isRailwayProduction()) {
    return 'https://web-production-61868.up.railway.app/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

// Get Socket.IO URL
export const getSocketUrl = () => {
  if (isRailwayProduction()) {
    return 'https://web-production-61868.up.railway.app';
  }
  return process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
};

// Export constants
export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  SOCKET_URL: getSocketUrl(),
  IS_PRODUCTION: isRailwayProduction(),
  TIMEOUT: 12000,
};

console.log('🔧 API Configuration:', API_CONFIG);
