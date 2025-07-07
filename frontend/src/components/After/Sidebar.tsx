// src/components/After/Sidebar.tsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Folder, Users, List, Calendar, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { Project } from "../../types/project";
import { getProjects } from "../../services/api";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const { userId } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const location = useLocation();

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        setProjectError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      try {
        const projects = await getProjects();
        const filteredProjects = projects.filter((p: Project) => p.created_by === userId && !p.is_deleted);
        const recent = filteredProjects
          .sort((a: Project, b: Project) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setRecentProjects(recent);
      } catch (err: any) {
        setProjectError("Lỗi khi lấy dự án gần đây: " + (err.response?.data?.message || err.message));
      }
    };
    fetchProjects();
  }, [userId]);

  const handleMouseEnter = (e: React.MouseEvent, content: string) => {
    if (!collapsed) return;

    try {
      const target = e.currentTarget as HTMLElement | null;
      if (!target) {
        console.warn("e.currentTarget is null in handleMouseEnter");
        return;
      }

      setHoverTimeout(
        setTimeout(() => {
          try {
            const rect = target.getBoundingClientRect();
            setTooltipContent(content);
            setTooltipPosition({
              x: rect.right + 10,
              y: rect.top,
            });
            setShowTooltip(true);
          } catch (error) {
            console.error("Error in tooltip positioning:", error);
          }
        }, 300)
      );
    } catch (error) {
      console.error("Error in handleMouseEnter:", error);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTooltip(false);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    setShowTooltip(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const mainMenu: MenuItem[] = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: `/dashboard/${userId || ":userId"}` },
    { icon: <Folder size={20} />, label: "Dự án", path: "/projects" },
    { icon: <List size={20} />, label: "Nhân viên", path: "/employees" },
    { icon: <Users size={20} />, label: "Nhóm", path: "/teams" },
    { icon: <Calendar size={20} />, label: "Gantt", path: `/dashboard/${userId || ":userId"}?view=portfolio-gantt` },
  ];

  return (
    <div
      className={`flex-shrink-0 flex flex-col h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header - always visible */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out"
          onMouseEnter={(e) => handleMouseEnter(e, collapsed ? "Mở rộng" : "Thu gọn")}
          onMouseLeave={handleMouseLeave}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {mainMenu.map((item, index) => {
            const currentPathname = location.pathname;
            const currentSearchParams = location.search;

            // Phân tích item.path thành pathname và search params
            const itemUrl = new URL(item.path, window.location.origin); // Dùng URL để parse dễ dàng hơn
            const itemPathname = itemUrl.pathname;
            const itemSearchParams = itemUrl.search;

            let isActive = false;
            if (currentPathname === itemPathname) {
              if (itemSearchParams && currentSearchParams) {
                // Cả hai đều có search params, so sánh chúng
                isActive = itemSearchParams === currentSearchParams;
              } else if (!itemSearchParams && !currentSearchParams) {
                // Cả hai đều không có search params, chỉ cần pathname khớp
                isActive = true;
              } else {
                // Một có, một không -> không active
                isActive = false;
              }
            }

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out ${
                  item.path === "#" ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${
                  isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
                } ${collapsed ? "justify-center" : ""}`}
                onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="ml-3 transition-opacity duration-200 ease-in-out">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
        {recentProjects.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              {!collapsed && "Dự án gần đây"}
            </h3>
            <ul className="space-y-1">
              {recentProjects.map((project) => (
                <li key={project._id}>
                  <Link
                    to={`/projects/${project._id}`}
                    className={`flex items-center p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      collapsed ? "justify-center" : ""
                    }`}
                    onMouseEnter={(e) => handleMouseEnter(e, project.project_name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Folder size={16} className="flex-shrink-0" />
                    {!collapsed && <span className="ml-2 truncate">{project.project_name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {projectError && !collapsed && (
          <div className="text-red-500 text-sm mt-4 p-2 rounded-md bg-red-100 dark:bg-red-900">
            {projectError}
          </div>
        )}
      </div>

      {/* Footer - always visible */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out ${
            collapsed ? "justify-center" : ""
          }`}
          onMouseEnter={(e) => handleMouseEnter(e, darkMode ? "Chế độ sáng" : "Chế độ tối")}
          onMouseLeave={handleMouseLeave}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && (
            <span className="ml-3 text-gray-700 dark:text-gray-300">
              {darkMode ? "Chế độ sáng" : "Chế độ tối"}
            </span>
          )}
        </button>
      </div>

      {showTooltip && collapsed && (
        <div
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default Sidebar;