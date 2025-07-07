import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";

// Context & Services
import { useToast } from "../../../../context/ToastContext";
import { teamApi, Team, TeamFilters as ITeamFilters, TeamStatsData, PaginatedTeamsResponse } from "../../../../../services/teamApi";

// Child Components (Đảm bảo đường dẫn import chính xác)
import TeamModal from "./TeamModal";
import ConfirmModal from "./ConfirmModal";
import LoadingSpinner from "./LoadingSpinner";
import TeamStats from "../../../../../components/teams/TeamStats";
import TeamFiltersComponent from "../../../../../components/teams/TeamFilters";
import Pagination from "../../../../common/Pagination";

export default function TeamList() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Component States
  const [stats, setStats] = useState<TeamStatsData | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState<PaginatedTeamsResponse['pagination'] | null>(null);
  
  const [filters, setFilters] = useState<Partial<ITeamFilters>>({
    search: '',
    type: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState({
    stats: true,
    teams: true,
  });

  // Modal and Confirmation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);  // --- DATA FETCHING LOGIC (ĐÃ SỬA LẠI) ---
  // Sử dụng useEffect trực tiếp để theo dõi filters object - LOẠI BỎ useCallback
  useEffect(() => {
    // Định nghĩa hàm fetch bên trong useEffect và gọi ngay lập tức
    const fetchData = async () => {
      setLoading(prev => ({ ...prev, teams: true }));
      
      // LOG: Ghi lại chi tiết filters, thời điểm gọi API và ID unique cho mỗi lần fetch
      const fetchId = Math.random().toString(36).substr(2, 9);
      console.log(`🔄 [FETCHING DATA ${fetchId}] Bắt đầu gọi API với filters:`, {
        ...filters,
        fetchId,
        timestamp: new Date().toISOString(),
        filtersObjectId: JSON.stringify(filters) // Để debug object reference
      });      
      // Loại bỏ các field không cần thiết trước khi gửi API
      const apiFilters = { ...filters };
      delete apiFilters._lastUpdate;
      delete apiFilters._refresh;
      
      try {
        console.log(`📤 [API CALL ${fetchId}] Gửi filters đã xử lý:`, {
          apiFilters,
          originalFiltersLength: Object.keys(filters).length,
          cleanedFiltersLength: Object.keys(apiFilters).length
        });
        
        const response = await teamApi.getTeams(apiFilters);
        
        console.log(`✅ [FETCHING DATA ${fetchId}] API trả về thành công:`, {
          teamsCount: response.teams.length,
          pagination: response.pagination,
          firstTeam: response.teams[0] ? {
            name: response.teams[0].name,
            createdAt: response.teams[0].createdAt,
            sortField: apiFilters.sortBy,
            sortOrder: apiFilters.sortOrder
          } : null
        });
        
        setTeams(response.teams);
        setPagination(response.pagination);
        
        console.log(`🎯 [STATE UPDATE ${fetchId}] State đã được cập nhật - Component sẽ re-render`);      } catch (error: any) {
        console.error(`❌ [FETCHING DATA ${fetchId}] Lỗi khi tải:`, {
          error: error?.message || error,
          filters: apiFilters,
          timestamp: new Date().toISOString()
        });
        showToast('Không thể tải danh sách nhóm', 'error');
      } finally {
        setLoading(prev => ({ ...prev, teams: false }));
        console.log(`🏁 [FETCHING DATA ${fetchId}] Hoàn thành - Loading state cleared`);
      }
    };

    // Log khi useEffect được trigger
    console.log('🎪 [useEffect TRIGGER] Filters đã thay đổi, khởi động fetch data:', {
      filtersSnapshot: { ...filters },
      timestamp: new Date().toISOString()
    });

    fetchData();
  }, [filters, showToast]); // QUAN TRỌNG: useEffect phụ thuộc trực tiếp vào TOÀN BỘ object `filters`

  // useEffect để tải thống kê (chỉ chạy 1 lần khi component mount)
  useEffect(() => {
    const loadStats = async () => {
      setLoading(prev => ({ ...prev, stats: true }));
      try {        const response = await teamApi.getTeamStatistics();
        setStats(response);
      } catch (error) {
        console.error('Error loading team stats:', error);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    loadStats();
  }, []);
  // --- EVENT HANDLERS ---
  const handleFiltersChange = (newFilterValue: Partial<ITeamFilters>) => {
    console.log('🔄 [FILTERS CHANGE] Nhận thay đổi filter mới:', newFilterValue);
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        ...newFilterValue,
        page: 1, // Luôn reset về trang 1 khi filter
        _lastUpdate: Date.now(), // Key để đảm bảo React nhận biết thay đổi
      };
      
      console.log('🔄 [FILTERS CHANGE] Filters cũ:', prev);
      console.log('🔄 [FILTERS CHANGE] Filters mới:', newFilters);
      
      return newFilters;
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  const handleStatClick = (status: string) => {
    showToast(`Đang lọc theo: Nhóm ${status}`, 'success');
    handleFiltersChange({ status });
  };
    const handleRefresh = () => {
    showToast('Đang làm mới dữ liệu...', 'success');
    // Force re-fetch bằng cách tạo một object filters mới 
    setFilters(prev => ({ ...prev }));
  };

  // Các hàm xử lý CRUD Modals
  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };
  
  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeletingTeamId(id);
    setIsConfirmOpen(true);
  };
  
  const handleSubmit = async (data: any, id?: string) => {
    try {
      if (id) {
        await teamApi.updateTeam(id, data);
        showToast('Cập nhật nhóm thành công!', 'success');
      } else {
        await teamApi.createTeam(data);
        showToast('Tạo nhóm mới thành công!', 'success');
      }
      setIsModalOpen(false);
      setEditingTeam(null);
      refreshDataAfterAction();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingTeamId) return;
    try {
      await teamApi.deleteTeam(deletingTeamId);
      showToast('Xóa nhóm thành công', 'success');
      refreshDataAfterAction();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa nhóm', 'error');
    } finally {
      setIsConfirmOpen(false);
      setDeletingTeamId(null);
    }
  };
  const refreshDataAfterAction = () => {
    // Force re-fetch bằng cách tạo một object filters mới với timestamp
    setFilters(prev => ({ ...prev, _refresh: Date.now() }));
    // Tải lại cả stats nếu cần
    // loadStats();
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhóm</h1>
          <p className="text-gray-500">Xem, tìm kiếm, và quản lý tất cả các nhóm.</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleRefresh} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600" title="Làm mới"><RefreshCw size={16}/></button>
           <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={16}/> Tạo nhóm</button>
        </div>
      </div>
        <TeamStats stats={stats} loading={loading.stats} onStatClick={handleStatClick} />
      
      <TeamFiltersComponent 
        filters={{
          search: filters.search || '',
          type: filters.type || '',
          sortBy: filters.sortBy || 'createdAt',
          sortOrder: filters.sortOrder || 'desc'
        }} 
        onFiltersChange={handleFiltersChange} 
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">        {loading.teams ? (
            <div className="p-8 text-center"><LoadingSpinner text="Đang tải danh sách..." /></div>
        ) : teams.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Không có nhóm nào được tìm thấy.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tên nhóm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {teams.map((team) => (
                    <tr key={team._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/teams/${team._id}`)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                          title="Xem chi tiết nhóm"
                        >
                          {team.name || 'N/A'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                        <div className="max-w-xs truncate" title={team.description}>
                          {team.description || 'Không có mô tả'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          team.type === 'Public' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {team.type === 'Public' ? 'Công khai' : 'Riêng tư'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(team.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(team)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(team._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
        
        {pagination && pagination.totalItems > 0 && !loading.teams && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={filters.limit || 10}
            onPageChange={handlePageChange}
          />
        )}
      </div>      {isModalOpen && (
        <TeamModal
          visible={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTeam(null); }}
          onSubmit={handleSubmit}
          initialData={editingTeam || undefined}
        />
      )}

      {isConfirmOpen && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          title="Xác nhận xóa nhóm"
          message="Bạn có chắc chắn muốn xóa nhóm này không?"
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}
