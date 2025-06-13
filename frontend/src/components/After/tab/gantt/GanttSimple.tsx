// src/components/After/tab/gantt/GanttSimple.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import { AlertCircle, Calendar, ArrowLeft, Kanban } from "lucide-react";
import { ganttApi, GanttDataResponse } from "../../../../services/ganttApi";
import { projectApi } from "../../../../services/projectApi";

export default function GanttSimple() {
  const { projectId } = useParams<{ projectId: string }>();
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [ganttData, setGanttData] = useState<GanttDataResponse | null>(null);

  // THÊM DÒNG DEBUG NÀY VÀO ĐẦU COMPONENT
  console.log('✅ [GanttSimple] Component rendered. Project ID from URL params:', projectId);
  console.log('✅ [GanttSimple] Current window location:', window.location.href);

  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  // Khởi tạo Gantt Chart - Phase 1: Read-only
  useEffect(() => {
    if (!ganttContainer.current) return;

    // Cấu hình cơ bản cho Gantt Chart (Read-only)
    gantt.config.readonly = true;
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.auto_scheduling = false;
    gantt.config.drag_move = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_links = false;
    gantt.config.drag_progress = false;

    // Cấu hình hiển thị
    gantt.config.scale_unit = "day";
    gantt.config.step = 1;
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [
      { unit: "month", step: 1, date: "%F %Y" }
    ];

    // Template hiển thị text trên task bar
    gantt.templates.task_text = function(start, end, task) {
      return task.text;
    };

    // Template cho tooltip
    gantt.templates.tooltip_text = function(start, end, task) {
      return `<b>Công việc:</b> ${task.text}<br/>
              <b>Trạng thái:</b> ${task.status}<br/>
              <b>Ưu tiên:</b> ${task.priority}<br/>
              <b>Người thực hiện:</b> ${task.assignee || 'Chưa giao'}<br/>
              <b>Thời gian:</b> ${gantt.date.date_to_str("%d/%m/%Y")(start)} - ${gantt.date.date_to_str("%d/%m/%Y")(end)}`;
    };

    // CSS class cho các task theo trạng thái
    gantt.templates.task_class = function(start, end, task) {
      let className = '';
      switch (task.status) {
        case 'Hoàn thành':
          className = "gantt-task-completed";
          break;
        case 'Đang làm':
          className = "gantt-task-in-progress";
          break;
        case 'Cần làm':
        default:
          className = "gantt-task-todo";
          break;
      }
      
      if (task.is_pinned) {
        className += " gantt-task-pinned";
      }
      
      return className;
    };

    // Khởi tạo Gantt Chart
    gantt.init(ganttContainer.current);

    return () => {
      gantt.clearAll();
    };
  }, []);
  // Load dữ liệu
  useEffect(() => {
    const loadGanttData = async () => {
      // THÊM DÒNG DEBUG NÀY VÀO TRONG USEEFFECT
      console.log('🔍 [GanttSimple] useEffect is running for projectId:', projectId);
      console.log('🔍 [GanttSimple] useEffect - window.location.pathname:', window.location.pathname);

      if (!projectId) {
        console.log('❌ [GanttSimple] No projectId found, setting error');
        setError('Không tìm thấy ID dự án. Vui lòng chọn một dự án.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');        // Lấy thông tin dự án
        console.log('📊 Loading project info for Gantt...');
        const project = await projectApi.getProject(projectId);
        setProjectInfo(project);

        // Lấy dữ liệu Gantt
        console.log('📊 Loading Gantt data...');
        const ganttResponse = await ganttApi.getGanttTasks(projectId);
        setGanttData(ganttResponse);

        // Load dữ liệu vào Gantt Chart
        if (ganttResponse.data && ganttResponse.data.length > 0) {
          const ganttDataForChart = {
            data: ganttResponse.data,
            links: ganttResponse.links || []
          };
          
          gantt.parse(ganttDataForChart);
          console.log('✅ Gantt data loaded successfully:', ganttDataForChart);
        } else {
          console.log('📊 No Gantt data found, showing empty chart');
          gantt.parse({ data: [], links: [] });
        }

      } catch (error: any) {
        console.error('❌ Error loading Gantt data:', error);
        setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu Gantt Chart');
      } finally {
        setIsLoading(false);
      }
    };

    loadGanttData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Dự Án", "Biểu đồ Gantt"]} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                Đang tải biểu đồ Gantt...
              </div>
            </div>
          </main>
          <Footer onFooterClick={handleFooterClick} />
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
        <Breadcrumb items={["Dashboard", "Dự Án", "Biểu đồ Gantt"]} />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Header */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Calendar size={28} />
                Biểu đồ Gantt {projectInfo?.project_name && `- ${projectInfo.project_name}`}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Back to Kanban Button */}
              {projectId && (
                <Link
                  to={`/projects/${projectId}/kanban`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                  title="Quay lại bảng Kanban"
                >
                  <ArrowLeft size={16} />
                  Quay lại Kanban
                </Link>
              )}
            </div>
          </div>

          {/* Error Display */}
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
            </div>
          )}

          {/* Gantt Chart Info */}
          {ganttData && (
            <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Calendar size={16} />
                  <span>Tổng số công việc:</span>
                  <span className="font-semibold">{ganttData.data.length}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Kanban size={16} />
                  <span>Công việc hoàn thành:</span>
                  <span className="font-semibold">
                    {ganttData.data.filter(task => task.status === 'Hoàn thành').length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle size={16} />
                  <span>Đang thực hiện:</span>
                  <span className="font-semibold">
                    {ganttData.data.filter(task => task.status === 'Đang làm').length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gantt Chart Container */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div 
              ref={ganttContainer} 
              className="w-full h-96"
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Empty State */}
          {ganttData && ganttData.data.length === 0 && (
            <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Chưa có công việc nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Hãy tạo công việc trong bảng Kanban để hiển thị trên biểu đồ Gantt
              </p>
              {projectId && (
                <Link
                  to={`/projects/${projectId}/kanban`}
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  <Kanban size={16} />
                  Đi đến bảng Kanban
                </Link>
              )}
            </div>
          )}

          {/* Read-only Notice */}
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle size={16} />
              <span className="font-medium">Chế độ xem:</span>
              <span>Đây là phiên bản xem của biểu đồ Gantt. Để chỉnh sửa công việc, vui lòng sử dụng bảng Kanban.</span>
            </div>
          </div>
        </main>
        <Footer onFooterClick={handleFooterClick} />
        <TopButton />
      </div>

      {/* CSS cho Gantt Chart */}
      <style>{`
        .gantt-task-completed {
          background-color: #10b981 !important;
          border-color: #059669 !important;
        }
        
        .gantt-task-in-progress {
          background-color: #f59e0b !important;
          border-color: #d97706 !important;
        }
        
        .gantt-task-todo {
          background-color: #6b7280 !important;
          border-color: #4b5563 !important;
        }
        
        .gantt-task-pinned {
          border: 2px solid #3b82f6 !important;
          box-shadow: 0 0 0 1px #3b82f6 !important;
        }
        
        .gantt_task_line {
          border-radius: 4px;
        }
        
        .gantt_task_progress {
          border-radius: 4px;
        }
        
        .gantt_grid_scale .gantt_grid_head_cell {
          background-color: #f8fafc;
          border-color: #e2e8f0;
          font-weight: 600;
        }
        
        .gantt_scale_line {
          background-color: #f1f5f9;
          border-color: #e2e8f0;
        }
        
        .gantt_task .gantt_task_content {
          color: white;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
