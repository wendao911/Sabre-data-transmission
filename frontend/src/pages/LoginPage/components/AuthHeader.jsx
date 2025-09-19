import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const AuthHeader = ({ isLogin }) => {
  return (
    <div className="text-center mb-8">
      <div className="text-4xl text-blue-600 mb-4">🔐</div>
      <Title level={2} className="mb-2">
        {isLogin ? '欢迎回来' : '创建账户'}
      </Title>
      <Text type="secondary">
        {isLogin ? '登录到您的账户' : '注册新账户'}
      </Text>
    </div>
  );
};

export { AuthHeader };
