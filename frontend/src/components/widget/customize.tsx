import React, { useState } from "react";
import { MoreVertical, BarChart3, ListChecks, Clock, FileText } from "lucide-react";

const widgetTypes = [
  { id: "burndown", label: "Biểu đồ Burn-down", icon: <BarChart3 size={16} /> },
  { id: "taskStats", label: "Thống kê Task", icon: <ListChecks size={16} /> },
  { id: "timeTracking", label: "Time Tracking", icon: <Clock size={16} /> },
  { id: "customReport", label: "Báo cáo tùy chỉnh", icon: <FileText size={16} /> },
];

interface WidgetCustomizeProps {
  onAddWidget: (type: string) => void;
}

const WidgetCustomize: React.FC<WidgetCustomizeProps> = ({ onAddWidget }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm text-gray-700 dark:text-white">WIDGET: TÙY CHỈNH</h3>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Thêm widget"
          >
            <MoreVertical size={18} />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                {widgetTypes.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      onAddWidget(w.id);
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  >
                    <span className="mr-2">{w.icon}</span>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Nhấn vào biểu tượng 3 chấm để thêm widget mới</p>
      </div>
    </div>
  );
};

export default WidgetCustomize;