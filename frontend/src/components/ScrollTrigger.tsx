// src/components/ScrollTrigger.tsx

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollTriggerProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  ease?: string | number[];
  amount?: "some" | "all" | number;
}

const ScrollTrigger = ({
  children,
  delay = 0,
  duration = 0.5, // GIẢM THỜI LƯỢNG CHUYỂN ĐỘNG (từ 0.6 xuống 0.5)
  direction = "up",
  once = true,
  ease = "easeOut",
  amount = 0.1 // GIÁ TRỊ MẶC ĐỊNH AMOUNT NHỎ HƠN để kích hoạt sớm (0.1 hoặc 0.05)
}: ScrollTriggerProps) => {
  const shouldReduceMotion = useReducedMotion();

  const getOffset = () => {
    if (shouldReduceMotion || direction === "none") {
      return { x: 0, y: 0 };
    }
    switch (direction) {
      case "up":
        return { y: 30, x: 0 }; // GIẢM OFFSET Y (từ 40 xuống 30)
      case "down":
        return { y: -30, x: 0 }; // GIẢM OFFSET Y
      case "left":
        return { x: 30, y: 0 }; // GIẢM OFFSET X
      case "right":
        return { x: -30, y: 0 }; // GIẢM OFFSET X
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      // KHÔNG CẦN THAY ĐỔI CÁC THUỘC TÍNH NÀY - CHÚNG VỐN DĨ ĐÃ ĐÚNG CÁCH HOẠT ĐỘNG
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          delay,
          duration,
          ease
        }
      }}
      viewport={{
        once,
        margin: "-50px", // Giữ nguyên margin âm để kích hoạt sớm hơn
        amount
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollTrigger;