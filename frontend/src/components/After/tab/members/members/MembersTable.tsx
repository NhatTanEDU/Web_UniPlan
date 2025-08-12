import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PersonalMember } from './types';

interface MembersTableProps {
  members: PersonalMember[];
  onEditMember: (member: PersonalMember) => void;
  onDeleteMember: (member: PersonalMember) => void;
}

export default function MembersTable({ members, onEditMember, onDeleteMember }: MembersTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tên Nhân viên
              </th>
              <th className="hidden sm:table-cell px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="hidden md:table-cell px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vai trò tùy chỉnh
              </th>
              <th className="hidden md:table-cell px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ngày thêm vào
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">                        <span className="text-xs font-medium text-white">
                        {(member.member_user_id?.full_name || member.member_user_id?.name)?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                        {member.member_user_id?.full_name || member.member_user_id?.name || 'Không có tên'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden line-clamp-1">
                        {member.member_user_id?.email?.split('@')[0] || 'N/A'}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    {window.innerWidth < 640 ? 
                      `${member.member_user_id?.email?.substring(0, 10) || 'N/A'}...` : 
                      window.innerWidth < 768 ? 
                        `${member.member_user_id?.email?.split('@')[0] || 'N/A'}@...` : 
                        member.member_user_id?.email || 'Không có email'
                    }
                  </div>
                </td>
                <td className="hidden md:table-cell px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    {member.custom_role || (
                      <span className="text-gray-400 italic">Chưa gán</span>
                    )}
                  </div>
                </td>
                <td className="hidden md:table-cell px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(member.added_at)}
                  </div>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    member.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {member.is_active ? 'Hoạt động' : 'Không'}
                  </span>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">                    <button
                      onClick={() => onEditMember(member)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Chỉnh sửa vai trò"
                    >
                      <PencilIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />                    </button>
                    <button
                      onClick={() => onDeleteMember(member)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Xóa khỏi danh sách"
                    >
                      <TrashIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                </td>              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Hiển thị chú thích cho màn hình nhỏ */}
      <div className="block md:hidden p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 text-center">
        <p>* Vuốt ngang để xem đầy đủ thông tin</p>
      </div>
    </div>
  );
}
