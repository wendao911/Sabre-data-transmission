import React from 'react';
import { Typography, Button, Space } from 'antd';

const { Text } = Typography;

const AuthFooter = ({ isLogin, onToggle, onClearError }) => {
  const handleToggle = () => {
    onToggle();
    onClearError();
  };

  return (
    <div className="text-center">
      <Space>
        <Text type="secondary">
          {isLogin ? '还没有账户？' : '已有账户？'}
        </Text>
        <Button
          type="link"
          onClick={handleToggle}
          className="p-0"
        >
          {isLogin ? '立即注册' : '立即登录'}
        </Button>
      </Space>
    </div>
  );
};

export { AuthFooter };
