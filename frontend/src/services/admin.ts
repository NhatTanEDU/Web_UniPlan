// services/admin.ts
import axios from 'axios';
import { User } from '../components/Admin/types';

// Runtime detection for Railway deployment
const getApiUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname.includes('railway.app') || window.location.hostname.includes('up.railway.app'))) {
    return "https://web-production-61868.up.railway.app/api/admin";
  }
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin`;
};

const API_URL = getApiUrl();

const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    return axios.put(`${API_URL}/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return axios.delete(`${API_URL}/users/${id}`);
  },
};

export default adminApi;
