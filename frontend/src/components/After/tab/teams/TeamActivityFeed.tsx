import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  UserPlus, 
  UserMinus,
  Settings,
  Star,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface ActivityItem {
  _id: string;
  type: 'create' | 'update' | 'delete' | 'join' | 'leave' | 'message' | 'project' | 'task' | 'setting';
  action: string;
  description: string;
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  teamId: string;
  teamName: string;
  metadata?: {
    projectName?: string;
    taskName?: string;
    messageContent?: string;
    changes?: string[];
  };
  timestamp: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface TeamActivityFeedProps {
  teamId?: string; // Nếu có teamId thì chỉ hiển thị hoạt động của nhóm đó
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const TeamActivityFeed: React.FC<TeamActivityFeedProps> = ({
  teamId,
  limit = 20,
  showFilters = true,
  className = ""
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        filter,
        timeRange,
        ...(teamId && { teamId })
      });

      const response = await fetch(`/api/teams-enhanced/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data || []);
      } else {
        setError('Không thể tải lịch sử hoạt động');
      }
    } catch (err) {
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [teamId, filter, timeRange, limit]);

  // Get icon based on activity type
  const getActivityIcon = (type: string, importance: string) => {
    const iconProps = {
      className: `h-4 w-4 ${getImportanceColor(importance)}`
    };

    switch (type) {
      case 'create':
        return <UserPlus {...iconProps} />;
      case 'update':
        return <Settings {...iconProps} />;
      case 'delete':
        return <Trash2 {...iconProps} />;
      case 'join':
        return <UserPlus {...iconProps} />;
      case 'leave':
        return <UserMinus {...iconProps} />;
      case 'message':
        return <MessageSquare {...iconProps} />;
      case 'project':
        return <GitBranch {...iconProps} />;
      case 'task':
        return <CheckCircle2 {...iconProps} />;
      case 'setting':
        return <Settings {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  // Get color based on importance
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Format time difference
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} tháng trước`;
  };

  // Render activity item
  const renderActivityItem = (activity: ActivityItem) => (
    <div 
      key={activity._id}
      className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      {/* Avatar or Icon */}
      <div className="flex-shrink-0">
        {activity.user.avatar ? (
          <img
            src={activity.user.avatar}
            alt={activity.user.fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {activity.user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-medium">{activity.user.fullName}</span>
              {' '}{activity.description}
              {!teamId && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {' '}trong nhóm {activity.teamName}
                </span>
              )}
            </p>
            
            {/* Metadata */}
            {activity.metadata && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activity.metadata.projectName && (
                  <span>Dự án: {activity.metadata.projectName}</span>
                )}
                {activity.metadata.taskName && (
                  <span>Task: {activity.metadata.taskName}</span>
                )}
                {activity.metadata.messageContent && (
                  <span className="italic">"{activity.metadata.messageContent}"</span>
                )}
                {activity.metadata.changes && activity.metadata.changes.length > 0 && (
                  <span>Thay đổi: {activity.metadata.changes.join(', ')}</span>
                )}
              </div>
            )}
          </div>

          {/* Activity Icon */}
          <div className="flex items-center space-x-2 ml-2">
            {getActivityIcon(activity.type, activity.importance)}
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatTimeAgo(activity.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải hoạt động...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <span className="ml-2 text-red-600 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {teamId ? 'Hoạt động nhóm' : 'Hoạt động gần đây'}
          </h3>
        </div>
        
        <button
          onClick={fetchActivities}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loại hoạt động:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="create">Tạo mới</option>
              <option value="update">Cập nhật</option>
              <option value="join">Tham gia</option>
              <option value="leave">Rời khỏi</option>
              <option value="message">Tin nhắn</option>
              <option value="project">Dự án</option>
              <option value="task">Task</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Thời gian:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map(renderActivityItem)
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có hoạt động nào</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {activities.length >= limit && (
        <div className="text-center mt-6">
          <button
            onClick={() => {/* Implement load more */}}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Xem thêm hoạt động
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamActivityFeed;
