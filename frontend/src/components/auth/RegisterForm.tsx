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
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* AuthError component sẽ được hiển thị ở component cha (Register.tsx) */}

            <label htmlFor="username" className="text-sm text-gray-700">Tên người dùng</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập tên người dùng" className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500" required />

            <label htmlFor="email" className="text-sm text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập Email" className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500" required />

            <label htmlFor="password" className="text-sm text-gray-700">Mật khẩu</label>
            <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>

            <label htmlFor="confirmPassword" className="text-sm text-gray-700">Xác nhận mật khẩu</label>
            <div className="relative">
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white placeholder-gray-500" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300">Đăng ký</button>

            <p className="text-center text-sm text-gray-700 mt-2">Đã có tài khoản? <Link to="/login" className="text-green-600 font-medium hover:underline">Đăng nhập</Link></p>
        </form>
    );
};

export default RegisterForm;