// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useContext } from "react";
import { NetworkContext } from "./NetworkContext";
import { NavigateFunction } from "react-router-dom";

interface AuthContextType {
  role: "admin" | "paid" | "free";
  isProUser: boolean;
  setRole: (role: "admin" | "paid" | "free") => void;
  userId?: string; // Đảm bảo userId được khai báo
}

export const AuthContext = createContext<AuthContextType>({
  role: "free",
  isProUser: false,
  setRole: () => {},
  userId: undefined, // Giá trị mặc định
});

interface AuthProviderProps {
  children: ReactNode;
  navigate: NavigateFunction;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, navigate }) => {
  const [role, setRole] = useState<"admin" | "paid" | "free">("free");
  const isProUser = role === "admin" || role === "paid";
  const { isOnline } = useContext(NetworkContext);
  const [userId, setUserId] = useState<string | undefined>(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : undefined;
  });

  useEffect(() => {    if (!isOnline) {
      navigate("/404");
      return;
    }

    // Giữ logic tĩnh như yêu cầu
    setRole("admin");
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
    }
    // fetchUserRole(); // Giữ comment vì chưa có API
  }, [navigate, isOnline]);

  useEffect(() => {
    console.log("Role updated in AuthProvider:", role);
    console.log("isProUser in AuthProvider:", isProUser);
    console.log("userId in AuthProvider:", userId);
  }, [role, isProUser, userId]);

  console.log("Providing context with role:", role, "userId:", userId);

  return (
    <AuthContext.Provider value={{ role, isProUser, setRole, userId }}>
      {children}
    </AuthContext.Provider>
  );
};