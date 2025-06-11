// Team Member Search API service specifically for team operations
import { baseApi } from "./baseApi";

// Team member search interfaces
export interface TeamSearchUser {
  _id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface TeamUserSearchResponse {
  users: TeamSearchUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TeamSearchFilters {
  team_id: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API functions for team member search
export const teamMemberSearchApi = {
  // Search users to add to team (uses correct /teams/members/search endpoint)
  searchUsersToAdd: async (filters: TeamSearchFilters): Promise<TeamUserSearchResponse> => {
    const response = await baseApi.get('/teams/members/search', {
      params: {
        team_id: filters.team_id,
        search: filters.search || '',
        page: filters.page || 1,
        limit: filters.limit || 10
      }
    });
    return response.data;
  },

  // Get user suggestions for short queries (1-2 characters)
  getUserSuggestions: async (query: string, teamId: string, limit: number = 5): Promise<TeamSearchUser[]> => {
    try {
      // For short queries, get recent/suggested users
      if (!query || query.trim().length < 2) {
        // Return empty array for very short queries, but could be enhanced
        // to show recent collaborators or suggested users
        return [];
      }
      
      // For 2+ character queries, use the regular search
      const response = await teamMemberSearchApi.searchUsersToAdd({
        team_id: teamId,
        search: query.trim(),
        limit
      });
      
      return response.users || [];
    } catch (error) {
      console.error('Error getting user suggestions:', error);
      return [];
    }
  }
};
