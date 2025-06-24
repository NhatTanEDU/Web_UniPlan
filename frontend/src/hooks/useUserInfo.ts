import { useState, useEffect, useCallback } from 'react';
import { userService, UserInfo } from '../services/userService';

// Event emitter để sync user info across components
class UserInfoEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}

export const userInfoEmitter = new UserInfoEventEmitter();

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getCurrentUser();
      setUserInfo(response.data.user);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin người dùng');
      console.error('Error fetching user info:', err);
      
      // Fallback to localStorage if API fails
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user) {
          setUserInfo(user);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Listen for user info updates
  useEffect(() => {
    const unsubscribe = userInfoEmitter.subscribe(() => {
      fetchUserInfo();
    });

    return unsubscribe;
  }, [fetchUserInfo]);

  const refreshUserInfo = useCallback(() => {
    userInfoEmitter.emit();
  }, []);

  return {
    userInfo,
    loading,
    error,
    refreshUserInfo,
    refetch: fetchUserInfo
  };
};

// Helper function to trigger user info refresh globally
export const refreshUserInfoGlobally = () => {
  userInfoEmitter.emit();
};
