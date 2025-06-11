import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number; // Thêm prop này
  totalMembers: number; // Thêm prop này
}

export default function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalMembers }: PaginationProps) {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  const renderPageNumbers = () => {
    // Adjust the number of page buttons based on screen width
    const maxPageButtons = window.innerWidth < 640 ? 3 : window.innerWidth < 768 ? 4 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2));

    if (endPage - startPage + 1 < maxPageButtons) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
    }

    const pagesToShow = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }

    return (
      <>        {startPage > 1 && (
          <button
            onClick={() => onPageChange(1)}
            className="relative inline-flex items-center rounded-md px-1.5 py-1 text-xs sm:text-sm text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-600 dark:text-gray-300"
          >
            1
          </button>
        )}
        {startPage > 2 && (
          <span className="relative inline-flex items-center px-1.5 py-1 text-xs sm:text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600">...</span>
        )}
        {pagesToShow.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`relative inline-flex items-center px-2 py-1 text-xs sm:text-sm font-semibold ${
              currentPage === page
                ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages - 1 && (
          <span className="relative inline-flex items-center px-1.5 py-1 text-xs sm:text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600">...</span>
        )}
        {endPage < totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="relative inline-flex items-center rounded-md px-1.5 py-1 text-xs sm:text-sm text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-600 dark:text-gray-300"
          >
            {totalPages}
          </button>
        )}
      </>
    );
  };  return (
    <div className="flex flex-col border-t border-gray-200 bg-white px-2 py-2 sm:px-4 shadow rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {/* Mobile version */}
      <div className="flex flex-col w-full sm:hidden mb-2">
        <div className="flex items-center justify-center space-x-3 mb-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-3 w-3 mr-1" aria-hidden="true" />
            Trước
          </button>
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Sau
            <ChevronRightIcon className="h-3 w-3 ml-1" aria-hidden="true" />
          </button>
        </div>
        <div className="flex justify-center w-full">
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-1 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeftIcon className="h-3 w-3" aria-hidden="true" />
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-1 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      {/* Desktop version */}
      <div className="hidden sm:flex sm:flex-col sm:items-center w-full">
        <div className="mb-2 text-center">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalMembers)}</span>{' '}
            / <span className="font-medium">{totalMembers}</span>
          </p>
        </div>
        <div className="flex justify-center w-full">
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-1 sm:px-1.5 py-1 sm:py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-1 sm:px-1.5 py-1 sm:py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}