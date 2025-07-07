import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Name_Logo_3x.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendResetLink = async (email: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/password/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "📩 Đường dẫn đặt lại mật khẩu đã được gửi tới email của bạn.");
      } else {
        setMessage(data.message || "❌ Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } catch (error) {
      setMessage("❌ Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "") {
      setMessage("Vui lòng nhập địa chỉ email của bạn.");
    } else {
      await sendResetLink(email);
      setEmail("");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Container chia trái/phải - responsive */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden bg-white">

        {/* Bên trái: Logo + mô tả - Ẩn trên mobile */}
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

        {/* Bên phải: Form quên mật khẩu */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-100 to-purple-200 p-10 flex flex-col justify-center">
          <h2 className="text-2xl text-center mb-6 font-bold italic text-black drop-shadow-sm">
            QUÊN MẬT KHẨU?
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="email" className="text-sm text-gray-700">
              Nhập địa chỉ email của bạn
            </label>
            <input
              id="email"
              type="email"
              title="Email"
              placeholder="nhapemail@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300"
            >
              Gửi liên kết đặt lại mật khẩu
            </button>

            {message && (
              <p className="text-center text-sm text-green-700 font-medium mt-2">
                {message}
              </p>
            )}

            <p className="text-center text-sm text-gray-700 mt-2">
              Đã nhớ mật khẩu?{" "}
              <Link to="/login" className="text-green-600 font-medium hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
