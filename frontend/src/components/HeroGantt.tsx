import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, Move3D, Link2, LineChart } from "lucide-react";
// import GanttImage from "../assets/Gantt.jpg"; // <-- Loại bỏ import ảnh tĩnh

import { COLORS } from "../constants/colors"; // Import COLORS
import videoGantt from "../assets/video/Video_Nền_HeroGantt_Đã_Sẵn_Sàng.mp4"; // <-- Import video Gantt

// Rút gọn text cho các tính năng
const features = [
  {
    icon: <CalendarClock className="w-6 h-6" />,
    title: "Tổng quan thời gian",
    desc: "Hiển thị dự án theo dòng thời gian."
  },
  {
    icon: <Move3D className="w-6 h-6" />,
    title: "Kéo thả trực quan",
    desc: "Điều chỉnh nhiệm vụ dễ dàng."
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: "Thiết lập phụ thuộc",
    desc: "Quản lý thứ tự công việc."
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Tiến độ tự động",
    desc: "Luôn đồng bộ với thời gian thực."
  }
];

const HeroGantt = () => {
  const handleViewGanttClick = () => {
    console.log("Xem biểu đồ Gantt được click!");
    // Thêm logic điều hướng hoặc mở công cụ Gantt
  };

  return (
    // Section chính: Định nghĩa màu nền và padding tại đây
    <section
      className="py-20 md:py-32 relative overflow-hidden flex flex-col justify-center items-center" // Thêm flex để căn giữa nội dung
      style={{
        backgroundColor: COLORS.primary, // Màu nền dự phòng nếu video lỗi
      }}
    >
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        src={videoGantt} // Sử dụng video Gantt của bạn
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay để làm mờ video và giúp chữ dễ đọc */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(180deg, ${COLORS.primary}D0 0%, ${COLORS.secondary}B0 100%)`, // Overlay màu primary/secondary
        }}
      ></div>

      {/* Nội dung trung tâm (tiêu đề, mô tả, CTA) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20"> {/* Tăng z-index */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Tiêu đề phụ */}
          <h1
            className="text-2xl md:text-3xl font-extrabold mb-3 uppercase tracking-wide"
            style={{
              color: COLORS.accent, // Màu accent (cam) để nổi bật trên nền tối
              textShadow: `1px 1px 0 ${COLORS.surface}55, 0 2px 4px ${COLORS.textDark}10` // Shadow sáng hơn
            }}
          >
            LỊCH GANTT
          </h1>
          {/* Tiêu đề chính */}
          <h2
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{
              color: COLORS.surface, // Chữ trắng trên nền tối
              textShadow: `2px 2px 0 ${COLORS.accent}, 0 5px 15px ${COLORS.textDark}20`
            }}
          >
            Tổng quan dự án, <span style={{ color: COLORS.accent }}>mọi lúc, mọi nơi</span>
          </h2>
          {/* Đoạn mô tả */}
          <p
            className="text-lg md:text-xl opacity-90 max-w-xl mx-auto"
            style={{
              color: COLORS.surface, // Chữ trắng trên nền tối
            }}
          >
            UniPlan với biểu đồ Gantt trực quan giúp bạn nắm bắt toàn bộ dòng thời gian dự án, dễ dàng quản lý nhiệm vụ và sự phụ thuộc.
          </p>
        </motion.div>

        {/* Nút CTA */}
        <motion.button
          onClick={handleViewGanttClick}
          className="mt-10 px-8 py-4 text-xl font-bold rounded-xl transition-all shadow-xl
                     hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                     focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          style={{
            backgroundColor: COLORS.accent, // Màu accent (cam)
            color: COLORS.surface, // Chữ trắng
            boxShadow: `0 6px 20px ${COLORS.accent}60`
          }}
          aria-label="Xem biểu đồ Gantt"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Xem biểu đồ Gantt chi tiết!
        </motion.button>
      </div>

      {/* Hình minh họa (trước đây) đã bị loại bỏ vì đã có video nền */}
      {/* <div className="w-full mt-16 md:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border w-[90%] max-w-[1200px] mx-auto aspect-video"
          style={{
            borderColor: COLORS.primary,
            boxShadow: `0 12px 40px ${COLORS.textDark}40`
          }}
        >
          <img
            src={GanttImage}
            alt="Biểu đồ Gantt trực quan"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </motion.div>
      </div>
      */}

      {/* Feature cards (bây giờ sẽ được đặt ở cuối section, trên nền video) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-20"> {/* Tăng z-index */}
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.9, duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-lg border p-6 text-center
                       hover:scale-105 hover:shadow-xl transition-all duration-300"
            style={{
              borderColor: COLORS.secondary, // Viền màu secondary
              color: COLORS.textDark, // Màu text mặc định (có thể đổi sang COLORS.surface nếu nền quá tối)
            }}
          >
            <div className="mt-1" style={{ color: COLORS.accent }}>{feature.icon}</div> {/* Icon màu accent */}
            <div>
              <h4 className="font-semibold text-lg mb-1" style={{ color: COLORS.textDark }}>{feature.title}</h4> {/* Chữ textDark */}
              <p className="text-sm opacity-80" style={{ color: COLORS.textLight }}>{feature.desc}</p> {/* Chữ textLight (hoặc COLORS.surface) */}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HeroGantt;