// src/components/After/tab/gantt/gantt.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { AlertCircle, GitMerge } from "lucide-react";
import { projectApi, Project } from "../../../../services/projectApi";

// Hàm chuyển đổi dữ liệu Project[] sang định dạng Gantt
const convertProjectsToGanttData = (projects: Project[]) => {
  console.log("🎯 LOG: 4. Converting project data to Gantt format...", projects);
  return projects.map(project => ({
    id: project._id,
    text: project.project_name,
    start_date: new Date(project.start_date),
    end_date: new Date(project.end_date),
    progress: project.status === 'Completed' ? 1 : (project.status === 'Active' ? 0.5 : 0.1),
    status: project.status,
    readonly: true,
    open: true,
  }));
};

export default function ProjectPortfolioGanttPage() {
  console.log("🎯 LOG: 0. ProjectPortfolioGanttPage component is mounting...");
  
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  
  // State để kiểm soát việc Gantt đã được khởi tạo hay chưa
  const [isGanttInitialized, setIsGanttInitialized] = useState(false);

  // === EFFECT 1: CHỈ KHỞI TẠO VÀ CẤU HÌNH GANTT (CHẠY 1 LẦN) ===
  useEffect(() => {
    console.log("🎯 LOG: 1. Gantt Init Effect RUNNING - Setting up structure.");
    
    if (!ganttContainer.current) {
      console.warn("🎯 LOG: 1.1. ganttContainer.current is null, skipping init");
      return;
    }

    gantt.config.readonly = true;
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.scale_height = 54;
    gantt.config.drag_progress = false;
    gantt.config.drag_links = false;
    
    gantt.config.columns = [
      { name: "text", label: "Tên Dự Án", tree: true, width: 300 },
      { name: "start_date", label: "Bắt đầu", align: "center", width: 120 },
      { name: "end_date", label: "Kết thúc", align: "center", width: 120 },
      {
        name: "status", label: "Trạng thái", align: "center", width: 120,
        template: (task: any) => `<span class="status-label status-${task.status?.toLowerCase().replace(' ', '-')}">${task.status || ''}</span>`
      },
    ];

    gantt.templates.task_class = (start, end, task: any) => `gantt-project-status-${task.status?.toLowerCase().replace(' ', '-')}`;

    gantt.templates.tooltip_text = (start, end, task: any) => `<b>Dự án:</b> ${task.text}<br/><i>(Nhấp đúp để xem chi tiết)</i>`;

    const onTaskDblClickHandler = gantt.attachEvent("onTaskDblClick", (id) => {
      console.log(`🎯 LOG: Double-clicked on project with ID: ${id} in Portfolio Gantt. Navigation is currently disabled.`);
      return false;
    });

    gantt.init(ganttContainer.current);
    
    // Đánh dấu là đã khởi tạo xong
    setIsGanttInitialized(true);
    console.log("🎯 LOG: 1.2. Gantt Initialized successfully!");

    return () => {
      console.log("🎯 LOG: Cleaning up Gantt instance.");
      gantt.detachEvent(onTaskDblClickHandler);
      gantt.clearAll();
      setIsGanttInitialized(false);
    };
  }, [navigate]);

  // === EFFECT 2: TẢI DỮ LIỆU SAU KHI GANTT ĐÃ KHỞI TẠO ===
  useEffect(() => {
    if (!isGanttInitialized) {
      console.log("🎯 LOG: 2. Data Fetch Effect SKIPPED - Gantt not initialized yet.");
      return;
    }
    
    console.log("🎯 LOG: 2. Data Fetch Effect RUNNING.");
    
    const fetchProjectsData = async () => {
      setIsLoading(true);
      setError('');
      try {
        console.log("🎯 LOG: 3. Calling getProjects API...");
        const response = await projectApi.getProjects(); 
        console.log("🎯 LOG: 3.1. API Response Received:", response);

        // Xử lý cả hai trường hợp: { projects: [...] } hoặc trực tiếp [...]
        let projectsArray: Project[] = [];
        
        if (response && response.projects && Array.isArray(response.projects)) {
          projectsArray = response.projects;
          console.log("🎯 LOG: 3.2. Using response.projects array");
        } else if (response && Array.isArray(response)) {
          projectsArray = response;
          console.log("🎯 LOG: 3.2. Using direct response array");
        } else {
          throw new Error("Dữ liệu dự án trả về không hợp lệ");
        }

        console.log("🎯 LOG: 3.3. Projects array:", projectsArray);

        if (projectsArray.length === 0) {
          console.log("🎯 LOG: 3.4. No projects found");
          setError("Không có dự án nào để hiển thị");
          return;
        }

        const ganttFormattedData = convertProjectsToGanttData(projectsArray);
        console.log("🎯 LOG: 5. Formatted Data for Gantt:", ganttFormattedData);

        gantt.parse({ data: ganttFormattedData, links: [] });
        console.log("🎯 LOG: 6. Data parsed into Gantt successfully!");

      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Không thể tải danh sách dự án";
        setError(errorMessage);
        console.error("🎯 LOG: ERROR - API call failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectsData();
  }, [isGanttInitialized]);

  // Render JSX
  console.log("🎯 LOG: Render - isLoading:", isLoading, "isGanttInitialized:", isGanttInitialized, "error:", error);

  if (isLoading && !isGanttInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-300">Đang khởi tạo biểu đồ Gantt...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <GitMerge size={28} className="text-blue-500" />
          Tổng quan các Dự án (Portfolio Gantt)
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Xem lịch trình tổng thể của tất cả các dự án. Nhấp đúp vào một dự án để xem chi tiết công việc.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Hiển thị loading khi đang fetch dữ liệu nhưng Gantt đã init */} 
      {isLoading && isGanttInitialized && (
         <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-500 dark:text-gray-400">Đang tải dữ liệu dự án...</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div 
          ref={ganttContainer}
          style={{ width: '100%', height: '650px' }}
          className="gantt-container"
        />
      </div>

       <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Chú thích trạng thái dự án:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded gantt-project-status-planning"></div><span>Planning</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded gantt-project-status-active"></div><span>Active</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded gantt-project-status-completed"></div><span>Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded gantt-project-status-on-hold"></div><span>On Hold</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-3 rounded gantt-project-status-cancelled"></div><span>Cancelled</span></div>
          </div>
        </div>
        
      <style>{`
        .gantt-project-status-planning .gantt_task_line { background-color: #60a5fa; border-color: #2563eb; }
        .gantt-project-status-active .gantt_task_line { background-color: #4ade80; border-color: #16a34a; }
        .gantt-project-status-completed .gantt_task_line { background-color: #a3e635; border-color: #65a30d; }
        .gantt-project-status-on-hold .gantt_task_line { background-color: #facc15; border-color: #ca8a04; }
        .gantt-project-status-cancelled .gantt_task_line { background-color: #f87171; border-color: #dc2626; }
        .gantt-project-status-archived .gantt_task_line { background-color: #d1d5db; border-color: #6b7280; }
        .status-label { padding: 2px 8px; border-radius: 9999px; font-size: 11px; color: white; font-weight: 500; }
        .status-planning { background-color: #2563eb; }
        .status-active { background-color: #16a34a; }
        .status-completed { background-color: #65a30d; }
        .status-on-hold { background-color: #ca8a04; }
        .status-cancelled { background-color: #dc2626; }
        .status-archived { background-color: #6b7280; }
        .gantt_task_line { border-radius: 4px; }
        .gantt_task_line:hover { cursor: pointer; opacity: 0.8; }
        .gantt_grid_scale .gantt_grid_head_cell,
        .gantt_task_scale .gantt_scale_cell {
          background: #f9fafb; border-color: #e5e7eb;
        }
        .dark .gantt_grid_scale .gantt_grid_head_cell,
        .dark .gantt_task_scale .gantt_scale_cell {
          background: #374151; border-color: #4b5563; color: #f3f4f6;
        }
        .gantt-container {
          border-radius: 0.5rem;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
