import React from 'react';
import { Layout as AntLayout } from 'antd';

const { Content: AntContent } = AntLayout;

const AppContent = ({ children }) => {
  return (
    <AntContent className="p-6 overflow-auto">
      <div className="fade-in">
        {children}
      </div>
    </AntContent>
  );
};

export default AppContent;
