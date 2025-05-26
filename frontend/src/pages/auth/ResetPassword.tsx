import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/Name_Logo_3x.png";
import { Link } from "react-router-dom";

const ChangePassword = () => {
  // State ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State dữ liệu form
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("❗ Vui lòng điền đầy đủ các trường.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ Mật khẩu nhập lại không khớp.");
      return;
    }

    // TODO: Gọi API đổi mật khẩu ở đây
    setMessage("✅ Đổi mật khẩu thành công!");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Container chia trái/phải - responsive */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden bg-white">

        {/* Bên trái: Logo + mô tả - Ẩn trên mobile, hiện từ md trở lên */}
        <div className="hidden md:flex md:w-1/2 px-10 py-12 flex-col items-center justify-center text-center bg-white">
          <img src={logo} alt="UniPlan Logo" className="w-60 mb-4" />
          <p className="text-sm text-gray-700 max-w-xs font-normal"
            style={{
              fontFamily: "Poppins, sans-serif",
              color: "#374151",
              textShadow: "0.5px 0.5px 0 #14AE5C",
            }}>
            UniPlan: Giúp bạn lập kế hoạch, thực hiện và theo dõi dự án một cách dễ dàng.
            Ứng dụng AI để dự đoán trễ hạn và nhắc nhở deadline.
          </p>
        </div>

        {/* Bên phải: Form đổi mật khẩu */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-100 to-purple-200 p-10 flex flex-col justify-center">
          <h2 className="text-2xl text-center mb-6 font-bold italic text-black drop-shadow-sm">
            ĐỔI MẬT KHẨU
          </h2>

          <div className="flex flex-col gap-4">
            {/* Input Password */}
            <label htmlFor="password" className="text-sm text-gray-700">Mật khẩu mới</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Input Confirm Password */}
            <label htmlFor="confirmPassword" className="text-sm text-gray-700">Nhập lại mật khẩu</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Button Submit */}
            <button
              onClick={handleChangePassword}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300"
            >
              Đổi mật khẩu
            </button>

            {/* Hiển thị thông báo */}
            {message && (
              <p className="text-center text-sm mt-2 font-medium text-red-600">
                {message}
              </p>
            )}

            {/* Link quay lại đăng nhập */}
            <p className="text-center text-sm text-gray-700 mt-2">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-green-600 font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
