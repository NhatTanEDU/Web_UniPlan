// Team Project API service for managing projects assigned to teams
import { baseApi } from "./baseApi";

// Team Project interfaces
export interface TeamProject {
  _id: string;
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  project_type_id?: {
    _id: string;
    name: string;
  };
}

export interface CreateProjectData {
  project_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status?: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High';
  project_type_id?: string;
  team_id?: string;
}

export interface AssignProjectData {
  project_id: string;
  team_id: string;
}

// API functions
export const teamProjectApi = {
  // Get all projects for a team
  getTeamProjects: async (teamId: string): Promise<{ projects: TeamProject[], total: number }> => {
    const response = await baseApi.get(`/teams/${teamId}/projects`);
    return response.data;
  },
  // Get available projects (not assigned to any team or user has access)
  getAvailableProjects: async (): Promise<{ projects: TeamProject[], total: number }> => {
    const response = await baseApi.get('/projects/available');
    return response.data;
  },

  // Assign existing project to team
  assignProjectToTeam: async (teamId: string, projectId: string): Promise<TeamProject> => {
    const response = await baseApi.post(`/teams/${teamId}/projects`, { project_id: projectId });
    return response.data.project;
  },

  // Remove project from team
  removeProjectFromTeam: async (teamId: string, projectId: string): Promise<void> => {
    await baseApi.delete(`/teams/${teamId}/projects/${projectId}`);
  },

  // Create new project and assign to team
  createAndAssignProject: async (teamId: string, projectData: CreateProjectData): Promise<TeamProject> => {
    const response = await baseApi.post('/projects', {
      ...projectData,
      team_id: teamId
    });
    return response.data.project;
  },

  // Update project details
  updateProject: async (projectId: string, projectData: Partial<CreateProjectData>): Promise<TeamProject> => {
    const response = await baseApi.put(`/projects/${projectId}`, projectData);
    return response.data.project;
  },
  // Search projects
  searchProjects: async (query: string): Promise<{ projects: TeamProject[], total: number }> => {
    const response = await baseApi.get('/projects/search', {
      params: { query }
    });
    return response.data;
  }
};
