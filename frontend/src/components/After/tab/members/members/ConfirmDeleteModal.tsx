import React, { useRef } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PersonalMember } from './types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  member: PersonalMember;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ 
  isOpen, 
  member, 
  onClose, 
  onConfirm 
}: ConfirmDeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleModalClick}
      onKeyDown={handleKeyDown}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2 sm:mr-3" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              Xác nhận xóa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="text-center">
            {/* Member Info */}
            <div className="mb-3 sm:mb-4">
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-medium text-white">
                    {member.member_user_id?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                {member.member_user_id?.name || 'Không có tên'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {member.member_user_id?.email || 'Không có email'}
              </p>
              {member.custom_role && (
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {member.custom_role}
                </p>
              )}
            </div>            {/* Warning Message */}
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
                Bạn có chắc muốn xóa <strong>{member.member_user_id?.name || 'thành viên này'}</strong> khỏi danh sách cá nhân của mình không?
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 sm:p-3 mt-2 sm:mt-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      Lưu ý quan trọng:
                    </p>
                    <ul className="text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside space-y-0.5 sm:space-y-1">
                      <li>Hành động này sẽ xóa thành viên khỏi danh sách cá nhân của bạn</li>
                      <li>Bạn có thể thêm lại họ bất cứ lúc nào</li>
                      <li>Điều này không ảnh hưởng đến tài khoản của họ trong hệ thống</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Xóa khỏi danh sách
          </button>
        </div>      </div>
    </div>
  );
}
