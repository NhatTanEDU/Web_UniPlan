import React from "react";

interface AuthErrorProps {
  message: string;
}

export const AuthError: React.FC<AuthErrorProps> = ({ message }) => {
  return (
    <>
      {message && (
        <p className="text-red-500 text-sm text-center">{message}</p>
      )}
    </>
  );
};