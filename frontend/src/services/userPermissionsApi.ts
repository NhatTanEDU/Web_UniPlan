import api from './api';

export interface UserPermissions {
  userRole: string;
  permissions: string[];
  projectId: string;
  userId: string;
  isOwner: boolean;
}

export const userPermissionsApi = {
  // Get user permissions for a specific project
  getUserPermissions: async (projectId: string): Promise<UserPermissions> => {
    try {
      const response = await api.get(`/user-permissions/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user permissions:', error);
      throw error;
    }
  },

  // Check if user can perform a specific action
  canPerformAction: (permissions: string[], action: string): boolean => {
    return permissions.includes(action);
  },

  // Get permission label for display
  getPermissionLabel: (userRole: string): string => {
    const labels: { [key: string]: string } = {
      'Quản trị viên': 'Admin - Toàn quyền',
      'Biên tập viên': 'Editor - Chỉnh sửa, xóa, ghim, di chuyển',
      'Người xem': 'Viewer - Chỉ di chuyển tasks'
    };
    return labels[userRole] || 'Không có quyền';
  },

  // Get available actions based on role
  getAvailableActions: (permissions: string[]): string[] => {
    const actionLabels: { [key: string]: string } = {
      'create': 'Tạo task',
      'edit': 'Chỉnh sửa task',
      'delete': 'Xóa task',
      'pin': 'Ghim/bỏ ghim task',
      'move': 'Di chuyển task'
    };
    
    return permissions.map(p => actionLabels[p]).filter(Boolean);
  }
};
