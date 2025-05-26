// components/Breadcrumb.tsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Home, Copy } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

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
  const params = useParams<{ projectId: string }>(); // Lấy projectId từ URL

  const [isKanbanPage, setIsKanbanPage] = useState(false);
  const [kanbanProjectName, setKanbanProjectName] = useState<string | null>(null);
  const [loadingProjectName, setLoadingProjectName] = useState(false);

  useEffect(() => {
    const kanbanPathRegex = /^\/projects\/([a-zA-Z0-9-]+)\/kanban$/;
    const match = location.pathname.match(kanbanPathRegex);

    if (match && params.projectId) {
      setIsKanbanPage(true);
      setLoadingProjectName(true);
      // TODO: Fetch project name using params.projectId
      // Ví dụ: getProjectById(params.projectId).then(project => setKanbanProjectName(project.name));
      // Hiện tại, dùng placeholder:
      setTimeout(() => { // Giả lập API call
        setKanbanProjectName(`Dự án ${params.projectId?.substring(0, 8)}...`);
        setLoadingProjectName(false);
      }, 300);
    } else {
      setIsKanbanPage(false);
      setKanbanProjectName(null);
    }
  }, [location.pathname, params.projectId]);

  // Copy path
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.pathname);
  };

  if (isKanbanPage) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Link to={`/dashboard/${userId || ""}`} className="hover:text-primary flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-primary flex items-center">
            Dự án
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
            {loadingProjectName ? "Đang tải..." : kanbanProjectName || "Bảng Kanban"}
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

  // Tạo path đầy đủ cho copy (biến này không được sử dụng trong code gốc, nhưng giữ lại nếu bạn cần)
  // const fullPath = normalizedItems.map(i => i.path || '').filter(Boolean).join('/');

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
