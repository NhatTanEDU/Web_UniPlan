export const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Thấp',
  Medium: 'Trung bình',
  High: 'Cao',
  Critical: 'Khẩn cấp',
};

export const STATUS_LABELS: Record<string, string> = {
  Planning: 'Lập kế hoạch',
  Active: 'Đang hoạt động',
  'On Hold': 'Tạm dừng',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Archived: 'Đã lưu trữ',
};

// Options arrays for dropdowns with color styling
export const PROJECT_STATUS_OPTIONS = [
  { 
    value: 'Planning', 
    label: 'Lập kế hoạch', 
    colorClasses: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', 
    iconColor: 'text-gray-500' 
  },
  { 
    value: 'Active', 
    label: 'Đang hoạt động', 
    colorClasses: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200', 
    iconColor: 'text-blue-500' 
  },
  { 
    value: 'On Hold', 
    label: 'Tạm dừng', 
    colorClasses: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200', 
    iconColor: 'text-yellow-500' 
  },
  { 
    value: 'Completed', 
    label: 'Hoàn thành', 
    colorClasses: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200', 
    iconColor: 'text-green-500' 
  },
  { 
    value: 'Cancelled', 
    label: 'Đã hủy', 
    colorClasses: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200', 
    iconColor: 'text-red-500' 
  },
  { 
    value: 'Archived', 
    label: 'Đã lưu trữ', 
    colorClasses: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-200', 
    iconColor: 'text-indigo-500' 
  }
];

export const PROJECT_PRIORITY_OPTIONS = [
  { 
    value: 'Low', 
    label: 'Thấp', 
    colorClasses: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200' 
  },
  { 
    value: 'Medium', 
    label: 'Trung bình', 
    colorClasses: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-200' 
  },
  { 
    value: 'High', 
    label: 'Cao', 
    colorClasses: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200' 
  },
  { 
    value: 'Critical', 
    label: 'Khẩn cấp', 
    colorClasses: 'bg-pink-200 text-pink-800 dark:bg-pink-700 dark:text-pink-100' 
  }
];

// Helper functions to get labels
export const getProjectStatusLabel = (statusValue?: string): string => {
  if (!statusValue) return 'Không rõ';
  const status = PROJECT_STATUS_OPTIONS.find(s => s.value.toLowerCase() === statusValue.toLowerCase());
  return status ? status.label : statusValue.charAt(0).toUpperCase() + statusValue.slice(1).replace('-', ' ');
};

export const getProjectPriorityLabel = (priorityValue?: string): string => {
  if (!priorityValue) return 'Không rõ';
  const priority = PROJECT_PRIORITY_OPTIONS.find(p => p.value.toLowerCase() === priorityValue.toLowerCase());
  return priority ? priority.label : priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1);
};

// Helper functions to get color classes
export const getProjectStatusColorClasses = (statusValue?: string): string => {
  if (!statusValue) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  const status = PROJECT_STATUS_OPTIONS.find(s => s.value.toLowerCase() === statusValue.toLowerCase());
  return status ? status.colorClasses : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

export const getProjectStatusIconColor = (statusValue?: string): string => {
  if (!statusValue) return 'text-gray-400';
  const status = PROJECT_STATUS_OPTIONS.find(s => s.value.toLowerCase() === statusValue.toLowerCase());
  return status ? status.iconColor : 'text-gray-400';
};

export const getProjectPriorityColorClasses = (priorityValue?: string): string => {
  if (!priorityValue) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  const priority = PROJECT_PRIORITY_OPTIONS.find(p => p.value.toLowerCase() === priorityValue.toLowerCase());
  return priority ? priority.colorClasses : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};
