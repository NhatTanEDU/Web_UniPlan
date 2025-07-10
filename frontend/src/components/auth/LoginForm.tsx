import React, { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { COLORS } from "../../constants/colors"; // Cập nhật đường dẫn đúng với dự án của bạn
interface LoginFormProps {
  onLoginSuccess: (token: string, user: { id: string; name: string; email: string; role?: "admin" | "paid" | "free" }) => void;
  onError: (message: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: username.trim(),
        password,
      });

      const { token, user } = response.data;
      // Không cần lưu riêng vào localStorage nữa, AuthContext sẽ lưu
      // AuthContext sẽ quản lý token và user
      onLoginSuccess(token, user);

    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        onError(err.response?.data?.message || "Đăng nhập thất bại");
      } else {
        onError("Lỗi kết nối tới máy chủ");
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4">
      {/* Tên đăng nhập / Email */}
      <label htmlFor="username" className="text-xs sm:text-sm text-gray-700 font-medium">
        Tên đăng nhập / Email
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nhập tài khoản của bạn"
        className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500 transition-all duration-200"
        required
      />

      {/* Mật khẩu */}
      <label htmlFor="password" className="text-xs sm:text-sm text-gray-700 font-medium">
        Mật khẩu
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          className="px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 w-full text-sm sm:text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500 transition-all duration-200"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Hiện/ẩn mật khẩu"
        >
          {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Ghi nhớ + Quên mật khẩu */}
      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-700 flex-wrap gap-2">
        <label className="flex items-center gap-2 min-w-0">
          <input type="checkbox" className="accent-primary flex-shrink-0" />
          <span className="truncate">Ghi nhớ đăng nhập</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-[#6A5ACD] hover:underline whitespace-nowrap"
          style={{ color: COLORS.primary }}
        >
          Quên mật khẩu?
        </Link>
      </div>

      {/* Nút submit */}
      <button
        type="submit"
        className="w-full bg-[#6A5ACD] text-white py-2 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all duration-300 mt-2 sm:mt-4 active:scale-95"
        style={{
          backgroundColor: COLORS.primary,
          boxShadow: `0 4px 6px rgba(46, 134, 171, 0.2)`,
        }}
      >
        Đăng nhập
      </button>

      {/* Link đăng ký */}
      <p className="text-center text-xs sm:text-sm text-gray-700 mt-2">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="text-green-600 font-medium hover:underline"
          style={{ color: COLORS.secondary }}
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;