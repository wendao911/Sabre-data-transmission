import React from 'react';

const PageContainer = ({ 
  children, 
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`p-6 ${className}`} 
      style={{ background: '#f8f9fa', minHeight: '100vh' }}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
