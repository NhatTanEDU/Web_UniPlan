import React from "react";
import { motion } from "framer-motion";
// import { Button } from "../components/ui/button"; // Giữ nguyên nếu bạn đang dùng Shadcn/ui Button. Nếu không, hãy sử dụng button HTML hoặc custom button.
import ScrollTrigger from "./ScrollTrigger";
import { Link } from "react-router-dom";
import { COLORS } from "../constants/colors"; 

const plans = [
  {
    name: "Miễn phí",
    price: "0đ",
    priceDetail: "",
    featured: false,
    description: "Dành cho cá nhân trải nghiệm miễn phí.",
    features: [],
    buttonText: "Chọn gói",
    link: "/register"
  },
  {
    name: "1 Tháng",
    price: "500.000đ",
    priceDetail: "",
    featured: true, // Nổi bật hơn
    description: "Linh hoạt, phù hợp nhóm nhỏ. Nâng cấp để trải nghiệm đầy đủ tính năng!",
    badge: "Phổ biến nhất",
    badgeColor: COLORS.accent,
    badgeTextColor: COLORS.surface,
    features: [],
    buttonText: "Nâng cấp",
    link: "/register"
  },
  {
    name: "1 Năm",
    price: "3.000.000đ",
    priceDetail: "",
    featured: true, // Nổi bật nhất
    description: "Tiết kiệm tới 50% so với trả tháng. Quản lý không giới hạn, hỗ trợ 24/7!",
    badge: "Tiết kiệm 50%",
    badgeColor: COLORS.primary,
    badgeTextColor: COLORS.surface,
    features: [],
    buttonText: "Nâng cấp ngay",
    link: "/register"
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
            className="max-w-5xl mx-auto mb-4 md:mb-8"
          >
            <h2 
              className="text-3xl xs:text-4xl md:text-7xl font-extrabold leading-tight drop-shadow-lg"
              style={{
                color: COLORS.textDark,
                textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`
              }}
            >
              Gói dịch vụ <span style={{ color: COLORS.accent }}>linh hoạt</span> cho mọi nhu cầu
            </h2>
          </motion.div>

          {/* Các gói dịch vụ */}
          {/* THAY ĐỔI LỚN: Thêm `md:items-stretch` để các cột có chiều cao bằng nhau */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto md:items-stretch"> 
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
                <div className="relative p-8 pt-12 pb-6 flex flex-col flex-grow"> {/* Thêm pt-12 để badge không bị che */}
                  {plan.badge && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 text-xs md:text-sm font-bold uppercase rounded-full shadow-md z-20 animate-fade-in-up whitespace-nowrap"
                      style={{ backgroundColor: plan.badgeColor, color: plan.badgeTextColor, minWidth: 90, maxWidth: '90vw', textAlign: 'center' }}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <h3
                    className={`text-2xl font-bold mb-3 ${plan.featured ? 'text-[color:#F18F01]' : ''}`}
                    style={{ color: plan.featured ? COLORS.accent : COLORS.textDark }}
                  >
                    {plan.name}
                  </h3>
                  <div className="my-6">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: plan.featured ? COLORS.accent : COLORS.primary }}
                    >
                      {plan.price}
                    </span>
                    {plan.priceDetail && (
                      <span className="text-xl font-semibold ml-1" style={{ color: COLORS.textLight }}>
                        {plan.priceDetail}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <div className="mb-6 text-base font-medium text-center" style={{ color: plan.featured ? COLORS.accent : COLORS.textDark, opacity: plan.featured ? 0.95 : 0.8 }}>
                      {plan.description}
                    </div>
                  )}
                  
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
                               hover:scale-105 active:scale-95 active:shadow-inner"
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

          {/* Đã xóa CTA chuyển đến bảng chi tiết */}
        </div>
      </section>
    </ScrollTrigger>
  );
}