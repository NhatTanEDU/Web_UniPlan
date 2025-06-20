import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import subscriptionService, { SubscriptionStatus, NotificationItem } from '../services/subscriptionService';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearError: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh subscription status
  const refreshSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err: any) {
      console.error('Error fetching subscription status:', err);
      setError(err.message || 'Failed to fetch subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const notifs = await subscriptionService.getNotifications();
      setNotifications(notifs);
      
      const unread = notifs.filter((n: NotificationItem) => !n.read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await subscriptionService.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await subscriptionService.markAllNotificationsAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Initial load and periodic refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshSubscriptionStatus();
      fetchNotifications();
    }

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        refreshSubscriptionStatus();
        fetchNotifications();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          refreshSubscriptionStatus();
          fetchNotifications();
        } else {
          setSubscriptionStatus(null);
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: SubscriptionContextType = {
    subscriptionStatus,
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshSubscriptionStatus,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearError,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
