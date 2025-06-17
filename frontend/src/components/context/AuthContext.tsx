// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from "react";
import { NetworkContext } from "./NetworkContext";
import { NavigateFunction } from "react-router-dom";

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: "admin" | "paid" | "free";
}

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: "admin" | "paid" | "free";
  isProUser: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setRole: (role: "admin" | "paid" | "free") => void;
}

export const useAuth = () => useContext(AuthContext);

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  role: "free",
  isProUser: false,
  login: () => {},
  logout: () => {},
  setRole: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  navigate: NavigateFunction;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, navigate }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState<string | null>(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : null;
  });
  const [role, setRole] = useState<"admin" | "paid" | "free">(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : "free";
  });
  const { isOnline } = useContext(NetworkContext);
  const isProUser = role === "admin" || role === "paid";

  const login = useCallback((newToken: string, user: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(newToken);
    setUserId(user.id);
    if (user.role) setRole(user.role);
    console.log("User logged in, token and user info saved.");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUserId(null);
    setRole("free");
    navigate("/login");
    console.log("User logged out.");
  }, [navigate]);

  useEffect(() => {
    if (!isOnline) {
      navigate("/404");
    }
  }, [isOnline, navigate]);

  useEffect(() => {
    console.log("Role updated in AuthProvider:", role);
    console.log("isProUser in AuthProvider:", isProUser);
    console.log("userId in AuthProvider:", userId);
    console.log("token in AuthProvider:", token);
  }, [role, isProUser, userId, token]);

  return (
    <AuthContext.Provider value={{ token, userId, role, isProUser, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};