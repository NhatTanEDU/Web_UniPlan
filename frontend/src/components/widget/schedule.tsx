import React from "react";
import { Calendar, GripVertical } from "lucide-react";

const WidgetSchedule: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 w-full h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm text-gray-700 dark:text-white">WIDGET: LỊCH BIỂU</h3>
        <GripVertical size={16} className="text-gray-400 cursor-move" />
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-blue-500" />
          <span>Sự kiện sắp tới</span>
        </div>
        <ul className="ml-5 list-disc text-xs mt-1 space-y-1">
          <li>24/04: Họp dự án</li>
          <li>26/04: Deadline task</li>
        </ul>
      </div>
    </div>
  );
};

export default WidgetSchedule;