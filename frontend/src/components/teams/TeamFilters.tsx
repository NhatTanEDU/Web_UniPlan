// src/components/teams/TeamFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho filters
interface FilterValues {
  search: string;
  type: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TeamFiltersProps {
  filters: FilterValues;
  onFiltersChange: (newFilterValue: Partial<FilterValues>) => void;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({ filters, onFiltersChange }) => {

  // Hàm xử lý chung cho các input và select
  const handleValueChange = (name: keyof FilterValues, value: string) => {
    onFiltersChange({ [name]: value });
  };

  // Hàm xử lý riêng cho việc đảo chiều sắp xếp
  const handleSortOrderToggle = () => {
    onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Search */}
      <div className="relative md:col-span-1">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm theo tên, mô tả..."
          value={filters.search}
          onChange={(e) => handleValueChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
        />
      </div>

      {/* Filter by type */}
      <select
        name="type"
        value={filters.type}
        onChange={(e) => handleValueChange('type', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
      >
        <option value="">Tất cả loại nhóm</option>
        <option value="Public">Công khai (Public)</option>
        <option value="Private">Riêng tư (Private)</option>
      </select>

      {/* Sort */}
      <div className="flex gap-2">
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={(e) => handleValueChange('sortBy', e.target.value)}
          className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
        >
          {/* Giá trị value phải khớp với tên trường trong model MongoDB */}
          <option value="createdAt">Ngày tạo</option>
          <option value="team_name">Tên nhóm</option> 
          <option value="updatedAt">Cập nhật gần đây</option>
        </select>
        <button
          onClick={handleSortOrderToggle}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          title={filters.sortOrder === 'asc' ? 'Sắp xếp tăng dần (cũ nhất)' : 'Sắp xếp giảm dần (mới nhất)'}
        >
          {/* Thay đổi mũi tên dựa trên chiều sắp xếp */}
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
};

export default TeamFilters;
