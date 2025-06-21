import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  resetSubscriptionData: () => void;
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
  const unreadCount = notifications.filter(n => !n.read).length;  // Refresh subscription status with cache control
  const refreshSubscriptionStatus = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      console.log('🔐 [SubscriptionContext] Not authenticated, skipping refresh');
      return;
    }
    
    // Debug token và authentication
    const token = localStorage.getItem('token');
    console.log('🔑 [SubscriptionContext] Token exists:', !!token);
    console.log('🔑 [SubscriptionContext] Token preview:', token?.substring(0, 30) + '...');
    console.log('🔑 [SubscriptionContext] isAuthenticated:', isAuthenticated);
    console.log('🔄 [SubscriptionContext] Force refresh:', forceRefresh);
    
    try {
      setIsLoading(true);
      setError(null);      console.log('🚀 [SubscriptionContext] Calling getSubscriptionStatus...');
      const status = await subscriptionService.getSubscriptionStatus(forceRefresh);
      console.log('✅ [SubscriptionContext] Received status:', status);
      setSubscriptionStatus(status);
    } catch (err: any) {
      console.error('❌ [SubscriptionContext] Error refreshing subscription status:', err);
      console.error('❌ [SubscriptionContext] Error response data:', err.response?.data);
      console.error('❌ [SubscriptionContext] Request config headers:', err.config?.headers);
      setError(err.message || 'Không thể tải trạng thái gói dịch vụ');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const notifs = await subscriptionService.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  }, [isAuthenticated]);

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
  };  // Load dữ liệu khi user đăng nhập với auto-refresh sau payment
  useEffect(() => {
    if (isAuthenticated) {
      // Check if need to force refresh after payment
      const needsRefresh = localStorage.getItem('pendingPaymentRefresh');
      
      if (needsRefresh) {
        console.log('🔄 [SubscriptionContext] Found pending payment refresh flag, force refreshing...');
        localStorage.removeItem('pendingPaymentRefresh');
        refreshSubscriptionStatus(true); // Force refresh
      } else {
        refreshSubscriptionStatus(false); // Normal refresh
      }
      
      refreshNotifications();
    } else {
      setSubscriptionStatus(null);
      setNotifications([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshSubscriptionStatus, refreshNotifications]);// Auto refresh subscription status mỗi 5 phút
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      refreshSubscriptionStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshSubscriptionStatus]);

  // Auto refresh notifications mỗi 2 phút
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      refreshNotifications();
    }, 2 * 60 * 1000); // 2 minutes    return () => clearInterval(interval);
  }, [isAuthenticated, refreshNotifications]);

  // Reset subscription data (for logout)
  const resetSubscriptionData = useCallback(() => {
    console.log('🔄 [SubscriptionContext] Resetting subscription data...');
    setSubscriptionStatus(null);
    setNotifications([]);
    setIsLoading(false);
    setError(null);
    console.log('✅ [SubscriptionContext] Subscription data reset completed');
  }, []);

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
    requiresPremium,
    resetSubscriptionData
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
