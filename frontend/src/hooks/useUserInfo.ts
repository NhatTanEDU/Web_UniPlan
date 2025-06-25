/**
 * Hook quản lý thông tin người dùng
 * 
 * Cập nhật ngày 25/06/2025:
 * - Cải thiện cơ chế phục hồi từ localStorage khi API gặp lỗi
 * - Tối ưu hóa quá trình refresh dữ liệu người dùng
 * - Thêm xử lý lỗi chi tiết với thông báo tiếng Việt
 */

import { useState, useEffect, useCallback } from 'react';
import { userService, UserInfo } from '../services/userService';

// Event emitter để đồng bộ thông tin người dùng giữa các components
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
      console.error('Lỗi khi tải thông tin người dùng:', err);
      
      // Sử dụng dữ liệu từ localStorage khi API gặp lỗi
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user) {
          setUserInfo(user);
          console.log('Đã tải thông tin người dùng từ localStorage');
        }
      } catch (e) {
        console.error('Lỗi khi đọc dữ liệu từ localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu lần đầu khi component được khởi tạo
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Lắng nghe cập nhật thông tin người dùng
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

// Hàm hỗ trợ để làm mới thông tin người dùng từ bất kỳ đâu trong ứng dụng
export const refreshUserInfoGlobally = () => {
  userInfoEmitter.emit();
};
