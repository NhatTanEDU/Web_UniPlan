import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import { UserCircle, Clock, Pin, Edit, Trash, AlertCircle } from "lucide-react";
import { projectApi } from "../../../../services/projectApi";
import { kanbanApi, KanbanTask, ProjectMember } from "../../../../services/kanbanApi";

const STATUS = ["Cần làm", "Đang làm", "Hoàn thành"];

const Kanban = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [currentKanban, setCurrentKanban] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    due_date: "",
    priority: "Trung bình" as "Thấp" | "Trung bình" | "Cao",
    status: "Cần làm" as "Cần làm" | "Đang làm" | "Hoàn thành",    assigned_to: "",
    color: "#ffffff",  });
  // Debug useEffect to monitor showForm state changes
  useEffect(() => {
    console.log("🔍 DEBUG: showForm state changed to:", showForm);
  }, [showForm]);

  // Debug useEffect to monitor currentProject state changes
  useEffect(() => {
    console.log("🔍 DEBUG: currentProject state changed to:", currentProject);
  }, [currentProject]);

  // Debug useEffect to monitor currentKanban state changes
  useEffect(() => {
    console.log("🔍 DEBUG: currentKanban state changed to:", currentKanban);
  }, [currentKanban]);

  // Debug useEffect to monitor loading state changes
  useEffect(() => {
    console.log("🔍 DEBUG: loading state changed to:", loading);
  }, [loading]);

  // Debug useEffect to monitor tasks and STATUS
  useEffect(() => {
    console.log("🔍 DEBUG: tasks length:", tasks.length);
    console.log("🔍 DEBUG: STATUS array:", STATUS);
    console.log("🔍 DEBUG: tasks by status:", STATUS.map(status => ({
      status,
      count: tasks.filter(t => t.status === status).length
    })));
  }, [tasks]);

  // Debug useEffect to log when DragDropContext is rendered
  useEffect(() => {
    console.log("🔍 DEBUG: Component mounted, DragDropContext should be rendered");
    console.log("🔍 DEBUG: Available droppableIds:", STATUS);
  }, []);

  // Load project and kanban data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔍 DEBUG: loadData called");
        console.log("🔍 DEBUG: projectId from useParams:", projectId);
        setLoading(true);
        setError('');
        
        // Use projectId from URL params, fall back to localStorage if needed
        const currentProjectId = projectId 
          || new URLSearchParams(window.location.search).get('projectId') 
          || localStorage.getItem('selectedProjectId');
        
        console.log("🔍 DEBUG: currentProjectId resolved to:", currentProjectId);        
        if (currentProjectId) {
          console.log("🔍 DEBUG: currentProjectId exists, proceeding with data loading");
          // Fetch project details
          const projectDetails = await projectApi.getProject(currentProjectId);
          console.log("🔍 DEBUG: projectDetails loaded:", projectDetails);
          setCurrentProject(projectDetails);
            // Load project members
          try {
            console.log("🔍 DEBUG: Loading project members for projectId:", currentProjectId);
            const members = await kanbanApi.getProjectMembers(currentProjectId);
            console.log("🔍 DEBUG: projectMembers loaded:", members);
            setProjectMembers(members);
          } catch (memberError) {
            console.warn('Could not load project members:', memberError);
            setProjectMembers([]);
          }
          
          // Try to get existing kanban or create one
          let kanbanId = localStorage.getItem(`kanban_${currentProjectId}`);
          console.log("🔍 DEBUG: kanbanId from localStorage:", kanbanId);
            if (!kanbanId) {
            // Create a default kanban if none exists
            try {
              console.log("🔍 DEBUG: Creating new kanban for project:", projectDetails.project_name);
              const newKanban = await kanbanApi.createKanban({
                project_id: currentProjectId,
                name: `Kanban - ${projectDetails.project_name}`,
                description: 'Bảng quản lý công việc chính'
              });
              kanbanId = newKanban._id!;
              localStorage.setItem(`kanban_${currentProjectId}`, kanbanId);
              console.log("🔍 DEBUG: New kanban created:", newKanban);
              setCurrentKanban(newKanban);
            } catch (kanbanError) {
              console.error('Could not create kanban:', kanbanError);
              throw new Error('Không thể tạo bảng Kanban cho dự án này');
            }
          } else {
            // Try to get existing kanban details
            try {
              console.log("🔍 DEBUG: Getting existing kanban details for kanbanId:", kanbanId);
              const kanbanData = await kanbanApi.getKanban(kanbanId);
              console.log("🔍 DEBUG: Existing kanban loaded:", kanbanData);
              setCurrentKanban(kanbanData.kanban);
            } catch (kanbanError) {
              console.warn('Could not get kanban details, creating new one:', kanbanError);
              // If kanban doesn't exist, create a new one
              const newKanban = await kanbanApi.createKanban({
                project_id: currentProjectId,
                name: `Kanban - ${projectDetails.project_name}`,
                description: 'Bảng quản lý công việc chính'
              });
              kanbanId = newKanban._id!;
              localStorage.setItem(`kanban_${currentProjectId}`, kanbanId);
              console.log("🔍 DEBUG: New kanban created after error:", newKanban);
              setCurrentKanban(newKanban);
            }
          }
            // Load tasks for this kanban
          if (kanbanId) {
            try {
              console.log("🔍 DEBUG: Loading tasks for kanbanId:", kanbanId);
              const tasks = await kanbanApi.getTasks(kanbanId);
              console.log("🔍 DEBUG: Tasks loaded:", tasks);
              setTasks(tasks);
            } catch (taskError) {
              console.warn('Could not load tasks:', taskError);
              setTasks([]);
            }
          }
        } else {
          console.log("🔍 DEBUG: No projectId found");
          setError('Không tìm thấy dự án. Vui lòng chọn dự án trước.');
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }    };    loadData();
  }, [projectId]); // Add projectId dependency

  // Debug useEffect to monitor showForm state changes
  useEffect(() => {
    console.log("🔍 DEBUG: showForm state changed to:", showForm);  }, [showForm]);

  // Utility functions
  const resetForm = () => {
    console.log("🔍 DEBUG: resetForm called");
    console.log("🔍 DEBUG: Current form state before reset:", form);
    
    setForm({
      title: "",
      description: "",
      start_date: "",
      due_date: "",
      priority: "Trung bình" as "Thấp" | "Trung bình" | "Cao",
      status: "Cần làm" as "Cần làm" | "Đang làm" | "Hoàn thành",
      assigned_to: "",
      color: "#ffffff",
    });
    setEditingTask(null);
    
    console.log("🔍 DEBUG: Form reset completed, editingTask set to null");
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Validate form data
  const validateForm = () => {
    if (!form.title.trim()) {
      showErrorMessage('Tên công việc không được để trống');
      return false;
    }

    if (form.start_date && form.due_date) {
      const startDate = new Date(form.start_date);
      const dueDate = new Date(form.due_date);
      
      if (startDate > dueDate) {
        showErrorMessage('Ngày bắt đầu không thể sau ngày kết thúc');
        return false;
      }
    }

    // Validate against project dates
    if (currentProject) {
      const projectStartDate = new Date(currentProject.start_date);
      const projectEndDate = new Date(currentProject.end_date);
      
      if (form.start_date) {
        const taskStartDate = new Date(form.start_date);
        if (taskStartDate < projectStartDate) {
          showErrorMessage('Ngày bắt đầu công việc không thể trước ngày bắt đầu dự án');
          return false;
        }
      }
      
      if (form.due_date) {
        const taskDueDate = new Date(form.due_date);
        if (taskDueDate > projectEndDate) {
          showErrorMessage('Ngày kết thúc công việc không thể sau ngày kết thúc dự án');
          return false;
        }
      }
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔍 DEBUG: handleSubmit called");
    console.log("🔍 DEBUG: currentProject:", currentProject);
    console.log("🔍 DEBUG: currentKanban:", currentKanban);
    
    // Ensure we have required data
    if (!currentProject || !currentKanban) {
      showErrorMessage('Dữ liệu dự án chưa sẵn sàng. Vui lòng thử lại.');
      return;
    }
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');      // Đảm bảo assigned_to là string ID hoặc null/undefined
      const assignedToId = form.assigned_to && typeof form.assigned_to === 'object' 
        ? (form.assigned_to as any)._id 
        : form.assigned_to;

      if (editingTask && editingTask._id) {        // Update existing task - chỉ gửi các trường cần thiết
        const taskDataForUpdate = {
          title: form.title,
          description: form.description,
          start_date: form.start_date || undefined,
          due_date: form.due_date || undefined,
          priority: form.priority,
          status: form.status,
          assigned_to: assignedToId || undefined,
          color: form.color
        };
        
        console.log("🔍 DEBUG: Data being sent for UPDATE:", taskDataForUpdate);
        const updatedTask = await kanbanApi.updateTask(editingTask._id, taskDataForUpdate);
        setTasks(tasks.map(task => task._id === editingTask._id ? updatedTask : task));
        showSuccessMessage('Cập nhật công việc thành công');
      } else {        // Create new task
        const taskDataForCreate = {
          ...form,
          assigned_to: assignedToId || undefined,
          kanban_id: currentKanban._id,
          project_id: currentProject._id,
          is_pinned: false
        };
        
        console.log("🔍 DEBUG: Data being sent for CREATE:", taskDataForCreate);
        const newTask = await kanbanApi.createTask(taskDataForCreate);
        setTasks([...tasks, newTask]);
        showSuccessMessage('Tạo công việc thành công');
      }

      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving task:', error);
      showErrorMessage(error.message || 'Có lỗi xảy ra khi lưu công việc');
    } finally {
      setSaving(false);
    }
  };
  // Task management functions
  const handleEditTask = (task: KanbanTask) => {
    setEditingTask(task);
    
    // Đảm bảo assigned_to được set đúng định dạng (string ID)
    const assignedToId = task.assigned_to && typeof task.assigned_to === 'object' 
      ? (task.assigned_to as any)._id 
      : task.assigned_to;
    
    setForm({
      title: task.title,
      description: task.description || "",
      start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : "",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
      priority: task.priority,
      status: task.status,
      assigned_to: assignedToId || "",
      color: task.color || "#ffffff",
    });
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;

    try {
      await kanbanApi.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      showSuccessMessage('Xóa công việc thành công');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      showErrorMessage(error.message || 'Có lỗi xảy ra khi xóa công việc');
    }
  };
  const handleTogglePin = async (taskId: string) => {
    try {
      const updatedTask = await kanbanApi.toggleTaskPin(taskId);
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
      showSuccessMessage(updatedTask.is_pinned ? 'Đã ghim công việc' : 'Đã bỏ ghim công việc');
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      showErrorMessage(error.message || 'Có lỗi xảy ra khi ghim/bỏ ghim công việc');
    }
  };
  // Drag and Drop Handler
  const handleOnDragEnd = async (result: DropResult) => {
    console.log("🔍 DEBUG: handleOnDragEnd called with result:", result);
    const { destination, source, draggableId } = result;

    console.log("🔍 DEBUG: Available STATUS array:", STATUS);
    console.log("🔍 DEBUG: Source droppableId:", source.droppableId);
    console.log("🔍 DEBUG: Destination droppableId:", destination?.droppableId);
    console.log("🔍 DEBUG: DraggableId:", draggableId);

    // Nếu không có destination hoặc vị trí không thay đổi
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      console.log("🔍 DEBUG: Early return - no destination or same position");
      return;
    }

    try {
      // Lấy task được kéo
      const draggedTask = tasks.find(task => task._id === draggableId);
      if (!draggedTask) return;

      // Tạo bản copy của tasks để cập nhật UI optimistically
      const newTasks = [...tasks];
      
      // Lọc ra tasks theo column
      const sourceColumnTasks = newTasks.filter(task => task.status === source.droppableId);
      const destColumnTasks = newTasks.filter(task => task.status === destination.droppableId);

      // Nếu di chuyển trong cùng column
      if (source.droppableId === destination.droppableId) {
        // Sắp xếp lại thứ tự trong cùng column
        const reorderedTasks = Array.from(sourceColumnTasks);
        const [movedTask] = reorderedTasks.splice(source.index, 1);
        reorderedTasks.splice(destination.index, 0, movedTask);

        // Cập nhật order cho các tasks trong column
        const updatedTasksData = reorderedTasks.map((task, index) => ({
          _id: task._id!,
          status: source.droppableId,
          order: index + 1
        }));

        // Cập nhật UI optimistically
        const allTasksUpdated = newTasks.map(task => {
          const updatedData = updatedTasksData.find(updated => updated._id === task._id);
          return updatedData ? { ...task, order: updatedData.order } : task;
        });
        setTasks(allTasksUpdated);

        // Gọi API để cập nhật backend
        await kanbanApi.reorderTasks({ tasks: updatedTasksData });
        showSuccessMessage('Đã cập nhật thứ tự công việc');

      } else {
        // Di chuyển giữa các column khác nhau
        
        // Xóa task khỏi source column
        const sourceTasksAfterRemoval = sourceColumnTasks.filter(task => task._id !== draggableId);
        
        // Cập nhật task với status mới và thêm vào destination column
        const updatedDraggedTask = { ...draggedTask, status: destination.droppableId as any };
        destColumnTasks.splice(destination.index, 0, updatedDraggedTask);

        // Tính toán lại order cho cả 2 columns
        const sourceUpdatedData = sourceTasksAfterRemoval.map((task, index) => ({
          _id: task._id!,
          status: source.droppableId,
          order: index + 1
        }));

        const destUpdatedData = destColumnTasks.map((task, index) => ({
          _id: task._id!,
          status: destination.droppableId,
          order: index + 1
        }));

        // Kết hợp tất cả updates
        const allUpdatedData = [...sourceUpdatedData, ...destUpdatedData];

        // Cập nhật UI optimistically
        const allTasksUpdated = newTasks.map(task => {
          const updatedData = allUpdatedData.find(updated => updated._id === task._id);
          if (updatedData) {
            return { 
              ...task, 
              status: updatedData.status as any, 
              order: updatedData.order 
            };
          }
          return task;
        });
        setTasks(allTasksUpdated);

        // Gọi API để cập nhật backend
        await kanbanApi.reorderTasks({ tasks: allUpdatedData });
        showSuccessMessage(`Đã chuyển công việc "${draggedTask.title}" sang ${destination.droppableId}`);
      }

    } catch (error: any) {
      console.error('Error handling drag and drop:', error);
      showErrorMessage(error.message || 'Có lỗi xảy ra khi di chuyển công việc');
      
      // Reload tasks để đồng bộ lại với backend nếu có lỗi
      if (currentKanban?._id) {
        try {
          const refreshedTasks = await kanbanApi.getTasks(currentKanban._id);
          setTasks(refreshedTasks);
        } catch (refreshError) {
          console.error('Error refreshing tasks:', refreshError);
        }
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "Cần làm" | "Đang làm" | "Hoàn thành") => {
    try {
      // Chỉ gửi field status khi cập nhật trạng thái
      const updateData = { status: newStatus };
      console.log("🔍 DEBUG: Status change data:", updateData);
      
      const updatedTask = await kanbanApi.updateTask(taskId, updateData);
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
      showSuccessMessage('Cập nhật trạng thái thành công');
    } catch (error: any) {
      console.error('Error updating status:', error);
      showErrorMessage(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };const handleCreateNewTask = () => {
    console.log("🔍 DEBUG: handleCreateNewTask called");
    console.log("🔍 DEBUG: showForm before reset:", showForm);
    console.log("🔍 DEBUG: currentProject:", currentProject);
    console.log("🔍 DEBUG: currentKanban:", currentKanban);
    
    // Ensure we have required data before allowing task creation
    if (!currentProject || !currentKanban) {
      console.log("🔍 DEBUG: Missing required data - cannot create task");
      showErrorMessage('Dữ liệu dự án chưa sẵn sàng. Vui lòng thử lại.');
      return;
    }
    
    resetForm();
    setShowForm(true);
    
    console.log("🔍 DEBUG: setShowForm(true) called");
    console.log("🔍 DEBUG: Expected showForm to be true after setState");
  };

  // Debug effect to ensure proper mounting
  useEffect(() => {
    if (!loading && currentKanban) {
      console.log("🔍 DEBUG: Kanban is ready, currentKanban:", currentKanban._id);
      console.log("🔍 DEBUG: Tasks loaded:", tasks.length);
      
      // Force a small delay to ensure DOM is ready
      setTimeout(() => {
        console.log("🔍 DEBUG: DOM should be ready for drag and drop");
        const droppables = document.querySelectorAll('[data-rbd-droppable-id]');
        console.log("🔍 DEBUG: Found droppable elements:", Array.from(droppables).map(el => el.getAttribute('data-rbd-droppable-id')));
      }, 100);
    }
  }, [loading, currentKanban, tasks.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Dự Án", "Bảng Kanban"]} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600 dark:text-gray-300">Đang tải...</div>
            </div>
          </main>
          <Footer onFooterClick={(item: string) => console.log(`Clicked ${item}`)} />
          <TopButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Breadcrumb items={["Dashboard", "Dự Án", "Bảng Kanban"]} />
        <main className="flex-1 overflow-y-auto p-4">          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Bảng Kanban {currentProject?.project_name && `- ${currentProject.project_name}`}
            </h1>            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Đang tải dữ liệu...
                </div>
              )}
              {!loading && (!currentProject || !currentKanban) && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Dữ liệu chưa sẵn sàng
                </div>
              )}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                onClick={() => {
                  console.log("🔍 DEBUG: + Tạo Task button clicked");
                  console.log("🔍 DEBUG: saving state:", saving);
                  console.log("🔍 DEBUG: currentProject exists:", !!currentProject);
                  console.log("🔍 DEBUG: currentKanban exists:", !!currentKanban);
                  handleCreateNewTask();
                }}
                disabled={saving || !currentProject || !currentKanban}
                title={(!currentProject || !currentKanban) ? "Dữ liệu dự án chưa sẵn sàng" : ""}
              >
                + Tạo Task
              </button>
            </div>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {success}
              <button
                className="ml-auto text-green-500 hover:text-green-700"
                onClick={() => setSuccess('')}
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
              <button
                className="ml-auto text-red-500 hover:text-red-700"
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>          )}
            {/* DEBUG LOG FOR FORM RENDERING */}
          {(() => {
            console.log("🔍 DEBUG: Render check - showForm:", showForm);
            console.log("🔍 DEBUG: Render check - currentProject:", !!currentProject);
            console.log("🔍 DEBUG: Render check - currentKanban:", !!currentKanban);
            console.log("🔍 DEBUG: Render check - loading:", loading);
            return null;
          })()}
          
          {showForm && (!currentProject || !currentKanban) && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              Dữ liệu dự án chưa được tải hoàn chỉnh. Vui lòng đợi hoặc tải lại trang.
              <button
                className="ml-auto text-yellow-500 hover:text-yellow-700"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
          )}
          
          {showForm && currentProject && currentKanban && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-4">
              {(() => {
                console.log("🔍 DEBUG: Form is being rendered with data!");
                console.log("🔍 DEBUG: Project name:", currentProject.project_name);
                console.log("🔍 DEBUG: Kanban name:", currentKanban.name);
                return null;
              })()}
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                {editingTask ? 'Cập nhật công việc' : 'Tạo công việc mới'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Title */}
                <div className="md:col-span-2">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên công việc *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên công việc"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả công việc"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    min={currentProject?.start_date ? new Date(currentProject.start_date).toISOString().split('T')[0] : ''}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    min={form.start_date || (currentProject?.start_date ? new Date(currentProject.start_date).toISOString().split('T')[0] : '')}
                    max={currentProject?.end_date ? new Date(currentProject.end_date).toISOString().split('T')[0] : ''}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Thấp">Thấp</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Cao">Cao</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cần làm">Cần làm</option>
                    <option value="Đang làm">Đang làm</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Người được giao
                  </label>                  <select
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chưa giao</option>
                    {projectMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu sắc
                  </label>
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="w-full h-10 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6 justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    editingTask ? 'Cập nhật' : 'Tạo'
                  )}
                </button>
              </div>
            </form>          )}          {!loading && currentKanban && (
            <DragDropContext 
              key={`kanban-dnd-${currentKanban?._id || 'default'}`}
              onDragEnd={handleOnDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS.map((status) => (
                  <div
                    key={status}
                    className="bg-gray-100 dark:bg-gray-800 rounded p-3 min-h-[300px]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{status}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({tasks.filter((t) => t.status === status).length})
                      </span>
                    </div>
                    
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-2 min-h-[200px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
                          }`}
                        >
                        {tasks
                          .filter((t) => t.status === status)
                          .sort((a, b) => {
                            // Pinned tasks first, then by order
                            if (a.is_pinned && !b.is_pinned) return -1;
                            if (!a.is_pinned && b.is_pinned) return 1;
                            return (a.order || 0) - (b.order || 0);
                          })
                          .map((task, index) => {
                            const assignedMember = projectMembers.find(m => m._id === task.assigned_to);
                            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Hoàn thành';
                              return (
                              <Draggable
                                key={`task-${task._id}`}
                                draggableId={task._id!}
                                index={index}
                                isDragDisabled={task.is_pinned} // Disable drag for pinned tasks
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-white dark:bg-gray-700 rounded shadow p-3 cursor-pointer hover:shadow-md transition-all relative border-l-4 group ${
                                      isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                    } ${
                                      snapshot.isDragging ? 'rotate-2 shadow-lg scale-105' : ''
                                    } ${
                                      task.is_pinned ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                    style={{ 
                                      backgroundColor: task.color !== '#ffffff' ? task.color : undefined,
                                      borderLeftColor: task.priority === 'Cao' ? '#ef4444' : 
                                                      task.priority === 'Trung bình' ? '#f59e0b' : '#10b981',
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    {/* Task Header */}
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        {task.is_pinned && (
                                          <Pin size={14} className="text-blue-500 fill-current" />
                                        )}
                                        <span className="font-bold text-gray-800 dark:text-gray-100 flex-1">
                                          {task.title}
                                        </span>
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTogglePin(task._id || '');
                                          }}
                                          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                                            task.is_pinned ? 'text-blue-500' : 'text-gray-400'
                                          }`}
                                          title={task.is_pinned ? 'Bỏ ghim' : 'Ghim'}
                                        >
                                          <Pin size={14} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTask(task);
                                          }}
                                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-blue-500"
                                          title="Chỉnh sửa"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTask(task._id || '');
                                          }}
                                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500"
                                          title="Xóa"
                                        >
                                          <Trash size={14} />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Description */}
                                    {task.description && (
                                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                                        {task.description}
                                      </div>
                                    )}
                                    
                                    {/* Dates */}
                                    <div className="text-xs space-y-1 mb-2">
                                      {task.start_date && (
                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                          <Clock size={12} className="mr-1" />
                                          Bắt đầu: {new Date(task.start_date).toLocaleDateString('vi-VN')}
                                        </div>
                                      )}
                                      {task.due_date && (
                                        <div className={`flex items-center ${
                                          isOverdue ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                          <Clock size={12} className="mr-1" />
                                          Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                          {isOverdue && <span className="ml-1 text-xs">(Quá hạn)</span>}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Footer */}
                                    <div className="flex justify-between items-center">
                                      {/* Priority Badge */}
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        task.priority === 'Cao' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        task.priority === 'Trung bình' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      }`}>
                                        {task.priority}
                                      </span>
                                      
                                      {/* Assigned Member */}
                                      {assignedMember && (
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                          <UserCircle size={14} className="mr-1" />
                                          <span className="truncate max-w-20" title={assignedMember.name}>
                                            {assignedMember.name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Quick Status Change */}
                                    {task.status !== status && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <select
                                          value={task.status}
                                          onChange={(e) => handleStatusChange(task._id || '', e.target.value as any)}
                                          className="w-full text-xs border rounded px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <option value="Cần làm">Cần làm</option>
                                          <option value="Đang làm">Đang làm</option>
                                          <option value="Hoàn thành">Hoàn thành</option>
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}            </div>
          </DragDropContext>
          )}

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
            </div>
          )}
        </main>
        <Footer onFooterClick={(item: string) => console.log(`Clicked ${item}`)} />
        <TopButton />
      </div>
    </div>
  );
};

export default Kanban;
