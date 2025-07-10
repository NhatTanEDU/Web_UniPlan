import React, { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from 'react-router-dom';
import axios, { AxiosError } from "axios";

interface RegisterFormProps {
    onRegisterSuccess: () => void;
    onError: (message: string) => void;
    onValidationError: (errors: Record<string, string>) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onError, onValidationError }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onError(""); // Reset lỗi chung
        onValidationError({}); // Reset lỗi validation cụ thể

        if (password !== confirmPassword) {
            onError("Mật khẩu không khớp");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    name: username.trim(),
                    email: email.trim(),
                    password
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 201) {
                console.log("Đăng ký thành công:", response.data);
                onRegisterSuccess(); // Gọi callback thành công
            } else {
                onError("Đăng ký thất bại"); // Xử lý trường hợp response không phải 201
            }

        } catch (error: any) {
            console.error("Lỗi đăng ký:", error);
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string> }>;
                if (axiosError.response) {
                    const { status, data } = axiosError.response;
                    if (status === 400 && data?.errors) {
                        onValidationError(data.errors); // Gọi callback lỗi validation
                    } else if (status === 409) {
                        onError(data?.message || "Email đã tồn tại");
                    } else {
                        onError(data?.message || "Đăng ký thất bại");
                    }
                } else {
                    onError("Lỗi mạng");
                }
            } else {
                onError("Có lỗi bất ngờ xảy ra");
            }
        }
    };

    return (
        <form onSubmit={handleRegister} className="flex flex-col gap-3 sm:gap-4">
            {/* AuthError component sẽ được hiển thị ở component cha (Register.tsx) */}

            <label htmlFor="username" className="text-xs sm:text-sm text-gray-700 font-medium auth-label">Tên người dùng</label>
            <input 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Nhập tên người dùng" 
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500 transition-all duration-200 auth-input" 
                required 
            />

            <label htmlFor="email" className="text-xs sm:text-sm text-gray-700 font-medium auth-label">Email</label>
            <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Nhập Email" 
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500 transition-all duration-200 auth-input" 
                required 
            />

            <label htmlFor="password" className="text-xs sm:text-sm text-gray-700 font-medium auth-label">Mật khẩu</label>
            <div className="relative">
                <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Nhập mật khẩu" 
                    className="px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 w-full text-sm sm:text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500 transition-all duration-200 auth-input" 
                    required 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                    {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
            </div>

            <label htmlFor="confirmPassword" className="text-xs sm:text-sm text-gray-700 font-medium auth-label">Xác nhận mật khẩu</label>
            <div className="relative">
                <input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Nhập lại mật khẩu" 
                    className="px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 w-full text-sm sm:text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500 transition-all duration-200 auth-input" 
                    required 
                />
                <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                    {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
            </div>

            <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-2 sm:py-3 text-sm sm:text-base rounded-xl font-semibold hover:bg-blue-600 active:bg-blue-700 transition-all duration-300 mt-2 sm:mt-4 auth-button"
            >
                Đăng ký
            </button>

            <p className="text-center text-xs sm:text-sm text-gray-700 mt-2 auth-link">
                Đã có tài khoản? <Link to="/login" className="text-green-600 font-medium hover:underline">Đăng nhập</Link>
            </p>
        </form>
    );
};

export default RegisterForm;