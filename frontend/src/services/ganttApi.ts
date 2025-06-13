// services/ganttApi.ts
import { baseApi } from './baseApi';

// Gantt Task interface (tương thích với dhtmlx-gantt)
export interface GanttTask {
  id: string;
  text: string;
  start_date: string | Date;
  end_date: string | Date;
  progress: number;
  status: string;
  priority: string;
  assignee: string;
  created_by: string;
  color: string;
  is_pinned: boolean;
  description: string;
}

// Gantt Link interface (cho dependencies - giai đoạn 3)
export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

// Response interface từ API
export interface GanttDataResponse {
  data: GanttTask[];
  links: GanttLink[];
  project: {
    _id: string;
    project_name: string;
    start_date: string;
    end_date: string;
  };
}

// Interface cho request cập nhật task từ Gantt
export interface UpdateGanttTaskRequest {
  text?: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  status?: 'Cần làm' | 'Đang làm' | 'Hoàn thành';
  priority?: 'Thấp' | 'Trung bình' | 'Cao';
  assignee?: string;
}

// Interface cho dependency
export interface CreateDependencyRequest {
  source: string;
  target: string;
  type: number; // 0: finish-to-start, 1: start-to-start, 2: finish-to-finish, 3: start-to-finish
  lag?: number;
}

// Gantt API Service
export const ganttApi = {  // Lấy dữ liệu Gantt tasks cho một project
  getGanttTasks: async (projectId: string): Promise<GanttDataResponse> => {
    try {
      console.log('🔍 Gantt API: Getting tasks for project:', projectId);
      const response = await baseApi.get(`/projects/${projectId}/gantt-tasks`);
      console.log('✅ Gantt API: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Gantt API Error:', error);
      throw error;
    }
  },
  // Cập nhật task từ Gantt Chart
  updateGanttTask: async (projectId: string, taskId: string, data: UpdateGanttTaskRequest): Promise<any> => {
    try {
      console.log('🔍 Gantt API: Updating task:', taskId, 'with data:', data);
      const response = await baseApi.put(`/projects/${projectId}/gantt-tasks/${taskId}`, data);
      console.log('✅ Gantt API: Task updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Gantt API Update Error:', error);
      throw error;
    }
  },

  // Dependencies Management - Giai đoạn 3
  getDependencies: async (projectId: string): Promise<{ links: GanttLink[]; total: number }> => {
    try {
      console.log('🔍 Gantt API: Getting dependencies for project:', projectId);
      const response = await baseApi.get(`/projects/${projectId}/gantt-dependencies`);
      console.log('✅ Gantt API: Dependencies received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Gantt API Dependencies Error:', error);
      throw error;
    }
  },

  createDependency: async (projectId: string, data: CreateDependencyRequest): Promise<any> => {
    try {
      console.log('🔍 Gantt API: Creating dependency:', data);
      const response = await baseApi.post(`/projects/${projectId}/gantt-dependencies`, data);
      console.log('✅ Gantt API: Dependency created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Gantt API Create Dependency Error:', error);
      throw error;
    }
  },

  deleteDependency: async (projectId: string, dependencyId: string): Promise<any> => {
    try {
      console.log('🔍 Gantt API: Deleting dependency:', dependencyId);
      const response = await baseApi.delete(`/projects/${projectId}/gantt-dependencies/${dependencyId}`);
      console.log('✅ Gantt API: Dependency deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Gantt API Delete Dependency Error:', error);
      throw error;
    }
  },

  // Auto-schedule tasks based on dependencies
  autoScheduleTasks: async (projectId: string): Promise<{ message: string; updatedTasks: number; tasks: any[] }> => {
    try {
      console.log('🔍 Gantt API: Auto-scheduling tasks for project:', projectId);
      const response = await baseApi.post(`/projects/${projectId}/gantt-auto-schedule`);
      console.log('✅ Gantt API: Auto-schedule completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Gantt API Auto-schedule Error:', error);
      throw error;
    }
  },

  // Helper function để format ngày cho dhtmlx-gantt
  formatDateForGantt: (date: string | Date): Date => {
    return new Date(date);
  },

  // Helper function để parse dữ liệu cho dhtmlx-gantt
  parseGanttData: (data: GanttDataResponse) => {
    const tasks = data.data.map(task => ({
      ...task,
      start_date: ganttApi.formatDateForGantt(task.start_date),
      end_date: ganttApi.formatDateForGantt(task.end_date)
    }));

    return {
      data: tasks,
      links: data.links || []
    };
  }
};

export default ganttApi;
