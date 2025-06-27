import React from "react";
import { motion } from "framer-motion";
import { Folder, Paperclip, Eye, Search } from "lucide-react";
// import Document_Manager_Image from "../assets/Document_Manager.jpg"; // <-- Loại bỏ import ảnh cũ

import { COLORS } from "../constants/colors"; // Import COLORS
import documentManagerImage from "../assets/Document Manager.png"; // <-- Import ảnh mới: Document Manager.png

// Rút gọn text cho các tính năng
const features = [
  {
    icon: <Folder className="w-6 h-6" />,
    title: "Tổ chức chuyên nghiệp",
    desc: "Sắp xếp tài liệu theo dự án/task."
  },
  {
    icon: <Paperclip className="w-6 h-6" />,
    title: "Gắn kết công việc",
    desc: "Đính kèm file trực tiếp vào task."
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Xem trước & phân quyền",
    desc: "Kiểm soát truy cập, bảo mật dữ liệu."
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Tìm kiếm siêu tốc",
    desc: "Tìm thấy mọi thứ trong vài giây."
  }
];

const HeroDocumentManager = () => {
  const handleExploreDocManagerClick = () => {
    console.log("Trải nghiệm quản lý tài liệu được click!");
  };

  return (
    <section
      className="py-20 md:py-32 relative overflow-hidden" 
      style={{
        background: `linear-gradient(45deg, ${COLORS.background} 0%, ${COLORS.surface} 100%)`, 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"> 
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
            QUẢN LÝ TÀI LIỆU
          </h1>
          <h2
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{
              color: COLORS.textDark,
              textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`
            }}
          >
            Tài liệu gọn gàng, <span style={{ color: COLORS.accent }}>dự án thành công</span>
          </h2>
          <p
            className="text-lg md:text-xl opacity-90"
            style={{
              color: COLORS.textDark,
            }}
          >
            Sắp xếp, tìm kiếm và chia sẻ mọi tài liệu liên quan đến dự án một cách thông minh, đảm bảo thông tin luôn trong tầm tay bạn.
          </p>
        </motion.div>

        {/* Hình minh họa lớn (trung tâm) */}
        <div className="w-full max-w-5xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border w-full aspect-video lg:aspect-auto" 
            style={{
              borderColor: COLORS.primary, 
              boxShadow: `0 12px 40px ${COLORS.textDark}40` 
            }}
          >
            <img
              src={documentManagerImage} // <-- Sử dụng ảnh mới: Document Manager.png
              alt="Quản lý tài liệu hiệu quả"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </motion.div>
        </div>

        {/* Feature cards (4 cột riêng biệt, có thể thêm số/điểm nhấn) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.7, duration: 0.5, ease: "easeOut" }} 
              viewport={{ once: true, amount: 0.5 }}
              className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-lg border p-6 text-center
                             relative overflow-hidden group
                             hover:scale-105 hover:shadow-xl transition-all duration-300" 
              style={{
                borderColor: COLORS.secondary, 
                color: COLORS.textDark, 
              }}
            >
              <div className="absolute top-0 right-0 p-2 text-xl font-bold rounded-bl-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                style={{ color: COLORS.accent }}
              >
                {index + 1}
              </div>
              
              <div className="mt-1" style={{ color: COLORS.primary }}>{feature.icon}</div> 
              <div>
                <h4 className="font-semibold text-lg mb-1">{feature.title}</h4>
                <p className="text-sm opacity-80">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleExploreDocManagerClick}
          className="mt-12 xs:mt-16 px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
            hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full xs:w-auto min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          style={{
            backgroundColor: COLORS.accent,
            color: COLORS.surface,
            boxShadow: `0 6px 20px ${COLORS.accent}60`
          }}
          aria-label="Trải nghiệm quản lý tài liệu"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Trải nghiệm quản lý tài liệu
        </motion.button>
      </div>
    </section>
  );
};

export default HeroDocumentManager;