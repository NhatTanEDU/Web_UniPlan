import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { Card, Spin, Alert } from 'antd';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiresPremium?: boolean;
  fallbackPath?: string;
  showUpgradePrompt?: boolean;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiresPremium = false,
  fallbackPath = '/subscription/plans',
  showUpgradePrompt = true
}) => {
  const { subscriptionStatus, isLoading, error, checkSubscriptionExpiry, requiresPremium: needsPremium } = useSubscription();
  const location = useLocation();
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <Alert
          message="Lỗi tải thông tin gói dịch vụ"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  // No subscription status
  if (!subscriptionStatus) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if subscription is expired
  const isExpired = checkSubscriptionExpiry();
  
  // Check if premium is required but user doesn't have it
  const needsUpgrade = requiresPremium && needsPremium();

  // If expired or needs upgrade, redirect or show prompt
  if (isExpired || needsUpgrade) {
    if (showUpgradePrompt) {
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }
    
    // If not showing upgrade prompt, just show message
    return (
      <Card className="max-w-md mx-auto mt-8">
        <Alert
          message={isExpired ? "Gói dịch vụ đã hết hạn" : "Cần nâng cấp gói dịch vụ"}
          description={
            isExpired 
              ? "Vui lòng gia hạn gói dịch vụ để tiếp tục sử dụng."
              : "Tính năng này yêu cầu gói Premium."
          }
          type="warning"
          showIcon
          action={
            <a href={fallbackPath} className="text-blue-600 hover:text-blue-800">
              {isExpired ? "Gia hạn ngay" : "Nâng cấp"}
            </a>
          }
        />
      </Card>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default SubscriptionGuard;
