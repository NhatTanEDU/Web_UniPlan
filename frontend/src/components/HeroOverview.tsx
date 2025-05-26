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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Tiêu đề cho phần tổng quan */}
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
            CÁI NHÌN TOÀN DIỆN
          </h1>
          <h2
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{
              color: COLORS.textDark,
              textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`
            }}
          >
            UniPlan: <span style={{ color: COLORS.accent }}>Sức mạnh tổng hợp</span> cho mọi dự án
          </h2>
          <p
            className="text-lg md:text-xl opacity-90"
            style={{
              color: COLORS.textDark,
            }}
          >
            Khám phá tất cả các công cụ và tính năng mà UniPlan mang lại, được thiết kế để hỗ trợ bạn từ ý tưởng ban đầu đến khi hoàn thành dự án.
          </p>
        </motion.div>

        {/* Hình ảnh bao quát */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border w-full max-w-6xl mx-auto aspect-video lg:aspect-auto" // Lớn hơn, bo tròn, shadow
          style={{
            borderColor: COLORS.primary, // Viền màu primary
            boxShadow: `0 12px 40px ${COLORS.textDark}40` // Shadow sâu hơn
          }}
        >
          <img
            src={overviewImage}
            alt="Tổng quan UniPlan"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300"
          />
          {/* Có thể thêm overlay nếu hình ảnh quá sáng */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div> */}
        </motion.div>

        {/* Nút CTA (tùy chọn) */}
        <motion.button
          onClick={() => console.log("Khám phá chi tiết")}
          className="mt-16 px-8 py-4 text-xl font-bold rounded-xl transition-all shadow-xl
                     hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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