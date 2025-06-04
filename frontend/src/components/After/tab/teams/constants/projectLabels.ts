// frontend/src/components/After/tab/teams/constants/projectLabels.ts

export const PROJECT_STATUS_OPTIONS = [
  { value: 'Planning', label: 'Lập kế hoạch' },
  { value: 'Active', label: 'Đang hoạt động' },
  { value: 'On Hold', label: 'Tạm dừng' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'Archived', label: 'Đã lưu trữ' }
];

export const PROJECT_PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Thấp' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'High', label: 'Cao' },
  { value: 'Critical', label: 'Khẩn cấp' }
];

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
