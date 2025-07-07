import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title, className }) => {
  return (
    <div className={`page-wrapper ${className || ''}`}>
      {title && <h1 className="page-title">{title}</h1>}
      {children}
    </div>
  );
};

export default PageWrapper;