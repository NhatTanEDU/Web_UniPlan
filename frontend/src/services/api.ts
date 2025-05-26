// src/services/api.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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