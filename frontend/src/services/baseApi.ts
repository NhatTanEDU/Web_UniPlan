/**
 * baseApi
 * - Axios instance chung cho toàn frontend
 */
import axios from "axios";

const baseApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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