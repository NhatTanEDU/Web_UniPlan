// src/components/After/tab/gantt/gantt.tsx
import React, { useEffect, useRef, useState } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import './gantt-custom.css';

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
  [key: string]: any;
}

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
    
    // Template để kiểm soát màu chữ tên dự án
    gantt.templates.task_text = function(start, end, task) {
      const now = new Date();
      const endDate = new Date(task.end_date || task.end || end);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let textColor = '';
      if (diffDays < 0) {
        // Đã hết hạn - chữ màu đỏ
        textColor = 'color: #ff4d4f; font-weight: bold;';
      } else if (diffDays <= 3) {
        // Sắp hết hạn (<=3 ngày) - chữ màu vàng đậm
        textColor = 'color: #faad14; font-weight: bold;';
      }
      
      return `<span style="${textColor}">${task.text}</span>`;
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
    };
  }, [token, navigate]);
  return (
    <main style={{ width: "100%", height: "100%" }}>
      {/* Header tiêu đề */}
      <div style={{
        backgroundColor: "#fff",
        borderBottom: "2px solid #e5e7eb",
        padding: "16px 24px",
        marginBottom: "16px"
      }}>
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
      
      <div style={{ position: "relative", width: "100%", height: "650px" }}>
        <div ref={ganttContainer} style={{ width: "100%", height: "650px" }} />
        {isLoading && !error && (
          <div style={{
            position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span style={{ marginLeft: 16, color: "#555" }}>Đang khởi tạo biểu đồ Gantt...</span>
            </div>
          </div>
        )}
        {error && (
          <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(255,0,0,0.1)", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "red", fontWeight: "bold" }}>{error}</span>
          </div>
        )}
      </div>
      
      {/* Component Tooltip Custom */}
      {customTooltip.visible && customTooltip.content && (
        <div
          style={{
            position: 'fixed',
            left: `${customTooltip.x + 20}px`,
            top: `${customTooltip.y + 20}px`,
            zIndex: 1000,
            pointerEvents: 'none',
            transition: 'opacity 0.2s, transform 0.2s',
            opacity: 1,
            transform: 'translateY(0)',
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
            </div>
          </div>
        </div>
      )}
      
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
      `}</style>
    </main>
  );
}
