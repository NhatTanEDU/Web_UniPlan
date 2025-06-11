import React from "react";
import { motion } from "framer-motion";
// import { Button } from "../components/ui/button"; // Giữ nguyên nếu bạn đang dùng Shadcn/ui Button. Nếu không, hãy sử dụng button HTML hoặc custom button.
import ScrollTrigger from "./ScrollTrigger";
import { Link } from "react-router-dom";
import { COLORS } from "../constants/colors"; 

const plans = [
  { 
    name: "Cá nhân", 
    price: "Miễn phí", 
    priceDetail: "", // Thêm chi tiết giá nếu cần
    featured: false,
    description: "Bắt đầu hành trình dự án cá nhân.",
    features: ["Quản lý 1 dự án", "100MB lưu trữ", "Tính năng cơ bản"],
    buttonText: "Bắt đầu miễn phí",
    link: "/register"
  },
  { 
    name: "Nâng cao", 
    price: "499.000đ", 
    priceDetail: "/tháng", // Tách phần "/tháng" ra
    featured: true, 
    description: "Giải pháp toàn diện cho nhóm nhỏ.",
    features: ["Không giới hạn dự án", "10GB lưu trữ", "Giao tiếp nhóm", "Trợ lý AI cơ bản", "Hỗ trợ ưu tiên"],
    buttonText: "Đăng ký ngay",
    link: "/register"
  },
  { 
    name: "Doanh nghiệp", 
    price: "Liên hệ", 
    priceDetail: "",
    featured: false,
    description: "Dành cho các tổ chức lớn, giải pháp tùy chỉnh.",
    features: ["Tính năng nâng cao", "Lưu trữ không giới hạn", "Tích hợp tùy chỉnh", "Hỗ trợ 24/7", "Đào tạo đội ngũ"],
    buttonText: "Liên hệ tư vấn",
    link: "/contact" 
  },
];

export default function HeroPricing() {
  return (
    <ScrollTrigger delay={0.1}>
      <section
        id="pricing"
        className="py-20 md:py-32 relative overflow-hidden" 
        style={{
          background: `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.surface} 100%)`, 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Tiêu đề */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-4xl mx-auto space-y-6 mb-12 md:mb-16"
          >
            <h1 
              className="text-2xl md:text-3xl font-extrabold mb-3 uppercase tracking-wide"
              style={{
                color: COLORS.primary,
                textShadow: `1px 1px 0 ${COLORS.secondary}55, 0 2px 4px ${COLORS.textDark}10`
              }}
            >
              LỰA CHỌN PHÙ HỢP
            </h1>
            <h2 
              className="text-4xl md:text-6xl font-bold leading-tight mb-6"
              style={{
                color: COLORS.textDark,
                textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`
              }}
            >
              Gói dịch vụ <span style={{ color: COLORS.accent }}>linh hoạt</span> cho mọi nhu cầu
            </h2>
            <p
              className="text-lg md:text-xl opacity-90"
              style={{
                color: COLORS.textDark,
              }}
            >
              Chọn gói dịch vụ UniPlan phù hợp nhất với quy mô đội nhóm và mục tiêu quản lý dự án của bạn.
            </p>
          </motion.div>

          {/* Các gói dịch vụ */}
          {/* THAY ĐỔI LỚN: Thêm `md:items-stretch` để các cột có chiều cao bằng nhau */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto md:items-stretch"> 
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 + 0.3, ease: "easeOut" }} 
                viewport={{ once: true, amount: 0.4 }} 
                className={`rounded-2xl overflow-hidden border transition-all duration-300 shadow-lg relative flex flex-col ${ // Thêm flex-col để nội dung đẩy xuống dưới
                  plan.featured
                    ? "transform scale-105 shadow-xl ring-4 ring-offset-4 ring-primary-light" 
                    : "hover:scale-102 hover:shadow-xl" 
                }`}
                style={{
                  border: plan.featured
                    ? `3px solid ${COLORS.accent}` 
                    : `1px solid ${COLORS.secondary}`, 
                  backgroundColor: plan.featured
                    ? COLORS.surface 
                    : COLORS.background, 
                }}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase rounded-full shadow-md z-10"
                    style={{ backgroundColor: COLORS.accent, color: COLORS.surface }}
                  >
                    Phổ biến nhất
                  </div>
                )}
                <div className="p-8 pb-6 flex flex-col flex-grow"> {/* Thêm flex-grow để nội dung đẩy xuống dưới */}
                  <h3
                    className="text-2xl font-bold mb-3" 
                    style={{ color: COLORS.textDark }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: COLORS.textLight }}>{plan.description}</p> 
                  <div className="my-6"> 
                    <span
                      className="text-4xl font-extrabold" // Giảm kích thước font cho giá để tránh cắt chữ
                      style={{ color: COLORS.primary }}
                    >
                      {plan.price}
                    </span>
                    {plan.priceDetail && ( // Hiển thị chi tiết giá (ví dụ: /tháng)
                      <span className="text-xl font-semibold ml-1" style={{ color: COLORS.textLight }}>
                        {plan.priceDetail}
                      </span>
                    )}
                  </div>
                  
                  {/* Danh sách tính năng */}
                  <ul className="text-left space-y-2 mb-8 text-sm flex-grow"> {/* Thêm flex-grow để đẩy nút xuống dưới */}
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center" style={{ color: COLORS.textDark }}>
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.success }}>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Nút hành động cho gói */}
                  <Link
                    to={plan.link} 
                    className="w-full font-semibold py-3 rounded-lg text-lg inline-block text-center // Đảm bảo py và text-lg thống nhất
                               transition-all duration-200 ease-in-out
                               hover:scale-105 active:scale-95 active:shadow-inner" // Giữ hiệu ứng scale cho nút
                    style={{
                      backgroundColor: plan.featured ? COLORS.accent : COLORS.primary, 
                      color: COLORS.surface,
                      boxShadow: plan.featured
                        ? `0 4px 12px ${COLORS.accent}55`
                        : `0 2px 8px ${COLORS.secondary}55`
                    }}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA chuyển đến bảng chi tiết */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Link
              to="/pricingPage"
              className="px-8 py-4 text-xl font-bold rounded-xl
                         transition-all duration-200 ease-in-out
                         hover:bg-primary-darker hover:scale-105 active:scale-95 active:shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                backgroundColor: COLORS.primary, 
                color: COLORS.surface, 
                boxShadow: `0 6px 20px ${COLORS.primary}60`
              }}
            >
              Xem bảng tính năng chi tiết
            </Link>
          </motion.div>
        </div>
      </section>
    </ScrollTrigger>
  );
}