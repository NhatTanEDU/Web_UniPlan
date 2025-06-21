import React from 'react';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
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
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!subscriptionStatus) {
    return null;
  }

  const { subscriptionType, daysRemaining } = subscriptionStatus;

  // Define badge styles and content based on subscription type
  const getBadgeConfig = () => {
    switch (subscriptionType) {
      case 'monthly':
      case 'yearly':
        return {
          icon: Crown,
          text: subscriptionType === 'monthly' ? 'Premium Monthly' : 'Premium Yearly',
          bgColor: 'bg-gradient-to-r from-purple-500 to-blue-500',
          textColor: 'text-white',
          iconColor: 'text-yellow-300'
        };
      
      case 'free_trial':
        const isExpiringSoon = daysRemaining !== undefined && daysRemaining <= 3;
        return {
          icon: isExpiringSoon ? AlertTriangle : Clock,
          text: `Trial (${daysRemaining || 0} ngày)`,
          bgColor: isExpiringSoon 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
            : 'bg-gradient-to-r from-green-500 to-teal-500',
          textColor: 'text-white',
          iconColor: isExpiringSoon ? 'text-yellow-100' : 'text-green-100'
        };
      
      case 'expired':
        return {
          icon: AlertTriangle,
          text: 'Expired',
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          textColor: 'text-white',
          iconColor: 'text-red-100'
        };      default:
        return {
          icon: Crown,
          text: 'Nâng cấp',
          bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        };
    }
  };
  const { icon: Icon, text, bgColor, textColor, iconColor } = getBadgeConfig();

  // Check if this is a free plan that should be clickable
  const isUpgradeable = subscriptionStatus?.subscriptionType === 'free';

  const BadgeContent = () => (
    <>
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>
        {text}
      </span>
      
      {/* Active indicator */}
      {subscriptionStatus?.isActive && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      )}
    </>
  );

  if (isUpgradeable && onUpgradeClick) {
    return (
      <button
        onClick={onUpgradeClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ${bgColor}`}
      >
        <BadgeContent />
      </button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm ${bgColor}`}>
      <BadgeContent />
    </div>
  );
};

export default SubscriptionBadge;
