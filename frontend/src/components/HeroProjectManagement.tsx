import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

import { COLORS } from "../constants/colors"; // Import COLORS
import videoKanban from "../assets/video/Video_Demo_Kanban_Board_UniPlan.mp4"; // <-- Import video Kanban của bạn

const features = [
  "Tạo & quản lý dự án đa dạng",
  "Phân quyền thành viên chi tiết",
  "Theo dõi tiến độ & deadline thực tế",
  "Báo cáo chuyên sâu, tức thì"
];

const HeroProjectManagement = () => {
  const handleExploreClick = () => {
    console.log("Khám phá quản lý dự án được click!");
    // Thêm logic điều hướng đến trang chi tiết hoặc cuộn đến section tương ứng
  };

  return (
    // Section chính: ĐỊNH NGHĨA MÀU NỀN TẠI ĐÂY ĐỂ NÓ TRÀN VIỀN
    <section
      className="relative w-full py-20 md:py-32 flex items-center justify-center overflow-hidden" // Thay đổi padding và làm section thành flex container
      style={{
        backgroundColor: COLORS.background, // Màu nền dự phòng nếu video lỗi
      }}
    >
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0" // Đảm bảo video che phủ toàn bộ section
        autoPlay
        loop
        muted
        playsInline // Quan trọng cho autoplay trên di động
        src={videoKanban} // Sử dụng video Kanban của bạn
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay để làm mờ video và giúp chữ dễ đọc */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(160deg, ${COLORS.primary}D0 0%, ${COLORS.secondary}B0 100%)`, // Overlay đậm hơn, có màu
        }}
      ></div>

      {/* Nội dung Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20"> {/* Tăng z-index để nội dung nằm trên overlay */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
          {/* Nội dung bên trái */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.5 }}
            >
              {/* Tiêu đề phụ: QUẢN LÝ DỰ ÁN TOÀN DIỆN */}
              <h1
                className="text-2xl md:text-3xl font-extrabold mb-3 uppercase tracking-wide"
                style={{
                  color: COLORS.accent, // Đổi màu phụ thành accent để nổi bật trên nền tối
                  textShadow: `1px 1px 0 ${COLORS.surface}55, 0 2px 4px ${COLORS.textDark}10` // Shadow sáng hơn
                }}
              >
                QUẢN LÝ DỰ ÁN TOÀN DIỆN
              </h1>
              {/* Tiêu đề chính: Tối ưu mọi dự án, gia tăng hiệu suất */}
              <h2
                className="text-4xl md:text-6xl font-bold leading-tight mb-6"
                style={{
                  color: COLORS.surface, // Đổi màu chính thành surface (trắng) để nổi bật trên nền tối
                  textShadow: `2px 2px 0 ${COLORS.accent}, 0 5px 15px ${COLORS.textDark}20` // Shadow với màu accent
                }}
              >
                Tối ưu mọi dự án, <span style={{ color: COLORS.accent }}>gia tăng hiệu suất</span> {/* Đổi màu nhấn thành accent */}
              </h2>
              <p
                className="text-lg md:text-xl max-w-xl mx-auto lg:mx-0"
                style={{
                  color: COLORS.surface, // Đổi màu text thành surface (trắng)
                  opacity: 0.9
                }}
              >
                UniPlan đơn giản hóa lập kế hoạch, phân công và theo dõi tiến độ công việc, giúp bạn kiểm soát dự án dễ dàng và đạt mục tiêu nhanh hơn.
              </p>
            </motion.div>

            {/* Danh sách tính năng (ít hơn, trực quan hơn) */}
            <motion.ul
              id="feature-list"
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-8 text-left mx-auto lg:mx-0 max-w-md lg:max-w-none"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.5 }}
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start text-base"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 + 0.3, duration: 0.3 }}
                  viewport={{ once: true, amount: 0.5 }}
                >
                  <CheckCircle
                    className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0"
                    style={{ color: COLORS.accent }} // Vẫn là accent
                    aria-hidden="true"
                  />
                  <span style={{ color: COLORS.surface }}> {/* Đổi màu text thành surface (trắng) */}
                    {feature}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Nút Call To Action */}
            <motion.button
              onClick={handleExploreClick}
              className="mt-10 px-8 py-4 text-xl font-bold rounded-xl transition-all shadow-xl
                         hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.surface,
                boxShadow: `0 6px 20px ${COLORS.accent}60`
              }}
              aria-label="Khám phá quản lý dự án"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Bắt đầu hành trình dự án của bạn!
            </motion.button>
          </div>

          {/* Loại bỏ Hình minh họa/Video riêng, vì video đã là nền */}
          {/* <div className="lg:w-1/2 w-full flex justify-center lg:justify-end mt-12 lg:mt-0 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border w-full max-w-xl aspect-video"
              style={{
                borderColor: COLORS.secondary,
                boxShadow: `0 12px 40px ${COLORS.textDark}40`
              }}
            >
              <video
                className="absolute inset-0 w-full h-full object-cover z-0"
                autoPlay
                loop
                muted
                playsInline
                src={videoKanban}
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-10"></div>
            </motion.div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroProjectManagement;