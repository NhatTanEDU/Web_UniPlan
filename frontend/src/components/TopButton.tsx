// components/TopButton.tsx
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const TopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      setVisible(scrolled > 300); // Hiện khi scroll > 300px
    };

    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
        visible
          ? "opacity-100 scale-100 bg-yellow-500 hover:bg-yellow-600 text-white"
          : "opacity-0 scale-0 pointer-events-none"
      }`}
      aria-label="Lên đầu trang"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default TopButton;
