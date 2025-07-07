// src/pages/NotFound.tsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { NetworkContext } from "../components/context/NetworkContext";

// Component NotFound (trang 404)
const NotFound: React.FC = () => {
  const { isOnline } = useContext(NetworkContext);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* Icon cảnh báo */}
        <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />

        {/* Tiêu đề lỗi */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {isOnline ? "404 - Trang không tìm thấy" : "Mất kết nối tới server"}
        </h1>

        {/* Mô tả lỗi */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {isOnline
            ? "Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
            : "Vui lòng kiểm tra kết nối mạng và thử lại."}
        </p>

        {/* Nút quay lại trang chủ */}
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-yellow-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md transition-all hover:shadow-lg"
          aria-label="Quay lại trang chủ"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;