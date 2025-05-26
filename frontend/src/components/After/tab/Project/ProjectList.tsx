import React, { useState, useEffect } from "react";
import { Pencil, Trash2, RotateCcw, MoreVertical, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Project } from "../../../../types/project";
import { PRIORITY_LABELS, STATUS_LABELS } from "../../../../constants/projectLabels";

interface Props {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const ProjectList: React.FC<Props> = ({ projects, onEdit, onDelete, onRestore }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-button') && !target.closest('.menu-dropdown')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy danh sách các phân loại dự án duy nhất
  const projectTypes = Array.from(new Set(projects.map(p => p.project_type_id?.name || "Không phân loại")));

  // Lọc dự án theo phân loại được chọn
  const filteredProjects = selectedType === "all"
    ? projects
    : projects.filter(p => p.project_type_id?.name === selectedType);

  if (!projects || projects.length === 0) {
    return <div className="text-gray-500 text-center py-4">Không có dự án nào</div>;
  }

  return (
    <div>
      {/* Filter Dropdown */}
      <div className="mb-4 relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter size={20} className="text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">Lọc theo phân loại</span>
        </button>
        {isFilterOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  setSelectedType("all");
                  setIsFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${selectedType === "all" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >Tất cả</button>
              {projectTypes.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${selectedType === type ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >{type}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map(project => (
      <Link key={project._id} to={`/projects/${project._id}/kanban`} className="block hover:shadow-lg transition-shadow rounded-lg">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">{project.project_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
              </div>
              {!project.is_deleted && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(openMenuId === project._id ? null : project._id); }}
                    className="menu-button p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Menu"
                  >
                    <MoreVertical size={20} className="text-gray-500" />
                  </button>
                  {openMenuId === project._id && (
                    <div className="menu-dropdown absolute right-0 mt-1 py-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project); setOpenMenuId(null); }}
                        className="flex items-center w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Pencil size={16} className="mr-2" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project._id); setOpenMenuId(null); }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <p>Ngày bắt đầu: {project.start_date ? new Date(project.start_date).toLocaleDateString() : ""}</p>
              <p>Ngày kết thúc: {project.end_date ? new Date(project.end_date).toLocaleDateString() : ""}</p>
              <p>Trạng thái: {STATUS_LABELS[project.status]} | Ưu tiên: {PRIORITY_LABELS[project.priority]}</p>
              <p>Phân loại: {project.project_type_id?.name || "Không phân loại"}</p>
            </div>
          </div>
          {project.is_deleted && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRestore(project._id); }}
                className="flex items-center text-green-500 hover:text-green-600 transition-colors"
              >
                <RotateCcw size={16} className="mr-1" />
                Khôi phục
              </button>
            </div>
          )}
        </div>
      </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;