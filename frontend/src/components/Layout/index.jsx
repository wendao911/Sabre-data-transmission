import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from './hooks/useLanguage';
import Sidebar from './components/Sidebar';
import AppHeader from './components/Header';
import AppContent from './components/Content';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AntLayout className="h-screen">
      <Sidebar 
        collapsed={collapsed}
        onMenuClick={handleMenuClick}
        t={t}
      />
      
      <AntLayout>
        <AppHeader
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          user={user}
          onLogout={logout}
          t={t}
        />
        
        <AppContent>
          {children}
        </AppContent>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
