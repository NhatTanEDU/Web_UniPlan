/**
 * TeamProjects Page
 * -------------------
 * - Trang quản lý dự án của team
 * - Sử dụng useTeamProjects, render ProjectList + TeamProjectModal
 * - Lấy teamId từ URL params
 */
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTeamProjects } from "../hooks/useTeamProjects";
import { CreateProjectData, TeamProject } from "../../../../../services/teamProjectApi";
import ProjectList from "../components/ProjectList";
import TeamProjectModal from "../components/TeamProjectModal";
import Toast from "../../../../common/Toast";

export default function TeamProjectsPage() {
  const { teamId } = useParams<{ teamId: string }>();  const {
    projects,
    loading,
    error,
    createProject,
    assignProject,
    updateProject,
    removeProject,
  } = useTeamProjects(teamId!);

  const [showModal, setShowModal] = useState(false);  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  // Wrapper function to convert TeamProject to CreateProjectData for the API
  const handleUpdateProject = async (projectId: string, data: Partial<TeamProject>) => {
    // Convert TeamProject fields to CreateProjectData fields
    const updateData: Partial<CreateProjectData> = {
      project_name: data.project_name,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      priority: data.priority,
      project_type_id: typeof data.project_type_id === 'object' ? data.project_type_id?._id : data.project_type_id,
    };
    await updateProject(projectId, updateData);
  };

  // Wrapper function for assigning existing project with toast notifications
  const handleAssignExisting = async (projectId: string) => {
    try {
      await assignProject({ projectId });
      setToast({
        show: true,
        message: 'Đã gán project vào team thành công',
        type: 'success'
      });
    } catch (error) {
      console.error('Error assigning project:', error);
      setToast({
        show: true,
        message: 'Không thể gán project vào team. Vui lòng thử lại.',
        type: 'error'
      });
    }
  };
  const handleRemoveProject = async (projectId: string) => {
    // Find project name for better toast message
    const project = projects.find(p => p._id === projectId);
    const projectName = project?.project_name || 'dự án';
    
    try {
      await removeProject(projectId);
      setToast({
        show: true,
        message: `Đã xóa ${projectName} khỏi team thành công`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error removing project:', error);
      setToast({
        show: true,
        message: `Không thể xóa ${projectName} khỏi team. Vui lòng thử lại.`,
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + nút Thêm/Gán dự án */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Dự án của nhóm</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Thêm / Tạo Project
        </button>
      </div>      {/* Danh sách projects */}
      <ProjectList
        projects={projects}
        loading={loading}
        error={error}
        onUpdate={handleUpdateProject}
        onRemove={handleRemoveProject}
      />      {/* Modal tạo/gán project */}
      <TeamProjectModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAssignExisting={handleAssignExisting}
        onAssign={async data => {
          // Data from TeamProjectModal's newProject state includes:
          // project_name, description, start_date, end_date, status, priority,
          // project_type (string name), project_type_id ({ _id, name })

          // Convert modal data to createProject expected format
          const projectPayload = {
            title: data.project_name, // Convert project_name to title
            description: data.description,
            startDate: data.start_date, // Convert start_date to startDate
            endDate: data.end_date, // Convert end_date to endDate
            status: data.status,
            priority: data.priority,
            project_type_id: data.project_type_id?._id || null // << THÊM DÒNG NÀY
          };
          
          // Kiểm tra nếu không có project_type_id thì không gửi hoặc báo lỗi tùy logic
          if (!projectPayload.project_type_id && data.project_type_id?.name && data.project_type_id?.name !== "Không phân loại") {
            // Có thể bạn muốn báo lỗi nếu người dùng đã chọn một phân loại cụ thể mà ID lại rỗng
            console.warn("Project Type ID bị thiếu dù đã chọn phân loại:", data.project_type_id);
            // Hoặc bạn có thể để backend tự xử lý bằng default type nếu project_type_id là null
          }
          
          await createProject(projectPayload);
          setShowModal(false);
        }}
      />      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}