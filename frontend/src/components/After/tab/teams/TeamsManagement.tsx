import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Shield,
  Crown,
  Settings
} from 'lucide-react';
import TeamCard from './TeamCard';
import TeamStats from './TeamStats';
import CreateTeamModal from './CreateTeamModal';
import TeamDetailsModal from './TeamDetailsModal';
import BulkOperationsModal from './BulkOperationsModal';
import TeamSearchFilters from './TeamSearchFilters';

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

const TeamsManagement: React.FC = () => {
  // State management
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<TeamStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'projects' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Fetch teams and stats
  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Call API để lấy teams từ backend enhanced
      const response = await fetch('/api/teams-enhanced/search', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.data || []);
      } else {
        setError('Không thể tải danh sách nhóm');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/teams-enhanced/stats/overview', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchStats();
  }, []);

  // Filter and sort teams
  const filteredAndSortedTeams = teams
    .filter(team => {
      if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Apply additional filters here
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
    setShowCreateModal(true);
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailsModal(true);
  };

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleBulkOperations = () => {
    if (selectedTeams.length > 0) {
      setShowBulkModal(true);
    }
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
            Quản lý nhóm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tạo, quản lý và theo dõi hiệu suất các nhóm làm việc
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
          
          {selectedTeams.length > 0 && (
            <button
              onClick={handleBulkOperations}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Settings className="h-4 w-4" />
              Thao tác hàng loạt ({selectedTeams.length})
            </button>
          )}
          
          <button
            onClick={handleCreateTeam}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Tạo nhóm mới
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <TeamStats stats={stats} />}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
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

        {/* Advanced Filters */}
        {showFilters && (
          <TeamSearchFilters
            filters={activeFilters}
            onFiltersChange={setActiveFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
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
            <TeamCard
              key={team._id}
              team={team}
              viewMode={viewMode}
              isSelected={selectedTeams.includes(team._id)}
              onSelect={() => handleSelectTeam(team._id)}
              onView={() => handleViewTeam(team)}
              getRoleIcon={getRoleIcon}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTeams();
          }}
        />
      )}

      {showDetailsModal && selectedTeam && (
        <TeamDetailsModal
          isOpen={showDetailsModal}
          team={selectedTeam}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTeam(null);
          }}
          onUpdate={fetchTeams}
        />
      )}

      {showBulkModal && (
        <BulkOperationsModal
          isOpen={showBulkModal}
          selectedTeams={selectedTeams}
          onClose={() => {
            setShowBulkModal(false);
            setSelectedTeams([]);
          }}
          onSuccess={() => {
            setShowBulkModal(false);
            setSelectedTeams([]);
            fetchTeams();
          }}
        />
      )}
    </div>
  );
};

export default TeamsManagement;

// Đã thêm export rỗng để đảm bảo file là module hợp lệ
export {};
