import React from 'react';

interface UpgradeWrapperProps {
  children: React.ReactNode;
}

const UpgradeWrapper: React.FC<UpgradeWrapperProps> = ({ children }) => {
  return (
    <div className="upgrade-wrapper">
      {children}
    </div>
  );
};

export default UpgradeWrapper;