import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <div className="auth-wrapper">
      {children}
    </div>
  );
};

export default AuthWrapper;