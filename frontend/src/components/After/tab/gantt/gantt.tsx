// src/components/After/tab/gantt/gantt.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import Footer from "../../../Footer";
import TopButton from "../../../TopButton";
import Breadcrumb from "../../Breadcrumb";
import { AlertCircle, Calendar, BarChart3, Edit3, Lock, Unlock, GitBranch, RefreshCw } from "lucide-react";
import { ganttApi, GanttDataResponse } from "../../../../services/ganttApi";
import { kanbanApi } from "../../../../services/kanbanApi";
import { projectApi } from "../../../../services/projectApi";
import { userPermissionsApi } from "../../../../services/userPermissionsApi";
import { socket } from "../../../../services/socket";
import { useToast } from "../../../context/ToastContext";

export default function GanttPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [ganttData, setGanttData] = useState<GanttDataResponse | null>(null);
  const { showToast } = useToast();
  
  // Giai đoạn 2: Thêm state cho chỉnh sửa
  const [isReadonly, setIsReadonly] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

  // Lấy projectId từ URL params hoặc search params
  const currentProjectId = projectId || searchParams.get('projectId') || localStorage.getItem('selectedProjectId');

  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  // Giai đoạn 2: Toggle edit mode
  const toggleEditMode = () => {
    if (hasEditPermission) {
      const newReadonly = !isReadonly;
      setIsReadonly(newReadonly);
      gantt.config.readonly = newReadonly;
      gantt.render();
      console.log(`Gantt Chart switched to ${newReadonly ? 'readonly' : 'edit'} mode`);
    }
  };

  // Giai đoạn 2: Load user permissions
  const loadUserPermissions = async () => {
    try {
      if (!currentProjectId) return;
      
      const permissions = await userPermissionsApi.getUserPermissions(currentProjectId);
      setUserRole(permissions.userRole || '');
      
      // Kiểm tra quyền chỉnh sửa: Admin và Editor có thể chỉnh sửa từ Gantt
      const canEdit = ['Quản trị viên', 'Biên tập viên'].includes(permissions.userRole);
      setHasEditPermission(canEdit);
      
      // Phase 2: Automatically enable edit mode for authorized users
      if (canEdit) {
        setIsReadonly(false);
        gantt.config.readonly = false;
        console.log('🔓 Auto-enabled edit mode for authorized user:', permissions.userRole);
      }
      
      console.log('User permissions loaded:', {
        role: permissions.userRole,
        canEdit,
        permissions: permissions.permissions,
        autoEnabledEdit: canEdit
      });
      
    } catch (error) {
      console.warn('Could not load user permissions:', error);
      setHasEditPermission(false);
    }
  };

  // Memoize loadUserPermissions để tránh infinite loop
  const memoizedLoadUserPermissions = React.useCallback(loadUserPermissions, [currentProjectId]);

  // Helper function để fetch Gantt data
  const fetchGanttData = React.useCallback(async () => {
    try {
      if (!currentProjectId) return;
      
      const response = await ganttApi.getGanttTasks(currentProjectId);
      setGanttData(response);
      
      // Parse và reload dữ liệu vào Gantt
      const parsedData = ganttApi.parseGanttData(response);
      gantt.clearAll();
      gantt.parse(parsedData);
      
      console.log("🔄 Gantt Chart data refreshed");
    } catch (error) {
      console.error("❌ Failed to refresh Gantt data:", error);
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (!ganttContainer.current || !currentProjectId) {
      setError('Không tìm thấy ID dự án. Vui lòng chọn dự án trước khi xem Gantt Chart.');
      setIsLoading(false);
      return;
    }

    // Load user permissions first
    memoizedLoadUserPermissions();

    // Cấu hình cơ bản cho Gantt
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.readonly = isReadonly; // Điều khiển bởi state
    gantt.config.autosize = "y";
    gantt.config.scale_height = 54;
    
    // Cấu hình các cột hiển thị
    gantt.config.columns = [
      { name: "text", label: "Tên công việc", tree: true, width: 250 },
      { name: "start_date", label: "Bắt đầu", align: "center", width: 120 },
      { name: "end_date", label: "Kết thúc", align: "center", width: 120 },
      { name: "assignee", label: "Người thực hiện", align: "center", width: 150 },
      { name: "status", label: "Trạng thái", align: "center", width: 100 },
      { name: "priority", label: "Ưu tiên", align: "center", width: 80 }
    ];

    // Cấu hình scale thời gian
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F %Y" },
      { unit: "day", step: 1, format: "%j" }
    ];

    // Template để hiển thị màu sắc cho từng task
    gantt.templates.task_class = function(start, end, task) {
      let className = "";
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

    // Template cho tooltip
    gantt.templates.tooltip_text = function(start, end, task) {
      return `<b>Công việc:</b> ${task.text}<br/>
              <b>Trạng thái:</b> ${task.status}<br/>
              <b>Ưu tiên:</b> ${task.priority}<br/>
              <b>Người thực hiện:</b> ${task.assignee}<br/>
              <b>Tiến độ:</b> ${Math.round((task.progress || 0) * 100)}%<br/>
              <b>Mô tả:</b> ${task.description || 'Không có mô tả'}`;
    };

    // Giai đoạn 2: Event handlers cho chỉnh sửa
    gantt.attachEvent("onAfterTaskUpdate", async function(id, task) {
      if (isReadonly) return true; // Không xử lý nếu đang ở chế độ readonly
      
      try {
        console.log("🔄 Gantt task updated:", id, task);
        
        const ganttTask = task as any; // Cast to avoid type conflicts
        // Chuẩn bị dữ liệu để gửi API
        const updateData = {
          text: ganttTask.text,
          start_date: gantt.date.date_to_str("%Y-%m-%d")(ganttTask.start_date),
          end_date: gantt.date.date_to_str("%Y-%m-%d")(ganttTask.end_date),
          progress: ganttTask.progress
        };
        
        // Gửi cập nhật lên server using kanbanApi for better synchronization
        await kanbanApi.updateTaskFromGantt(currentProjectId, String(id), updateData);
        console.log("✅ Task successfully updated on server with Kanban sync");
        showToast("Cập nhật công việc thành công", 'success');
        
      } catch (error) {
        console.error("❌ Failed to update task:", error);
        // Rollback thay đổi nếu có lỗi
        gantt.undo();
        setError("Không thể cập nhật công việc. Vui lòng thử lại.");
      }
      
      return true;
    });

    gantt.attachEvent("onAfterTaskDrag", async function(id, mode, task) {
      if (isReadonly) return true;
      
      try {
        console.log("🔄 Gantt task dragged:", id, mode, task);
        
        const ganttTask = task as any; // Cast to avoid type conflicts
        const updateData = {
          start_date: gantt.date.date_to_str("%Y-%m-%d")(ganttTask.start_date),
          end_date: gantt.date.date_to_str("%Y-%m-%d")(ganttTask.end_date)
        };
        
        // Use kanbanApi for better Kanban synchronization
        await kanbanApi.updateTaskFromGantt(currentProjectId, String(id), updateData);
        console.log("✅ Task dates successfully updated with Kanban sync");
        showToast("Cập nhật thời gian công việc thành công", 'success');
        
      } catch (error) {
        console.error("❌ Failed to update task dates:", error);
        gantt.undo();
        setError("Không thể cập nhật ngày tháng công việc. Vui lòng thử lại.");
      }
      
      return true;
    });

    // Giai đoạn 3: Event handlers cho dependencies
    gantt.attachEvent("onAfterLinkAdd", async function(id, link) {
      if (isReadonly) return true;
      
      try {
        console.log("🔄 Gantt link added:", id, link);
        
        const dependencyData = {
          source: String(link.source),
          target: String(link.target),
          type: Number(link.type) || 0,
          lag: link.lag || 0
        };
        
        await ganttApi.createDependency(currentProjectId, dependencyData);
        console.log("✅ Dependency successfully created on server");
        showToast("Tạo liên kết phụ thuộc thành công", 'success');
        
      } catch (error) {
        console.error("❌ Failed to create dependency:", error);
        gantt.deleteLink(id);
        setError("Không thể tạo liên kết phụ thuộc. Vui lòng thử lại.");
      }
      
      return true;
    });

    gantt.attachEvent("onBeforeLinkDelete", function(id, link) {
      if (isReadonly) return false;
      
      // Thực hiện delete bất đồng bộ
      ganttApi.deleteDependency(currentProjectId, String(id))
        .then(() => {
          console.log("✅ Dependency successfully deleted on server");
        })
        .catch((error) => {
          console.error("❌ Failed to delete dependency:", error);
          setError("Không thể xóa liên kết phụ thuộc. Vui lòng thử lại.");
          // Re-add the link if deletion failed
          setTimeout(() => {
            gantt.addLink({
              id: id,
              source: link.source,
              target: link.target,
              type: link.type
            });
          }, 100);
        });
      
      return true; // Allow deletion to proceed immediately on UI
    });

    // Khởi tạo Gantt
    gantt.init(ganttContainer.current);

    // Tải dữ liệu từ API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Lấy thông tin project
        const projectDetails = await projectApi.getProject(currentProjectId);
        setProjectInfo(projectDetails);

        // Lấy dữ liệu Gantt
        const response = await ganttApi.getGanttTasks(currentProjectId);
        setGanttData(response);

        // Parse và load dữ liệu vào Gantt
        const parsedData = ganttApi.parseGanttData(response);
        gantt.parse(parsedData);

        console.log("✅ Gantt Chart loaded successfully:", {
          tasksCount: response.data.length,
          projectName: response.project.project_name
        });

      } catch (error: any) {
        console.error("❌ Failed to load Gantt data:", error);
        setError(error.response?.data?.message || error.message || "Không thể tải dữ liệu Gantt Chart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup khi component bị hủy
    return () => {
      gantt.clearAll();
    };
  }, [currentProjectId, isReadonly, memoizedLoadUserPermissions, showToast]); // Add showToast dependency

  // Socket management useEffect
  useEffect(() => {
    if (currentProjectId && socket) {
      console.log('🔌 Setting up socket listeners for project:', currentProjectId);
      
      // Join project room để nhận updates
      socket.emit('join_project', currentProjectId);
      
      // Lắng nghe cập nhật từ Kanban board
      const handleKanbanUpdate = (updatedTasks: any[]) => {
        console.log('🔄 Received Kanban update, refreshing Gantt data...');
        // Refresh Gantt data khi có thay đổi từ Kanban
        if (!isReadonly) {
          // Chỉ refresh khi đang ở chế độ readonly để tránh conflict
          setTimeout(() => {
            fetchGanttData();
          }, 1000);
        }
      };
      
      // Lắng nghe cập nhật task cụ thể
      const handleTaskUpdate = (updatedTask: any) => {
        console.log('🔄 Received task update:', updatedTask);
        // Cập nhật task specific trong Gantt nếu cần
      };
      
      // Lắng nghe auto-schedule events
      const handleAutoScheduleUpdate = (data: any) => {
        console.log('🔄 Received auto-schedule update:', data);
        // Refresh Gantt data sau khi auto-schedule
        setTimeout(() => {
          fetchGanttData();
        }, 1000);
      };
      
      socket.on('kanban:updated', handleKanbanUpdate);
      socket.on('gantt:task_updated', handleTaskUpdate);
      socket.on('gantt:auto_scheduled', handleAutoScheduleUpdate);
      
      return () => {
        console.log('🔌 Cleaning up socket listeners');
        socket.off('kanban:updated', handleKanbanUpdate);
        socket.off('gantt:task_updated', handleTaskUpdate);
        socket.off('gantt:auto_scheduled', handleAutoScheduleUpdate);
        socket.emit('leave_project', currentProjectId);
      };
    }
  }, [currentProjectId, isReadonly, fetchGanttData, showToast]); // Add showToast dependency

  // Giai đoạn 3: Auto-schedule function
  const handleAutoSchedule = async () => {
    if (!hasEditPermission || !currentProjectId) return;
    
    try {
      setIsAutoScheduling(true);
      console.log("🔄 Starting auto-schedule for project:", currentProjectId);
      
      const result = await ganttApi.autoScheduleTasks(currentProjectId);
      console.log("✅ Auto-schedule completed:", result);
      
      // Refresh Gantt data to show updated schedules
      await fetchGanttData();
      
      // Show success message
      setError(''); // Clear any previous errors
      showToast(`Tự động sắp xếp thành công ${result.updatedTasks} công việc`, 'success');
      
    } catch (error: any) {
      console.error("❌ Auto-schedule failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể tự động sắp xếp lịch trình";
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsAutoScheduling(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Breadcrumb items={["Dashboard", "Gantt Chart"]} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Đang tải Gantt Chart...</p>
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
        <Breadcrumb items={["Dashboard", "Gantt Chart"]} />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Header thông tin dự án */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Gantt Chart {projectInfo?.project_name && `- ${projectInfo.project_name}`}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Xem tổng quan lịch trình và tiến độ công việc
                </p>
              </div>
              
              {/* Controls và Thống kê */}
              <div className="flex items-center gap-4">
                {/* Auto-Schedule Button */}
                {hasEditPermission && ganttData && ganttData.links && ganttData.links.length > 0 && (
                  <button
                    onClick={handleAutoSchedule}
                    disabled={isAutoScheduling || isReadonly}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isAutoScheduling || isReadonly
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                        : 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-300'
                    }`}
                    title="Tự động sắp xếp lịch trình dựa trên liên kết phụ thuộc"
                  >
                    <RefreshCw size={16} className={isAutoScheduling ? 'animate-spin' : ''} />
                    <span className="text-sm font-medium">
                      {isAutoScheduling ? 'Đang xử lý...' : 'Tự động sắp xếp'}
                    </span>
                  </button>
                )}

                {/* Toggle Edit Mode Button */}
                {hasEditPermission && (
                  <button
                    onClick={toggleEditMode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isReadonly 
                        ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300' 
                        : 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300'
                    }`}
                    title={isReadonly ? 'Bật chế độ chỉnh sửa' : 'Tắt chế độ chỉnh sửa'}
                  >
                    {isReadonly ? <Lock size={16} /> : <Unlock size={16} />}
                    <span className="text-sm font-medium">
                      {isReadonly ? 'Chỉ xem' : 'Chỉnh sửa'}
                    </span>
                  </button>
                )}

                {/* User Role Badge */}
                {userRole && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userRole === 'Quản trị viên' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    userRole === 'Biên tập viên' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {userRole}
                  </span>
                )}

                {/* Thống kê nhanh */}
                {ganttData && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-blue-500" />
                      <span>{ganttData.data.length} công việc</span>
                    </div>
                    {ganttData.links && ganttData.links.length > 0 && (
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-purple-500" />
                        <span>{ganttData.links.length} liên kết</span>
                      </div>
                    )}
                    {projectInfo && (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-green-500" />
                          <span>{new Date(projectInfo.start_date).toLocaleDateString('vi-VN')} - {new Date(projectInfo.end_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode Notice */}
            {!isReadonly && hasEditPermission && (
              <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                <Edit3 size={16} className="mr-2" />
                <span className="text-sm">
                  <strong>Chế độ chỉnh sửa đang bật:</strong> Bạn có thể kéo thả để thay đổi ngày, chỉnh sửa tên task, thay đổi tiến độ công việc, và tạo liên kết phụ thuộc giữa các tasks.
                </span>
              </div>
            )}

            {/* Dependencies Guide */}
            {!isReadonly && hasEditPermission && ganttData && ganttData.data.length > 1 && (
              <div className="mt-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300">
                <div className="flex items-start gap-2">
                  <GitBranch size={16} className="mt-0.5" />
                  <div className="text-sm">
                    <strong>Tạo liên kết phụ thuộc:</strong> Kéo từ điểm kết thúc của task nguồn đến điểm bắt đầu của task đích để tạo liên kết phụ thuộc.
                    <br />
                    <span className="text-xs opacity-75">Nhấp chuột phải vào liên kết để xóa.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}

          {/* Gantt Chart Container */}
          {!error && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div 
                ref={ganttContainer}
                style={{ width: '100%', height: '600px' }}
                className="gantt-container"
              />
            </div>
          )}

          {/* Legend và Dependencies Info */}
          {ganttData && ganttData.data.length > 0 && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Legend */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Chú thích trạng thái:</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Đang làm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gray-400 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Cần làm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-red-500 rounded border-2 border-red-700"></div>
                      <span className="text-gray-600 dark:text-gray-400">Công việc quan trọng</span>
                    </div>
                  </div>
                </div>

                {/* Dependencies Info */}
                {ganttData.links && ganttData.links.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Liên kết phụ thuộc:</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Tổng số liên kết:</span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">{ganttData.links.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <GitBranch size={12} />
                        <span>Các tasks được liên kết theo thứ tự ưu tiên</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
          border: 2px solid #ef4444 !important;
          box-shadow: 0 0 0 1px #ef4444 !important;
        }

        .gantt_task_line {
          border-radius: 4px;
        }

        .gantt_task_progress {
          border-radius: 4px;
        }

        .gantt_grid_scale .gantt_grid_head_cell,
        .gantt_task_scale .gantt_scale_cell {
          background: #f9fafb;
          border-color: #e5e7eb;
        }

        .dark .gantt_grid_scale .gantt_grid_head_cell,
        .dark .gantt_task_scale .gantt_scale_cell {
          background: #374151;
          border-color: #4b5563;
          color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
