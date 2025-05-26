// src/components/HeroBanner.tsx

import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../constants/colors"; // Import COLORS
import videoDemo from "../assets/video/Tạo_Video_Demo_UniPlan.mp4"; // <-- Đã sửa đường dẫn này

const HeroBanner = () => {
  return (
    <section
      className="relative w-full h-screen flex items-center justify-center overflow-hidden" // Full height, center content
      style={{
        backgroundColor: COLORS.primary, // Màu nền dự phòng nếu video lỗi
      }}
    >
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0" // Đảm bảo video che phủ toàn bộ section
        autoPlay
        loop
        muted
        playsInline // Quan trọng cho autoplay trên di động
        src={videoDemo} // Sử dụng video demo của bạn
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay để làm mờ video và giúp chữ dễ đọc */}
      <div
        className="absolute inset-0 z-10"
        style={{
          // ĐIỀU CHỈNH OVERLAY TẠI ĐÂY
          // Sử dụng một màu đậm hơn (ví dụ: textDark hoặc primary) với opacity cao hơn
          background: `linear-gradient(120deg, ${COLORS.textDark}E0 0%, ${COLORS.primary}C0 100%)`, // Màu đậm hơn với opacity cao hơn
          // Hoặc đơn giản là một màu overlay solid với opacity cao:
          // background: `${COLORS.textDark}E0`, // textDark với opacity 88%
        }}
      ></div>

      {/* Nội dung Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{
              color: COLORS.surface, // Giữ chữ trắng, vì overlay sẽ tối hơn
              textShadow: `2px 2px 0 ${COLORS.accent}, 0 5px 15px rgba(0,0,0,0.4)`, // Tăng độ đậm của text-shadow
            }}
          >
            Quản lý dự án thông minh hơn,
            <span style={{ color: COLORS.accent }}> hiệu quả hơn</span>
          </h1>
          <p
            className="text-lg md:text-xl opacity-90"
            style={{
              color: COLORS.surface, // Giữ chữ trắng
            }}
          >
            UniPlan giúp đội nhóm của bạn cộng tác trơn tru, hoàn thành dự án đúng thời hạn và đạt được mục tiêu.
          </p>
          <div className="flex justify-center space-x-4 mt-8">
            <motion.button
              onClick={() => console.log("Bắt đầu dùng thử miễn phí")}
              className="px-8 py-4 text-xl font-bold rounded-xl transition-all shadow-xl
                             hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                             focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                backgroundColor: COLORS.accent, // Màu accent (cam)
                color: COLORS.surface,
                boxShadow: `0 6px 20px ${COLORS.accent}60`,
              }}
              aria-label="Bắt đầu dùng thử miễn phí"
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