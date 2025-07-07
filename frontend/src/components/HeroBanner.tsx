// src/components/HeroBanner.tsx

import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../constants/colors"; // Import COLORS
import videoDemo from "../assets/video/Tạo_Video_Demo_UniPlan.mp4"; // <-- Đã sửa đường dẫn này

const HeroBanner = () => {
  return (
    <section
      className="relative w-full min-h-[70vh] h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: COLORS.primary,
      }}
    >
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        src={videoDemo}
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay để làm mờ video và giúp chữ dễ đọc */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(120deg, ${COLORS.textDark}E0 0%, ${COLORS.primary}C0 100%)`,
        }}
      ></div>

      {/* Nội dung Banner */}
      <div className="max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 relative z-20 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
        >
          <motion.h1
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 break-words"
            style={{
              color: COLORS.surface,
              textShadow: `2px 2px 0 ${COLORS.accent}, 0 5px 15px rgba(0,0,0,0.4)`,
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Quản lý dự án thông minh hơn,<br className="block md:hidden" />
            <span style={{ color: COLORS.accent }}> hiệu quả hơn</span>
          </motion.h1>
          <motion.p
            className="text-base xs:text-lg md:text-xl opacity-90 max-w-xl mx-auto"
            style={{
              color: COLORS.surface,
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            UniPlan giúp đội nhóm của bạn cộng tác trơn tru, hoàn thành dự án đúng thời hạn và đạt được mục tiêu.
          </motion.p>
          <div className="flex flex-col xs:flex-row justify-center items-center gap-4 mt-6 sm:mt-8 w-full">
            <motion.button
              onClick={() => console.log("Bắt đầu dùng thử miễn phí")}
              className="w-full xs:w-auto px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
                hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.surface,
                boxShadow: `0 6px 20px ${COLORS.accent}60`,
              }}
              aria-label="Bắt đầu dùng thử miễn phí"
              viewport={{ once: true, amount: 0.5 }}
            >
              Dùng thử miễn phí
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;