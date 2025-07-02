import React from 'react';
import styles from './GanttTab.module.css';

interface GanttTaskTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  content: any;
}

const GanttTaskTooltip: React.FC<GanttTaskTooltipProps> = ({ visible, x, y, content }) => {
  if (!visible || !content) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 999999,
        pointerEvents: 'none',
        transition: 'opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.98)',
        willChange: 'opacity, transform',
      }}
    >
      <div className="bg-gray-800 text-white border border-gray-600 rounded-lg p-2 md:p-3 shadow-xl max-w-[220px] md:max-w-xs text-xs md:text-sm backdrop-blur-sm bg-opacity-95"
        style={{ minWidth: 180 }}
      >
        <div className="font-semibold text-sm md:text-base mb-2 border-b border-gray-600 pb-1 md:pb-2 text-blue-300">
          {content.text}
        </div>
        <div className="space-y-1 text-gray-200">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-blue-400">👤</span>
            <span className="text-gray-300">Người thực hiện:</span>
            <span className="font-medium">{content.assignee || 'Chưa giao'}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-green-400">📅</span>
            <span className="text-gray-300">Bắt đầu:</span>
            <span className="font-medium">{new Date(content.start_date).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-red-400">📅</span>
            <span className="text-gray-300">Kết thúc:</span>
            <span className="font-medium">{new Date(content.end_date).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-yellow-400">📊</span>
            <span className="text-gray-300">Trạng thái:</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              content.status === 'Hoàn thành' ? 'bg-green-600 text-white' :
              content.status === 'Đang làm' ? 'bg-yellow-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {content.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-purple-400">⚡</span>
            <span className="text-gray-300">Ưu tiên:</span>
            <span className="font-medium">{content.priority || 'Thấp'}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-indigo-400">📈</span>
            <span className="text-gray-300">Tiến độ:</span>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-12 md:w-16 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(content.progress * 100)}%` }}
                ></div>
              </div>
              <span className="font-medium text-blue-300">{Math.round(content.progress * 100)}%</span>
            </div>
          </div>
          {/* CẢNH BÁO RỦI RO */}
          {typeof content.riskLevel === 'number' && content.riskLevel > 0.7 && (
            <div className="text-red-500 font-semibold mt-2 flex items-center">
              <span className={styles.lucideIcon}>⚠️</span>
              Cảnh báo: Công việc có nguy cơ trễ deadline!
            </div>
          )}
          {typeof content.riskLevel === 'number' && content.riskLevel > 0.4 && content.riskLevel <= 0.7 && (
            <div className="text-orange-400 font-semibold mt-2 flex items-center">
              <span className={styles.lucideIcon}>⚠️</span>
              Chú ý: Công việc sắp đến hạn, cần theo dõi!
            </div>
          )}
          {typeof content.riskLevel === 'number' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    content.riskLevel > 0.7
                      ? 'bg-red-600'
                      : content.riskLevel > 0.4
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${content.riskLevel * 100}%` }}
                ></div>
              </div>
              <span className="text-xs">
                {content.riskLevel > 0.7
                  ? 'Cao - Cần ưu tiên xử lý'
                  : content.riskLevel > 0.4
                  ? 'Trung bình - Theo dõi'
                  : 'Thấp'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttTaskTooltip;
