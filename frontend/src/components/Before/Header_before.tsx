import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "../../assets/Name_Logo_3x.png";
import { COLORS } from "../../constants/colors";

interface HeaderbeforeProps {
  onNavigate: (section: string) => void;
}

const Headerbefore: React.FC<HeaderbeforeProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown và menu khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Góp ý: Đóng menu mobile khi resize màn hình sang desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // 768px là breakpoint của md trong Tailwind
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Góp ý: Kiểm soát cuộn body khi menu mobile mở/đóng
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // Ngăn cuộn body
    } else {
      document.body.style.overflow = ''; // Cho phép cuộn lại
    }
    return () => {
      document.body.style.overflow = ''; // Dọn dẹp khi component unmount
    };
  }, [mobileMenuOpen]);


  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleMenuClick = (section: string) => {
    onNavigate(section);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: COLORS.background }}
      ref={menuRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" aria-label="Trang chủ UniPlan">
              <img
                src={logo}
                alt="UniPlan Logo"
                className="h-12 md:h-16"
                loading="lazy"
                draggable={false}
                style={{ filter: `drop-shadow(0 2px 6px ${COLORS.secondary}88)` }}
              />
            </Link>
          </div>

          {/* Menu desktop */}
          <nav
            className="hidden md:flex items-center space-x-8 text-lg font-semibold"
            style={{ color: COLORS.textDark }}
          >
            {/* Dropdown "Tính năng" */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("features")}
                className="flex items-center space-x-1 transition-all duration-200 ease-in-out
                           hover:text-primary-darker hover:underline hover:underline-offset-4
                           focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                           active:text-primary-active" // Thêm hiệu ứng hover, focus, active
                aria-haspopup="true"
                aria-expanded={activeDropdown === "features"}
                style={{ color: COLORS.textDark }} // Đảm bảo màu text mặc định
              >
                <span>Tính năng</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === "features" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {activeDropdown === "features" && (
                <div
                  className="absolute left-0 mt-2 w-64 rounded-lg shadow-lg border bg-white z-50 overflow-hidden" // Thêm overflow-hidden
                  style={{ borderColor: COLORS.secondary }}
                >
                  <ul className="py-1"> {/* Giảm py để phù hợp hơn với menu dropdown */}
                    <li>
                      <button
                        onClick={() => handleMenuClick("project-management")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200" // Hiệu ứng cho dropdown items
                        style={{ color: COLORS.textDark }}
                      >
                        Quản lý dự án
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenuClick("communicate")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200"
                        style={{ color: COLORS.textDark }}
                      >
                        Giao tiếp nhóm
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenuClick("idea-to-completion")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200"
                        style={{ color: COLORS.textDark }}
                      >
                        Ý tưởng đến hoàn thiện
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenuClick("gantt")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200"
                        style={{ color: COLORS.textDark }}
                      >
                        Gantt chart
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenuClick("ai-assistant")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200"
                        style={{ color: COLORS.textDark }}
                      >
                        Trợ lý AI
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenuClick("document-manager")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200"
                        style={{ color: COLORS.textDark }}
                      >
                        Quản lý tài liệu
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenuClick("pricing")}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                   hover:bg-gray-100 hover:text-primary focus:outline-none focus:bg-gray-100 active:bg-gray-200"
                        style={{ color: COLORS.textDark }}
                      >
                        Bảng giá
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Nút "Giá cả" */}
            <button
              onClick={() => handleMenuClick("pricing")}
              className="transition-all duration-200 ease-in-out
                         hover:text-primary-darker hover:underline hover:underline-offset-4
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                         active:text-primary-active"
              style={{ color: COLORS.textDark }} // Đảm bảo màu text mặc định
            >
              Giá cả
            </button>
            {/* Nút "Hỗ trợ" */}
            <button
              onClick={() => handleMenuClick("support")}
              className="transition-all duration-200 ease-in-out
                         hover:text-primary-darker hover:underline hover:underline-offset-4
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                         active:text-primary-active"
              style={{ color: COLORS.textDark }} // Đảm bảo màu text mặc định
            >
              Hỗ trợ
            </button>
          </nav>

          {/* Nút đăng nhập/đăng ký desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-lg font-semibold transition-all duration-200 ease-in-out
                         hover:text-primary-darker hover:underline hover:underline-offset-4
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                         active:text-primary-active" // Thêm hiệu ứng hover, focus, active
              style={{ color: COLORS.textDark }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-lg text-white font-semibold shadow-md
                         transition-all duration-200 ease-in-out
                         hover:bg-accent-darker hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                         active:scale-95 active:shadow-inner" // Hiệu ứng cho nút CTA
              style={{ backgroundColor: COLORS.accent }}
            >
              Bắt đầu miễn phí
            </Link>
          </div>

          {/* Nút menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu"
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                         transition-colors duration-200 hover:text-primary-darker" // Thêm hiệu ứng hover cho icon
              style={{ color: COLORS.primary }}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t bg-white overflow-y-auto max-h-[calc(100vh-80px)]" // Thêm max-h và overflow-y-auto
          style={{ borderColor: COLORS.secondary }}
        >
          <nav className="px-4 pt-4 pb-6 space-y-4">
            {/* Dropdown "Tính năng" mobile */}
            <button
              onClick={() => toggleDropdown("mobileFeatures")}
              className="flex justify-between w-full font-semibold text-lg
                         transition-colors duration-200 hover:text-primary-darker focus:outline-none"
              style={{ color: COLORS.textDark }}
              aria-haspopup="true"
              aria-expanded={activeDropdown === "mobileFeatures"}
            >
              <span>Tính năng</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeDropdown === "mobileFeatures" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeDropdown === "mobileFeatures" && (
              <div className="pl-4 space-y-2 border-l-2" style={{ borderColor: COLORS.secondary }}>
                <button
                  onClick={() => handleMenuClick("project-management")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Quản lý dự án
                </button>
                <button
                  onClick={() => handleMenuClick("communicate")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Giao tiếp nhóm
                </button>
                <button
                  onClick={() => handleMenuClick("idea-to-completion")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Ý tưởng đến hoàn thiện
                </button>
                <button
                  onClick={() => handleMenuClick("gantt")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Gantt chart
                </button>
                <button
                  onClick={() => handleMenuClick("ai-assistant")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Trợ lý AI
                </button>
                <button
                  onClick={() => handleMenuClick("document-manager")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Quản lý tài liệu
                </button>
                <button
                  onClick={() => handleMenuClick("pricing")}
                  className="block py-2 hover:text-primary w-full text-left transition-colors duration-150 focus:outline-none"
                  style={{ color: COLORS.textDark }}
                >
                  Bảng giá
                </button>
              </div>
            )}

            {/* Các nút độc lập trong menu mobile */}
            <button
              onClick={() => handleMenuClick("pricing")}
              className="block py-2 font-semibold w-full text-left transition-colors duration-200 hover:text-primary-darker focus:outline-none"
              style={{ color: COLORS.textDark }}
            >
              Giá cả
            </button>
            <button
              onClick={() => handleMenuClick("support")}
              className="block py-2 font-semibold w-full text-left transition-colors duration-200 hover:text-primary-darker focus:outline-none"
              style={{ color: COLORS.textDark }}
            >
              Hỗ trợ
            </button>

            <Link
              to="/login"
              className="block py-2 font-semibold transition-colors duration-200 hover:text-primary-darker focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: COLORS.textDark }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="block py-2 px-4 mt-2 rounded-lg text-white font-semibold
                         transition-all duration-200 ease-in-out hover:bg-accent-darker hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                         active:scale-95 active:shadow-inner"
              style={{ backgroundColor: COLORS.accent }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Bắt đầu miễn phí
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Headerbefore;