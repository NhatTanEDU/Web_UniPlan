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
  phone?: string;
  address?: string;
  bio?: string;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string; // Mongoose default field
  updatedAt?: string; // Mongoose default field
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
      console.log('🔍 [UserService] User object details:', response.data.data.user);
      console.log('🔍 [UserService] CreatedAt field:', response.data.data.user.createdAt);
      console.log('🔍 [UserService] UpdatedAt field:', response.data.data.user.updatedAt);
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
  },

  // Cập nhật profile
  updateProfile: async (profileData: {
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<UserResponse> => {
    try {
      console.log('🔄 [UserService] Updating profile...', profileData);
      const response = await api.put('/users/profile', profileData);
      console.log('✅ [UserService] Profile updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error updating profile:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin cá nhân');
    }
  },

  // Upload avatar (lưu trực tiếp vào MongoDB)
  uploadAvatar: async (file: File): Promise<{ data: { avatar_url: string } }> => {
    try {
      console.log('📤 [UserService] Uploading avatar to MongoDB...');
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Sử dụng API endpoint mới để lưu vào MongoDB
      const response = await api.post('/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ [UserService] Avatar uploaded successfully to MongoDB:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error uploading avatar:', error);
      throw new Error(error.response?.data?.message || 'Không thể upload avatar');
    }
  },

  // Xóa avatar người dùng
  deleteAvatar: async (): Promise<{ success: boolean, message: string }> => {
    try {
      console.log('🗑️ [UserService] Deleting avatar...');
      const response = await api.delete('/avatar/delete');
      console.log('✅ [UserService] Avatar deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error deleting avatar:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa avatar');
    }
  },

  // Lấy URL avatar từ ID người dùng (không dùng token - cho public usage)
  getAvatarUrl: (userId: string): string => {
    // Xử lý để tránh đường dẫn trùng '/api' nếu có trong baseURL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    console.log(`🖼️ [UserService] Getting avatar URL for userId: ${userId}`);
    console.log(`🔗 [UserService] Avatar URL: ${baseUrl}/api/avatar/${userId}?t=${timestamp}`);
    
    return `${baseUrl}/api/avatar/${userId}?t=${timestamp}`;
  }
};

export default userService;
