/**
 * useTeamProjects Hook
 * ----------------------
 * - Quản lý state danh sách projects của 1 team
 * - Cung cấp các hàm: fetchProjects, assignProject, createProject, removeProject, updateProject
 */
import { useState, useEffect, useCallback } from "react";
import { teamProjectApi, TeamProject, CreateProjectData } from "../../../../../services/teamProjectApi";

export function useTeamProjects(teamId: string) {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchProjects()
   *  - Gọi API getTeamProjects(teamId)
   *  - Cập nhật state projects
   */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await teamProjectApi.getTeamProjects(teamId);
      setProjects(res.projects);
    } catch (err: any) {
      setError(err.message || "Không tải được danh sách dự án");
    } finally {
      setLoading(false);
    }
  }, [teamId]);
  /**
   * assignProject(data)
   *  - Gọi API assignProjectToTeam
   *  - Sau đó refetch
   */
  const assignProject = async (data: {
    projectId: string;
  }) => {
    await teamProjectApi.assignProjectToTeam(teamId, data.projectId);
    await fetchProjects();
  };  /**
   * createProject(data)
   *  - Gọi API createAndAssignProject (tạo và gán luôn)
   *  - Sau đó refetch
   */
  const createProject = async (data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    project_type_id?: string | null; // << THÊM VÀO KIỂU DỮ LIỆU
  }) => {
    const projectData: CreateProjectData = { // Đảm bảo projectData khớp với CreateProjectData
      project_name: data.title,
      description: data.description,
      start_date: data.startDate || new Date().toISOString(),
      end_date: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: data.status ? data.status as 'Active' | 'Completed' | 'On Hold' | 'Cancelled' : 'Active', // Sửa lại cách gán status
      priority: data.priority ? data.priority as 'Low' | 'Medium' | 'High' : 'Medium', // Sửa lại cách gán priority
      project_type_id: data.project_type_id || undefined // << THÊM VÀO projectData
    };
    
    // Loại bỏ project_type_id nếu nó là null hoặc undefined để backend tự xử lý default
    if (!projectData.project_type_id) {
      delete projectData.project_type_id;
    }

    await teamProjectApi.createAndAssignProject(teamId, projectData);
    await fetchProjects();
  };/**
   * updateProject(projectId, data)
   *  - Gọi API updateProject
   *  - Sau đó refetch
   */
  const updateProject = async (projectId: string, data: Partial<CreateProjectData>) => {
    await teamProjectApi.updateProject(projectId, data);
    await fetchProjects();
  };
  /**
   * removeProject(projectId)
   *  - Gọi API removeProjectFromTeam
   *  - Sau đó refetch
   */
  const removeProject = async (projectId: string) => {
    await teamProjectApi.removeProjectFromTeam(teamId, projectId);
    await fetchProjects();
  };

  // Auto-fetch khi teamId thay đổi
  useEffect(() => {
    if (teamId) fetchProjects();
  }, [fetchProjects, teamId]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    assignProject,
    createProject,
    updateProject,
    removeProject,
  };
}