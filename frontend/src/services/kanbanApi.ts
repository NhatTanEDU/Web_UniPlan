import { baseApi } from './baseApi';

// Interfaces for Kanban
export interface Document {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  taskId?: string;
  projectId?: string;
  teamId?: string;
  uploadedAt: string;
}

export interface KanbanTask {
  _id?: string;
  kanban_id: string;
  title: string;
  description?: string;
  status: 'Cần làm' | 'Đang làm' | 'Hoàn thành';
  start_date?: string;
  due_date?: string;
  priority: 'Thấp' | 'Trung bình' | 'Cao';
  assigned_to?: string;
  assigned_to_name?: string;
  color?: string;
  is_pinned?: boolean;
  order?: number;
  created_by?: string;
  tags?: string[];
  documents?: Document[]; // THÊM TRƯỜNG NÀY
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  riskLevel?: number;   // Thêm dòng này
  riskClass?: string;   // Thêm dòng này
}

export interface Kanban {
  _id?: string;
  project_id: string;
  name: string;
  description?: string;
  created_by?: string;
  status?: 'Active' | 'Archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  kanban_id: string;
  title: string;
  description?: string;
  status?: 'Cần làm' | 'Đang làm' | 'Hoàn thành';
  start_date?: string;
  due_date?: string;
  priority?: 'Thấp' | 'Trung bình' | 'Cao';
  assigned_to?: string;
  color?: string;
  is_pinned?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'Cần làm' | 'Đang làm' | 'Hoàn thành';
  start_date?: string;
  due_date?: string;
  priority?: 'Thấp' | 'Trung bình' | 'Cao';
  assigned_to?: string;
  color?: string;
  is_pinned?: boolean;
}

export interface ProjectMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface TaskDependency {
  _id: string;
  source_task_id: {
    _id: string;
    title: string;
    status: string;
  };
  target_task_id: {
    _id: string;
    title: string;
    status: string;
  };
  dependency_type: string;
  lag_days: number;
  is_active: boolean;
}

// Kanban API Service
export const kanbanApi = {
  // Kanban Board Operations
  createKanban: async (data: {
    project_id: string;
    name: string;
    description?: string;
  }): Promise<Kanban> => {
    const response = await baseApi.post('/kanban', data);
    return response.data;
  },
  // TÌM KANBAN THEO PROJECT ID - API MỚI
  findKanbanByProject: async (projectId: string): Promise<{
    success: boolean;
    found: boolean;
    data?: {
      kanban: Kanban;
      tasks: KanbanTask[];
      project_name: string;
    };
    message?: string;
    error?: string;
  }> => {
    try {
      const response = await baseApi.get(`/kanban/project/${projectId}`);
      
      if (response.status === 200) {
        return { 
          success: true, 
          found: true, 
          data: response.data 
        };
      } else {
        return { 
          success: true, 
          found: false, 
          message: response.data.message || 'Không tìm thấy Kanban' 
        };
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { 
          success: true, 
          found: false, 
          message: error.response.data.message || 'Không tìm thấy Kanban cho dự án này' 
        };
      } else {
        console.error('Lỗi API findKanbanByProject:', error);
        return { 
          success: false, 
          found: false, 
          error: error.response?.data?.message || error.message || 'Lỗi không xác định' 
        };
      }
    }
  },

  getKanban: async (kanbanId: string): Promise<{
    kanban: Kanban;
    tasks: KanbanTask[];
    project_name: string;
  }> => {
    const response = await baseApi.get(`/kanban/${kanbanId}`);
    return response.data;
  },

  updateKanban: async (kanbanId: string, data: {
    name?: string;
    description?: string;
  }): Promise<Kanban> => {
    const response = await baseApi.put(`/kanban/${kanbanId}`, data);
    return response.data;
  },

  deleteKanban: async (kanbanId: string): Promise<void> => {
    await baseApi.delete(`/kanban/${kanbanId}`);
  },

  // Task Operations
  createTask: async (data: CreateTaskRequest): Promise<KanbanTask> => {
    const response = await baseApi.post('/kanban-tasks', data);
    return response.data;
  },

  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<KanbanTask> => {
    const response = await baseApi.put(`/kanban-tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await baseApi.delete(`/kanban-tasks/${taskId}`);
  },

  getTasks: async (kanbanId: string): Promise<KanbanTask[]> => {
    const response = await baseApi.get(`/kanban-tasks/${kanbanId}/tasks`);
    return response.data;
  },
  toggleTaskPin: async (taskId: string): Promise<KanbanTask> => {
    const response = await baseApi.put(`/kanban-tasks/${taskId}/pin`);
    return response.data;
  },

  // Drag and Drop Operations
  reorderTasks: async (data: {
    tasks: Array<{ _id: string; status: string; order: number }>
  }): Promise<{ message: string; modifiedCount: number }> => {
    const response = await baseApi.put(`/kanban-tasks/reorder`, data);
    return response.data;
  },

  // Single task reorder (alternative method)
  updateTaskOrder: async (taskId: string, data: {
    newStatus?: string;
    newOrder?: number;
  }): Promise<KanbanTask> => {
    const response = await baseApi.put(`/kanban-tasks/${taskId}/order`, data);
    return response.data;
  },

  // Project Members for Task Assignment
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    console.log("🔍 API: Getting project members for projectId:", projectId);
    const response = await baseApi.get(`/projects/${projectId}/members-for-assignment`);
    console.log("🔍 API: Project members response:", response.data);
    return response.data;
  },

  // Utility methods
  getTasksByStatus: (tasks: KanbanTask[], status: string): KanbanTask[] => {
    return tasks.filter(task => task.status === status);
  },

  sortTasksByOrder: (tasks: KanbanTask[]): KanbanTask[] => {
    return tasks.sort((a, b) => {
      // Pinned tasks first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // Then by order
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  },

  validateTaskDates: (startDate?: string, dueDate?: string): string | null => {
    if (!startDate || !dueDate) return null;
    
    const start = new Date(startDate);
    const due = new Date(dueDate);
    
    if (start > due) {
      return 'Ngày bắt đầu không thể sau ngày kết thúc';
    }
    
    return null;
  },

  validateTaskAgainstProject: (
    taskStartDate?: string,
    taskDueDate?: string,
    projectStartDate?: string,
    projectEndDate?: string
  ): string | null => {
    if (taskStartDate && projectStartDate) {
      const taskStart = new Date(taskStartDate);
      const projectStart = new Date(projectStartDate);
      
      if (taskStart < projectStart) {
        return 'Ngày bắt đầu task không thể trước ngày bắt đầu dự án';
      }
    }
    
    if (taskDueDate && projectEndDate) {
      const taskDue = new Date(taskDueDate);
      const projectEnd = new Date(projectEndDate);
      
      if (taskDue > projectEnd) {
        return 'Ngày kết thúc task không thể sau ngày kết thúc dự án';
      }
    }
    
    return null;
  },

  // Lấy tài liệu cho một task
  getTaskDocuments: async (taskId: string): Promise<Document[]> => {
    const response = await baseApi.get(`/kanban-tasks/${taskId}/documents`);
    return response.data;
  },

  // Xóa một tài liệu khỏi task
  deleteTaskDocument: async (taskId: string, documentId: string): Promise<void> => {
    await baseApi.delete(`/kanban-tasks/${taskId}/documents/${documentId}`);
  },

  // Cập nhật task từ Gantt Chart (Phase 2 implementation)
  updateTaskFromGantt: async (projectId: string, taskId: string, data: {
    text?: string;
    start_date?: string;
    end_date?: string;
    progress?: number;
  }): Promise<KanbanTask> => {
    const response = await baseApi.put(`/projects/${projectId}/gantt-tasks/${taskId}`, data);
    return response.data.task;
  },

  // Task Dependencies Operations
  createTaskDependency: async (data: {
    source_task_id: string;
    target_task_id: string;
    dependency_type?: string;
  }) => {
    const response = await baseApi.post('/kanban-tasks/dependencies', data);
    return response.data;
  },

  getTaskDependencies: async (kanbanId: string): Promise<TaskDependency[]> => {
    const response = await baseApi.get(`/kanban-tasks/${kanbanId}/dependencies`);
    return response.data;
  },

  deleteTaskDependency: async (dependencyId: string) => {
    const response = await baseApi.delete(`/kanban-tasks/dependencies/${dependencyId}`);
    return response.data;
  },

  // Gantt Dependencies Operations
  getGanttDependencies: async (projectId: string) => {
    try {
      // SỬA: Đúng endpoint là /gantt-dependencies
      const response = await baseApi.get(`/projects/${projectId}/gantt-dependencies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gantt dependencies:', error);
      // Trả về format mặc định thay vì throw
      return { links: [] };
    }
  },

  createGanttDependency: async (projectId: string, data: {
    source: string | number;
    target: string | number;
    type?: string | number;
    lag?: number;
  }) => {
    const payload = {
      source: String(data.source),
      target: String(data.target), 
      type: typeof data.type === 'string' ? parseInt(data.type) : (data.type || 0),
      lag: data.lag || 0
    };
    // SỬA: Đúng endpoint là /gantt-dependencies
    const response = await baseApi.post(`/projects/${projectId}/gantt-dependencies`, payload);
    return response.data;
  },

  deleteGanttDependency: async (projectId: string, dependencyId: string | number) => {
    try {
      // SỬA: Đúng endpoint là /gantt-dependencies
      const response = await baseApi.delete(`/projects/${projectId}/gantt-dependencies/${String(dependencyId)}`);
      return response.data;
    } catch (error: any) {
      // Không throw error nếu dependency không tồn tại
      if (error.response?.status === 404) {
        console.warn('Dependency not found, may have been already deleted');
        return { message: 'Dependency not found' };
      }
      throw error;
    }
  }
};

export default kanbanApi;
