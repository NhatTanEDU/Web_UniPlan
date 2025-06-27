import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Github, Globe } from "lucide-react";
import ScrollTrigger from "../components/ScrollTrigger";
import SocialLink from "../components/SocialLink";
import { COLORS } from "../constants/colors"; 
import logo from "../assets/Name_Logo_3x.png"; // Import logo để sử dụng

interface FooterProps {
  onFooterClick?: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onFooterClick = () => { } }) => {
  return (
    <ScrollTrigger delay={0.8}>
      <footer
        className="border-t pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-poppins relative overflow-hidden w-full bg-white dark:bg-[#18181b] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 transition-colors duration-300" 
        style={{
          background: `linear-gradient(120deg, ${COLORS.background} 0%, ${COLORS.surface} 100%)`,
          borderColor: COLORS.secondary,
          color: COLORS.textDark,
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {/* Cột 1: Logo và Thông tin Chủ sở hữu */}
          <div className="md:col-span-1 flex flex-col items-start pr-4"> 
            <Link to="/" aria-label="Trang chủ UniPlan">
              <img
                src={logo}
                alt="UniPlan Logo"
                className="h-14 mb-4" // Tăng margin bottom sau logo
                loading="lazy"
                draggable={false}
                style={{ filter: `drop-shadow(0 2px 8px ${COLORS.secondary}88)` }}
              />
            </Link>
            {/* LOẠI BỎ TEXT LOGO VÀ SLOGAN */}
            {/* <p className="font-bold mb-2 text-xl" style={{ color: COLORS.primary, fontFamily: "cursive" }}>UniPlan</p> */}
            {/* <p className="mb-1 text-base" style={{ color: COLORS.secondary, fontWeight: 600 }}>Where Smart Meets Planning</p> */}
            
            <p className="text-sm mt-auto" style={{ color: COLORS.textDark, opacity: 0.7 }}>
              Bởi <span className="font-semibold" style={{ color: COLORS.primary }}>Ma Nguyễn Nhật Tân</span> - Chủ sở hữu UniPlan
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textDark, opacity: 0.6 }}>© 2025 UniPlan. All rights reserved.</p> {/* Dòng copyright chính xác hơn */}
          </div>

          {/* Cột 2: Giới thiệu */}
          <div>
            <h4 className="font-semibold mb-3 text-base" style={{ color: COLORS.primary }}>Giới thiệu</h4> 
            <ul className="space-y-2"> 
              <li>
                <Link
                  to="/about"
                  onClick={() => onFooterClick("Về UniPlan")}
                  className="hover:text-primary-darker transition-colors duration-200" 
                  style={{ color: COLORS.textDark }}
                >
                  Về UniPlan
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() => onFooterClick("Blog")}
                  className="hover:text-primary-darker transition-colors duration-200" 
                  style={{ color: COLORS.textDark }}
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h4 className="font-semibold mb-3 text-base" style={{ color: COLORS.primary }}>Chính sách</h4> 
            <ul className="space-y-2"> 
              <li>
                <Link
                  to="/privacy-policy"
                  onClick={() => onFooterClick("Chính sách bảo mật")}
                  className="hover:text-primary-darker transition-colors duration-200" 
                  style={{ color: COLORS.textDark }}
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-use"
                  onClick={() => onFooterClick("Điều khoản sử dụng")}
                  className="hover:text-primary-darker transition-colors duration-200" 
                  style={{ color: COLORS.textDark }}
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ & Liên hệ */}
          <div>
            <h4 className="font-semibold mb-3 text-base" style={{ color: COLORS.primary }}>Hỗ trợ</h4> 
            <ul className="space-y-2 mb-4"> 
              <li>
                <Link
                  to="/faq"
                  onClick={() => onFooterClick("FAQ")}
                  className="hover:text-primary-darker transition-colors duration-200" 
                  style={{ color: COLORS.textDark }}
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  onClick={() => onFooterClick("Trung tâm hỗ trợ")}
                  className="hover:text-primary-darker transition-colors duration-200" 
                  style={{ color: COLORS.textDark }}
                >
                  Trung tâm trợ giúp
                </Link>
              </li>
            </ul>
            <p className="text-sm mb-3" style={{ color: COLORS.secondary }}>support@uniplan.app</p> 
            <div className="flex space-x-4 text-lg" style={{ color: COLORS.primary }}>
              <SocialLink
                href="https://www.facebook.com/tanma180803"
                icon={<Facebook className="w-6 h-6" />} 
                label="Facebook"
                className="hover:text-accent transition-colors duration-200" 
              />
              <SocialLink
                href="https://github.com/MATan1808"
                icon={<Github className="w-6 h-6" />} 
                label="GitHub"
                className="hover:text-accent transition-colors duration-200" 
              />
              <SocialLink
                href="https://your-website.com"
                icon={<Globe className="w-6 h-6" />} 
                label="Website"
                className="hover:text-accent transition-colors duration-200" 
              />
            </div>
          </div>
        </div>

        {/* Dòng nhỏ ở cuối */}
        <div className="text-center mt-12 text-sm" style={{ color: COLORS.secondary }}> 
          Made with ❤️ by UniPlan Team – Version 1.0.0
        </div>
      </footer>
    </ScrollTrigger>
  );
};

export default Footer;