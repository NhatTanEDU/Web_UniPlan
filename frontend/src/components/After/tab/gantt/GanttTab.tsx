// src/components/After/tab/gantt/GanttTab.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { AlertCircle, Calendar, ArrowLeft, Kanban } from "lucide-react";
import { projectApi } from "../../../../services/projectApi";
import { kanbanApi, KanbanTask } from "../../../../services/kanbanApi";
import styles from './GanttTab.module.css';
import GanttTaskTooltip from './GanttTaskTooltip';

// Interface cho TaskDependency
interface TaskDependency {
  _id: string;
  id?: string;
  source_task_id: {
    _id: string;
    title: string;
    status: string;
  } | string;
  target_task_id: {
    _id: string;
    title: string;
    status: string;
  } | string;
  source: string;
  target: string;
  dependency_type: string;
  type: number;
  lag_days: number;
  lag: number;
  is_active: boolean;
}

// Đảm bảo các interface được khai báo ở đầu file
interface PopulatedAssignedToUser {
  _id: string;
  name: string;
}
interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
  lag: number;
}

// Đặt các state lên đầu function
export default function GanttTab() {
  // State đặt ở đầu function component
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);

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
  
  // THÊM STATE CHO CUSTOM TOOLTIP
  const [customTooltip, setCustomTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: any;
  }>({ visible: false, x: 0, y: 0, content: null });

  // Đưa loadDependencies lên ngay sau khai báo state
  const loadDependencies = useCallback(async (): Promise<TaskDependency[]> => {
    if (!projectId) return [];
    try {
      setIsLoadingDependencies(true);
      const result = await kanbanApi.getGanttDependencies(projectId);
      console.log('Loaded dependencies from API:', result);
      const dependencyArray = result.links || [];
      const validDependencies = dependencyArray.filter((dep: any) => {
        const isValid = dep.id && dep.source && dep.target;
        if (!isValid) {
          console.warn('Invalid dependency found:', dep);
        }
        return isValid;
      });
      setDependencies(validDependencies);
      return validDependencies;
    } catch (error) {
      console.error('Error loading dependencies:', error);
      setDependencies([]);
      return [];
    } finally {
      setIsLoadingDependencies(false);
    }
  }, [projectId]);

  const convertKanbanTasksToGantt = (tasks: KanbanTask[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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

      const assignedToData = task.assigned_to as unknown as (PopulatedAssignedToUser | null | undefined);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue = diffDays < 0 && task.status !== 'Hoàn thành';
      const isApproachingDeadline = diffDays >= 0 && diffDays <= 3 && task.status !== 'Hoàn thành';

      return {
        id: task._id || `task_${index}`,
        text: task.title,
        start_date: startDate,
        end_date: endDate,
        progress,
        status: task.status,
        priority: task.priority,
        assignee: assignedToData?.name || 'Chưa giao',
        assigned_to: assignedToData?._id,
        description: task.description,
        color: task.color,
        is_overdue: isOverdue,
        is_approaching_deadline: isApproachingDeadline,
        riskLevel: task.riskLevel || 0,
        riskClass: task.riskClass || '',
      };
    });
  };

  // *** BẮT ĐẦU SỬA LỖI ***

  // 1. Sử dụng ref để lưu trữ tasks, cho phép event handlers truy cập giá trị mới nhất
  const tasksRef = useRef(allTasks);
  useEffect(() => {
    tasksRef.current = allTasks;
  }, [allTasks]);

  // 2. Hook khởi tạo Gantt và gắn sự kiện CHỈ CHẠY MỘT LẦN
  useEffect(() => {
    if (!ganttContainer.current) return;

    // Cấu hình ngôn ngữ Tiếng Việt
    const viLocale = {
        date: {
            month_full: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
            month_short: ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"],
            day_full: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
            day_short: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
        },
        labels: {
            column_text: "Tên công việc",
            column_start_date: "Bắt đầu",
            column_duration: "Thời lượng",
            column_add: ""
        }
    };
    gantt.i18n.setLocale(viLocale);    // BƯỚC 1: Xóa cột "Người thực hiện" khỏi cấu hình columns
    gantt.config.columns = [
      { name: "text",       label: "Tên công việc",   tree: true, width: '*', min_width: 200 },
      // Dòng "assignee" đã được xóa
      { name: "status",     label: "Trạng thái",      align: "center", width: 100 },
      { name: "priority",   label: "Ưu tiên",         align: "center", width: 90 },
      { name: "start_date", label: "Bắt đầu",         align: "center", width: 100 },
      { name: "duration",   label: "Thời lượng",       align: "center", width: 90 },    ];
    gantt.config.grid_resize = true;
    gantt.config.readonly = false;
    gantt.config.date_grid = "%d-%m-%Y";
    gantt.config.date_format = "%Y-%m-%d %H:%i";

    // ======================= THAY ĐỔI QUAN TRỌNG =======================
    // TẮT TOOLTIP DHTMLX và tự tạo custom tooltip  
    gantt.config.tooltip = false; // TẮT tooltip của dhtmlx
    console.log('DHTMLX Tooltip disabled, using custom tooltip');
    
    // ======================== THAY ĐỔI QUAN TRỌNG ========================
    // TẮT chức năng cho phép người dùng kéo thả thanh tiến độ
    gantt.config.drag_progress = false;
    console.log('Progress drag disabled - tiến độ chỉ dựa trên trạng thái');
    // ===================================================================
    
    // Thêm cấu hình responsive cho Gantt
    gantt.config.fit_tasks = true;

    // THAY ĐỔI CÁCH ĐỊNH DẠNG THÁNG TRONG SCALES
    gantt.config.scales = [
        {
            unit: "month",
            step: 1,
            format: function(date) {
                return viLocale.date.month_full[date.getMonth()] + " " + date.getFullYear();
            }
        },
        { unit: "day", step: 1, format: "%d" } // Giữ nguyên định dạng ngày
    ];
    gantt.config.scale_height = 50;    gantt.templates.task_text = (start, end, task) => task.text;
    gantt.templates.task_class = (start, end, task) => {
      if (task.riskClass === 'high-risk') return styles.taskOverdue;
      if (task.riskClass === 'medium-risk') return styles.taskApproaching;
      if (task.is_overdue) return styles.taskOverdue;
      if (task.is_approaching_deadline) return styles.taskApproaching;
      switch (task.status) {
        case 'Hoàn thành': return styles.taskCompleted;
        case 'Đang làm': return styles.taskInProgress;
        default: return styles.taskTodo;
      }
    };    // ======================= CUSTOM TOOLTIP THAY THẾ =======================
    // Xóa tooltip template cũ và thay bằng event listener custom
    // ===================================================================

    // Gắn các sự kiện (sử dụng logic cũ)
    gantt.attachEvent("onAfterTaskDrag", async (id, mode, e) => { /* ... */ });
    gantt.attachEvent("onAfterTaskUpdate", async (id, task) => { /* ... */ });    // CUSTOM TOOLTIP EVENT - thay thế cho dhtmlx tooltip
    let tooltipTimeout: NodeJS.Timeout;
    
    gantt.attachEvent("onMouseMove", (id, e) => {
        // Clear timeout cũ
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        
        if (id && gantt.getTask(id)) {
            const task = gantt.getTask(id);
            const mouseEvent = e as MouseEvent;
            console.log('Custom tooltip triggered for:', task.text);
            setCustomTooltip({
                visible: true,
                x: mouseEvent.clientX + 15,
                y: mouseEvent.clientY - 10,
                content: task
            });
        } else {
            // Ẩn tooltip khi không hover vào task nào với delay nhỏ
            tooltipTimeout = setTimeout(() => {
                setCustomTooltip(prev => ({ ...prev, visible: false }));
            }, 150);
        }
        return true;
    });
    
    // Sự kiện nhấp đúp SỬ DỤNG REF để lấy danh sách task mới nhất
    gantt.attachEvent("onTaskDblClick", (id) => {
        const taskToEdit = tasksRef.current.find(t => t._id === id); // <-- Sửa ở đây
        if (taskToEdit) {
            setEditingTask(taskToEdit);
            setFormData(taskToEdit);
            setIsModalOpen(true);
        }
        return false;
    });    // Handler tạo dependency
    gantt.attachEvent("onAfterLinkAdd", async (id, link) => {
      if (!projectId) return false;
      try {
        const newDep = await kanbanApi.createGanttDependency(projectId, {
          source: String(link.source),
          target: String(link.target),
          type: Number(link.type) || 0,
          lag: Number(link.lag) || 0
        });
        setDependencies(prev => [
          ...prev,
          { ...(newDep.dependency as TaskDependency) }
        ]);
        return true;
      } catch (error) {
        gantt.deleteLink(id);
        setError('Không thể tạo phụ thuộc: ' + (error as any).message);
        return false;
      }
    });
    // Handler xóa dependency
    gantt.attachEvent("onAfterLinkDelete", async (id, link) => {
      if (!projectId) return true;
      try {
        await kanbanApi.deleteGanttDependency(projectId, String(id));
        setDependencies(prev => prev.filter(dep => dep.id !== String(id)));
        return true;
      } catch (error) {
        setError('Không thể xóa phụ thuộc: ' + (error as any).message);
        return true;
      }
    });
    
    gantt.init(ganttContainer.current);
    setIsGanttInitialized(true);    // Hàm cleanup này chỉ chạy khi component bị unmount
    return () => {
      // Clear tooltip timeout khi cleanup
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      gantt.clearAll();
    };
  }, [projectId]); // <-- THAY ĐỔI QUAN TRỌNG: Dependency rỗng để hook chỉ chạy 1 lần

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
          const loadedDependencies = await loadDependencies();
          const ganttTasks = convertKanbanTasksToGantt(kanbanResult.data.tasks);
          const ganttLinks: GanttLink[] = loadedDependencies.map((dep: TaskDependency) => ({
            id: String(dep.id || dep._id),
            source: String(dep.source || (typeof dep.source_task_id === 'string' ? dep.source_task_id : dep.source_task_id._id)),
            target: String(dep.target || (typeof dep.target_task_id === 'string' ? dep.target_task_id : dep.target_task_id._id)),
            type: String(dep.type ?? 0), // type là string
            lag: Number(dep.lag || dep.lag_days || 0)
          }));
          gantt.parse({
            data: ganttTasks,
            links: ganttLinks
          });
          console.log('✅ Gantt loaded with dependencies:', ganttLinks.length);
        } else {
          setKanbanData(null);
          gantt.parse({ data: [], links: [] });
          setError(kanbanResult.message || 'Không tìm thấy dữ liệu Gantt');
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId, isGanttInitialized, loadDependencies]);

  // Các hàm reload, save và phần JSX còn lại được giữ nguyên
  // ... (Phần code còn lại của bạn)
  const reloadGanttData = async () => {
    if (!projectId) return;
    try {
      const [kanbanResult, loadedDependencies] = await Promise.all([
        kanbanApi.findKanbanByProject(projectId),
        loadDependencies()
      ]);
      if (kanbanResult.success && kanbanResult.found && kanbanResult.data) {
        setKanbanData(kanbanResult.data);
        setAllTasks(kanbanResult.data.tasks);
        const ganttTasks = convertKanbanTasksToGantt(kanbanResult.data.tasks);
        const ganttLinks: GanttLink[] = loadedDependencies.map((dep: TaskDependency) => ({
          id: String(dep.id || dep._id),
          source: String(dep.source || (typeof dep.source_task_id === 'string' ? dep.source_task_id : dep.source_task_id._id)),
          target: String(dep.target || (typeof dep.target_task_id === 'string' ? dep.target_task_id : dep.target_task_id._id)),
          type: String(dep.type ?? 0),
          lag: Number(dep.lag || dep.lag_days || 0)
        }));
        gantt.clearAll();
        gantt.parse({
          data: ganttTasks,
          links: ganttLinks
        });
        console.log('✅ Gantt reloaded with dependencies:', ganttLinks.length);
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

  // Chú thích phụ thuộc Gantt
  const GanttLegend = () => (
    <div className="gantt-legend mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
      <b>Chú thích phụ thuộc:</b>
      <ul className="list-disc pl-5 mt-1">
        <li><b>FS</b> (<b>Finish-to-Start</b>): Công việc sau bắt đầu khi công việc trước kết thúc</li>
        <li><b>SS</b> (<b>Start-to-Start</b>): Hai công việc bắt đầu cùng lúc</li>
        <li><b>FF</b> (<b>Finish-to-Finish</b>): Hai công việc kết thúc cùng lúc</li>
        <li><b>SF</b> (<b>Start-to-Finish</b>): Công việc trước bắt đầu thì công việc sau kết thúc</li>
      </ul>
    </div>
  );

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
      {/* Chú thích phụ thuộc Gantt */}
      <GanttLegend />
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
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                🔗 Phụ thuộc: {dependencies.length}
                {isLoadingDependencies && <span className="text-gray-500">(đang tải...)</span>}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div
          ref={ganttContainer}
          className="w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        ></div>
      </div>
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto mx-auto md:mx-0">
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
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <AlertCircle size={16} />
          <span className="font-medium">Chế độ tương tác:</span>
          <span>
            Bây giờ bạn có thể chỉnh sửa trực tiếp! 
            Kéo thả để thay đổi thời gian, nhấp đúp vào tên để đổi tên, nhấp đúp vào task để xem chi tiết.
          </span>
        </div>        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          💡 Tip: Mọi thay đổi sẽ được tự động lưu và đồng bộ với bảng Kanban. Tiến độ task được tự động tính dựa trên trạng thái (Cần làm: 0%, Đang làm: 50%, Hoàn thành: 100%).
        </div>        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
          ✅ Custom Tooltip với giao diện tối đẹp mắt! ✅ Tiến độ tự động - không thể kéo thả thủ công!
        </div>
      </div>

      {/* CUSTOM TOOLTIP COMPONENT */}
      {customTooltip.visible && customTooltip.content && (
        <GanttTaskTooltip
          visible={customTooltip.visible}
          content={customTooltip.content}
          x={customTooltip.x}
          y={customTooltip.y}
        />
      )}
    </div>
  );
}