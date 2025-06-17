// src/components/After/tab/gantt/gantt.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import { AlertCircle, GitMerge } from "lucide-react";
import { projectApi, Project } from "../../../../services/projectApi"; // Giả định bạn có định nghĩa Project và projectApi

// Hàm chuyển đổi dữ liệu Project[] sang định dạng Gantt
const convertProjectsToGanttData = (projects: Project[]) => {
  return projects.map(project => {
    // Tính toán tiến độ dựa trên trạng thái dự án
    let progress = 0;
    switch (project.status) {
      case 'Active':
        progress = 0.5; // Đang hoạt động: 50%
        break;
      case 'Completed':
        progress = 1; // Hoàn thành: 100%
        break;
      case 'On Hold':
        progress = 0.25; // Tạm dừng: 25%
        break;
      default:
        progress = 0.1; // Các trạng thái khác
        break;
    }

    return {
      id: project._id,
      text: project.project_name,
      start_date: new Date(project.start_date),
      end_date: new Date(project.end_date),
      progress: progress,
      status: project.status, // Giữ lại status để tô màu
      readonly: true, // Quan trọng: Mỗi thanh dự án là read-only
      open: true, // Tự động mở rộng
    };
  });
};


export default function ProjectPortfolioGanttPage() {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState<Project[]>([]); // projects state is used to store fetched data, which is then processed for the Gantt chart.
  const navigate = useNavigate();

  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  // Effect để khởi tạo và cấu hình Gantt Chart
  useEffect(() => {
    if (!ganttContainer.current) return;

    // === CẤU HÌNH CHO "GANTT LỚN" ===
    gantt.config.readonly = true; // Toàn bộ biểu đồ là CHỈ XEM
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.scale_height = 54;
    gantt.config.drag_progress = false; // Không cho kéo tiến độ
    gantt.config.drag_links = false; // Không cho tạo/sửa liên kết
    
    // Cấu hình các cột hiển thị
    gantt.config.columns = [
      { name: "text", label: "Tên Dự Án", tree: true, width: 300 },
      { name: "start_date", label: "Bắt đầu", align: "center", width: 120 },
      { name: "end_date", label: "Kết thúc", align: "center", width: 120 },
      { name: "status", label: "Trạng thái", align: "center", width: 120,
        template: (task: any) => `<span class="status-label status-${task.status?.toLowerCase().replace(' ', '-')}">${task.status || ''}</span>`
      },
    ];

    // Template để tô màu cho từng thanh dự án dựa trên trạng thái
    gantt.templates.task_class = (start, end, task: any) => {
      return `gantt-project-status-${task.status?.toLowerCase().replace(' ', '-')}`;
    };

    // Template cho tooltip
    gantt.templates.tooltip_text = (start, end, task: any) => {
      return `<b>Dự án:</b> ${task.text}<br/>
              <b>Trạng thái:</b> ${task.status}<br/>
              <b>Thời gian:</b> ${gantt.templates.tooltip_date_format(start)} - ${gantt.templates.tooltip_date_format(end)}<br/>
              <i>(Nhấp đúp để xem chi tiết)</i>`;
    };

    // === SỰ KIỆN TƯƠNG TÁC QUAN TRỌNG NHẤT ===
    // Khi người dùng nhấp đúp chuột vào một dự án, chuyển hướng tới "Gantt Nhỏ" của dự án đó
    const onTaskDblClickHandler = gantt.attachEvent("onTaskDblClick", (id) => {
      // navigate(`/projects/${id}/kanban`); 
      // TẠM THỜI VÔ HIỆU HÓA ĐIỀU HƯỚNG KHI NHẤP ĐÚP TRÊN GANTT LỚN
      // CHÚNG TA SẼ CẬP NHẬT ĐÚNG ĐƯỜNG DẪN SAU
      console.log(`LOG: Double-clicked on project with ID: ${id} in Portfolio Gantt. Navigation is currently disabled.`);
      return false;
    });

    gantt.init(ganttContainer.current);

    // Cleanup khi component bị hủy
    return () => {
      gantt.detachEvent(onTaskDblClickHandler);
      gantt.clearAll();
    };
  }, [navigate]); // Thêm navigate vào dependencies

  // Effect để tải dữ liệu các dự án
  useEffect(() => {
    const fetchProjectsData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Gọi API để lấy tất cả các dự án của người dùng
        const response = await projectApi.getProjects(); 
        setProjects(response.projects); // Sửa ở đây

        const ganttFormattedData = convertProjectsToGanttData(response.projects); // Sửa ở đây
        gantt.parse({ data: ganttFormattedData, links: [] }); // Không có links ở Gantt Lớn

      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Không thể tải danh sách dự án");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectsData();
  }, []); // Chạy 1 lần khi component mount

  if (isLoading) {
    // Bạn có thể giữ lại component Loading hiện tại
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-300">Đang tải tổng quan dự án...</p>
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div 
              ref={ganttContainer}
              style={{ width: '100%', height: '650px' }}
              className="gantt-container"
            />
          </div>

          {/* Chú thích */}
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
        </main>
  );
}
