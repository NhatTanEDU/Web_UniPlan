// src/context/NetworkContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { NavigateFunction } from "react-router-dom";

interface NetworkContextType {
  isOnline: boolean;
}

export const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
});

interface NetworkProviderProps {
  children: ReactNode;
  navigate: NavigateFunction;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children, navigate }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("Network status: Online");
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log("Network status: Offline");
      navigate("/404");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [navigate]);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};