/**
 * useProjects Hook
 * -------------------
 * - Quản lý state danh sách projects (loading, error, data)
 * - Cung cấp các hàm: fetchProjects, createProject, updateProject, deleteProject, restoreProject
 * - Hỗ trợ optimistic updates và thông báo thành công/lỗi
 * - Tự động cập nhật UI sau mỗi thao tác CRUD
 * - Pattern tương tự useTeams nhưng dành cho project management
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Project } from "../../../../../types/project";
import { getProjects, createProject, softDeleteProject, restoreProject, updateProject } from "../../../../../services/api";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  /**
   * fetchProjects()
   *  - Gọi API getProjects()
   *  - Cập nhật state: projects, loading, error
   */
  const fetchProjects = useCallback(async () => {
    console.log("🔄 useProjects: fetchProjects called");
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      console.log("✅ useProjects: API response received", { 
        projectsCount: Array.isArray(data) ? data.length : 'Not an array', 
        dataType: typeof data,
        isArray: Array.isArray(data),
        data: data
      });
      
      // 🚀 DEFENSIVE: Đảm bảo data là array
      const safeData = Array.isArray(data) ? data : [];
      setProjects(safeData);
      console.log("✅ useProjects: State updated with new projects");
    } catch (err: any) {
      console.error("❌ useProjects: Error fetching projects", err);
      let msg = "Không tải được danh sách dự án";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * createProjectWithOptimisticUpdate(data)
   *  - Optimistic Update: Thêm project tạm vào state ngay lập tức
   *  - Gọi API createProject()
   *  - Replace project tạm bằng project thật từ API
   *  - Rollback nếu có lỗi
   *  - Return result { success, message }
   */
  const createProjectWithOptimisticUpdate = async (projectData: {
    project_name: string;
    description: string;
    start_date: string;
    end_date: string;
    status?: string;
    priority?: string;
    project_type_id: string;
  }) => {
    console.log("🔄 useProjects: createProject called with data:", projectData);
    
    try {
      // 1. Optimistic update: Thêm project tạm vào state ngay lập tức
      const tempId = `temp_${Date.now()}`;
      const tempProject: Project = {
        _id: tempId,
        project_name: projectData.project_name,
        description: projectData.description,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        status: projectData.status || 'Planning',
        priority: projectData.priority || 'Medium',
        project_type_id: { _id: projectData.project_type_id, name: "Đang tải..." },
        created_by: "",
        created_at: new Date().toISOString(),
        is_deleted: false,
        deleted_at: null
      };
      
      setProjects(prev => [...prev, tempProject]);
      console.log("✅ useProjects: Optimistic update applied - temp project added");

      // 2. Gọi API
      const response = await createProject(projectData);
      console.log("✅ useProjects: API response received:", response);
      
      // 3. Replace temp project với real project
      setProjects(prev => prev.map(project => 
        project._id === tempId ? response.project : project
      ));
      console.log("✅ useProjects: Real project replaced temp project");
      
      return { success: true, message: "Thêm dự án thành công" };
      
    } catch (err: any) {
      // 4. Rollback: Xóa project tạm nếu có lỗi
      setProjects(prev => prev.filter(project => !project._id.startsWith('temp_')));
      console.error("❌ useProjects: Error creating project, rollback applied", err);
      
      let errorMessage = "Lỗi khi tạo dự án";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };
  /**
   * updateProjectWithOptimisticUpdate(id, data)
   *  - Optimistic Update: Cập nhật project trong state ngay lập tức
   *  - Gọi API updateProject()
   *  - Replace với data thật từ API
   *  - Rollback nếu có lỗi
   *  - Return result { success, message }
   */
  const updateProjectWithOptimisticUpdate = async (id: string, updatedData: Partial<Project>) => {
    console.log("🔄 useProjects: updateProject called", { id, updatedData });
    
    // Lưu trạng thái cũ cho rollback
    const oldProjects = [...projects];
    
    try {
      // 1. Optimistic update
      setProjects(prev => prev.map(project => 
        project._id === id ? { ...project, ...updatedData } : project
      ));
      console.log("✅ useProjects: Optimistic update applied");

      // 2. Chuẩn bị data cho API (loại bỏ các field undefined và chỉ gửi những field cần thiết)
      const updatePayload: any = {};
      if (updatedData.project_name !== undefined) updatePayload.project_name = updatedData.project_name;
      if (updatedData.description !== undefined) updatePayload.description = updatedData.description;
      if (updatedData.start_date !== undefined) updatePayload.start_date = updatedData.start_date;
      if (updatedData.end_date !== undefined) updatePayload.end_date = updatedData.end_date;
      if (updatedData.status !== undefined) updatePayload.status = updatedData.status;
      if (updatedData.priority !== undefined) updatePayload.priority = updatedData.priority;
      if (updatedData.project_type_id !== undefined) updatePayload.project_type_id = updatedData.project_type_id;

      // 3. Gọi API
      const response = await updateProject(id, updatePayload);
      console.log("✅ useProjects: API response received:", response);
      
      // 4. Replace với data thật từ API
      setProjects(prev => prev.map(project => 
        project._id === id ? response.project : project
      ));
      console.log("✅ useProjects: Real data replaced optimistic data");
      
      return { success: true, message: "Cập nhật dự án thành công" };
      
    } catch (err: any) {
      // 5. Rollback
      setProjects(oldProjects);
      console.error("❌ useProjects: Error updating project, rollback applied", err);
      
      let errorMessage = "Lỗi khi cập nhật dự án";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  /**
   * deleteProjectWithOptimisticUpdate(id)
   *  - Optimistic Update: Đánh dấu project là đã xóa
   *  - Gọi API softDeleteProject()
   *  - Rollback nếu có lỗi
   *  - Return result { success, message }
   */
  const deleteProjectWithOptimisticUpdate = async (id: string) => {
    console.log("🔄 useProjects: deleteProject called", { id });
    
    // Lưu trạng thái cũ cho rollback
    const oldProjects = [...projects];
    
    try {
      // 1. Optimistic update: Đánh dấu là đã xóa
      setProjects(prev => prev.map(project => 
        project._id === id ? { 
          ...project, 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        } : project
      ));
      console.log("✅ useProjects: Optimistic delete applied");

      // 2. Gọi API
      await softDeleteProject(id);
      console.log("✅ useProjects: API call successful");
      
      return { success: true, message: "Xóa dự án thành công" };
      
    } catch (err: any) {
      // 3. Rollback
      setProjects(oldProjects);
      console.error("❌ useProjects: Error deleting project, rollback applied", err);
      
      let errorMessage = "Lỗi khi xóa dự án";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  /**
   * restoreProjectWithOptimisticUpdate(id)
   *  - Optimistic Update: Khôi phục project
   *  - Gọi API restoreProject()
   *  - Rollback nếu có lỗi
   *  - Return result { success, message }
   */
  const restoreProjectWithOptimisticUpdate = async (id: string) => {
    console.log("🔄 useProjects: restoreProject called", { id });
    
    // Lưu trạng thái cũ cho rollback
    const oldProjects = [...projects];
    
    try {
      // 1. Optimistic update: Khôi phục
      setProjects(prev => prev.map(project => 
        project._id === id ? { 
          ...project, 
          is_deleted: false, 
          deleted_at: null 
        } : project
      ));
      console.log("✅ useProjects: Optimistic restore applied");

      // 2. Gọi API
      await restoreProject(id);
      console.log("✅ useProjects: API call successful");
      
      return { success: true, message: "Khôi phục dự án thành công" };
      
    } catch (err: any) {
      // 3. Rollback
      setProjects(oldProjects);
      console.error("❌ useProjects: Error restoring project, rollback applied", err);
      
      let errorMessage = "Lỗi khi khôi phục dự án";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  // Auto-fetch projects khi hook được mount (chỉ 1 lần)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProjects();
    }
  }, [fetchProjects]);

  return {
    // State
    projects,
    loading,
    error,
    
    // Actions với optimistic updates
    fetchProjects,
    createProject: createProjectWithOptimisticUpdate,
    updateProject: updateProjectWithOptimisticUpdate,
    deleteProject: deleteProjectWithOptimisticUpdate,
    restoreProject: restoreProjectWithOptimisticUpdate,
  };
}
