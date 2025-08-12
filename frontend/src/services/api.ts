// src/services/api.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Set a sane client-side timeout so we don't hang for 30s on server timeouts
  timeout: 12000,
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

// ===== Helpers for rate-limit friendly fetching =====
const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));
const normalizeProjects = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.projects)) return data.projects;
  return [];
};

let projectsCache: { data: any[]; timestamp: number } | null = null;
let projectsInFlight: Promise<any[]> | null = null;
let lastProjectsFetchAt = 0;
const PROJECTS_MIN_INTERVAL_MS = 600; // backend asks ~500ms; be a bit higher

export const getProjects = async (
  opts: { force?: boolean; cacheMs?: number } = {}
): Promise<any[]> => {
  const { force = false, cacheMs = 1500 } = opts;
  const now = Date.now();

  // Serve from short-lived cache
  if (!force && projectsCache && now - projectsCache.timestamp < cacheMs) {
    console.log('🟡 [getProjects] Serving from cache');
    return projectsCache.data;
  }

  // Share an in-flight request
  if (projectsInFlight) {
    console.log('🟡 [getProjects] Reusing in-flight request');
    return projectsInFlight;
  }

  projectsInFlight = (async () => {
    try {
      // Throttle to avoid 429 (respect minimum interval between real calls)
      const since = Date.now() - lastProjectsFetchAt;
      if (since < PROJECTS_MIN_INTERVAL_MS) {
        const waitMs = PROJECTS_MIN_INTERVAL_MS - since;
        console.log(`⏳ [getProjects] Throttling ${waitMs}ms to avoid 429`);
        await sleep(waitMs);
      }

      lastProjectsFetchAt = Date.now();
      const doFetch = async () => {
        const resp = await api.get("/projects");
        const data = normalizeProjects(resp.data);
        projectsCache = { data, timestamp: Date.now() };
        return data;
      };

      try {
        return await doFetch();
      } catch (err: any) {
        // Handle 429 with retryAfter
        if (err?.response?.status === 429) {
          const raw = err.response?.data;
          const retryAfterSec = Number(raw?.retryAfter) || 0.5;
          const waitMs = Math.max(Math.ceil(retryAfterSec * 1000), PROJECTS_MIN_INTERVAL_MS);
          console.warn(`🚫 [getProjects] 429 received, retrying after ${waitMs}ms`);
          await sleep(waitMs);
          lastProjectsFetchAt = Date.now();
          return await doFetch(); // one retry
        }
        // Handle server timeout (503) or client timeout/network errors gracefully
        const isTimeoutOrUnavailable = err?.response?.status === 503 || err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
        if (isTimeoutOrUnavailable && projectsCache) {
          console.warn('🟠 [getProjects] Serving STALE cache due to server timeout/unavailable');
          return projectsCache.data;
        }
        throw err;
      }
    } finally {
      projectsInFlight = null;
    }
  })();

  return projectsInFlight;
};

// Allow other modules to invalidate cache after mutations
export const invalidateProjectsCache = () => {
  console.log('🧹 [getProjects] Invalidating projects cache');
  projectsCache = null;
  lastProjectsFetchAt = 0;
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
  // Invalidate cache so next getProjects fetches fresh data
  invalidateProjectsCache();
  return response.data;
};

export const softDeleteProject = async (id: string) => {
  const response = await api.delete(`/projects/${id}`);
  invalidateProjectsCache();
  return response.data;
};

export const restoreProject = async (id: string) => {
  const response = await api.put(`/projects/${id}/restore`);
  invalidateProjectsCache();
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
  invalidateProjectsCache();
  return response.data;
};

export default api;