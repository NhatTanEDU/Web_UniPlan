// src/services/api.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log('🔐 [API Interceptor] Token exists:', !!token);
  console.log('🔐 [API Interceptor] Token preview:', token?.substring(0, 30) + '...');
  console.log('🔐 [API Interceptor] Request URL:', config.url);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 [API Interceptor] Added Authorization header');
  } else {
    console.log('🔐 [API Interceptor] No token found');
  }
  
  console.log('🔐 [API Interceptor] Final headers:', config.headers);
  return config;
});

// Response interceptor để xử lý token hết hạn
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API Response] Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('❌ [API Response] Error:', error.config?.url, error.response?.status, error.response?.data);
    console.log('❌ [API Response] Full error data:', JSON.stringify(error.response?.data, null, 2));
    
    // Nếu token hết hạn hoặc không hợp lệ (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message;
      console.log('🚪 [API Response] Token expired or invalid:', errorMessage);
      
      // Xóa token hết hạn
      localStorage.removeItem("token");
      
      // Redirect về trang login (tránh vòng lặp)
      if (!window.location.pathname.includes('/login')) {
        console.log('🚪 [API Response] Redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

// Users CRUD APIs
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};
export const createUser = async (payload: { email: string }) => {
  const response = await api.post("/users", payload);
  return response.data;
};
export const updateUser = async (id: string, payload: { email: string }) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};
export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const createProject = async (project: { 
  project_name: string; 
  description: string;
  start_date: string;
  end_date: string;
  status?: string;
  priority?: string;
  project_type_id: string;
}) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/projects", project, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const softDeleteProject = async (id: string) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export const restoreProject = async (id: string) => {
  const response = await api.put(`/projects/${id}/restore`);
  return response.data;
};

export const updateProject = async (id: string, project: { 
  project_name: string; 
  description: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  priority?: string;
  project_type_id?: { _id: string; name: string };
}) => {
  const response = await api.put(`/projects/${id}`, project);
  return response.data;
};

export default api;