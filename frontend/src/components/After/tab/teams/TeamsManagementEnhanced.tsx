import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Shield,
  Crown,
  Bell,
  Heart,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import teamsEnhancedApi from '../../../../services/teamsEnhanced.api';
import useTeamRealTime from '../../../../hooks/useTeamRealTime';
import TeamActivityFeed from './TeamActivityFeed';
import TeamHealthCheck from './TeamHealthCheck';
import TeamRecommendations from './TeamRecommendations';
import NotificationCenter from './NotificationCenter';

interface Team {
  _id: string;
  name: string;
  description: string;
  color: string;
  isPublic: boolean;
  memberCount: number;
  projectCount: number;
  completionRate: number;
  userRole: 'leader' | 'admin' | 'member';
  createdAt: string;
  recentActivity: number;
}

interface TeamStatsData {
  overview: {
    totalTeams: number;
    teamsAsLeader: number;
    teamsAsAdmin: number;
    teamsAsMember: number;
    publicTeams: number;
    privateTeams: number;
  };
  projects: {
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    pendingProjects: number;
  };
  members: {
    totalMembers: number;
    averageTeamSize: number;
  };
}

const TeamsManagementEnhanced: React.FC = () => {  // Auth context
  const { userId } = useContext(AuthContext); // Will be used for user-specific team filtering

  // State management
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<TeamStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'projects' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Enhanced component states
  const [activeTab, setActiveTab] = useState<'teams' | 'activity' | 'health' | 'recommendations' | 'notifications'>('teams');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeamForHealth, setSelectedTeamForHealth] = useState<string | null>(null);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  // Real-time updates
  const { isConnected, realtimeEvents } = useTeamRealTime({
    onTeamUpdate: (event) => {
      console.log('Team update received:', event);
      // Refresh teams when there's an update
      fetchTeams();
    },
    onNotification: (notification) => {
      console.log('New notification:', notification);
      setNewNotificationsCount(prev => prev + 1);
    },
    onActivity: (activity) => {
      console.log('New activity:', activity);
      // Could trigger activity feed refresh
    }
  });  // Fetch teams and stats using API service
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await teamsEnhancedApi.searchTeams({
        query: searchQuery,
        sort: `${sortBy}-${sortOrder}`
        // TODO: Add userId for personalized results when backend supports it
      });
      
      setTeams(data.data || []);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await teamsEnhancedApi.getOverviewStats();
      setStats(data.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, []);
  useEffect(() => {
    fetchTeams();
    fetchStats();
  }, [fetchTeams, fetchStats]);

  // Filter and sort teams
  const filteredAndSortedTeams = teams
    .filter(team => {
      if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'members':
          aValue = a.memberCount;
          bValue = b.memberCount;
          break;
        case 'projects':
          aValue = a.projectCount;
          bValue = b.projectCount;
          break;
        case 'activity':
          aValue = a.recentActivity;
          bValue = b.recentActivity;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handle team actions
  const handleCreateTeam = () => {
    // setShowCreateModal(true);
    console.log('Create team clicked');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý nhóm nâng cao
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tạo, quản lý và theo dõi hiệu suất các nhóm làm việc với AI hỗ trợ
          </p>
        </div>
          <div className="flex items-center gap-3">
          {/* Real-time status indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
          
          <button
            onClick={handleCreateTeam}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Tạo nhóm mới
          </button>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'teams'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Danh sách nhóm
          </button>
          
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            Hoạt động
          </button>
          
          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'health'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Heart className="h-4 w-4" />
            Sức khỏe nhóm
          </button>
          
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Gợi ý AI
          </button>
            <button
            onClick={() => {
              setActiveTab('notifications');
              setNewNotificationsCount(0); // Reset count when viewing notifications
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap relative ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Bell className="h-4 w-4" />
            Thông báo
            {newNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newNotificationsCount > 9 ? '9+' : newNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'teams' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center">
                      <Users className="h-8 w-8" />
                      <div className="ml-4">
                        <p className="text-blue-100">Tổng số nhóm</p>
                        <p className="text-2xl font-bold">{stats.overview.totalTeams}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8" />
                      <div className="ml-4">
                        <p className="text-green-100">Vai trò trưởng nhóm</p>
                        <p className="text-2xl font-bold">{stats.overview.teamsAsLeader}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8" />
                      <div className="ml-4">
                        <p className="text-purple-100">Vai trò quản trị</p>
                        <p className="text-2xl font-bold">{stats.overview.teamsAsAdmin}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center">
                      <Users className="h-8 w-8" />
                      <div className="ml-4">
                        <p className="text-orange-100">Thành viên thường</p>
                        <p className="text-2xl font-bold">{stats.overview.teamsAsMember}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Events from Real-time */}
              {realtimeEvents.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Cập nhật gần đây ({realtimeEvents.length})
                  </h4>
                  <div className="space-y-2 max-h-20 overflow-y-auto">
                    {realtimeEvents.slice(0, 3).map((event, index) => (
                      <div key={index} className="text-xs text-blue-700 dark:text-blue-300">
                        {event.type === 'team_created' && '📝 Nhóm mới được tạo'}
                        {event.type === 'team_updated' && '✏️ Nhóm được cập nhật'}
                        {event.type === 'member_added' && '👤 Thành viên mới'}
                        {event.type === 'activity_logged' && '⚡ Hoạt động mới'}
                        {event.type === 'notification_received' && '🔔 Thông báo mới'}
                        {' - ' + new Date(event.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhóm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sắp xếp:
                    </label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field as any);
                        setSortOrder(order as any);
                      }}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="name-asc">Tên A-Z</option>
                      <option value="name-desc">Tên Z-A</option>
                      <option value="members-desc">Nhiều thành viên nhất</option>
                      <option value="projects-desc">Nhiều dự án nhất</option>
                      <option value="activity-desc">Hoạt động gần đây</option>
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } rounded-l-lg`}
                    >
                      <div className="grid grid-cols-2 gap-1 h-4 w-4">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } rounded-r-lg`}
                    >
                      <div className="space-y-1 h-4 w-4">
                        <div className="bg-current h-1 rounded-sm"></div>
                        <div className="bg-current h-1 rounded-sm"></div>
                        <div className="bg-current h-1 rounded-sm"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Teams Display */}
              {error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-2">{error}</div>
                  <button 
                    onClick={fetchTeams}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : filteredAndSortedTeams.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'Không tìm thấy nhóm' : 'Chưa có nhóm nào'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchQuery 
                      ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                      : 'Tạo nhóm đầu tiên để bắt đầu cộng tác'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleCreateTeam}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Tạo nhóm mới
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {filteredAndSortedTeams.map((team) => (
                    <div key={team._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              {getRoleIcon(team.userRole)}
                              <span className="capitalize">{team.userRole}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {team.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {team.memberCount}
                          </span>
                          <span>Dự án: {team.projectCount}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          team.isPublic 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {team.isPublic ? 'Công khai' : 'Riêng tư'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <TeamActivityFeed />
          )}          {activeTab === 'health' && (
            <div className="space-y-6">
              {/* Team Selection for Health Check */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn nhóm để kiểm tra sức khỏe:
                </label>
                <select
                  value={selectedTeamForHealth || ''}
                  onChange={(e) => setSelectedTeamForHealth(e.target.value || null)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-- Chọn nhóm --</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name} ({team.memberCount} thành viên)
                    </option>
                  ))}
                </select>
              </div>

              {/* Health Check Component */}
              {selectedTeamForHealth ? (
                <TeamHealthCheck 
                  teamId={selectedTeamForHealth}
                  showRecommendations={true}
                  autoRefresh={true}
                  refreshInterval={30}
                />
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Chọn nhóm để xem báo cáo sức khỏe
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hãy chọn một nhóm để xem chi tiết về hiệu suất và sức khỏe của nhóm
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <TeamRecommendations />
          )}

          {activeTab === 'notifications' && (
            <NotificationCenter />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsManagementEnhanced;
