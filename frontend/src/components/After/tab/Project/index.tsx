import React, { useState, useEffect, useContext } from "react";
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import { socket, connectToSocket } from "../../../../services/socket";
import { AuthContext } from "../../../context/AuthContext";
import { Project } from "../../../../types/project";
import { getProjects, createProject, softDeleteProject, restoreProject, updateProject } from "../../../../services/api";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";
import ProjectEditModal from "./ProjectEditModal";
import { Plus } from "lucide-react";
import Toast from "../../../common/Toast";

interface ToastConfig {
  message: string;
  type: 'success' | 'error';
}

export default function ProjectPage() {
  const { userId } = useContext(AuthContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Active",  // Đảm bảo giá trị mặc định khớp với enum trong schema
    priority: "Medium",
    project_type: "",
    project_type_id: { _id: "", name: "" }
  });
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err: any) {
        let msg = "Lỗi không xác định";
        if (err?.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    // Kết nối socket và join room
    connectToSocket(userId);

    // Lắng nghe sự kiện project_changed
    const handleProjectChanged = () => {
      fetchProjects();
    };

    socket.on('project_changed', handleProjectChanged);

    // Load dự án ban đầu
    fetchProjects();

    // Cleanup function
    return () => {
      socket.off('project_changed', handleProjectChanged);
      if (userId) {
        socket.emit('leave', userId);
      }
    };
  }, [userId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!userId) {
        setToast({
          message: "Bạn cần đăng nhập để tạo dự án",
          type: 'error'
        });
        return;
      }

      if (!newProject.project_type_id?._id) {
        setToast({
          message: "Vui lòng chọn phân loại dự án",
          type: 'error'
        });
        return;
      }      // Tạo đối tượng dự án mới với các trường bắt buộc      // Chuyển đổi định dạng ngày tháng để phù hợp với MongoDB      // Kiểm tra tất cả các trường bắt buộc trước khi gửi
      if (!newProject.project_name || !newProject.start_date || !newProject.end_date || !newProject.project_type_id?._id) {
        setToast({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: 'error'
        });
        return;
      }

      const projectToCreate = {
        project_name: newProject.project_name,
        description: newProject.description || "",
        start_date: new Date(newProject.start_date).toISOString(),
        end_date: new Date(newProject.end_date).toISOString(),
        status: newProject.status || 'Active',
        priority: newProject.priority || 'Medium',
        project_type_id: newProject.project_type_id._id
      };const project = await createProject(projectToCreate);
      setProjects([...projects, project.project]);
      setNewProject({
        project_name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Active",
        priority: "Medium",
        project_type: "",
        project_type_id: { _id: "", name: "" } // Thêm trường này vào object reset
      });
      setShowCreateModal(false);
      setToast({
        message: "Dự án đã được tạo thành công",
        type: 'success'
      });
    } catch (err: any) {
      setToast({
        message: "Lỗi khi tạo dự án: " + (err.response?.data?.message || err.message),
        type: 'error'
      });
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      await softDeleteProject(id);
      setProjects(projects.map((p) => (p._id === id ? { ...p, is_deleted: true, deleted_at: new Date().toISOString() } : p)));
      setToast({
        message: "Dự án đã được xóa thành công",
        type: 'success'
      });
    } catch (err: any) {
      setToast({
        message: "Lỗi khi xóa dự án: " + (err.response?.data?.message || err.message),
        type: 'error'
      });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProject(id);
      setProjects(projects.map((p) => (p._id === id ? { ...p, is_deleted: false, deleted_at: null } : p)));
      setToast({
        message: "Dự án đã được khôi phục thành công",
        type: 'success'
      });
    } catch (err: any) {
      setToast({
        message: "Lỗi khi khôi phục dự án: " + (err.response?.data?.message || err.message),
        type: 'error'
      });
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    try {
      const updated = await updateProject(editProject._id, editProject);
      setProjects(projects.map((p) => (p._id === editProject._id ? updated.project : p)));
      setEditProject(null);
      setToast({
        message: "Dự án đã được cập nhật thành công",
        type: 'success'
      });
    } catch (err: any) {
      setToast({
        message: "Lỗi khi cập nhật dự án: " + (err.response?.data?.message || err.message),
        type: 'error'
      });
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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
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