import React from 'react';

interface PricingPageWrapperProps {
  children: React.ReactNode;
}

const PricingPageWrapper: React.FC<PricingPageWrapperProps> = ({ children }) => {
  return (
    <div className="pricing-page-wrapper">
      {children}
    </div>
  );
};

export default PricingPageWrapper;