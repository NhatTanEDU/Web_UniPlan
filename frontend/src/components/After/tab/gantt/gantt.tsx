// src/components/After/tab/gantt/gantt.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import './gantt-custom.css';
import { Input, Select, Button, Tooltip, Switch, Radio, Space, Spin } from 'antd'; 
import { 
  SearchOutlined, ExpandAltOutlined, CompressOutlined, CalendarOutlined, InfoCircleOutlined,
  BarChartOutlined, PieChartOutlined, ProjectOutlined, ReloadOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

// Hàm helper để Việt hóa trạng thái
const localizeStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'Active': 'Hoạt động', 'Planning': 'Lên kế hoạch', 'On Hold': 'Tạm dừng',
    'Completed': 'Hoàn thành', 'In Progress': 'Đang thực hiện',
    'Delayed': 'Trì hoãn', 'Cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

// Interface Project
interface Project {
  _id?: string; id?: string; text?: string; project_name?: string;
  start_date?: string | Date; end_date?: string | Date; status?: string;
  is_overdue?: boolean; // Thêm trường này
  is_approaching_deadline?: boolean; // Thêm trường này
  [key: string]: any;
}

// Định nghĩa các trạng thái dự án và màu sắc tương ứng
const projectStatuses = [
  { value: 'Active', label: 'Hoạt động', color: '#52c41a' },        /* xanh lá */
  { value: 'Planning', label: 'Lên kế hoạch', color: '#1890ff' },   /* xanh dương */
  { value: 'On Hold', label: 'Tạm dừng', color: '#faad14' },        /* vàng */
  { value: 'Completed', label: 'Hoàn thành', color: '#eb2f96' },    /* hồng đậm */
  { value: 'In Progress', label: 'Đang thực hiện', color: '#722ed1' }, /* tím */
  { value: 'Delayed', label: 'Trì hoãn', color: '#f5222d' },        /* đỏ */
  { value: 'Cancelled', label: 'Đã hủy', color: '#6b7280' },        /* xám */
  { value: 'Default', label: 'Mặc định', color: '#000' }            /* đen */
];

export default function ProjectPortfolioGanttPage() {
  const ganttContainer = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate(); // Thêm hook điều hướng
    // State và Ref cho tooltip custom
  const [customTooltip, setCustomTooltip] = useState<{
    visible: boolean; x: number; y: number; content: any;
  }>({ visible: false, x: 0, y: 0, content: null });
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State để quản lý ẩn/hiện chú thích
  const [showLegend, setShowLegend] = useState(true);
  // State để lưu trữ tất cả dự án và các bộ lọc
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [timeScale, setTimeScale] = useState("week");
  const [expandAll, setExpandAll] = useState(true);
  const [showTodayMarker, setShowTodayMarker] = useState(true);
  
  // State để quản lý loại biểu đồ hiển thị
  const [chartView, setChartView] = useState('gantt'); // 'gantt', 'pie', 'bar'
  // Hàm áp dụng bộ lọc phía client
  const applyFilters = () => {
    if (!allProjects.length) return;
    
    setIsLoading(true);
    
    let filteredProjects = [...allProjects];
    
    // Lọc theo tên dự án (không phân biệt chữ hoa/thường)
    if (searchText.trim()) {
      const searchLower = searchText.trim().toLowerCase();
      filteredProjects = filteredProjects.filter(project => {
        const projectName = project.text || project.project_name || '';
        return projectName.toLowerCase().includes(searchLower);
      });
    }
    
    // Lọc theo trạng thái (nếu có trạng thái được chọn)
    if (statusFilter.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        statusFilter.includes(project.status || '')
      );
    }
    
    // Cập nhật dữ liệu Gantt với kết quả đã lọc
    gantt.clearAll();
    gantt.parse({
      data: filteredProjects
    });
    
    // Hiển thị số lượng kết quả lọc (tùy chọn)
    console.log(`Đã lọc: ${filteredProjects.length}/${allProjects.length} dự án`);
    
    setIsLoading(false);
  };

  // Hàm xử lý lọc theo trạng thái
  const handleStatusFilter = (values: string[]) => {
    setStatusFilter(values);
    // Việc áp dụng lọc sẽ được xử lý trong useEffect
  };

  // useEffect để áp dụng lại bộ lọc khi state thay đổi
  useEffect(() => {
    // Thêm debounce cho tìm kiếm để tránh gọi quá nhiều lần khi người dùng gõ nhanh
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchText, statusFilter, allProjects]);
  // Hàm xử lý thay đổi thang thời gian
  const handleTimeScaleChange = (value: string) => { /* ... giữ nguyên ... */ };
  // Hàm xử lý thu gọn/mở rộng tất cả
  const toggleExpandAll = () => { /* ... giữ nguyên ... */ };
  // Hàm load dữ liệu Gantt từ API
  const loadGanttData = async () => { /* ... giữ nguyên ... */ };
  // Template cải tiến cho tooltip
  const renderEnhancedTooltip = (task: any) => { /* ... giữ nguyên ... */ };

  useEffect(() => {
    const container = ganttContainer.current;
    if (!container) return;

    // --- Cấu hình Gantt ---
    gantt.config.readonly = true;
    gantt.config.select_task = true;
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.tooltip = false; // Tắt tooltip mặc định

    const formatDate = gantt.date.date_to_str("%Y-%m-%d");
    
    // SỬA LỖI 3: Cập nhật template của cột status để Việt hóa
    gantt.config.columns = [
      { 
        name: "text", label: "Tên Dự Án", tree: true, width: 300,
        template: function(task) {
          const now = new Date();
          const endDate = new Date(task.end_date || task.end);
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            return `<span style="color:#ff4d4f; font-weight:bold;">${task.text}</span>`;
          } else if (diffDays <= 3) {
            return `<span style="color:#faad14; font-weight:bold;">${task.text}</span>`;
          }
          return task.text;
        }
      },
      {
        name: "start_date", label: "Bắt đầu", align: "center", width: 120,
        template: (task: any) => `<span class="date-color date-color-start"></span> ${formatDate(task.start_date)}`
      },
      {
        name: "end_date", label: "Kết thúc", align: "center", width: 120,
        template: (task: any) => `<span class="date-color date-color-end"></span> ${formatDate(task.end_date)}`
      },      {
        name: "status", label: "Trạng thái", align: "center", width: 120,
        template: (task) => {
          const localizedText = localizeStatus(task.status || '');
          const statusColorClass = `status-color-${task.status?.toLowerCase().replace(' ', '-') || 'default'}`;
          return `<span class="status-label ${statusColorClass}">${localizedText}</span>`;
        }
      },
    ];
    
    // CẬP NHẬT: Template để kiểm soát màu chữ tên dự án và hiển thị cảnh báo
    gantt.templates.task_text = function(start, end, task) {
        const now = new Date();
        const endDate = new Date(task.end_date || task.end || end);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let textColor = '';
        let warningIcon = '';
        let warningText = '';
        if (diffDays < 0) {
            textColor = 'color: #ff4d4f; font-weight: bold;';
            warningIcon = `<span class="lucide-icon text-red-500" title="Đã quá hạn!"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></span>`;
            warningText = ` <span class="gantt-warning-text overdue-text">(Quá hạn)</span>`;
        } else if (diffDays <= 3) {
            textColor = 'color: #faad14; font-weight: bold;';
            warningIcon = `<span class="lucide-icon text-yellow-500" title="Sắp hết hạn!"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></span>`;
            warningText = ` <span class="gantt-warning-text approaching-text">(Sắp hết hạn)</span>`;
        }
        return `<span style="${textColor}">${warningIcon} ${task.text}${warningText}</span>`;
    };
    
    // Thêm class cho task line nếu sắp hết hạn hoặc đã hết hạn
    gantt.templates.task_class = (start, end, task) => {
      const now = new Date();
      const endDate = new Date(task.end_date || task.end || end);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'gantt-task-expired'; // Đã hết hạn
      if (diffDays <= 3) return 'gantt-task-warning'; // Sắp hết hạn (<=3 ngày)
      return `gantt-project-status-${task.status?.toLowerCase().replace(' ', '-') || 'default'}`;
    };
    
    gantt.init(container);
    // === SỰ KIỆN TƯƠI NG TÁC QUAN TRỌNG NHẤT ===
    // Khi người dùng nhấp đúp chuột vào một dự án, chuyển hướng tới "Gantt Nhỏ" của dự án đó
    gantt.attachEvent("onTaskDblClick", (id) => {
      console.log(`🚀 Navigating from Portfolio Gantt to Project Gantt with ID: ${id}`);
      // Lấy userId từ localStorage hoặc AuthContext để tạo URL đầy đủ
      const user = JSON.parse(localStorage.getItem("user") || '{}');
      const userId = user.id;
      if (userId) {
        // Điều hướng đến Dashboard với các query params để render GanttTab
        navigate(`/dashboard/${userId}?view=gantt&projectId=${id}`);
      } else {
        console.error("Không tìm thấy User ID để điều hướng.");
      }
      return false; // Ngăn chặn popup chỉnh sửa mặc định của Gantt
    });
    // ...existing code...

    // ================= SỬA LỖI: SỬ DỤNG SỰ KIỆN HOVER DOM CHUẨN =================
    // Gắn sự kiện hover cho từng task line sau khi Gantt render
    setTimeout(() => {
      const lines = document.querySelectorAll('.gantt_task_line');
      lines.forEach(line => {
        const el = line as HTMLElement;
        const taskId = el.getAttribute('task_id');
        if (!taskId) return;
        el.onmouseenter = null;
        el.onmouseleave = null;
        el.addEventListener('mouseenter', (e: MouseEvent) => {
          if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          const task = gantt.getTask(taskId);
          setCustomTooltip({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            content: task,
          });
        });
        el.addEventListener('mouseleave', () => {
          tooltipTimeoutRef.current = setTimeout(() => {
            setCustomTooltip((prev) => ({ ...prev, visible: false }));
          }, 300);
        });
      });
      // GẮN THÊM SỰ KIỆN HOVER VÀO TÊN DỰ ÁN (CỘT TÊN DỰ ÁN)
      // Chỉ chọn cell tên dự án (cột đầu tiên)
      const nameCells = document.querySelectorAll('.gantt_row .gantt_cell_tree .gantt_tree_content');
      console.log('[DEBUG] Số lượng nameCells:', nameCells.length); // DEBUG LOG
      nameCells.forEach((cell, idx) => {
        const el = cell as HTMLElement;
        const row = el.closest('.gantt_row');
        if (!row) return;
        const taskId = row.getAttribute('task_id');
        if (!taskId) return;
        el.onmouseenter = null;
        el.onmouseleave = null;
        el.addEventListener('mouseenter', (e: MouseEvent) => {
          if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          const task = gantt.getTask(taskId);
          console.log(`[DEBUG] Hover vào tên dự án (cell ${idx}):`, task); // DEBUG LOG
          setCustomTooltip({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            content: task,
          });
        });
        el.addEventListener('mouseleave', () => {
          tooltipTimeoutRef.current = setTimeout(() => {
            setCustomTooltip((prev) => ({ ...prev, visible: false }));
          }, 300);
        });
      });
    }, 0);
    // =======================================================================

    (async () => {
      if (!token) {
        console.log("🎯 [Gantt Effect] Không có token, không thể gọi API");
        setIsLoading(false);
        setError("Bạn chưa đăng nhập hoặc token đã hết hạn.");
        return;
      }

      setError("");
      setIsLoading(true);
      try {
        console.log("🎯 [Gantt Effect] Fetching projects với token...");
        const API_URL = "http://localhost:5000/api/projects";
        const resp = await fetch(API_URL, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!resp.ok) throw new Error(`Lỗi API: ${resp.status}`);
        
        const data = await resp.json();
        let arr = Array.isArray(data) ? data : data.projects;
        if (!Array.isArray(arr)) arr = [];
        
        // ======================== BƯỚC XỬ LÝ DỮ LIỆU ========================
        // Chuyển đổi các trường ngày tháng từ chuỗi (string) sang đối tượng Date
        const processedData = arr.map((project: Project) => {
          const result = { 
            ...project,
            id: project._id || project.id, // Đảm bảo ID tồn tại
            text: project.project_name || project.name || project.text || 'Dự án không tên', // Ánh xạ tên dự án vào trường text
          };
          
          // Kiểm tra và chuyển đổi start_date
          if (project.start_date) {
            try {
              result.start_date = new Date(project.start_date);
              // Kiểm tra nếu ngày không hợp lệ (Invalid Date)
              if (isNaN(result.start_date.getTime())) {
                console.warn(`Dự án "${result.text}" có start_date không hợp lệ:`, project.start_date);
                result.start_date = new Date(); // Ngày mặc định: hôm nay
              }
            } catch (e) {
              console.warn(`Lỗi chuyển đổi start_date cho dự án "${result.text}":`, e);
              result.start_date = new Date();
            }
          } else {
            console.warn(`Dự án "${result.text}" thiếu start_date.`);
            result.start_date = new Date();
          }
          
          // Kiểm tra và chuyển đổi end_date
          if (project.end_date) {
            try {
              result.end_date = new Date(project.end_date);
              // Kiểm tra nếu ngày không hợp lệ hoặc end_date < start_date
              if (isNaN(result.end_date.getTime()) || result.end_date < result.start_date) {
                console.warn(`Dự án "${result.text}" có end_date không hợp lệ:`, project.end_date);
                // Ngày mặc định: start_date + 7 ngày
                result.end_date = new Date(result.start_date);
                result.end_date.setDate(result.end_date.getDate() + 7);
              }
            } catch (e) {
              console.warn(`Lỗi chuyển đổi end_date cho dự án "${result.text}":`, e);
              // Ngày mặc định: start_date + 7 ngày
              result.end_date = new Date(result.start_date);
              result.end_date.setDate(result.end_date.getDate() + 7);
            }
          } else {
            console.warn(`Dự án "${result.text}" thiếu end_date.`);
            // Ngày mặc định: start_date + 7 ngày
            result.end_date = new Date(result.start_date);
            result.end_date.setDate(result.end_date.getDate() + 7);
          }
          
          return result;
        });
        // =====================================================================
          console.log("🎯 [Gantt Effect] Dự án đã xử lý:", processedData.length);
        
        // Lưu trữ dữ liệu gốc vào state để sử dụng cho lọc
        setAllProjects(processedData);
        
        // Hiển thị trên Gantt chart
        gantt.clearAll();
        gantt.parse({ data: processedData, links: [] });

        // Gắn lại sự kiện hover cho các task line SAU KHI PARSE
        setTimeout(() => {
          const lines = document.querySelectorAll('.gantt_task_line');
          lines.forEach(line => {
            const el = line as HTMLElement;
            const taskId = el.getAttribute('task_id');
            if (!taskId) return;
            el.onmouseenter = null;
            el.onmouseleave = null;
            el.addEventListener('mouseenter', (e: MouseEvent) => {
              if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
              const task = gantt.getTask(taskId);
              setCustomTooltip({
                visible: true,
                x: e.pageX,
                y: e.pageY,
                content: task,
              });
            });
            el.addEventListener('mouseleave', () => {
              tooltipTimeoutRef.current = setTimeout(() => {
                setCustomTooltip((prev) => ({ ...prev, visible: false }));
              }, 300);
            });
          });
        }, 0);
        
        // Sau khi render, đồng bộ class màu từ task line sang row/cell tên dự án
        setTimeout(() => {
          // Cài đặt ban đầu đã đủ, không cần thêm code ở đây nữa
          // do đã dùng task_text template để điều khiển trực tiếp màu chữ
        }, 0);
        
      } catch (e) {
        console.error("🎯 [Gantt Effect] ERROR:", e);
        setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      setCustomTooltip({ visible: false, x: 0, y: 0, content: null });
      gantt.clearAll();
    };  }, [token, navigate]);
  // Theo dõi thay đổi chartView để tái khởi tạo biểu đồ Gantt khi cần
  useEffect(() => {
    if (chartView === 'gantt' && allProjects.length > 0) {
      const container = ganttContainer.current;
      if (!container) return;
      
      try {
        // Cấu hình Gantt 
        gantt.config.readonly = true;
        gantt.config.select_task = true;
        gantt.config.date_format = "%Y-%m-%d %H:%i";
        gantt.config.tooltip = false; // Tắt tooltip mặc định
        
        // Cấu hình columns nếu chưa được cài đặt
        if (!gantt.config.columns || gantt.config.columns.length === 0) {
          gantt.config.columns = [
            { 
              name: "text", label: "Tên Dự Án", tree: true, width: 300,
              template: function(task) {
                const now = new Date();
                const endDate = new Date(task.end_date || task.end);
                const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                  return `<span style="color:#ff4d4f; font-weight:bold;">${task.text}</span>`;
                } else if (diffDays <= 3) {
                  return `<span style="color:#faad14; font-weight:bold;">${task.text}</span>`;
                }
                return task.text;
              }
            },
            { name: "start_date", label: "Bắt đầu", align: "center", width: 100 },
            { name: "end_date", label: "Kết thúc", align: "center", width: 100 },
            { 
              name: "status", label: "Trạng thái", align: "center", width: 110,
              template: function(task) {
                return `<div class="gantt_cell_status">${localizeStatus(task.status || '')}</div>`;
              }
            }
          ];
        }
        
        // Reinitialize Gantt
        gantt.init(container);
        
        // Clear and parse data
        gantt.clearAll();
        gantt.parse({ data: allProjects });
        
        console.log("Gantt reinitalized after switching from another chart view");
        
        // Gắn lại sự kiện hover cho các task line SAU KHI PARSE
        setTimeout(() => {
          const lines = document.querySelectorAll('.gantt_task_line');
          console.log("Found task lines after switching view:", lines.length);
          
          lines.forEach(line => {
            const el = line as HTMLElement;
            const taskId = el.getAttribute('task_id');
            if (!taskId) return;
            el.onmouseenter = null;
            el.onmouseleave = null;
            el.addEventListener('mouseenter', (e: MouseEvent) => {
              if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
              const task = gantt.getTask(taskId);
              setCustomTooltip({
                visible: true,
                x: e.pageX,
                y: e.pageY,
                content: task,
              });
            });
            el.addEventListener('mouseleave', () => {
              tooltipTimeoutRef.current = setTimeout(() => {
                setCustomTooltip((prev) => ({ ...prev, visible: false }));
              }, 300);
            });
          });
        }, 500); // Tăng thời gian chờ để đảm bảo DOM đã render
      } catch (error) {
        console.error("Error reinitializing Gantt chart:", error);
      }
    }
  }, [chartView, allProjects]);
  
  // Component hiển thị tooltip
  const TooltipComponent = () => {
    if (!customTooltip.visible || !customTooltip.content) return null;
    return (
      <div
        style={{
          position: 'fixed',
          left: `${customTooltip.x + 15}px`,
          top: `${customTooltip.y + 15}px`,
          zIndex: 10001
        }}
      >
        <div style={{
          backgroundColor: 'rgba(31, 41, 55, 0.95)', 
          color: 'white',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
          maxWidth: '280px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            fontWeight: 'bold', 
            fontSize: '0.95rem', 
            marginBottom: '0.5rem', 
            color: '#93c5fd', 
            borderBottom: '1px solid rgba(75, 85, 99, 0.5)',
            paddingBottom: '0.5rem'
          }}>
            {customTooltip.content.text}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>Trạng thái:</strong> {localizeStatus(customTooltip.content.status || '')}
            </p>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>Bắt đầu:</strong> {customTooltip.content.start_date ? new Date(customTooltip.content.start_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
            </p>
            <p>
              <strong>Kết thúc:</strong> {customTooltip.content.end_date ? new Date(customTooltip.content.end_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
            </p>
            {/* THÊM THÔNG BÁO TRONG TOOLTIP */}
            {customTooltip.content.is_overdue && (
                <p style={{ marginTop: '0.5rem', color: '#f87171', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <span className="lucide-icon" style={{ marginRight: 4 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    </span>
                    Dự án đã quá hạn!
                </p>
            )}
            {customTooltip.content.is_approaching_deadline && (
                <p style={{ marginTop: '0.5rem', color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <span className="lucide-icon" style={{ marginRight: 4 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    </span>
                    Dự án sắp hết hạn!
                </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component biểu đồ phân tích dự án
  const ProjectChart = ({ chartType, projects }: { chartType: string; projects: Project[] }) => {
    const chartOptions = useMemo(() => {
      if (!projects?.length) return {};
      
      // Đếm số lượng dự án theo trạng thái
      const statusCounts = projects.reduce((acc, project) => {
        const status = project.status || 'default';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Chuẩn bị dữ liệu cho biểu đồ
      const statuses = Object.keys(statusCounts);
      const counts = statuses.map(status => statusCounts[status]);
      
      // Lấy màu và nhãn từ projectStatuses
      const labels = statuses.map(status => {
        const statusInfo = projectStatuses.find(s => s.value === status);
        return statusInfo?.label || status;
      });
      
      const colors = statuses.map(status => {
        const statusInfo = projectStatuses.find(s => s.value === status);
        return statusInfo?.color || '#999';
      });
      
      // Tùy theo loại biểu đồ
      switch(chartType) {
        case 'pie':
          return {
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} dự án ({d}%)'
            },
            legend: {
              orient: 'vertical',
              right: 10,
              top: 'center',
              data: labels
            },
            series: [
              {
                name: 'Trạng thái dự án',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 6,
                  borderColor: '#fff',
                  borderWidth: 2
                },
                label: {
                  show: false
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: statuses.map((status, index) => ({
                  value: counts[index],
                  name: labels[index],
                  itemStyle: { color: colors[index] }
                }))
              }
            ]
          };
          
        case 'bar':
          return {
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: labels,
              axisLabel: {
                interval: 0,
                rotate: 30
              }
            },
            yAxis: {
              type: 'value',
              name: 'Số dự án'
            },
            series: [
              {
                name: 'Số lượng',
                data: statuses.map((status, index) => ({
                  value: counts[index],
                  itemStyle: { color: colors[index] }
                })),
                type: 'bar',
                showBackground: true,
                backgroundStyle: {
                  color: 'rgba(180, 180, 180, 0.2)'
                }
              }
            ]
          };
          
        default:
          return {};
      }
    }, [chartType, projects]);
    
    return (
      <ReactECharts 
        option={chartOptions}
        style={{ height: 400, width: '100%' }}
      />
    );
  };

  // Tổng quan số lượng dự án
  const totalProjects = allProjects.length;
  const overdueProjects = allProjects.filter(p => {
    const endDate = new Date(p.end_date || p.end);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0 && (p.status !== 'Completed');
  }).length;
  const approachingProjects = allProjects.filter(p => {
    const endDate = new Date(p.end_date || p.end);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && (p.status !== 'Completed');
  }).length;
  // Thêm số lượng dự án đã hoàn thành và đang hoạt động
  const completedProjects = allProjects.filter(p => (p.status === 'Completed')).length;
  const activeProjects = allProjects.filter(p => (p.status === 'Active' || p.status === 'In Progress')).length;

  return (    <main style={{ width: "100%", height: "100%" }}>
      {/* Tổng quan số lượng dự án */}
      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        padding: '16px 24px 0 24px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: 0
      }}>
        <div style={{ fontWeight: 600, fontSize: 18, color: '#222' }}>
          Tổng số dự án: <span style={{ color: '#2563eb' }}>{totalProjects}</span>
        </div>
        <div style={{ fontWeight: 500, fontSize: 16, color: '#b91c1c', display: 'flex', alignItems: 'center' }}>
          <span className="lucide-icon" style={{ marginRight: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </span>
          Dự án đã hết hạn: <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: 4 }}>{overdueProjects}</span>
        </div>
        <div style={{ fontWeight: 500, fontSize: 16, color: '#b45309', display: 'flex', alignItems: 'center' }}>
          <span className="lucide-icon" style={{ marginRight: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </span>
          Dự án sắp hết hạn: <span style={{ color: '#f59e0b', fontWeight: 700, marginLeft: 4 }}>{approachingProjects}</span>
        </div>
        <div style={{ fontWeight: 500, fontSize: 16, color: '#2563eb', display: 'flex', alignItems: 'center' }}>
          <span className="lucide-icon" style={{ marginRight: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 17 10"/></svg>
          </span>
          Dự án đã hoàn thành: <span style={{ color: '#2563eb', fontWeight: 700, marginLeft: 4 }}>{completedProjects}</span>
        </div>
        <div style={{ fontWeight: 500, fontSize: 16, color: '#10b981', display: 'flex', alignItems: 'center' }}>
          <span className="lucide-icon" style={{ marginRight: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-circle"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          </span>
          Dự án đang hoạt động: <span style={{ color: '#10b981', fontWeight: 700, marginLeft: 4 }}>{activeProjects}</span>
        </div>
      </div>
      
      <div style={{
        backgroundColor: "#fff",
        borderBottom: "2px solid #e5e7eb",
        padding: "16px 24px",
        marginBottom: "16px"
      }}>
        {/* Phần tiêu đề và mô tả */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              📊 Tổng quan Gantt - Quản lý Dự án
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "8px 0 0 0"
            }}>
              Xem tổng quan tiến độ và trạng thái của tất cả dự án trong hệ thống
            </p>
          </div>
          
          {/* Nút chú thích - có thể ẩn/hiện */}
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            onClick={() => setShowLegend(!showLegend)}
            style={{ marginLeft: "8px", marginTop: "4px" }}
          >
            {showLegend ? "Ẩn chú thích" : "Hiện chú thích"}
          </Button>
        </div>

        {/* Phần chú thích - có thể ẩn/hiện */}
        {showLegend && (
          <div style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Chú thích:</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "12px",
            }}>
              {projectStatuses.map((status) => (
                <div key={status.value} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  fontSize: "14px",
                }}>
                  <div style={{ 
                    backgroundColor: status.color, 
                    width: "12px", 
                    height: "12px", 
                    borderRadius: "3px", 
                    marginRight: "8px" 
                  }} />
                  {status.label}
                </div>
              ))}
              
              <div style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                <div style={{ backgroundColor: '#ff4d4f', width: '12px', height: '12px', borderRadius: '3px', marginRight: '8px' }} />
                Quá hạn
              </div>
              
              <div style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                <div style={{ backgroundColor: '#faad14', width: '12px', height: '12px', borderRadius: '3px', marginRight: '8px' }} />
                Sắp hết hạn
              </div>
              
              <div style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                <div style={{ backgroundColor: '#ff4d4f', width: '2px', height: '16px', marginRight: '8px' }} />
                Ngày hiện tại
              </div>
            </div>
          </div>
        )}      </div>
      
      {/* Toolbar cho các điều khiển UI */}
      <div style={{ 
        padding: "12px 24px", 
        backgroundColor: "#f5f5f5", 
        borderBottom: "1px solid #e8e8e8", 
        marginBottom: "10px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        {/* Tìm kiếm */}
        <Input
          placeholder="Tìm kiếm dự án..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        
        {/* Bộ lọc trạng thái */}
        <Select
          mode="multiple"
          placeholder="Lọc theo trạng thái"
          value={statusFilter}
          onChange={handleStatusFilter}
          style={{ width: 240 }}
          options={projectStatuses.map(s => ({ label: s.label, value: s.value }))}
          maxTagCount="responsive"
          allowClear
        />
        
        {/* Nút reset bộ lọc */}
        {(searchText || statusFilter.length > 0) && (
          <Button 
            onClick={() => {
              setSearchText('');
              setStatusFilter([]);
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
        
        {/* Hiển thị số lượng kết quả nếu đã lọc */}
        {allProjects.length > 0 && (gantt.getTaskCount() < allProjects.length) && (
          <div style={{ marginLeft: "auto", padding: "5px 10px", backgroundColor: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: "4px" }}>
            Hiển thị: {gantt.getTaskCount()}/{allProjects.length} dự án
          </div>
        )}      </div>
        {/* Lựa chọn loại biểu đồ */}
      <div style={{ 
        marginBottom: "16px", 
        display: "flex", 
        justifyContent: "flex-end",
        padding: "0 24px" 
      }}>
        <Select
          defaultValue="gantt"
          value={chartView}
          onChange={setChartView}
          style={{ width: 180 }}
          options={[
            { 
              value: 'gantt', 
              label: 'Biểu đồ Gantt', 
              icon: <ProjectOutlined /> 
            },
            { 
              value: 'pie', 
              label: 'Biểu đồ tròn', 
              icon: <PieChartOutlined /> 
            },
            { 
              value: 'bar', 
              label: 'Biểu đồ cột', 
              icon: <BarChartOutlined /> 
            }
          ]}
          optionRender={(option) => (
            <Space>
              {option.data.icon}
              {option.label}
            </Space>
          )}
        />
      </div>
        {/* Hiển thị biểu đồ dựa trên lựa chọn */}      {chartView === 'gantt' ? (
        <div style={{ position: "relative", width: "100%", height: "650px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)" }}>
          {/* Sử dụng key={chartView} để đảm bảo React tạo lại DOM element khi chuyển đổi view */}
          <div key={chartView} ref={ganttContainer} style={{ width: "100%", height: "650px" }} />
          {isLoading && !error && (
            <div style={{
              position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
              background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Spin size="large" />
                <span>Đang khởi tạo biểu đồ Gantt...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          width: "100%", 
          height: "650px",
          backgroundColor: "#fff", 
          borderRadius: "8px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)", 
          padding: "16px",
          position: "relative"
        }}>
          <h3 style={{ margin: "0 0 16px" }}>
            {chartView === 'pie' ? 'Biểu đồ tròn phân bố dự án theo trạng thái' : 'Biểu đồ cột phân bố dự án theo trạng thái'}
          </h3>
          {isLoading ? (
            <div style={{
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              height: "calc(100% - 30px)"
            }}>
              <Spin size="large" />
            </div>
          ) : (
            <ProjectChart chartType={chartView} projects={allProjects} />
          )}
        </div>      )}
      
      {error && (
        <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(255,0,0,0.1)", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "red", fontWeight: "bold" }}>{error}</span>
        </div>
      )}
      
      {/* Component Tooltip Custom */}
      <TooltipComponent />
      
      <style>{`
        /* CSS cho trạng thái của task trên thanh Gantt */
        .gantt-project-status-hoạt-động {
          background-color: #10b981 !important; /* Màu xanh lá cây cho 'Hoạt động' */
          border-color: #059669 !important;
          color: white !important; /* Màu chữ trắng để dễ đọc */
        }
        .gantt-project-status-lên-kế-hoạch {
          background-color: #f59e0b !important; /* Màu vàng cam cho 'Lên kế hoạch' */
          border-color: #d97706 !important;
          color: white !important;
        }
        .gantt-project-status-tạm-dừng {
          background-color: #f43f5e !important; /* Màu đỏ cho 'Tạm dừng' */
          border-color: #e11d48 !important;
          color: white !important;
        }
        .gantt-project-status-hoàn-thành {
          background-color: #3b82f6 !important; /* Màu xanh dương cho 'Hoàn thành' */
          border-color: #2563eb !important;
          color: white !important;
        }
        .gantt-project-status-đang-thực-hiện {
          background-color: #8b5cf6 !important; /* Màu tím cho 'Đang thực hiện' */
          border-color: #7c3aed !important;
          color: white !important;
        }
        .gantt-project-status-trì-hoãn {
          background-color: #ef4444 !important; /* Màu đỏ tươi cho 'Trì hoãn' */
          border-color: #dc2626 !important;
          color: white !important;
        }
        .gantt-project-status-đã-hủy {
          background-color: #6b7280 !important; /* Màu xám cho 'Đã hủy' */
          border-color: #4b5563 !important;
          color: white !important;
        }

        /* CSS cho màu sắc trạng thái trong Grid */
        .status-color {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 5px;
          vertical-align: middle; /* Căn giữa chấm tròn với chữ */
        }
        .status-color-hoạt-động {
          background-color: #10b981;
        }
        .status-color-lên-kế-hoạch {
          background-color: #f59e0b;
        }
        .status-color-tạm-dừng {
          background-color: #f43f5e;
        }
        .status-color-hoàn-thành {
          background-color: #3b82f6;
        }
        .status-color-đang-thực-hiện {
          background-color: #8b5cf6;
        }
        .status-color-trì-hoãn {
          background-color: #ef4444;
        }
        .status-color-đã-hủy {
          background-color: #6b7280;
        }

        /* CSS cho màu sắc ngày bắt đầu và kết thúc trong Grid */
        .date-color {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;
          vertical-align: middle;
        }
        .date-color-start {
          background-color: #3b82f6; /* Màu xanh dương cho ngày bắt đầu */
        }
        .date-color-end {
          background-color: #ea580c; /* Màu cam cho ngày kết thúc */
        }
        .status-label {
          vertical-align: middle;
        }

        /* BƯỚC 1: CSS cho dòng được chọn */
        .gantt_row.gantt_selected {
          background-color: #eef2ff !important;
        }
        .dark .gantt_row.gantt_selected {
          background-color: #312e81 !important;
        }

        /* BƯỚC 3: CSS cho thanh cuộn */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .dark ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* CSS cho hiệu ứng cảnh báo và hết hạn */
        .gantt-task-warning {
          background-color: rgba(255, 165, 0, 0.7) !important; /* Màu cam nhạt cho cảnh báo */
        }
        .gantt-task-expired {
          background-color: rgba(255, 0, 0, 0.7) !important; /* Màu đỏ nhạt cho hết hạn */
        }

        /* Style cho icon cảnh báo trong task_text */
        .lucide-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
            margin-right: 4px;
        }
        .gantt-warning-text {
            font-size: 0.75em; /* Kích thước nhỏ hơn */
            font-weight: 600;
            margin-left: 4px;
            vertical-align: middle;
        }
        .overdue-text { color: #dc2626; }
        .approaching-text { color: #d97706; }
      `}</style>
    </main>
  );
}
