import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import subscriptionService, { SubscriptionStatus, NotificationItem } from '../../services/subscriptionService';
import { useAuth } from './AuthContext';

  interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  checkSubscriptionExpiry: () => boolean;
  requiresPremium: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useAuth();
  const isAuthenticated = !!token;

  // Tính số thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.read).length;

  // Refresh subscription status
  const refreshSubscriptionStatus = async () => {
    if (!isAuthenticated) return;
      try {
      setIsLoading(true);
      setError(null);
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('Error refreshing subscription status:', err);
      setError('Không thể tải trạng thái gói dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      const notifs = await subscriptionService.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await subscriptionService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await subscriptionService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Kiểm tra xem subscription có hết hạn không
  const checkSubscriptionExpiry = (): boolean => {
    if (!subscriptionStatus) return true;
    return subscriptionStatus.subscriptionType === 'expired';
  };

  // Kiểm tra xem có cần gói premium không
  const requiresPremium = (): boolean => {
    if (!subscriptionStatus) return true;
    return !subscriptionStatus.isPremium;
  };
  // Load dữ liệu khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscriptionStatus();
      refreshNotifications();
    } else {
      setSubscriptionStatus(null);
      setNotifications([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Auto refresh subscription status mỗi 5 phút
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      refreshSubscriptionStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Auto refresh notifications mỗi 2 phút
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      refreshNotifications();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);
  const value: SubscriptionContextType = {
    subscriptionStatus,
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshSubscriptionStatus,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    checkSubscriptionExpiry,
    requiresPremium
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
