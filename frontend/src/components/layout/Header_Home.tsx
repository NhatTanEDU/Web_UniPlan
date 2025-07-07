import React, { useState, useEffect, useRef } from 'react';
import { Bell, Crown, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserInfo } from '../../hooks/useUserInfo';
import NotificationDropdown from './NotificationDropdown';
// SubscriptionBadge has been removed from the UI
import { Button } from '../ui/button';
import logo from '../../assets/Name_Logo_3x.png';
import userService from '../../services/userService';

interface HeaderProps {
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  const { subscriptionStatus, notifications, unreadCount, resetSubscriptionData } = useSubscription();
  const { userInfo } = useUserInfo(); // Sử dụng hook để lấy thông tin user và avatar
  
  // Debug authentication và token
  useEffect(() => {
    console.log('🔐 [Header_Home] Authentication Debug:');
    
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    const userInfo_local = localStorage.getItem('user');
    
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token preview:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('👤 User info exists:', !!userInfo_local);
    console.log('👤 User from hook:', !!userInfo);
    
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
  }, [userInfo]);

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuBtnRef = useRef<HTMLButtonElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Đóng notifications dropdown khi click ra ngoài
      if (
        showNotifications &&
        notificationsRef.current && 
        !notificationsRef.current.contains(event.target as Node) &&
        notificationBtnRef.current &&
        !notificationBtnRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      
      // Đóng user menu dropdown khi click ra ngoài
      if (
        showUserMenu &&
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target as Node) &&
        userMenuBtnRef.current &&
        !userMenuBtnRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback navigation
      window.location.pathname = path;
    }
    
    // Đóng tất cả dropdown khi điều hướng
    setShowNotifications(false);
    setShowUserMenu(false);
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

  // Hàm xử lý đăng xuất hoàn toàn
  const handleLogout = () => {
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
  };

  const isExpired = subscriptionStatus?.subscriptionType === 'expired';
  const daysRemaining = subscriptionStatus?.daysRemaining || 0;
  const subscriptionType = subscriptionStatus?.subscriptionType;
  const isFreeTrial = subscriptionType === 'free_trial';
  const isPaid = (subscriptionType === 'monthly' || subscriptionType === 'yearly') && !isExpired;
  
  // Animation variants cho dropdowns
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -5,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeInOut" } 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.2, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeInOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 }
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black bg-opacity-40 flex justify-end md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-gray-900 w-64 h-full shadow-lg p-4 flex flex-col gap-2">
              <button
                className="self-end mb-2 text-gray-700 dark:text-gray-200 hover:text-red-500"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Đóng menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <Button onClick={handleStartClick} className="w-full mb-2">Bắt đầu</Button>
              {!isPaid && (
                <Button onClick={handleUpgradeClick} className="w-full mb-2">Nâng cấp</Button>
              )}
              <button onClick={handleAccountClick} className="w-full text-left px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <span>Tài khoản</span>
              </button>
              <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-left px-2 py-2 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Header Row */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex justify-between items-center h-[56px] sm:h-[70px]">
          {/* Logo (Left side) */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleNavigate('/dashboard')}
          >
            <img
              className="h-8 sm:h-10 md:h-14 lg:h-16 xl:h-[68px] 2xl:h-[72px] w-auto"
              src={logo}
              alt="UniPlan Logo"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23007bff'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 9.74 9 9 5.16.74 9-3.45 9-9V7l-10-5z'/%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* Hamburger menu for mobile */}
          <div className="flex md:hidden items-center ml-auto">
            <button
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={() => setShowMobileMenu(true)}
              aria-label="Mở menu"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7" x2="24" y2="7"/><line x1="4" y1="14" x2="24" y2="14"/><line x1="4" y1="21" x2="24" y2="21"/></svg>
            </button>
          </div>
          {/* Right side - Buttons and User/Notifications */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 ml-auto">
            {/* Development: Force refresh button */}
            {process.env.NODE_ENV === 'development' && (
              <motion.button
                onClick={handleForceRefresh}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors hidden sm:inline-flex"
                title="Force refresh subscription status"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                🔄
              </motion.button>
            )}
            
            {/* Icon Pro thay thế text "Đã thanh toán" */}
            {isPaid && (
              <div 
                className="group relative flex items-center p-1 sm:p-2 rounded-full cursor-pointer transition-colors duration-200 hover:bg-yellow-100"
                title="Gói cước của bạn đã được kích hoạt"
              >
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                {/* Tooltip hiển thị khi hover - đã chuyển vị trí từ trên xuống dưới */}
                <span className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  Gói Pro đã kích hoạt
                </span>
              </div>
            )}

            {/* Bắt đầu Button */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2"
                onClick={handleStartClick}
              >
                <span className="inline-block">Bắt đầu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:inline-block">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </motion.div>
            
            {/* Nâng cấp Button */}
            {!isPaid && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={handleUpgradeClick}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                >
                  <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">
                    Nâng cấp
                  </span>
                </Button>
              </motion.div>
            )}

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <motion.button
                ref={notificationBtnRef}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Thông báo"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="absolute right-0 mt-2 z-50 origin-top-right min-w-[280px] sm:min-w-[320px]"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                  >
                    <NotificationDropdown
                      notifications={notifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Menu */}                {userInfo && (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  ref={userMenuBtnRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 sm:gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white p-0.5 sm:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Tài khoản người dùng"
                >
                  {/* Kiểm tra có avatar và URL khác rỗng + hợp lệ hay không */}
                  {userInfo.avatar_url && userInfo.avatar_url.trim() !== "" ? (
                    <div className="relative">
                      {/* Nếu avatar_url là Data URL (base64) thì dùng trực tiếp */}
                      {userInfo.avatar_url.startsWith('data:image') ? (
                        <img
                          src={userInfo.avatar_url}
                          alt={userInfo.full_name || 'User'}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                          onError={() => {
                            // Fallback nếu có lỗi
                            const btn = userMenuBtnRef.current;
                            if (btn) {
                              const imgElements = btn.querySelectorAll('img');
                              imgElements.forEach(img => img.style.display = 'none');
                              
                              // Tạo và thêm avatar mặc định
                              const avatarDiv = document.createElement('div');
                              avatarDiv.className = "h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center";
                              
                              const letterSpan = document.createElement('span');
                              letterSpan.className = "text-white font-medium text-sm";
                              letterSpan.textContent = userInfo.full_name ? 
                                userInfo.full_name.charAt(0).toUpperCase() : 
                                userInfo.email.charAt(0).toUpperCase();
                              
                              avatarDiv.appendChild(letterSpan);
                              btn.appendChild(avatarDiv);
                            }
                          }}
                        />
                      ) : (
                        // Nếu không phải Data URL thì dùng API endpoint để lấy hình từ MongoDB
                        <img
                          src={userService.getAvatarUrl(userInfo._id)}
                          alt={userInfo.full_name || 'User'}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            // Ghi log lỗi tải hình
                            console.error('❌ [Header_Home] Avatar image failed to load:', e);
                            console.log('🔄 [Header_Home] Using fallback avatar for user:', userInfo._id);
                            console.log('🔗 [Header_Home] Failed image URL:', userService.getAvatarUrl(userInfo._id));
                            
                            // Fallback nếu có lỗi
                            const btn = userMenuBtnRef.current;
                            if (btn) {
                              const imgElements = btn.querySelectorAll('img');
                              imgElements.forEach(img => img.style.display = 'none');
                              
                              // Tạo và thêm avatar mặc định
                              const avatarDiv = document.createElement('div');
                              avatarDiv.className = "h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center";
                              
                              const letterSpan = document.createElement('span');
                              letterSpan.className = "text-white font-medium text-sm";
                              letterSpan.textContent = userInfo.full_name ? 
                                userInfo.full_name.charAt(0).toUpperCase() : 
                                userInfo.email.charAt(0).toUpperCase();
                              
                              avatarDiv.appendChild(letterSpan);
                              btn.appendChild(avatarDiv);
                            }
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    // Avatar mặc định khi không có URL
                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {userInfo.full_name ? 
                          userInfo.full_name.charAt(0).toUpperCase() : 
                          userInfo.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 origin-top-right"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                    >
                      <motion.div 
                        className="px-4 py-2 border-b border-gray-200 dark:border-gray-700"
                        variants={itemVariants}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userInfo.full_name || userInfo.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userInfo.email}
                        </p>
                      </motion.div>

                      <motion.button
                        onClick={handleAccountClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        variants={itemVariants}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Tài khoản</span>
                      </motion.button>

                      <motion.hr 
                        className="my-2 border-gray-200 dark:border-gray-700"
                        variants={itemVariants} 
                      />
                      
                      <motion.button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                        variants={itemVariants}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Subscription Warning Banner */}
      <AnimatePresence>
        {isExpired && (
          <motion.div 
            className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-900/30 dark:to-red-800/30 border-b border-red-200 dark:border-red-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-2 w-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  ></motion.div>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Gói dịch vụ của bạn đã hết hạn. Nâng cấp ngay để tiếp tục sử dụng đầy đủ tính năng.
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleUpgradeClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs sm:text-sm font-medium rounded-md"
                  >
                    Nâng cấp ngay
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial Warning Banner */}
      <AnimatePresence>
        {isFreeTrial && daysRemaining <= 3 && daysRemaining > 0 && (
          <motion.div 
            className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 dark:from-yellow-900/30 dark:to-yellow-800/30 border-b border-yellow-200 dark:border-yellow-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-2 w-2 bg-yellow-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  ></motion.div>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Gói dùng thử của bạn sẽ hết hạn trong {daysRemaining} ngày. Nâng cấp để không bị gián đoạn.
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleUpgradeClick}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-xs sm:text-sm font-medium rounded-md"
                  >
                    Nâng cấp
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Xác nhận đăng xuất</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn đăng xuất?<br />Tất cả dữ liệu phiên làm việc sẽ bị xóa.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;