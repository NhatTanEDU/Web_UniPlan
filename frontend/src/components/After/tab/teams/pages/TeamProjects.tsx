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

export default function TeamProjectsPage() {
  const { teamId } = useParams<{ teamId: string }>();  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    removeProject,
  } = useTeamProjects(teamId!);

  const [showModal, setShowModal] = useState(false);

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
        onRemove={removeProject}
      />

      {/* Modal tạo/gán project */}
      <TeamProjectModal
        visible={showModal}
        onClose={() => setShowModal(false)}        onAssign={async data => {
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
          };
          await createProject(projectPayload);
          setShowModal(false);
        }}
      />
    </div>
  );
}