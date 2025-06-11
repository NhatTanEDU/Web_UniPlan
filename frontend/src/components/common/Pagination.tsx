// src/components/common/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true
}) => {
  // Đảm bảo các giá trị không bị NaN
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeTotalItems = Math.max(0, totalItems || 0);
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages));
  const safeItemsPerPage = Math.max(1, itemsPerPage || 10);

  const getVisiblePages = () => {
    if (safeTotalPages <= 1) return [1];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Tạo range quanh trang hiện tại
    for (let i = Math.max(2, safeCurrentPage - delta); i <= Math.min(safeTotalPages - 1, safeCurrentPage + delta); i++) {
      range.push(i);
    }

    // Thêm trang đầu và dấu ...
    if (safeCurrentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Thêm range giữa
    rangeWithDots.push(...range);

    // Thêm dấu ... và trang cuối
    if (safeCurrentPage + delta < safeTotalPages - 1) {
      rangeWithDots.push('...', safeTotalPages);
    } else if (safeTotalPages > 1) {
      rangeWithDots.push(safeTotalPages);
    }

    // Loại bỏ duplicates và sắp xếp
    return rangeWithDots.filter((page, index, arr) => 
      arr.indexOf(page) === index
    );
  };

  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem = safeTotalItems === 0 ? 0 : Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);
  // Hiển thị khi không có dữ liệu hoặc chỉ có 1 trang
  if (safeTotalItems === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  if (safeTotalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Hiển thị <span className="font-medium">{safeTotalItems}</span> kết quả
        </div>
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Hiển thị:</label>
            <select
              value={safeItemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">mục</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">        <div className="text-sm text-gray-700 dark:text-gray-300">
          Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
          <span className="font-medium">{endItem}</span> trong{' '}
          <span className="font-medium">{safeTotalItems}</span> kết quả
        </div>

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Hiển thị:</label>
            <select
              value={safeItemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">mục</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">        {/* Previous Button */}
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 dark:border-gray-600 ${
              page === safeCurrentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : page === '...'
                ? 'bg-white dark:bg-gray-800 text-gray-400 cursor-default'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {page === '...' ? <MoreHorizontal className="w-4 h-4" /> : page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
