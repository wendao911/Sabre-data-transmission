import React from 'react';
import { Card, Typography } from 'antd';
import { useLoginPage } from './hooks/useLoginPage';
import { AuthForm } from './components/AuthForm';
import { AuthHeader } from './components/AuthHeader';
import { AuthFooter } from './components/AuthFooter';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { 
    isLogin, 
    loading, 
    error, 
    handleSubmit, 
    toggleMode, 
    clearError 
  } = useLoginPage();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl">
        <AuthHeader isLogin={isLogin} />
        
        <AuthForm 
          isLogin={isLogin}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
        
        <AuthFooter 
          isLogin={isLogin}
          onToggle={toggleMode}
          onClearError={clearError}
        />
      </Card>
    </div>
  );
};

export default LoginPage;
