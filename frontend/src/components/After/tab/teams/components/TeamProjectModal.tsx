/**
 * TeamProjectModal Component
 * ----------------------------
 * - Popup form gán hoặc tạo nhanh project cho team
 * - Hỗ trợ 2 chế độ: Tạo mới (mặc định) và Gán project có sẵn
 * - Sử dụng ProjectForm để nhập đầy đủ thông tin cho tạo mới
 * - Sử dụng ProjectSearchForm để tìm và gán project có sẵn
 */
import React, { useState, useEffect } from "react";
import ProjectForm from "../../Project/ProjectForm";
import { TeamProject, teamProjectApi } from "../../../../../services/teamProjectApi";

type ModalMode = 'create' | 'assign';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAssign: (data: { // This data structure should match the 'newProject' state
    project_name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    priority: string;
    project_type: string;
    project_type_id: { _id: string; name: string };
  }) => void;
  onAssignExisting?: (projectId: string) => void; // New callback for assigning existing projects
}

export default function TeamProjectModal({ visible, onClose, onAssign, onAssignExisting }: Props) {
  const [mode, setMode] = useState<ModalMode>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TeamProject[]>([]);
  const [availableProjects, setAvailableProjects] = useState<TeamProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo state cho form mới
  const [newProject, setNewProject] = useState<any>({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planning",
    priority: "Medium",
    project_type: "",
    project_type_id: { _id: "", name: "" },
  });

  // Load available projects when switching to assign mode
  useEffect(() => {
    if (mode === 'assign' && visible) {
      loadAvailableProjects();
    }
  }, [mode, visible]);

  const loadAvailableProjects = async () => {
    try {
      setIsLoading(true);
      const response = await teamProjectApi.getAvailableProjects();
      setAvailableProjects(response.projects);
      setSearchResults(response.projects); // Initially show all projects
    } catch (error) {
      console.error('Failed to load available projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(availableProjects);
      return;
    }

    try {
      setIsLoading(true);
      const response = await teamProjectApi.searchProjects(query);
      setSearchResults(response.projects);
    } catch (error) {
      console.error('Failed to search projects:', error);
      // Fallback to local search
      const filtered = availableProjects.filter(project =>
        project.project_name.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignExisting = (project: TeamProject) => {
    if (onAssignExisting) {
      onAssignExisting(project._id);
    }
    onClose();
  };

  const resetModal = () => {
    setMode('create');
    setSearchQuery('');
    setSearchResults([]);
    setNewProject({
      project_name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "Planning",
      priority: "Medium",
      project_type: "",
      project_type_id: { _id: "", name: "" },
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96 max-h-[90vh] overflow-auto">
        {/* Header với toggle mode */}
        <div className="mb-4">
          <h2 className="text-xl mb-3">
            {mode === 'create' ? 'Tạo Project Mới' : 'Gán Project Có Sẵn'}
          </h2>
          
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tạo Mới
            </button>
            <button
              onClick={() => setMode('assign')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'assign'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Gán Có Sẵn
            </button>
          </div>
        </div>

        {/* Content based on mode */}
        {mode === 'create' ? (
          /* Form tạo nhanh project */
          <ProjectForm
            newProject={newProject}
            setNewProject={setNewProject}
            onSubmit={e => {
              e.preventDefault();
              onAssign(newProject);
              handleClose();
            }}
          />
        ) : (
          /* Project search and assignment interface */
          <div className="space-y-4">
            {/* Search box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tìm kiếm project
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Nhập tên hoặc mô tả project..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Search results */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Đang tải...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {searchQuery ? 'Không tìm thấy project nào' : 'Không có project nào có sẵn'}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((project) => (
                    <div
                      key={project._id}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleAssignExisting(project)}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {project.project_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {project.description || 'Không có mô tả'}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          project.status === 'Active' ? 'bg-green-100 text-green-800' :
                          project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          project.priority === 'High' ? 'bg-red-100 text-red-800' :
                          project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
                      {project.project_type_id && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Loại: {project.project_type_id.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nút đóng */}
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleClose} 
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}