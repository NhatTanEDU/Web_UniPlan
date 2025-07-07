// src/components/HeroOverview.tsx

import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../constants/colors";
import overviewImage from "../assets/anhbaoquatUniPlan.png"; // <-- Import hình ảnh bao quát

const HeroOverview = () => {
  return (
    <section
      className="py-20 md:py-32 relative overflow-hidden" // Padding tương tự các Hero khác
      style={{
        background: `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.surface} 100%)`, // Màu nền sáng, chuyển từ kem sang trắng
      }}
    >
      <div className="max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 relative z-20 text-center w-full">
        {/* Tiêu đề cho phần tổng quan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-4xl mx-auto space-y-4 sm:space-y-6 mb-8 md:mb-12 lg:mb-16"
        >
          <motion.h1
            className="text-xl xs:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 uppercase tracking-wide"
            style={{
              color: COLORS.primary,
              textShadow: `1px 1px 0 ${COLORS.secondary}55, 0 2px 4px ${COLORS.textDark}10`
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            CÁI NHÌN TOÀN DIỆN
          </motion.h1>
          <motion.h2
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 break-words"
            style={{
              color: COLORS.textDark,
              textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            UniPlan: <span style={{ color: COLORS.accent }}>Sức mạnh tổng hợp</span> cho mọi dự án
          </motion.h2>
          <motion.p
            className="text-base xs:text-lg md:text-xl opacity-90 max-w-xl mx-auto"
            style={{
              color: COLORS.textDark,
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Khám phá tất cả các công cụ và tính năng mà UniPlan mang lại, được thiết kế để hỗ trợ bạn từ ý tưởng ban đầu đến khi hoàn thành dự án.
          </motion.p>
        </motion.div>

        {/* Hình ảnh bao quát */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border w-full max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto aspect-[16/9] lg:aspect-auto"
          style={{
            borderColor: COLORS.primary,
            boxShadow: `0 12px 40px ${COLORS.textDark}40`
          }}
        >
          <img
            src={overviewImage}
            alt="Tổng quan UniPlan"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300"
          />
        </motion.div>

        {/* Nút CTA (tùy chọn) */}
        <motion.button
          onClick={() => console.log("Khám phá chi tiết")}
          className="mt-10 xs:mt-12 md:mt-16 px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
                     hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full xs:w-auto min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          style={{
            backgroundColor: COLORS.accent,
            color: COLORS.surface,
            boxShadow: `0 6px 20px ${COLORS.accent}60`
          }}
          aria-label="Khám phá chi tiết"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Tìm hiểu thêm về UniPlan
        </motion.button>
      </div>
    </section>
  );
};

export default HeroOverview;