// Project API service for project-related operations
import { baseApi } from "./baseApi";

// Project Member interfaces
export interface ProjectMember {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    full_name?: string;
  };
  role_in_project: string;
  joined_at: string;
}

export interface Project {
  _id: string;
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  created_by: string;
  team_id?: string;
}

// API functions
export const projectApi = {
  // Get project members
  getProjectMembers: async (projectId: string): Promise<{ members: ProjectMember[] }> => {
    const response = await baseApi.get(`/project-members/${projectId}`);
    return { members: response.data };
  },
  // Get project details
  getProject: async (projectId: string): Promise<Project> => {
    try {
      console.log("🔍 API: Getting project details for projectId:", projectId);
      const response = await baseApi.get(`/api/projects/${projectId}`);
      console.log("🔍 API: Project response structure:", response.data);
      
      // Handle different response structures
      const projectData = response.data.project || response.data;
      console.log("🔍 API: Extracted project data:", projectData);
      
      if (!projectData) {
        throw new Error("Project data not found in response");
      }
      
      return projectData;
    } catch (error) {
      console.error('🚨 API Error getting project:', error);
      throw error;
    }
  },

  // Get all projects for current user
  getProjects: async (): Promise<{ projects: Project[] }> => {
    const response = await baseApi.get('/projects');
    return { projects: response.data.projects || response.data };
  }
};

export default projectApi;
