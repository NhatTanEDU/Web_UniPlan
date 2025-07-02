import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../constants/colors";
import documentManagerImage from "../assets/Document Manager.png";

const HeroDocumentManager = () => {
  const handleExploreDocManagerClick = () => {
    console.log("Trải nghiệm quản lý tài liệu được click!");
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#f9f7e8] to-[#fff] min-h-[520px] flex items-center justify-center"
      style={{ minHeight: 520 }}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={documentManagerImage}
          alt="Quản lý tài liệu hiệu quả"
          loading="lazy"
          className="w-full h-full object-cover object-center scale-105 brightness-95 animate-fade-in"
        />
        {/* Overlay gradient mạnh hơn để text nổi bật */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Centered Title Content + Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
        className="relative z-10 w-full max-w-3xl mx-auto text-center px-4 flex flex-col items-center justify-center"
      >
        <div className="mb-8 mt-8 md:mt-16">
          <h2
            className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in-up drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)]"
            style={{
              color: COLORS.surface,
              textShadow: `0 4px 24px #000, 2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`,
            }}
          >
            Tài liệu gọn gàng,{" "}
            <span
              style={{
                color: COLORS.accent,
                textShadow: "0 2px 12px #000, 0 0 0 #fff",
              }}
            >
              dự án thành công
            </span>
          </h2>
        </div>
        {/* Button nằm chính giữa dưới tiêu đề */}
        <motion.button
          onClick={handleExploreDocManagerClick}
          className="mt-2 md:mt-4 px-8 py-4 text-lg md:text-xl font-bold rounded-xl shadow-xl bg-[var(--accent,#F18F01)] text-white hover:scale-105 hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 animate-fade-in-up"
          style={{
            backgroundColor: COLORS.accent,
            color: COLORS.surface,
            boxShadow: `0 6px 20px ${COLORS.accent}60`,
          }}
          aria-label="Trải nghiệm quản lý tài liệu"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Trải nghiệm quản lý tài liệu
        </motion.button>
      </motion.div>
    </section>
  );
};

export default HeroDocumentManager;