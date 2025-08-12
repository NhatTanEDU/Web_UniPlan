import React from 'react';
import { Crown, Clock, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { SubscriptionStatus } from '../../services/subscriptionService';

interface SubscriptionBadgeProps {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading?: boolean;
  onUpgradeClick?: () => void;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ 
  subscriptionStatus, 
  isLoading,
  onUpgradeClick
}) => {
  // Loading state với animation mượt hơn
  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</span>
      </motion.div>
    );
  }

  // Không hiển thị gì nếu không có dữ liệu
  if (!subscriptionStatus) {
    return null;
  }

  const { subscriptionType, daysRemaining } = subscriptionStatus;

  // Cấu hình style và nội dung dựa trên loại gói
  const getBadgeConfig = () => {
    switch (subscriptionType) {
      case 'monthly':
      case 'yearly':
        return {
          icon: Crown,
          text: subscriptionType === 'monthly' ? 'Gói Tháng' : 'Gói Năm',
          tooltip: subscriptionType === 'monthly' ? 'Bạn đang sử dụng Gói Tháng Premium' : 'Bạn đang sử dụng Gói Năm Premium',
          bgColor: 'bg-gradient-to-r from-purple-500 to-blue-500',
          textColor: 'text-white',
          iconColor: 'text-yellow-300'
        };
      
      case 'free_trial':
        const isExpiringSoon = daysRemaining !== undefined && daysRemaining <= 3;
        return {
          icon: isExpiringSoon ? AlertTriangle : Clock,
          text: `Dùng thử (${daysRemaining || 0} ngày)`,
          tooltip: isExpiringSoon 
            ? `Gói dùng thử của bạn sẽ hết hạn trong ${daysRemaining} ngày` 
            : `Bạn đang trong giai đoạn dùng thử, còn ${daysRemaining} ngày`,
          bgColor: isExpiringSoon 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
            : 'bg-gradient-to-r from-green-500 to-teal-500',
          textColor: 'text-white',
          iconColor: isExpiringSoon ? 'text-yellow-100' : 'text-green-100'
        };
      
      case 'expired':
        return {
          icon: AlertTriangle,
          text: 'Đã hết hạn',
          tooltip: 'Gói dịch vụ của bạn đã hết hạn, vui lòng nâng cấp để tiếp tục sử dụng các tính năng',
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          textColor: 'text-white',
          iconColor: 'text-red-100'
        };
      
      default:
        return {
          icon: Info,
          text: 'Nâng cấp',
          tooltip: 'Nâng cấp lên gói Premium để mở khóa tất cả tính năng',
          bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        };
    }
  };
  
  const { icon: Icon, text, tooltip, bgColor, textColor, iconColor } = getBadgeConfig();

  // Kiểm tra nếu đây là gói miễn phí cần có thể nâng cấp
  const isUpgradeable = subscriptionStatus?.subscriptionType === 'free';

  const BadgeContent = () => (
    <>
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>
        {text}
      </span>
      
      {/* Đèn báo trạng thái dịch vụ đang hoạt động */}
      {subscriptionStatus?.isActive && (
        <motion.div 
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        ></motion.div>
      )}
    </>
  );

  if (isUpgradeable && onUpgradeClick) {
    return (
      <div className="group relative">
        <motion.button
          onClick={onUpgradeClick}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ${bgColor}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BadgeContent />
        </motion.button>
        
        {/* Tooltip hiển thị khi hover */}
        <span className="absolute hidden group-hover:block z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {tooltip}
        </span>
      </div>
    );
  }

  return (
    <div className="group relative">
      <motion.div 
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm ${bgColor}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BadgeContent />
      </motion.div>
      
      {/* Tooltip hiển thị khi hover */}
      <span className="absolute hidden group-hover:block z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {tooltip}
      </span>
    </div>
  );
};

export default SubscriptionBadge;
