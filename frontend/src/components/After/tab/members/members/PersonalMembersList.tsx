import React, { useState, useEffect, useCallback } from 'react';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AddMemberModal from './AddMemberModal';
import EditMemberModal from './EditMemberModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmptyState from './EmptyState';
import MembersTable from './MembersTable';
import Pagination from './Pagination';
import { PersonalMember, ApiResponse } from "./types";

// Consolidated filters interface
interface MemberFilters {
  search: string;
  sortField: 'name' | 'added_at';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export default function PersonalMembersList() {
  const [members, setMembers] = useState<PersonalMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<PersonalMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);

  // Consolidated filters state
  const [filters, setFilters] = useState<MemberFilters>({
    search: '',
    sortField: 'added_at',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PersonalMember | null>(null);

  // Fetch members data - simplified dependency
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
     
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortField,
        sortOrder: filters.sortOrder,
        search: filters.search
      }).toString();

      console.log('🔍 Fetching members with filters:', filters);

      const response = await fetch(`http://localhost:5000/api/personal-members?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: ApiResponse<PersonalMember[]> = await response.json();
        setMembers(data.data || []);
        setFilteredMembers(data.data || []);
        setTotalMembers(data.pagination?.total_items || 0);
        
        console.log('✅ Members fetched successfully:', {
          count: data.data?.length || 0,
          total: data.pagination?.total_items || 0,
          currentPage: data.pagination?.current_page || 1
        });

        // 🐛 DEBUG: Log first member structure to understand data format
        if (data.data && data.data.length > 0) {
          console.log('🐛 [Personal Members] First member structure:', JSON.stringify(data.data[0], null, 2));
          if (data.data[0].member_user_id) {
            console.log('🐛 [Personal Members] member_user_id structure:', JSON.stringify(data.data[0].member_user_id, null, 2));
          }
        }
      } else {
        console.error('Failed to fetch members:', response.statusText);
        setMembers([]);
        setFilteredMembers([]);
        setTotalMembers(0);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
      setFilteredMembers([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  // Simple useEffect with only filters dependency
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (memberUserId: string, customRole?: string) => {
    const toastId = toast.loading('Đang thêm thành viên...'); // Hiển thị thông báo loading
    
    try {
      const token = localStorage.getItem('token');
     
      const response = await fetch('http://localhost:5000/api/personal-members', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member_user_id: memberUserId,
          custom_role: customRole || '',
          notes: `Được thêm bởi script test - ${new Date().toLocaleString()}`
        })
      });

      const result = await response.json();

      if (response.ok) {
        await fetchMembers(); // Refresh the list
        setShowAddModal(false);
        
        // Lấy tên thành viên từ response
        const memberName = result.data?.member_user_id?.full_name || 
                          result.data?.member_user_id?.name || 
                          'Thành viên';
        
        toast.success(`Đã thêm '${memberName}' vào danh sách của bạn!`, { id: toastId });
      } else {
        toast.error(result.message || 'Không thể thêm thành viên', { id: toastId });
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thêm thành viên', { id: toastId });
    }
  };

  const handleEditMember = (member: PersonalMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };
  const handleUpdateMember = async (memberId: string, customRole: string) => {
    const toastId = toast.loading('Đang cập nhật vai trò...');
    
    try {
      const token = localStorage.getItem('token');
     
      const response = await fetch(`http://localhost:5000/api/personal-members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          custom_role: customRole
        })
      });

      const result = await response.json();      if (response.ok) {
        await fetchMembers(); // Refresh the list
        setShowEditModal(false);
        setSelectedMember(null);
        toast.success('Đã cập nhật vai trò thành công!', { id: toastId });
      } else {
        toast.error(result.message || 'Không thể cập nhật vai trò', { id: toastId });
      }
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật vai trò', { id: toastId });
    }
  };

  const handleDeleteMember = (member: PersonalMember) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!selectedMember) return;

    const toastId = toast.loading('Đang xóa thành viên...');

    try {
      const token = localStorage.getItem('token');
      // Gọi API xóa cứng (permanent delete)
      const response = await fetch(`http://localhost:5000/api/personal-members/${selectedMember._id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();      if (response.ok) {
        await fetchMembers(); // Refresh the list
        setShowDeleteModal(false);
        setSelectedMember(null);
        
        const memberName = selectedMember.member_user_id?.full_name || 
                          selectedMember.member_user_id?.name || 
                          'Thành viên';
        
        toast.success(`Đã xóa '${memberName}' khỏi danh sách!`, { id: toastId });
      } else {
        toast.error(result.message || 'Không thể xóa thành viên', { id: toastId });
      }
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi xóa thành viên', { id: toastId });
    }
  };
  const handleSortChange = (field: 'name' | 'added_at') => {
    if (filters.sortField === field) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortField: field,
        sortOrder: 'asc',
        page: 1
      }));
    }
  };
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page: page
    }));
  };
  const totalPages = Math.ceil(totalMembers / filters.limit);
  
  // Debugging output
  console.log('--- Debugging PersonalMembersList ---');
  console.log('totalMembers:', totalMembers);
  console.log('itemsPerPage:', filters.limit);
  console.log('Calculated totalPages:', totalPages);
  console.log('Should Pagination render (totalPages > 1)?', totalPages > 1);
  console.log('--- End Debugging ---');
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-full">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 break-words">
            Danh sách Nhân viên của bạn
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Quản lý thành viên cá nhân để dễ dàng phân công công việc
          </p>
        </div>
        <div className="mt-3 sm:mt-0 self-start sm:self-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap"
          >
            <UserPlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Thêm Nhân viên
          </button>
        </div>
      </div>      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
              </div>              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    search: e.target.value,
                    page: 1
                  }));
                }}
                className="block w-full pl-8 sm:pl-9 md:pl-10 pr-2 sm:pr-3 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              />
            </div>
          </div>          {/* Sort Controls */}
          <div className="flex flex-wrap items-center space-x-1 sm:space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Sắp xếp:</span>            <button
              onClick={() => handleSortChange('name')}
              className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md text-xs font-medium ${
                filters.sortField === 'name'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Tên {filters.sortField === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>            <button
              onClick={() => handleSortChange('added_at')}
              className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md text-xs font-medium ${
                filters.sortField === 'added_at'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Ngày {filters.sortField === 'added_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>        {/* Results count */}
        <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {filters.search ? (
            <>Tìm thấy {totalMembers} kết quả cho "{filters.search}"</>
          ) : (
            <>Tổng cộng {totalMembers} nhân viên</>
          )}
        </div>
      </div>      {/* Content */}
      {filteredMembers.length === 0 && totalMembers === 0 ? (
        <EmptyState
          hasMembers={totalMembers > 0}
          isSearching={!!filters.search}
          onAddMember={() => setShowAddModal(true)}
        />
      ) : (
        <>
          <MembersTable
            members={filteredMembers}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
          />          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={filters.limit} // Truyền itemsPerPage
              totalMembers={totalMembers} // Truyền totalMembers
            />
          )}
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddMember={handleAddMember}
          existingMemberIds={members.map(m => m.member_user_id._id)}
        />
      )}

      {showEditModal && selectedMember && (
        <EditMemberModal
          isOpen={showEditModal}
          member={selectedMember}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {showDeleteModal && selectedMember && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          member={selectedMember}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}