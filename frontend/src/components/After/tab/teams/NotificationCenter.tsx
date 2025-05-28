import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Settings,
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Star,
  UserPlus,
  UserMinus,
  FileText,
  Award
} from 'lucide-react';

interface Notification {
  _id: string;
  type: 'team_invite' | 'member_joined' | 'member_left' | 'project_update' | 'task_assigned' | 'deadline_reminder' | 'achievement' | 'system' | 'announcement';
  title: string;
  message: string;
  data?: {
    teamId?: string;
    teamName?: string;
    userId?: string;
    userName?: string;
    projectId?: string;
    projectName?: string;
    taskId?: string;
    taskName?: string;
    url?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  actionRequired: boolean;
  actions?: {
    label: string;
    action: 'accept' | 'decline' | 'view' | 'complete' | 'dismiss';
    url?: string;
    style: 'primary' | 'secondary' | 'success' | 'danger';
  }[];
}

interface NotificationCenterProps {
  teamId?: string;
  showHeader?: boolean;
  maxHeight?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  teamId,
  showHeader = true,
  maxHeight = '500px',
  limit = 20,
  autoRefresh = true,
  refreshInterval = 30,
  className = ""
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        filter,
        ...(teamId && { teamId }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/teams-enhanced/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setError(null);
      } else {
        setError('Không thể tải thông báo');
      }
    } catch (err) {
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  }, [limit, filter, teamId, typeFilter, searchQuery]);
  useEffect(() => {
    fetchNotifications();

    // Auto refresh
    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, autoRefresh, refreshInterval]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/teams-enhanced/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Toggle star
  const toggleStar = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n._id === notificationId);
      if (!notification) return;

      const response = await fetch(`/api/teams-enhanced/notifications/${notificationId}/star`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ starred: !notification.isStarred })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isStarred: !notif.isStarred }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  // Archive notification
  const archiveNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/teams-enhanced/notifications/${notificationId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/teams-enhanced/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Bulk operations
  const bulkMarkAsRead = async () => {
    const unreadIds = Array.from(selectedNotifications)
      .map(id => notifications.find(n => n._id === id))
      .filter(n => n && !n.isRead)
      .map(n => n!._id);

    if (unreadIds.length === 0) return;

    try {
      const response = await fetch('/api/teams-enhanced/notifications/bulk/read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds: unreadIds })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            unreadIds.includes(notif._id) 
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
        setSelectedNotifications(new Set());
      }
    } catch (err) {
      console.error('Error bulk marking as read:', err);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-4 w-4 ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' :
      'text-gray-500'
    }`;

    switch (type) {
      case 'team_invite':
        return <UserPlus className={iconClass} />;
      case 'member_joined':
        return <UserPlus className={iconClass} />;
      case 'member_left':
        return <UserMinus className={iconClass} />;
      case 'project_update':
        return <FileText className={iconClass} />;
      case 'task_assigned':
        return <CheckCircle2 className={iconClass} />;
      case 'deadline_reminder':
        return <Clock className={iconClass} />;
      case 'achievement':
        return <Award className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      case 'announcement':
        return <MessageSquare className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Format time
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return notificationTime.toLocaleDateString('vi-VN');
  };
  // Handle notification action
  const handleNotificationAction = async (notification: Notification, action: NonNullable<Notification['actions']>[0]) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    switch (action.action) {
      case 'accept':
      case 'decline':
        // Handle team invite or other accept/decline actions
        try {
          const response = await fetch(`/api/teams-enhanced/notifications/${notification._id}/action`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: action.action })
          });

          if (response.ok) {
            // Remove notification after action
            setNotifications(prev => prev.filter(n => n._id !== notification._id));
          }
        } catch (err) {
          console.error('Error handling notification action:', err);
        }
        break;
      
      case 'view':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      
      case 'complete':
        // Mark task as complete or similar
        break;
      
      case 'dismiss':
        await archiveNotification(notification._id);
        break;
    }
  };

  // Render notification item
  const renderNotificationItem = (notification: Notification) => (
    <div 
      key={notification._id}
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={selectedNotifications.has(notification._id)}
          onChange={(e) => {
            const newSet = new Set(selectedNotifications);
            if (e.target.checked) {
              newSet.add(notification._id);
            } else {
              newSet.delete(notification._id);
            }
            setSelectedNotifications(newSet);
          }}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />

        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`text-sm font-medium ${
                  notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                )}
                {notification.isStarred && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
              </div>
              
              <p className={`text-sm ${
                notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {notification.message}
              </p>
              
              {/* Team/Project info */}
              {notification.data?.teamName && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Nhóm: {notification.data.teamName}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTimeAgo(notification.createdAt)}</span>
                {notification.expiresAt && (
                  <span className="text-orange-500">
                    Hết hạn: {formatTimeAgo(notification.expiresAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={() => toggleStar(notification._id)}
                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                title={notification.isStarred ? 'Bỏ gắn sao' : 'Gắn sao'}
              >
                <Star className={`h-4 w-4 ${notification.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
              </button>
              
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Đánh dấu đã đọc"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              <div className="relative group">
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-6 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 py-1 min-w-32">
                  <button
                    onClick={() => archiveNotification(notification._id)}
                    className="w-full px-3 py-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Archive className="h-3 w-3" />
                    <span>Lưu trữ</span>
                  </button>
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="w-full px-3 py-1 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleNotificationAction(notification, action)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    action.style === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                    action.style === 'success' ? 'bg-green-500 text-white hover:bg-green-600' :
                    action.style === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Bộ lọc"
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={fetchNotifications}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Làm mới"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trạng thái:
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="unread">Chưa đọc</option>
                  <option value="starred">Đã gắn sao</option>
                  <option value="archived">Đã lưu trữ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại:
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="team_invite">Lời mời nhóm</option>
                  <option value="member_joined">Thành viên mới</option>
                  <option value="project_update">Cập nhật dự án</option>
                  <option value="task_assigned">Task được giao</option>
                  <option value="deadline_reminder">Nhắc nhở deadline</option>
                  <option value="achievement">Thành tích</option>
                  <option value="announcement">Thông báo</option>
                </select>
              </div>
            </div>
          )}

          {/* Bulk actions */}
          {selectedNotifications.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Đã chọn {selectedNotifications.size} thông báo
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={bulkMarkAsRead}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  Đánh dấu đã đọc
                </button>
                <button
                  onClick={() => setSelectedNotifications(new Set())}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Hủy chọn
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications List */}
      <div style={{ maxHeight }} className="overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải thông báo...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-6 w-6 mr-2" />
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map(renderNotificationItem)
        )}
      </div>

      {/* Load More */}
      {notifications.length >= limit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => {/* Implement load more */}}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Xem thêm thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
