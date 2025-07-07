import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SearchUser } from './types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (memberUserId: string, customRole?: string) => void;
  existingMemberIds: string[];
}

export default function AddMemberModal({ 
  isOpen, 
  onClose, 
  onAddMember, 
  existingMemberIds 
}: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper function to safely get avatar initial
  const getAvatarInitial = (user: SearchUser): string => {
    try {
      if (user.name && typeof user.name === 'string' && user.name.trim().length > 0) {
        return user.name.trim().charAt(0).toUpperCase();
      }
      if (user.email && typeof user.email === 'string' && user.email.trim().length > 0) {
        return user.email.trim().charAt(0).toUpperCase();
      }
      return '?';
    } catch (error) {
      console.error('Error getting avatar initial:', error);
      return '?';
    }
  };

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:5000/api/personal-members/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
        setSearchPerformed(true);
      } else if (response.status === 400) {
        // Backend requires at least 2 characters for search
        console.log('Search requires at least 2 characters');
        setSearchResults([]);
        setSearchPerformed(true);
      } else {
        console.error('Search failed:', response.statusText);
        setSearchResults([]);
        setSearchPerformed(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (user: SearchUser) => {
    onAddMember(user._id);
  };

  const isUserAlreadyAdded = (userId: string) => {
    return existingMemberIds.includes(userId);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleInviteNewMember = () => {
    // Redirect to register page or home page
    window.open('http://localhost:3000/register', '_blank');
  };

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleModalClick}
    >      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md sm:max-w-lg md:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Thêm Nhân viên vào danh sách của bạn
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Tìm kiếm người dùng UniPlan bằng Email hoặc Tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập email hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-xs sm:text-sm"
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm
            </p>
          </div>          {/* Search Results */}
          <div className="min-h-[150px] sm:min-h-[200px] max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Đang tìm kiếm...</span>
              </div>
            )}

            {!loading && searchTerm.trim().length >= 2 && searchPerformed && (
              <div>
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      Kết quả tìm kiếm ({searchResults.length})
                    </h4>
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                              <span className="text-xs sm:text-sm font-medium text-white">
                                {getAvatarInitial(user)}
                              </span>
                            </div>
                          </div><div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                              {(user.name && user.name.trim().length > 0) ? user.name : 'Không có tên'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {user.email || 'Không có email'}
                            </p>
                          </div>
                        </div>
                        <div>
                          {isUserAlreadyAdded(user._id) ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              <span className="text-xs sm:text-sm font-medium">Đã thêm</span>
                            </div>
                          ) : (                            <button
                              onClick={() => handleAddMember(user)}
                              className="inline-flex items-center px-2 sm:px-3 py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                              <UserPlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              Thêm
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 sm:py-8">
                    <div className="text-gray-400 mb-2 sm:mb-3">
                      <MagnifyingGlassIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                      Không tìm thấy người dùng
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                      Không tìm thấy người dùng nào với từ khóa "{searchTerm}"
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                      Bạn có muốn mời họ tham gia UniPlan không?
                    </p>                    <button
                      onClick={handleInviteNewMember}
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-blue-300 text-xs sm:text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
                    >
                      <UserPlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Mời người mới
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && searchTerm.trim().length < 2 && (
              <div className="text-center py-5 sm:py-8 text-gray-500 dark:text-gray-400">
                <MagnifyingGlassIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-xs sm:text-sm">Nhập từ khóa để tìm kiếm người dùng</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
          >
            Đóng
          </button>        </div>
      </div>
    </div>
  );
}
