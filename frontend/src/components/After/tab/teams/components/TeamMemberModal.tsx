/**
 * TeamMemberModal Component
 * --------------------------
 * - Enhanced popup để thêm nhiều thành viên cùng lúc
 * - Sử dụng UserSearchInput multi-select với improved UX
 * - Mặc định role = "Member"
 * - Added member count display và better validation
 */
import React, { useState, useEffect } from "react";
import { XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import UserSearchInputSafe from "./UserSearchInputSafe";
import { TeamSearchUser } from "../../../../../services/teamMemberSearchApi";
import { AddMemberData } from "../../../../../services/teamMemberApi";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (list: AddMemberData[]) => void;
  teamId: string; // Required team ID
  existingMemberIds?: string[]; // To prevent adding existing members
}

export default function TeamMemberModal({ visible, onClose, onAdd, teamId, existingMemberIds = [] }: Props) {
  const [selectedUsers, setSelectedUsers] = useState<TeamSearchUser[]>([]);
  const [role, setRole] = useState<"Admin" | "Editor" | "Member">("Member");
  const [loading, setLoading] = useState(false);

  // Filter out users who are already team members
  const filteredUsers = selectedUsers.filter(user => 
    !existingMemberIds.includes(user._id)
  );
  const duplicateCount = selectedUsers.length - filteredUsers.length;

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedUsers([]);
      setRole("Member");
      setLoading(false);
    }
  }, [visible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleAdd = async () => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      // Filter out existing members
      const newUsers = selectedUsers.filter(user => !existingMemberIds.includes(user._id));
      if (newUsers.length === 0) {
        alert('Tất cả thành viên đã chọn đều đã có trong nhóm!');
        return;
      }
      
      const list = newUsers.map(u => ({ userId: u._id, role }));
      await onAdd(list);
      onClose();
    } catch (error) {
      console.error('Failed to add members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Thêm thành viên mới
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm kiếm thành viên
            </label>
            <UserSearchInputSafe 
              onChange={setSelectedUsers}
              teamId={teamId}
            />
          </div>

          {/* Selected Members Count */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Đã chọn: {filteredUsers.length} thành viên
                </span>
                {duplicateCount > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {duplicateCount} đã có trong nhóm
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vai trò mặc định
            </label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value as "Admin" | "Editor" | "Member")} 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="Member">Member - Thành viên cơ bản</option>
              <option value="Editor">Editor - Có thể chỉnh sửa</option>
              <option value="Admin">Admin - Toàn quyền quản lý</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Bạn có thể thay đổi vai trò sau khi thêm thành viên
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleAdd}
            disabled={filteredUsers.length === 0 || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang thêm...
              </div>
            ) : (
              `Thêm ${filteredUsers.length} thành viên`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}