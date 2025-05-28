// filepath: d:\Official_Project\Project_UniPlan\my_uniplan\frontend\src\services\teamsEnhanced.api.ts
import api from './api';

// Enhanced Teams API Service
export const teamsEnhancedApi = {
  // Health Check
  healthCheck: async () => {
    const response = await api.get('/teams-enhanced/health');
    return response.data;
  },
  // Search and List Teams
  searchTeams: async (params: {
    query?: string;
    filters?: any;
    sort?: string;
    page?: number;
    limit?: number;
    userId?: string;
  } = {}) => {
    const response = await api.get('/teams-enhanced/search', { params });
    return response.data;
  },

  // Statistics
  getOverviewStats: async () => {
    const response = await api.get('/teams-enhanced/stats/overview');
    return response.data;
  },

  getDetailedStats: async (teamId: string) => {
    const response = await api.get(`/teams-enhanced/stats/detailed/${teamId}`);
    return response.data;
  },

  // Activity Feed
  getActivityFeed: async (params: {
    teamId?: string;
    type?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get('/teams-enhanced/activity', { params });
    return response.data;
  },

  // Team Health
  getTeamHealth: async (teamId: string) => {
    const response = await api.get(`/teams-enhanced/health/${teamId}`);
    return response.data;
  },

  updateTeamHealth: async (teamId: string, healthData: any) => {
    const response = await api.put(`/teams-enhanced/health/${teamId}`, healthData);
    return response.data;
  },

  // Recommendations
  getRecommendations: async (params: {
    teamId?: string;
    type?: string;
    limit?: number;
  } = {}) => {
    const response = await api.get('/teams-enhanced/recommendations', { params });
    return response.data;
  },

  submitRecommendationFeedback: async (recommendationId: string, feedback: {
    helpful: boolean;
    rating?: number;
    comment?: string;
  }) => {
    const response = await api.post(`/teams-enhanced/recommendations/${recommendationId}/feedback`, feedback);
    return response.data;
  },

  // Notifications
  getNotifications: async (params: {
    type?: string;
    read?: boolean;
    starred?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get('/teams-enhanced/notifications', { params });
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string) => {
    const response = await api.put(`/teams-enhanced/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/teams-enhanced/notifications/mark-all-read');
    return response.data;
  },

  toggleNotificationStar: async (notificationId: string) => {
    const response = await api.put(`/teams-enhanced/notifications/${notificationId}/star`);
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/teams-enhanced/notifications/${notificationId}`);
    return response.data;
  },

  bulkDeleteNotifications: async (notificationIds: string[]) => {
    const response = await api.post('/teams-enhanced/notifications/bulk-delete', { 
      notificationIds 
    });
    return response.data;
  },

  archiveNotifications: async (notificationIds: string[]) => {
    const response = await api.post('/teams-enhanced/notifications/archive', { 
      notificationIds 
    });
    return response.data;
  },

  // Bulk Operations
  bulkUpdateTeams: async (teamIds: string[], updates: any) => {
    const response = await api.post('/teams-enhanced/bulk/update', {
      teamIds,
      updates
    });
    return response.data;
  },

  bulkDeleteTeams: async (teamIds: string[]) => {
    const response = await api.post('/teams-enhanced/bulk/delete', {
      teamIds
    });
    return response.data;
  },

  bulkAssignMembers: async (teamIds: string[], memberIds: string[]) => {
    const response = await api.post('/teams-enhanced/bulk/assign-members', {
      teamIds,
      memberIds
    });
    return response.data;
  },

  exportTeamsData: async (teamIds?: string[], format: 'csv' | 'json' = 'json') => {
    const response = await api.post('/teams-enhanced/bulk/export', {
      teamIds,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default teamsEnhancedApi;
