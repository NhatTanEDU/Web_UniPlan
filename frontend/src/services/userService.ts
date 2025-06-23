// src/services/userService.ts
import api from './api';

export interface UserInfo {
  _id: string;
  full_name: string;
  email: string;
  current_plan_type: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  payment_status?: string;
  avatar_url?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    user: UserInfo;
  };
  message?: string;
}

export const userService = {
  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<UserResponse> => {
    try {
      console.log('🔍 [UserService] Fetching current user info...');
      const response = await api.get('/users/me');
      console.log('✅ [UserService] User info fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error fetching user info:', error);
      console.error('❌ [UserService] Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin tài khoản');
    }
  },

  // Cập nhật thông tin user (nếu cần)
  updateUser: async (userData: Partial<UserInfo>): Promise<UserResponse> => {
    try {
      console.log('🔄 [UserService] Updating user info...', userData);
      const response = await api.put('/users/me', userData);
      console.log('✅ [UserService] User updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  },

  // Lấy thông tin user theo ID (nếu cần)
  getUserById: async (userId: string): Promise<UserResponse> => {
    try {
      console.log('🔍 [UserService] Fetching user by ID:', userId);
      const response = await api.get(`/users/${userId}`);
      console.log('✅ [UserService] User fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error fetching user by ID:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin user');
    }
  }
};

export default userService;
