import api from './api';

export interface ProjectType {
  _id: string;
  name: string;
}

export const getProjectTypes = async (userId: string): Promise<ProjectType[]> => {
  const response = await api.get(`/project-types?userId=${userId}`);
  return response.data;
};

export const createProjectType = async (name: string, userId: string): Promise<ProjectType> => {
  const response = await api.post('/project-types', { name, userId });
  return response.data;
};

// Đảm bảo file được coi là module
const projectTypeApi = {
  getProjectTypes,
  createProjectType
};

export default projectTypeApi;