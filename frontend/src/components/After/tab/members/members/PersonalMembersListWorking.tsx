import React, { useState, useEffect } from 'react';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface PersonalMember {
  _id: string;
  member_user_id: {
    _id: string;
    name: string;
    email: string;
  };
  custom_role: string;
  added_at: string;
  status: string;
}

export default function PersonalMembersList() {
  const [members, setMembers] = useState<PersonalMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch members data
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/personal-members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      } else {
        console.error('Failed to fetch members:', response.statusText);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);
  const filteredMembers = members.filter(member => {
    if (!member?.member_user_id) return false;
    
    const userName = member.member_user_id.name || '';
    const userEmail = member.member_user_id.email || '';
    const searchLower = searchTerm.toLowerCase();
    
    return userName.toLowerCase().includes(searchLower) ||
           userEmail.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Danh sách Nhân viên của bạn
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý thành viên cá nhân để dễ dàng phân công công việc
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => alert('Chức năng đang được phát triển')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Thêm Nhân viên
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách của bạn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm"
          />
        </div>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {searchTerm ? (
            <>Tìm thấy {filteredMembers.length} kết quả cho "{searchTerm}"</>
          ) : (
            <>Tổng cộng {members.length} nhân viên</>
          )}
        </div>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có nhân viên nào'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Thử từ khóa khác hoặc xóa bộ lọc' : 'Bắt đầu bằng cách thêm nhân viên đầu tiên'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMembers.map((member) => (
              <li key={member._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {member.member_user_id?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {member.member_user_id?.name || 'Không có tên'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.member_user_id?.email || 'Không có email'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      {member.custom_role || 'Thành viên'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(member.added_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
