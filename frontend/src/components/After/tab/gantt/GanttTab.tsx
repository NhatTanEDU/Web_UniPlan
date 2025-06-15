// src/components/After/tab/gantt/GanttTab.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { AlertCircle, Calendar, ArrowLeft, Kanban } from "lucide-react";
import { projectApi } from "../../../../services/projectApi";
import { kanbanApi, KanbanTask } from "../../../../services/kanbanApi";

// Hàm chuyển đổi không thay đổi
const convertKanbanTasksToGantt = (tasks: KanbanTask[]) => {
  return tasks.map((task, index) => {
    const startDate = task.start_date ? new Date(task.start_date) : new Date();
    let endDate = task.due_date ? new Date(task.due_date) : new Date();

    if (endDate <= startDate) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    let progress = 0;
    switch (task.status) {
      case 'Hoàn thành': progress = 1; break;
      case 'Đang làm': progress = 0.5; break;
      default: progress = 0; break;
    }

    return {
      id: task._id || `task_${index}`,
      text: task.title,
      start_date: startDate,
      end_date: endDate,
      progress,
      status: task.status,
      priority: task.priority,
      assignee: task.assigned_to_name || 'Chưa giao',
      assigned_to: task.assigned_to,
      description: task.description,
      color: task.color
    };
  });
};

export default function GanttTab() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [kanbanData, setKanbanData] = useState<any>(null);
  const [isGanttInitialized, setIsGanttInitialized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [allTasks, setAllTasks] = useState<KanbanTask[]>([]);
  const [formData, setFormData] = useState<Partial<KanbanTask>>({});
  const [isSaving, setIsSaving] = useState(false);

  // *** BẮT ĐẦU SỬA LỖI ***

  // 1. Sử dụng ref để lưu trữ tasks, cho phép event handlers truy cập giá trị mới nhất
  const tasksRef = useRef(allTasks);
  useEffect(() => {
    tasksRef.current = allTasks;
  }, [allTasks]);

  // 2. Hook khởi tạo Gantt và gắn sự kiện CHỈ CHẠY MỘT LẦN
  useEffect(() => {
    if (!ganttContainer.current) return;

    // Cấu hình ngôn ngữ và các cột (giữ nguyên)
    gantt.i18n.setLocale({ /* ... */ });
    gantt.config.columns = [
      { name: "text",       label: "Tên công việc",   tree: true, width: '*', min_width: 200 },
      { name: "assignee",   label: "Người thực hiện", align: "center", width: 150, template: (task) => task.assignee || "Chưa giao" },
      { name: "status",     label: "Trạng thái",      align: "center", width: 100 },
      { name: "priority",   label: "Ưu tiên",         align: "center", width: 80 },
      { name: "start_date", label: "Bắt đầu",         align: "center", width: 120 },
      { name: "duration",   label: "Thời lượng",       align: "center", width: 90 },
    ];
    gantt.config.grid_resize = true;
    gantt.config.readonly = false;
    gantt.config.date_grid = "%d-%m-%Y";
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.scales = [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "day", step: 1, format: "%d" }
    ];
    gantt.config.scale_height = 50;
    gantt.templates.task_text = (start, end, task) => task.text;
    gantt.templates.task_class = (start, end, task) => {
      switch (task.status) {
        case 'Hoàn thành': return "gantt-task-completed";
        case 'Đang làm': return "gantt-task-in-progress";
        default: return "gantt-task-todo";
      }
    };

    // Gắn các sự kiện (sử dụng logic cũ)
    gantt.attachEvent("onAfterTaskDrag", async (id, mode, e) => { /* ... */ });
    gantt.attachEvent("onAfterTaskUpdate", async (id, task) => { /* ... */ });
    
    // Sự kiện nhấp đúp SỬ DỤNG REF để lấy danh sách task mới nhất
    gantt.attachEvent("onTaskDblClick", (id) => {
        const taskToEdit = tasksRef.current.find(t => t._id === id); // <-- Sửa ở đây
        if (taskToEdit) {
            setEditingTask(taskToEdit);
            setFormData(taskToEdit);
            setIsModalOpen(true);
        }
        return false;
    });

    gantt.init(ganttContainer.current);
    setIsGanttInitialized(true);

    // Hàm cleanup này chỉ chạy khi component bị unmount
    return () => {
      gantt.clearAll();
    };
  }, []); // <-- THAY ĐỔI QUAN TRỌNG: Dependency rỗng để hook chỉ chạy 1 lần

  // *** KẾT THÚC SỬA LỖI ***

  // Hook 2: Tải dữ liệu (giữ nguyên, không thay đổi)
  useEffect(() => {
    if (!isGanttInitialized || !projectId) {
      if (!projectId) setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [project, kanbanResult] = await Promise.all([
          projectApi.getProject(projectId),
          kanbanApi.findKanbanByProject(projectId)
        ]);
        
        setProjectInfo(project);
        if (kanbanResult.success && kanbanResult.found && kanbanResult.data) {
          setKanbanData(kanbanResult.data);
          setAllTasks(kanbanResult.data.tasks);
          const ganttTasks = convertKanbanTasksToGantt(kanbanResult.data.tasks);
          // Bây giờ việc parse sẽ không bị clear ngay sau đó
          gantt.parse({ data: ganttTasks, links: [] });
        } else {
          setKanbanData(null);
          gantt.parse({ data: [], links: [] });
          setError(kanbanResult.message || 'Không tìm thấy dữ liệu Kanban');
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, isGanttInitialized]);

  // Các hàm reload, save và phần JSX còn lại được giữ nguyên
  // ... (Phần code còn lại của bạn)
  const reloadGanttData = async () => {
    if (!projectId) return;
    
    try {
      const kanbanResult = await kanbanApi.findKanbanByProject(projectId);
      if (kanbanResult.success && kanbanResult.found && kanbanResult.data) {
        setKanbanData(kanbanResult.data);
        setAllTasks(kanbanResult.data.tasks);
        const ganttTasks = convertKanbanTasksToGantt(kanbanResult.data.tasks);
        gantt.clearAll();
        gantt.parse({ data: ganttTasks, links: [] });
      }
    } catch (err: any) {
      setError('Không thể tải lại dữ liệu: ' + err.message);
    }
  };

  const handleSaveTask = async () => {
    if (!formData._id) return;
    
    try {
      setIsSaving(true);
      await kanbanApi.updateTask(formData._id, formData);
      setIsModalOpen(false);
      await reloadGanttData();
    } catch (err: any) {
      setError("Lỗi khi cập nhật task: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!projectId) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            <AlertCircle size={20} className="inline-block mr-2" />
            Không tìm thấy ID dự án. Vui lòng quay lại và chọn một dự án.
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Calendar size={28} />
          Biểu đồ Gantt {isLoading ? '...' : projectInfo?.project_name && `- ${projectInfo.project_name}`}
        </h1>
        <Link to={`/projects/${projectId}/kanban`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2">
          <ArrowLeft size={16} /> Quay lại Kanban
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Đang tải biểu đồ...</span>
        </div>
      )}

      <div className={isLoading ? 'hidden' : ''}>
        {error && !kanbanData && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <AlertCircle size={20} className="inline-block mr-2" /> {error}
          </div>
        )}
        {kanbanData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Kanban size={16} /> Tổng số công việc: {kanbanData.tasks.length}
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                Hoàn thành: {kanbanData.tasks.filter((t: any) => t.status === 'Hoàn thành').length}
              </div>
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                Đang làm: {kanbanData.tasks.filter((t: any) => t.status === 'Đang làm').length}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div ref={ganttContainer} style={{ width: '100%', height: '500px' }} />
      </div>
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Chỉnh sửa: {editingTask.title}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên công việc
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.due_date ? new Date(formData.due_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="Cần làm">Cần làm</option>
                    <option value="Đang làm">Đang làm</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    value={formData.priority || ''}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="Thấp">Thấp</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Cao">Cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Màu task
                </label>
                <input
                  type="color"
                  value={formData.color || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveTask}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <AlertCircle size={16} />
          <span className="font-medium">Chế độ tương tác:</span>
          <span>
            Bây giờ bạn có thể chỉnh sửa trực tiếp! 
            Kéo thả để thay đổi thời gian, nhấp đúp vào tên để đổi tên, nhấp đúp vào task để xem chi tiết.
          </span>
        </div>
        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          💡 Tip: Mọi thay đổi sẽ được tự động lưu và đồng bộ với bảng Kanban
        </div>
      </div>

      <style>{`
        /* Giữ nguyên các style của bạn */
        .gantt-task-completed { background-color: #10b981 !important; border-color: #059669 !important; }
        /* ... */
      `}</style>
    </div>
  );
}