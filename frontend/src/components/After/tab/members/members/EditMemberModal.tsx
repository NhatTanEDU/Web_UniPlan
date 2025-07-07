import React, { useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PersonalMember } from './types';

interface EditMemberModalProps {
  isOpen: boolean;
  member: PersonalMember;
  onClose: () => void;
  onUpdateMember: (memberId: string, customRole: string) => void;
}

export default function EditMemberModal({ 
  isOpen, 
  member, 
  onClose, 
  onUpdateMember 
}: EditMemberModalProps) {
  const [customRole, setCustomRole] = useState(member.custom_role || '');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await onUpdateMember(member._id, customRole.trim());
    } finally {
      setLoading(false);
    }
  };

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
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Chỉnh sửa Vai trò của {member.member_user_id?.name || 'thành viên'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Member Info (Read-only) */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-base sm:text-lg font-medium text-white">
                      {member.member_user_id?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                    {member.member_user_id?.name || 'Không có tên'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {member.member_user_id?.email || 'Không có email'}
                  </p>
                </div>
              </div>
            </div>            {/* Custom Role Input */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Gán vai trò tùy chỉnh
              </label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Ví dụ: Trưởng nhóm Marketing, Cộng tác viên..."
                className="block w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                disabled={loading}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Để trống nếu chưa muốn gán vai trò cụ thể
              </p>
            </div>            {/* Current Role Display */}
            {member.custom_role && (
              <div className="text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400">Vai trò hiện tại: </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {member.custom_role}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                  <span className="text-xs sm:text-sm">Đang lưu...</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>      </div>
    </div>
  );
}
