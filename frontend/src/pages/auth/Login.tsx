import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { COLORS } from "../../constants/colors";
import LoginForm from "../../components/auth/LoginForm";
import LoginSideInfo from "../../components/auth/LoginSideInfo";
import { AuthError } from "../../components/auth/AuthError";
import { useAuth } from "../../components/context/AuthContext"; // Thêm import useAuth

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  
  const handleLoginSuccess = (token: string, user: { id: string; name: string; full_name?: string; email: string; role?: "admin" | "paid" | "free" }) => {
    // Gọi login từ AuthContext để lưu token và user info
    login(token, user);
    // Chuyển hướng về trang chủ sau đăng nhập thay vì dashboard cũ
    navigate('/home');
  };

  const handleLoginError = (message: string) => {
    setError(message);
  };

  return (
    // 🌄 Nền tổng thể chuyển nhẹ từ xanh dịu sang tím pastel
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#e8f0ff] to-[#ede7f6] relative">
      {/* Nút quay về ở góc trên cùng bên trái */}
      <motion.div
        className="absolute top-6 left-6 z-10"
        whileHover={{ scale: 1.13 }}
        whileTap={{ scale: 0.96 }}
      >
        <Link
          to="/"
          className="flex items-center gap-1 px-1 py-1 rounded-full font-medium transition-all text-[#5e5728] hover:text-[#a3a06a] focus:outline-none focus:underline"
          style={{
            backgroundColor: 'transparent',
            fontSize: '1rem',
            minHeight: '32px',
            minWidth: 'auto',
            boxShadow: 'none',
            fontWeight: 500
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span style={{fontSize: '1rem'}}>Quay về</span>
        </Link>
      </motion.div>
      {/* 🧩 Hộp nội dung login với bo tròn + đổ bóng nhẹ */}
      <div className="flex flex-col md:flex-row w-[90%] max-w-[900px] rounded-3xl shadow-xl ring-1 ring-gray-100 overflow-hidden bg-white">
        
        {/* 🔹 Bên trái: logo + mô tả (LoginSideInfo) */}
        <LoginSideInfo />

        {/* 🔸 Bên phải: form đăng nhập */}
        <div className="w-full md:w-1/2 bg-[#fcfcfc] p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-2xl text-center mb-6 font-bold italic text-gray-800 drop-shadow-sm">
            ĐĂNG NHẬP TÀI KHOẢN
          </h2>

          {/* ⚠️ Hiển thị lỗi nếu có */}
          {error && <AuthError message={error} />}

          {/* 📥 Form đăng nhập */}
          <LoginForm onLoginSuccess={handleLoginSuccess} onError={handleLoginError} />
        </div>
      </div>
    </div>
  );
};

export default Login;
