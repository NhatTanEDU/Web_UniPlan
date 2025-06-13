// src/components/After/tab/gantt/GanttTab.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { AlertCircle, Calendar, ArrowLeft, Kanban } from "lucide-react";
import { projectApi } from "../../../../services/projectApi";
import { kanbanApi, KanbanTask } from "../../../../services/kanbanApi";

// Hàm chuyển đổi Kanban tasks thành format cho Gantt
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

    const formatDate = (date: Date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        date = new Date();
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      id: task._id || `task_${index}`,
      text: task.title,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      progress,
      status: task.status,
      priority: task.priority,
      assignee: task.assigned_to_name || 'Chưa giao',
      readonly: true
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

  // Hook 1: Khởi tạo Gantt MỘT LẦN DUY NHẤT
  useEffect(() => {
    if (!ganttContainer.current) return;

    gantt.config.readonly = true;
    gantt.config.date_format = "%Y-%m-%d";
    
    // Cập nhật cấu hình scale để hết cảnh báo "obsolete"
    gantt.config.scales = [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "day", step: 1, format: "%d %M" }
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

    gantt.init(ganttContainer.current);
    setIsGanttInitialized(true);

    // Dọn dẹp khi component unmount
    return () => {
      // SỬA LỖI: Dùng clearAll() thay vì destructor() để tránh crash khi Hot-Reload
      // Mặc dù destructor() là "đúng" về mặt lý thuyết để giải phóng bộ nhớ,
      // nó lại gây lỗi khi React HMR cố gắng re-init instance đã bị hủy.
      // clearAll() là một sự đánh đổi an toàn trong môi trường dev.
      gantt.clearAll();
    };
  }, []); // Dependency rỗng `[]` đảm bảo nó chỉ chạy 1 lần khi mount

  // Hook 2: Tải dữ liệu khi Gantt đã sẵn sàng và có projectId
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
          const ganttTasks = convertKanbanTasksToGantt(kanbanResult.data.tasks);
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
  }, [projectId, isGanttInitialized]); // Chạy lại khi projectId hoặc trạng thái khởi tạo thay đổi

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
                <Kanban size={16} /> Tổng tasks: {kanbanData.tasks.length}
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
      
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <AlertCircle size={16} />
          <span className="font-medium">Chế độ xem:</span>
          <span>Đây là phiên bản chỉ xem. Để chỉnh sửa công việc, vui lòng sử dụng bảng Kanban.</span>
        </div>
      </div>

      <style>{`
        .gantt-task-completed { background-color: #10b981 !important; border-color: #059669 !important; }
        .gantt-task-in-progress { background-color: #f59e0b !important; border-color: #d97706 !important; }
        .gantt-task-todo { background-color: #6b7280 !important; border-color: #4b5563 !important; }
        .gantt_task_line { border-radius: 4px; }
        .gantt_grid_scale .gantt_grid_head_cell { background-color: #f8fafc; border-color: #e2e8f0; font-weight: 600; }
        .dark .gantt_grid_scale .gantt_grid_head_cell { background-color: #1f2937; border-color: #374151; color: #d1d5db; }
        .gantt_scale_line { background-color: #f1f5f9; border-color: #e2e8f0; }
        .dark .gantt_scale_line { background-color: #374151; border-color: #4b5563; }
        .gantt_task .gantt_task_content { color: white; font-weight: 500; }
      `}</style>
    </div>
  );
}