import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  User,
} from "lucide-react";
import logo from "../../assets/Name_Logo_3x.png";
import { useUserInfo } from "../../hooks/useUserInfo";
// Định nghĩa kiểu cho props (tùy chọn, có thể mở rộng sau)
interface HeaderProps {
    // Có thể thêm props nếu cần, ví dụ: onSearch, userData
  }
  // Component Header
  const Header: React.FC<HeaderProps> = () => {
    // State để quản lý menu user dropdown
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    // Sử dụng custom hook để lấy user info
    const { userInfo, loading } = useUserInfo();

    // Lấy thông tin user với fallback
    const userName = userInfo?.full_name || "Tài khoản";
    const userEmail = userInfo?.email || "email@example.com";
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = userInfo?.avatar_url;

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUserMenuOpen(false);
      navigate("/");
    };

    return (
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2" aria-label="Trang chủ">
                <img src={logo} alt="UniPlan Logo" className="h-10 w-auto" loading="lazy" />
              </Link>
            </div>
            {/* Thanh tìm kiếm */}
            <div className="hidden md:block flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Bạn muốn tìm gì hôm nay?"
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
  
            {/* Các hành động */}
            <div className="flex items-center space-x-4">
              {/* Nút Tạo mới */}
              {/* <QuickCreateMenu /> */}
  
              {/* Thông báo */}
              {/* <NotificationBadge count={3} /> */}
  
              {/* Trợ giúp */}
              {/* <HelpButton /> */}
  
              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2"
                  aria-label="Menu người dùng"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">{userInitial}</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
  
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium dark:text-white">{userName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
                    </div>
                    <ul className="p-2">
                      <li>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left text-sm dark:text-gray-300"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Thông tin cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left text-sm dark:text-gray-300"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Cài đặt
                        </Link>
                      </li>
                      <li className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                        <button
                          className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left text-sm text-red-600 dark:text-red-400"
                          onClick={handleLogout}
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  };
  
  export default Header;
