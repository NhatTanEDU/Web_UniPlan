// User Search API service for finding and searching users
import { baseApi } from "./baseApi";

// User search interfaces
export interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  role?: string;
  department?: string;
  last_active?: string;
}

export interface UserSearchFilters {
  query?: string;
  role?: string;
  department?: string;
  status?: 'online' | 'offline' | 'away';
  exclude_ids?: string[];
  limit?: number;
  page?: number;
}

export interface UserSearchResponse {
  users: SearchUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API functions
export const userSearchApi = {
  // Search users with query and filters
  searchUsers: async (filters: UserSearchFilters = {}): Promise<UserSearchResponse> => {
    const response = await baseApi.get('/personal-members/search', {
      params: {
        query: filters.query || '',
        role: filters.role,
        department: filters.department,
        status: filters.status,
        exclude_ids: filters.exclude_ids?.join(','),
        limit: filters.limit || 20,
        page: filters.page || 1
      }
    });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<SearchUser> => {
    const response = await baseApi.get(`/users/${userId}`);
    return response.data.user;
  },

  // Get user suggestions (commonly worked with users)
  getUserSuggestions: async (limit: number = 10): Promise<SearchUser[]> => {
    const response = await baseApi.get('/users/suggestions', {
      params: { limit }
    });
    return response.data.users || [];
  },

  // Get all users with pagination
  getAllUsers: async (page: number = 1, limit: number = 20): Promise<UserSearchResponse> => {
    const response = await baseApi.get('/users', {
      params: { page, limit }
    });
    return response.data;
  },

  // Search users by email
  searchByEmail: async (email: string): Promise<SearchUser[]> => {
    const response = await baseApi.get('/users/search-email', {
      params: { email }
    });
    return response.data.users || [];
  },

  // Search users by name
  searchByName: async (name: string): Promise<SearchUser[]> => {
    const response = await baseApi.get('/users/search-name', {
      params: { name }
    });
    return response.data.users || [];
  },

  // Get online users
  getOnlineUsers: async (): Promise<SearchUser[]> => {
    const response = await baseApi.get('/users/online');
    return response.data.users || [];
  }
};
