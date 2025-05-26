// components/LinkButton.tsx
import React from "react";

// Định nghĩa kiểu cho props
interface LinkButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

// Component LinkButton - Thay thế cho thẻ a khi không có href hợp lệ
const LinkButton: React.FC<LinkButtonProps> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="hover:underline text-left w-full text-current"
  >
    {children}
  </button>
);

export default LinkButton;