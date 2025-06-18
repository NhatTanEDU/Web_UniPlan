// components/Breadcrumb.tsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Home, Copy } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { projectApi } from "../../services/projectApi";

// Helper function để làm sạch tên dự án, loại bỏ ID
const cleanProjectName = (projectName: string): string => {
  if (!projectName) return projectName;
  
  // Loại bỏ các pattern ID phổ biến:
  // - " - 123456789" (dấu gạch ngang + số)
  // - " 123456789" (chỉ số ở cuối)
  // - Các ID dài hơn 8 ký tự
  return projectName
    .replace(/\s*-\s*\d{8,}$/g, '') // Loại bỏ " - 123456789" ở cuối
    .replace(/\s+\d{8,}$/g, '') // Loại bỏ " 123456789" ở cuối
    .trim();
};

// Định nghĩa kiểu cho từng mục breadcrumb
interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: (string | BreadcrumbItem)[]; // Có thể truyền string hoặc object
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items: propItems = ["Dashboard"] }) => {
  const { userId } = useContext(AuthContext);
  const location = useLocation();
  const params = useParams<{ projectId: string; teamId: string }>();
  const [searchParams] = useSearchParams(); // Để đọc query params

  const [isKanbanPage, setIsKanbanPage] = useState(false);
  const [isGanttPage, setIsGanttPage] = useState(false);
  const [kanbanProjectName, setKanbanProjectName] = useState<string | null>(null);
  const [loadingProjectName, setLoadingProjectName] = useState(false);
  
  const [isTeamDetailPage, setIsTeamDetailPage] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [loadingTeamName, setLoadingTeamName] = useState(false);
  const [isPortfolioGanttView, setIsPortfolioGanttView] = useState(false); // State mới cho Portfolio Gantt
  
  useEffect(() => {
    const kanbanPathRegex = /^\/projects\/([a-zA-Z0-9-]+)\/kanban$/;
    const ganttPathRegex = /^\/projects\/([a-zA-Z0-9-]+)\/kanban\/gantt$/;
    const teamDetailPathRegex = /^\/teams\/([a-zA-Z0-9-]+)/;
    const dashboardPathRegex = /^\/dashboard\/([a-zA-Z0-9-]+)$/;

    const kanbanMatch = location.pathname.match(kanbanPathRegex);
    const ganttMatch = location.pathname.match(ganttPathRegex);
    const teamMatch = location.pathname.match(teamDetailPathRegex);
    const dashboardMatch = location.pathname.match(dashboardPathRegex);
    
    const currentViewQueryParam = searchParams.get('view');

    // Reset states trước
    setIsKanbanPage(false);
    setIsGanttPage(false);
    setIsTeamDetailPage(false);
    setIsPortfolioGanttView(false); // Reset state mới

    if (dashboardMatch && currentViewQueryParam === 'portfolio-gantt') {
      setIsPortfolioGanttView(true);
    } else if (dashboardMatch && currentViewQueryParam === 'gantt' && searchParams.get('projectId')) {
      const projectId = searchParams.get('projectId');
      setIsGanttPage(true); // "Gantt Nhỏ" của một dự án cụ thể trên dashboard
      // ... (logic fetch project name nếu cần cho breadcrumb "Gantt Nhỏ")
      if (projectId) {
        setLoadingProjectName(true);
        projectApi.getProject(projectId)
          .then(project => {
            const cleanName = cleanProjectName(project.project_name || `Dự án ${projectId.substring(0, 8)}...`);
            setKanbanProjectName(cleanName);
            setLoadingProjectName(false);
          })
          .catch(error => {
            console.error('Error fetching project for Gantt Nhỏ view:', error);
            setKanbanProjectName(`Dự án ${projectId.substring(0, 8)}...`);
            setLoadingProjectName(false);
          });
      } else {
        setLoadingProjectName(false);
      }
    } else if (ganttMatch && params.projectId) { // Logic cũ cho /projects/:id/kanban/gantt
      setIsGanttPage(true);
      setIsKanbanPage(false);
      setIsTeamDetailPage(false);
      setLoadingProjectName(true);
      
      // Fetch project name using API
      projectApi.getProject(params.projectId)
        .then(project => {
          const cleanName = cleanProjectName(project.project_name || `Dự án ${params.projectId?.substring(0, 8)}...`);
          setKanbanProjectName(cleanName);
          setLoadingProjectName(false);
        })
        .catch(error => {
          console.error('Error fetching project:', error);
          setKanbanProjectName(`Dự án ${params.projectId?.substring(0, 8)}...`);
          setLoadingProjectName(false);
        });
    } else if (kanbanMatch && params.projectId) {
      setIsKanbanPage(true);
      setIsGanttPage(false);
      setIsTeamDetailPage(false);
      setLoadingProjectName(true);
      
      // Fetch project name using API
      projectApi.getProject(params.projectId)
        .then(project => {
          const cleanName = cleanProjectName(project.project_name || `Dự án ${params.projectId?.substring(0, 8)}...`);
          setKanbanProjectName(cleanName);
          setLoadingProjectName(false);
        })
        .catch(error => {
          console.error('Error fetching project:', error);
          setKanbanProjectName(`Dự án ${params.projectId?.substring(0, 8)}...`);
          setLoadingProjectName(false);
        });
    } else if (teamMatch && params.teamId) {
      setIsTeamDetailPage(true);
      setIsKanbanPage(false);
      setIsGanttPage(false);
      setLoadingTeamName(true);
      // TODO: Fetch team name using params.teamId
      // Ví dụ: getTeamById(params.teamId).then(team => setTeamName(team.name));
      // Hiện tại, dùng placeholder:
      setTimeout(() => { // Giả lập API call
        setTeamName(`Nhóm ${params.teamId?.substring(0, 8)}...`);
        setLoadingTeamName(false);
      }, 300);
    } 
  }, [location.pathname, location.search, params.projectId, params.teamId, searchParams]); // Thêm searchParams vào dependency array
  // Copy path
  const handleCopy = () => {
    navigator.clipboard.writeText(`${location.pathname}${location.search}`);
  };

  // Ưu tiên hiển thị Breadcrumb cho Portfolio Gantt nếu state là true
  if (isPortfolioGanttView) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Link to={`/dashboard/${userId || ""}`} className="hover:text-primary flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
            Tổng quan Gantt
          </span>
           <button
            onClick={handleCopy}
            className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Copy đường dẫn"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Handle team detail page breadcrumb
  if (isTeamDetailPage) {
    const currentPath = location.pathname;
    const isInfoTab = currentPath.includes('/info');
    const isMembersTab = currentPath.includes('/members');
    const isProjectsTab = currentPath.includes('/projects');
    const isSettingsTab = currentPath.includes('/settings');
    
    let currentTabName = 'Chi tiết';
    if (isInfoTab) currentTabName = 'Thông tin';
    else if (isMembersTab) currentTabName = 'Thành viên';
    else if (isProjectsTab) currentTabName = 'Dự án';
    else if (isSettingsTab) currentTabName = 'Cài đặt';

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Link to={`/dashboard/${userId || ""}`} className="hover:text-primary flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/teams" className="hover:text-primary flex items-center">
            Nhóm
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
            {loadingTeamName ? "Đang tải..." : teamName || "Chi tiết nhóm"}
          </span>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300">
            {currentTabName}
          </span>
          <button
            onClick={handleCopy}
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Copy đường dẫn"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Handle Gantt page breadcrumb
  if (isGanttPage) {
    // Check if we're in dashboard with gantt view
    const urlParams = new URLSearchParams(location.search);
    const isDashboardGantt = location.pathname.includes('/dashboard/') && urlParams.get('view') === 'gantt';
    const projectIdFromUrl = urlParams.get('projectId') || params.projectId;

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Link to={`/dashboard/${userId || ""}`} className="hover:text-primary flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          {isDashboardGantt ? (
            <>
              <Link
                to={`/projects/${projectIdFromUrl}/kanban`}
                className="hover:text-primary flex items-center"
              >
                {loadingProjectName ? "Đang tải..." : kanbanProjectName || "Dự án"}
              </Link>
              <span>/</span>
              <Link
                to={`/projects/${projectIdFromUrl}/kanban`}
                className="hover:text-primary flex items-center"
              >
                Kanban
              </Link>
              <span>/</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                Gantt
              </span>
            </>
          ) : (
            <>
              <Link
                to="/projects"
                className="hover:text-primary flex items-center"
              >
                Dự án
              </Link>
              <span>/</span>
              <Link
                to={`/projects/${projectIdFromUrl}/kanban`}
                className="hover:text-primary flex items-center"
              >
                {loadingProjectName ? "Đang tải..." : kanbanProjectName || "Dự án"}
              </Link>
              <span>/</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                Gantt
              </span>
            </>
          )}
          <button
            onClick={handleCopy}
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Copy đường dẫn"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (isKanbanPage) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Link to={`/dashboard/${userId || ""}`} className="hover:text-primary flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="hover:text-primary flex items-center">
            {loadingProjectName ? "Đang tải..." : kanbanProjectName || "Dự án"}
          </span>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
            Kanban
          </span>
          <button
            onClick={handleCopy}
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Copy đường dẫn"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Logic cũ cho các trang không phải Kanban
  const normalizedItems: BreadcrumbItem[] = propItems.map((item) =>
    typeof item === "string"
      ? { label: item, path: item === "Dashboard" ? `/dashboard/${userId || ""}` : undefined }
      : item
  );

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        {/* Link Dashboard gốc */}
        <Link to={`/dashboard/${userId || ""}`} className="hover:text-primary flex items-center">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        {normalizedItems.slice(1).map((item, index) => (
          <React.Fragment key={index}>
            <span>/</span>
            {item.path ? (
              <Link to={item.path} className="hover:text-primary flex items-center">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
        {/* Nút copy path */}
        <button
          onClick={handleCopy}
          className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title="Copy đường dẫn"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
};
export default Breadcrumb;
