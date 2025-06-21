import React, { useState, useEffect } from 'react';
import { Bell, Crown, User, Settings, LogOut, CreditCard } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import NotificationDropdown from './NotificationDropdown';
import SubscriptionBadge from './SubscriptionBadge';
import { Button } from '../ui/button';
import logo from '../../assets/Name_Logo_3x.png';

interface HeaderProps {
  user?: {
    name?: string;
    full_name?: string;
    username?: string;
    email: string;
    avatar?: string;
  };
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
  const { subscriptionStatus, notifications, unreadCount, isLoading, resetSubscriptionData } = useSubscription();
  
  // Debug authentication và token
  useEffect(() => {
    console.log('🔐 [Header_Home] Authentication Debug:');
    
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token preview:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('👤 User info exists:', !!userInfo);
    console.log('👤 User prop exists:', !!user);
    
    // Kiểm tra token có hết hạn không
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;
        
        console.log('⏰ Token expiry:', new Date(payload.exp * 1000).toLocaleString());
        console.log('⏰ Current time:', new Date(currentTime * 1000).toLocaleString());
        console.log('❌ Token expired:', isExpired);
        console.log('👤 Token user ID:', payload.id);
        console.log('📧 Token email:', payload.email);
        
        if (isExpired) {
          console.error('🚨 TOKEN HẾT HẠN - Cần đăng nhập lại!');
        }
      } catch (error) {
        console.error('❌ Error decoding token:', error);
      }
    } else {
      console.warn('🚨 KHÔNG CÓ TOKEN - User chưa đăng nhập!');
    }
  }, [user]);

  useEffect(() => {
    console.log('🔎 [Header_Home] subscriptionStatus:', subscriptionStatus);
    if (subscriptionStatus) {
      // Nếu API có trả về field raw `current_plan_type`
      // (tùy backend bạn gọi đúng key này)
      // hoặc dùng subscriptionType
      const raw = (subscriptionStatus as any).current_plan_type;
      console.log(
        '📦 current_plan_type:',
        raw ?? subscriptionStatus.subscriptionType ?? 'undefined'
      );
      console.log('� isPremium:', subscriptionStatus.isPremium);
      console.log('🔍 isActive:', subscriptionStatus.isActive);
      console.log('🔍 daysRemaining:', subscriptionStatus.daysRemaining);
    } else {
      console.warn('📦 subscriptionStatus is null - API call failed or user not authenticated');
    }
  }, [subscriptionStatus]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback navigation
      window.location.pathname = path;
    }
  };

  // Hàm xử lý khi nhấn nút "Bắt đầu" để vào dashboard
  const handleStartClick = () => {
    // Lấy thông tin user từ localStorage để lấy userId
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        const userId = userData.id || userData._id;
        if (userId) {
          handleNavigate(`/dashboard/${userId}`);
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    // Fallback nếu không có userId
    handleNavigate('/dashboard');
  };
  const handleUpgradeClick = () => {
    handleNavigate('/subscription/plans');
  };

  // Debug function to manually refresh subscription
  const handleForceRefresh = () => {
    console.log('🔄 [Header_Home] Manual force refresh triggered');
    if (resetSubscriptionData) {
      resetSubscriptionData();
    }
    // Force refresh subscription status
    window.location.reload();
  };

  const handleAccountClick = () => {
    handleNavigate('/account');
  };
  const handleBillingClick = () => {
    handleNavigate('/subscription/billing');
  };
  // Hàm xử lý đăng xuất hoàn toàn
  const handleLogout = () => {
    // Hiển thị confirmation dialog
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn đăng xuất?\n\nTất cả dữ liệu phiên làm việc sẽ bị xóa.'
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      console.log('🚪 [Header_Home] Starting logout process...');
      
      // 1. Xóa tất cả dữ liệu trong localStorage
      const keysToRemove = [
        'token',
        'user', 
        'userInfo',
        'auth_token',
        'access_token',
        'refresh_token',
        'subscriptionStatus',
        'notifications',
        'preferences',
        'settings',
        'lastActivity',
        'rememberMe'
      ];
      
      // Ghi log những key nào thực sự tồn tại
      const existingKeys = keysToRemove.filter(key => localStorage.getItem(key) !== null);
      console.log('🔍 [Header_Home] Found localStorage keys:', existingKeys);
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed ${key} from localStorage`);
        }
      });
      
      // 2. Xóa tất cả sessionStorage (nếu có)
      const sessionKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        sessionKeys.push(sessionStorage.key(i));
      }
      if (sessionKeys.length > 0) {
        console.log('🔍 [Header_Home] Found sessionStorage keys:', sessionKeys);
        sessionStorage.clear();
        console.log('🗑️ Cleared sessionStorage');
      }
      
      // 3. Xóa tất cả cookies liên quan (nếu có)
      const cookiesToClear = ['token', 'auth', 'session', 'user', 'authToken', 'accessToken'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname.replace('www.', '')};`;
      });
      console.log('🍪 Cleared cookies');
        // 4. Reset UI state và subscription context
      setShowNotifications(false);
      setShowUserMenu(false);
      
      // Reset subscription context data
      if (resetSubscriptionData) {
        resetSubscriptionData();
        console.log('🔄 [Header_Home] Subscription context reset completed');
      }
      
      // 5. Thông báo thành công
      console.log('✅ [Header_Home] Logout cleanup completed successfully');
      console.log('📊 [Header_Home] Remaining localStorage items:', localStorage.length);
      console.log('📊 [Header_Home] Remaining sessionStorage items:', sessionStorage.length);
      
      // 6. Gọi callback onLogout từ parent component
      if (onLogout) {
        console.log('🚀 [Header_Home] Calling parent onLogout callback');
        onLogout();
      } else {
        console.log('🚀 [Header_Home] No parent callback, redirecting to login');
        // Fallback: redirect to login page
        window.location.href = '/login';
      }
      
    } catch (error) {
      console.error('❌ [Header_Home] Error during logout:', error);
      
      // Fallback cleanup nếu có lỗi - clear tất cả
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🆘 [Header_Home] Emergency cleanup completed');
      } catch (clearError) {
        console.error('💥 [Header_Home] Emergency cleanup failed:', clearError);
      }
      
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/login';
      }
    }
  };const isExpired = subscriptionStatus?.subscriptionType === 'expired';
  const daysRemaining = subscriptionStatus?.daysRemaining || 0;
  const subscriptionType = subscriptionStatus?.subscriptionType;
  const isFreeTrial = subscriptionType === 'free_trial';
  const isPaid = (subscriptionType === 'monthly' || subscriptionType === 'yearly') && !isExpired;
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[70px]">
          {/* Logo and Nav Links */}
          <div className="flex items-center gap-3 md:gap-6">
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigate('/dashboard')}
            >
              <img
                className="h-14 w-auto" 
                src={logo}
                alt="UniPlan"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23007bff'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 9.74 9 9 5.16.74 9-3.45 9-9V7l-10-5z'/%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
            {/* Center - Subscription Status */}
          <div className="hidden md:flex justify-center">
            <SubscriptionBadge 
              subscriptionStatus={subscriptionStatus}
              isLoading={isLoading}
              onUpgradeClick={handleUpgradeClick}
            />
          </div>          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Development: Force refresh button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleForceRefresh}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="Force refresh subscription status"
              >
                🔄
              </button>
            )}
            
            {/* Bắt đầu */}
            <Button
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-base font-bold flex items-center gap-2"
              onClick={handleStartClick}
            >
              <span className="inline-block">Bắt đầu</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>            {/* Nếu trả phí (Paid) */}
            {isPaid ? (
              <span className="hidden sm:inline text-sm font-medium text-green-600 dark:text-green-400">
                Đã thanh toán
              </span>
            ) : (
              <Button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Nâng cấp
                </span>
              </Button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50">
                  <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>              )}
            </div>
            
            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium pr-1">
                    {user.full_name || user.name || user.username || user.email.split('@')[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || user.name || user.username || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={handleAccountClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Tài khoản</span>
                    </button>

                    <button
                      onClick={handleBillingClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Thanh toán</span>
                    </button>

                    <hr className="my-2 border-gray-200 dark:border-gray-700" />                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>      {/* Subscription Warning Banner */}
      {isExpired && (
        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-900/30 dark:to-red-800/30 border-b border-red-200 dark:border-red-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Gói dịch vụ của bạn đã hết hạn. Nâng cấp ngay để tiếp tục sử dụng đầy đủ tính năng.
                </span>
              </div>
              <Button
                onClick={handleUpgradeClick}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs sm:text-sm font-medium rounded-md"
              >
                Nâng cấp ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trial Warning Banner */}
      {isFreeTrial && daysRemaining <= 3 && daysRemaining > 0 && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 dark:from-yellow-900/30 dark:to-yellow-800/30 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Gói dùng thử của bạn sẽ hết hạn trong {daysRemaining} ngày. Nâng cấp để không bị gián đoạn.
                </span>
              </div>
              <Button
                onClick={handleUpgradeClick}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-xs sm:text-sm font-medium rounded-md"
              >
                Nâng cấp
              </Button>
            </div>
          </div>
        </div>      )}
    </header>
  );
};

export default Header;