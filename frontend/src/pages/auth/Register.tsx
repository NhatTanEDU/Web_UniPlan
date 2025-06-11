import React, { useState } from "react";
import RegisterForm from "../../components/auth/RegisterForm";
import LoginSideInfo from "../../components/auth/LoginSideInfo";
import { AuthError } from "../../components/auth/AuthError";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const handleRegisterSuccess = () => {
        setError("Đăng ký thành công!");
        setTimeout(() => {
            navigate("/login");
        }, 1500);
    };

    const handleRegisterError = (message: string) => {
        setError(message);
    };

    const handleValidationError = (errors: Record<string, string>) => {
        setValidationErrors(errors);
        setError(""); // Clear global error
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex w-[900px] rounded-3xl shadow-2xl overflow-hidden bg-white flex-col md:flex-row">
                <LoginSideInfo />
                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-gradient-to-br from-blue-50 to-purple-100">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 text-center text-gray-800">
                        Đăng ký tài khoản
                    </h2>

                    {error && <AuthError message={error} />}

                    <RegisterForm
                        onRegisterSuccess={handleRegisterSuccess}
                        onError={handleRegisterError}
                        onValidationError={handleValidationError}
                    />

                    {Object.keys(validationErrors).length > 0 && (
                        <ul className="mt-4 text-sm text-red-600 list-disc pl-5 space-y-1">
                            {Object.entries(validationErrors).map(([field, message]) => (
                                <li key={field}>
                                    <span className="capitalize">{field}</span>: {message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;