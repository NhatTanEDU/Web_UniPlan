/**
 * baseApi
 * - Axios instance chung cho toàn frontend
 */
import axios from "axios";

// Temporary hardcode for Railway deployment debugging
const getApiUrl = () => {
  // Check if we're in production (Railway)
  if (window.location.hostname.includes('railway.app') || window.location.hostname.includes('up.railway.app')) {
    return "https://web-production-61868.up.railway.app/api";
  }
  // Use environment variable for local development
  return process.env.REACT_APP_API_URL || "http://localhost:5000/api";
};

const baseApi = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
});

// Ví dụ: thêm interceptor để gắn token
baseApi.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export { baseApi };
export default baseApi;