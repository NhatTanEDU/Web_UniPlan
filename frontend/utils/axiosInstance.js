import axios from 'axios';

// Runtime detection for Railway deployment
const getApiUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname.includes('railway.app') || window.location.hostname.includes('up.railway.app'))) {
    return 'https://web-production-61868.up.railway.app/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
});

// ✅ Thêm interceptor để tự động gắn token nếu có
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;