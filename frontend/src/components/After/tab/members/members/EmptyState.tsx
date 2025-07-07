import React from 'react';
import { UserGroupIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  hasMembers: boolean;
  isSearching: boolean;
  onAddMember: () => void;
}

export default function EmptyState({ hasMembers, isSearching, onAddMember }: EmptyStateProps) {  if (isSearching) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-12 text-center">
        <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
          Không tìm thấy kết quả
        </h3>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Không có nhân viên nào phù hợp với từ khóa tìm kiếm của bạn.
        </p>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Hãy thử từ khóa khác hoặc thêm nhân viên mới.
        </p>
        <div className="mt-4 sm:mt-6">
          <button
            onClick={onAddMember}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <UserPlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Thêm Nhân viên
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-12 text-center">
      <UserGroupIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
      <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100">
        Bạn chưa có nhân viên nào trong danh sách cá nhân
      </h3>
      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Hãy thêm người đầu tiên để dễ dàng quản lý và phân công công việc!
      </p>
      <div className="mt-6 sm:mt-8">
        <button
          onClick={onAddMember}
          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          Thêm Nhân viên Đầu tiên
        </button>
      </div>
      <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <p>💡 Mẹo: Thêm các đồng nghiệp thường xuyên làm việc cùng để tiết kiệm thời gian khi tạo dự án mới</p>
      </div>    </div>
  );
}
