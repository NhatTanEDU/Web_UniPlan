import React, { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { COLORS } from "../../constants/colors"; // Cập nhật đường dẫn đúng với dự án của bạn
interface LoginFormProps {
  onLoginSuccess: (token: string, user: { id: string; name: string; email: string }) => void;
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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
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
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      {/* Tên đăng nhập / Email */}
      <label htmlFor="username" className="text-sm text-gray-700">
        Tên đăng nhập / Email
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nhập tài khoản của bạn"
        className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500"
        required
      />

      {/* Mật khẩu */}
      <label htmlFor="password" className="text-sm text-gray-700">
        Mật khẩu
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          className="px-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          aria-label="Hiện/ẩn mật khẩu"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Ghi nhớ + Quên mật khẩu */}
      <div className="flex justify-between items-center text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-primary" />
          Ghi nhớ đăng nhập
        </label>
        <Link
          to="/forgot-password"
          className="text-[#6A5ACD] hover:underline"
          style={{ color: COLORS.primary }}
        >
          Quên mật khẩu?
        </Link>
      </div>

      {/* Nút submit */}
      <button
        type="submit"
        className="w-full bg-[#6A5ACD] text-white py-3 rounded-xl font-semibold transition-all duration-300"
        style={{
          backgroundColor: COLORS.primary,
          boxShadow: `0 4px 6px rgba(46, 134, 171, 0.2)`,
        }}
      >
        Đăng nhập
      </button>

      {/* Link đăng ký */}
      <p className="text-center text-sm text-gray-700 mt-2">
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