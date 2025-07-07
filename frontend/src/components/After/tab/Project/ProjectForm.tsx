import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
  getProjectTypes,
  ProjectType,
} from "../../../../services/projectTypeApi";
import ProjectTypeManagerModal from "./ProjectTypeManagerModal";
import CreateProjectTypeModal from "./CreateProjectTypeModal";
import { PROJECT_STATUS_OPTIONS, PROJECT_PRIORITY_OPTIONS } from "../../../../constants/projectLabels";

interface ProjectFormProps {
  newProject: {
    project_name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    priority: string;
    project_type: string;
    project_type_id: {
      _id: string;
      name: string;
    };
  };
  setNewProject: (v: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProjectForm({
  newProject,
  setNewProject,
  onSubmit,
}: ProjectFormProps) {
  const { userId } = useContext(AuthContext);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);

  // Hàm xử lý khi tạo project type mới thành công
  const handleTypeCreated = (newType: ProjectType) => {
    console.log("[DEBUG] New project type created:", newType);
    // Cập nhật danh sách project types
    setProjectTypes([...projectTypes, newType]);
    // Tự động chọn phân loại mới tạo cho dự án đang tạo
    setNewProject({
      ...newProject,
      project_type: newType.name,
      project_type_id: newType,
    });
  };

  useEffect(() => {
    if (!userId) return;
    setLoadingTypes(true);
    getProjectTypes(userId)
      .then(setProjectTypes)
      .finally(() => setLoadingTypes(false));
  }, [userId]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Tên dự án */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tên dự án
        </label>
        <input
          type="text"
          value={newProject.project_name}
          onChange={(e) =>
            setNewProject({ ...newProject, project_name: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mô tả
        </label>
        <textarea
          value={newProject.description}
          onChange={(e) =>
            setNewProject({ ...newProject, description: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Ngày bắt đầu và kết thúc */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            value={newProject.start_date}
            onChange={(e) =>
              setNewProject({ ...newProject, start_date: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ngày kết thúc
          </label>
          <input
            type="date"
            value={newProject.end_date}
            onChange={(e) =>
              setNewProject({ ...newProject, end_date: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </div>

      {/* Trạng thái */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Trạng thái
        </label>        <select
          value={newProject.status}
          onChange={(e) =>
            setNewProject({ ...newProject, status: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          {PROJECT_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mức độ ưu tiên */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ưu tiên
        </label>        <select
          value={newProject.priority}
          onChange={(e) =>
            setNewProject({ ...newProject, priority: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          {PROJECT_PRIORITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Phân loại dự án */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Phân loại dự án
        </label>
        <div className="flex items-center gap-2">          <select
            value={newProject.project_type_id?._id || ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === "__new__") {
                // Mở modal tạo phân loại mới thay vì prompt
                console.log("[DEBUG] User selected '+ Tạo phân loại mới...', opening modal.");
                setIsCreateTypeModalOpen(true);
              } else {
                const found = projectTypes.find((pt) => pt._id === selectedId);
                if (found) {
                  setNewProject({
                    ...newProject,
                    project_type: found.name,
                    project_type_id: found,
                  });
                }
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="" disabled>
              {loadingTypes ? "Đang tải..." : "Chọn phân loại"}
            </option>
            {projectTypes.map((pt) => (
              <option key={pt._id} value={pt._id}>
                {pt.name}
              </option>
            ))}
            <option value="__new__">+ Tạo phân loại mới...</option>
          </select>
          <button
            type="button"
            className="ml-2 text-blue-500 underline text-sm"
            onClick={() => setShowTypeManager(true)}
          >
            Quản lý phân loại
          </button>
        </div>        <ProjectTypeManagerModal
          open={showTypeManager}
          onClose={() => setShowTypeManager(false)}
        />
      </div>

      {/* Nút submit */}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
      >
        Tạo Dự án
      </button>

      {/* Modal tạo phân loại mới */}
      <CreateProjectTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onTypeCreated={handleTypeCreated}
      />
    </form>
  );
}
