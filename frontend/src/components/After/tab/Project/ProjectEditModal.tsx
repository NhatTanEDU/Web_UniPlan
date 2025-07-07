import React, { useState, useEffect, useContext } from "react";
import { Project } from "../../../../types/project";
import { AuthContext } from "../../../context/AuthContext";
import { getProjectTypes, ProjectType } from "../../../../services/projectTypeApi";
import ProjectTypeManagerModal from "./ProjectTypeManagerModal";
import CreateProjectTypeModal from "./CreateProjectTypeModal"; // << 1. IMPORT MODAL MỚI
import { PROJECT_STATUS_OPTIONS, PROJECT_PRIORITY_OPTIONS } from "../../../../constants/projectLabels";
// TEMPORARILY DISABLED - Preventing Socket.IO 404 logs
// import { socket } from "../../../../services/socket";

interface Props {
  editProject: Project;
  setEditProject: (p: Project | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProjectEditModal({ editProject, setEditProject, onSubmit }: Props) {
  const { userId } = useContext(AuthContext);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  // << 2. THÊM STATE ĐỂ ĐIỀU KHIỂN MODAL TẠO PHÂN LOẠI >>
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  useEffect(() => {
    if (!userId) return;
    
    const fetchProjectTypes = async () => {
      setLoadingTypes(true);
      try {
        const types = await getProjectTypes(userId);
        setProjectTypes(types);
      } finally {
        setLoadingTypes(false);
      }
    };    fetchProjectTypes();    // TEMPORARILY DISABLED - Socket.IO to prevent 404 logs
    // const handleProjectTypeUpdate = () => {
    //   fetchProjectTypes();
    // };

    // socket.on('project_changed', handleProjectTypeUpdate);

    // return () => {
    //   socket.off('project_changed', handleProjectTypeUpdate);
    // };
  }, [userId]);
  // Hàm xử lý khi tạo project type mới thành công
  const handleTypeCreated = (newType: ProjectType) => {
    console.log("[DEBUG] New project type created:", newType);
    // Cập nhật danh sách project types
    setProjectTypes([...projectTypes, newType]);
    // Tự động chọn phân loại mới tạo cho dự án đang edit
    setEditProject({ ...editProject, project_type_id: newType });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto relative mx-2 sm:mx-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Chỉnh sửa Dự án</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên dự án</label>
              <input
                type="text"
                value={editProject.project_name}
                onChange={(e) => setEditProject({ ...editProject, project_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
              <textarea
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày bắt đầu</label>
              <input
                type="date"
                value={editProject.start_date ? editProject.start_date.slice(0, 10) : ""}
                onChange={(e) => setEditProject({ ...editProject, start_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày kết thúc</label>
              <input
                type="date"
                value={editProject.end_date ? editProject.end_date.slice(0, 10) : ""}
                onChange={(e) => setEditProject({ ...editProject, end_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
              <select
                id="project-status"
                value={editProject.status}
                onChange={(e) => setEditProject({ ...editProject, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {PROJECT_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mức độ ưu tiên</label>
              <select
                id="project-priority"
                value={editProject.priority}
                onChange={(e) => setEditProject({ ...editProject, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {PROJECT_PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phân loại dự án</label>
              <div className="flex items-center gap-2">
                <select
                  value={editProject.project_type_id?._id || ""}
                  onChange={e => {
                    const selectedId = e.target.value;
                    if (selectedId === "__new__") {
                      // Mở modal tạo phân loại mới
                      console.log("[DEBUG] User selected '+ Tạo phân loại mới...', opening modal.");
                      setIsCreateTypeModalOpen(true);
                    } else {
                      const found = projectTypes.find(pt => pt._id === selectedId);
                      if (found) {
                        setEditProject({ ...editProject, project_type_id: found });
                      }
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="" disabled>{loadingTypes ? "Đang tải..." : "Chọn phân loại"}</option>
                  {projectTypes.map(pt => (
                    <option key={pt._id} value={pt._id}>{pt.name}</option>
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
              </div>
              <ProjectTypeManagerModal open={showTypeManager} onClose={() => setShowTypeManager(false)} />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => setEditProject(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal tạo phân loại mới */}
      <CreateProjectTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onTypeCreated={handleTypeCreated}
      />
    </>
  );
}