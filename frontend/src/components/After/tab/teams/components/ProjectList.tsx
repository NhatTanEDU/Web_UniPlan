/**
 * ProjectList Component
 * --------------------
 * Enhanced project list component for team detail view
 * - Modern table design with advanced features
 * - Project status indicators and progress tracking
 * - Project actions (edit, remove, view)
 * - Empty states and loading states
 * - Responsive design
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  Archive
} from 'lucide-react';
import { TeamProject } from "../../../../../services/teamProjectApi";
import { Project } from "../../../../../types/project";
import ProjectEditModal from "../../Project/ProjectEditModal";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "./LoadingSpinner";
import { 
  PROJECT_STATUS_OPTIONS, 
  getProjectStatusLabel, 
  getProjectStatusColorClasses,
  getProjectStatusIconColor,
  getProjectPriorityLabel,
  getProjectPriorityColorClasses
} from '../../../../../constants/projectLabels';

interface Props {
  projects: TeamProject[];
  loading: boolean;
  error: string | null;
  onUpdate: (projectId: string, data: Partial<TeamProject>) => Promise<void>;
  onRemove: (projectId: string) => Promise<void>;
}

export default function ProjectList({ projects, loading, error, onUpdate, onRemove }: Props) {
  const navigate = useNavigate();
  const [editProject, setEditProject] = useState<TeamProject | null>(null);
  const [confirm, setConfirm] = useState<{ visible: boolean; id?: string }>({ visible: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

    // Hàm tạo icon cho status với màu sắc động
  const getStatusIcon = (status: string) => {
    const iconBaseClass = "h-4 w-4";
    const colorClass = getProjectStatusIconColor(status);

    switch (status) {
      case 'Completed':
        return <CheckCircle className={`${iconBaseClass} ${colorClass}`} />;
      case 'Active':
        return <PlayCircle className={`${iconBaseClass} ${colorClass}`} />;
      case 'On Hold':
        return <PauseCircle className={`${iconBaseClass} ${colorClass}`} />;
      case 'Planning':
        return <Clock className={`${iconBaseClass} ${colorClass}`} />;
      case 'Cancelled':
        return <AlertCircle className={`${iconBaseClass} ${colorClass}`} />;
      case 'Archived':
        return <Archive className={`${iconBaseClass} ${colorClass}`} />;
      default:
        return <AlertCircle className={`${iconBaseClass} ${colorClass}`} />;
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa đặt';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải danh sách dự án..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Lỗi: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Convert TeamProject to Project for the modal
  const convertToProject = (teamProject: TeamProject): Project => ({
    _id: teamProject._id,
    project_name: teamProject.project_name,
    description: teamProject.description,
    start_date: teamProject.start_date,
    end_date: teamProject.end_date,
    status: teamProject.status,
    priority: teamProject.priority,
    project_type_id: teamProject.project_type_id,
    created_by: teamProject.created_by,
    created_at: teamProject.created_at
  });

  return (
    <div className="space-y-4">
      {/* Header with search and filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dự án nhóm ({filteredProjects.length})
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              {PROJECT_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Empty state */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Không có dự án phù hợp</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-gray-200 dark:divide-gray-700">              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loại dự án</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ưu tiên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày bắt đầu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày kết thúc</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map(p => (
                  <tr 
                    key={p._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={(e) => {
                      // Kiểm tra nếu click vào button thì không điều hướng
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      // Điều hướng đến trang Kanban của dự án
                      navigate(`/projects/${p._id}/kanban`);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {p.project_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {p.project_type_id?.name || 'Chưa xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getProjectStatusColorClasses(p.status)}`}>
                        {getStatusIcon(p.status)}
                        <span className="ml-1">{getProjectStatusLabel(p.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectPriorityColorClasses(p.priority)}`}>
                        {getProjectPriorityLabel(p.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">{formatDate(p.start_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400">{formatDate(p.end_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditProject(p)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => window.open(`/projects/${p._id}`, '_blank')} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors" title="Xem">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirm({ visible: true, id: p._id })} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal chỉnh sửa project */}
      {editProject && (
        <ProjectEditModal
          editProject={convertToProject(editProject)}
          setEditProject={(p: Project | null) => {
            if (p) {
              // Convert back to TeamProject
              const teamProject: TeamProject = {
                ...editProject,
                project_name: p.project_name,
                description: p.description,
                start_date: p.start_date,
                end_date: p.end_date,
                status: p.status as any,
                priority: p.priority as any,
                project_type_id: p.project_type_id
              };
              setEditProject(teamProject);
            } else {
              setEditProject(null);
            }
          }}
          onSubmit={async e => {
            e.preventDefault();
            await onUpdate(editProject._id, editProject);
            setEditProject(null);
          }}
        />
      )}

      {/* Confirm xóa project */}
      <ConfirmModal
        isOpen={confirm.visible}
        title="⚠️ Cảnh báo"
        message="Xóa project sẽ gỡ khỏi nhóm và mất thông tin liên quan."
        onCancel={() => setConfirm({ visible: false })}
        onConfirm={() => {
          if (confirm.id) onRemove(confirm.id);
          setConfirm({ visible: false });
        }}
      />
    </div>
  );
}