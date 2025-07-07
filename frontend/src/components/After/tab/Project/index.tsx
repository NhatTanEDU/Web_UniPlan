import React, { useState, useContext } from "react";
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
// TEMPORARILY DISABLED - Preventing Socket.IO 404 logs
// import { socket, connectToSocket } from "../../../../services/socket";
import { AuthContext } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Project } from "../../../../types/project";
import { useProjects } from "./hooks/useProjects";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";
import ProjectEditModal from "./ProjectEditModal";
import { Plus } from "lucide-react";

export default function ProjectPage() {
  const { userId } = useContext(AuthContext);
  const { showToast } = useToast();
  
  // Use the new useProjects hook with optimistic updates
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    restoreProject,
  } = useProjects();

  // Local state for UI modals and forms
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Planning",  // Đổi từ "Active" thành "Planning" để khớp với enum schema
    priority: "Medium",
    project_type: "",
    project_type_id: { _id: "", name: "" }
  });
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // TEMPORARILY DISABLED - Socket.IO integration
  // useEffect(() => {
  //   if (!userId) return;
  //   connectToSocket(userId);
  //   const handleProjectChanged = () => {
  //     fetchProjects();
  //   };
  //   socket.on('project_changed', handleProjectChanged);
  //   return () => {
  //     socket.off('project_changed', handleProjectChanged);
  //     if (userId) {
  //       socket.emit('leave', userId);
  //     }
  //   };
  // }, [userId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!userId) {
        showToast("Bạn cần đăng nhập để tạo dự án", 'error');
        return;
      }

      if (!newProject.project_type_id?._id) {
        showToast("Vui lòng chọn phân loại dự án", 'error');
        return;
      }

      // Kiểm tra tất cả các trường bắt buộc trước khi gửi
      if (!newProject.project_name || !newProject.start_date || !newProject.end_date || !newProject.project_type_id?._id) {
        showToast("Vui lòng điền đầy đủ thông tin bắt buộc", 'error');
        return;
      }

      const projectToCreate = {
        project_name: newProject.project_name,
        description: newProject.description || "",
        start_date: new Date(newProject.start_date).toISOString(),
        end_date: new Date(newProject.end_date).toISOString(),
        status: newProject.status || 'Planning',
        priority: newProject.priority || 'Medium',
        project_type_id: newProject.project_type_id._id
      };

      // Use optimistic update
      const result = await createProject(projectToCreate);
      
      if (result.success) {
        // Reset form and close modal
        setNewProject({
          project_name: "",
          description: "",
          start_date: "",
          end_date: "",
          status: "Planning",
          priority: "Medium",
          project_type: "",
          project_type_id: { _id: "", name: "" }
        });
        setShowCreateModal(false);
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast("Lỗi khi tạo dự án: " + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleSoftDelete = async (id: string) => {
    const result = await deleteProject(id);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restoreProject(id);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    
    const result = await updateProject(editProject._id, editProject);
    if (result.success) {
      setEditProject(null);
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Dự án"]} />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Quản lý Dự án
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
            >
              <Plus size={20} className="mr-2" />
              Tạo Dự án Mới
            </button>
          </div>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Không có dự án nào</p>
          ) : (
            <ProjectList
              projects={projects}
              onEdit={setEditProject}
              onDelete={handleSoftDelete}
              onRestore={handleRestore}
            />
          )}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col mx-2 sm:mx-0">
                <div className="p-4 sm:p-6 flex-shrink-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 text-center">Tạo Dự án Mới</h2>
                </div>
                <div className="p-4 sm:p-6 pt-0 overflow-y-auto flex-grow">
                  <ProjectForm newProject={newProject} setNewProject={setNewProject} onSubmit={handleCreateProject} />
                </div>
                <div className="p-4 sm:p-6 pt-0 flex-shrink-0 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                  >
                    Tạo mới
                  </button>
                </div>
              </div>
            </div>
          )}
          {editProject && (
            <ProjectEditModal
              editProject={editProject}
              setEditProject={setEditProject}
              onSubmit={handleEditProject}
            />
          )}
        </main>
        <Footer onFooterClick={handleFooterClick} />
        <TopButton />
      </div>
    </div>
  );
}