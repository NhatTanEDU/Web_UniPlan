// services/admin.ts
import axios from 'axios';
import { User } from '../components/Admin/types';

const API_URL = 'http://localhost:5000/api/admin';

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
