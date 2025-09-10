import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isLogin) {
        result = await login(values.email, values.password);
      } else {
        result = await register(values.name, values.email, values.password);
      }
      
      if (result.success) {
        toast.success(isLogin ? '登录成功！' : '注册成功！');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <div className="text-4xl text-blue-600 mb-4">🔐</div>
          <Title level={2} className="mb-2">
            {isLogin ? '欢迎回来' : '创建账户'}
          </Title>
          <Text type="secondary">
            {isLogin ? '登录到您的账户' : '注册新账户'}
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Form
          name="auth"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{
            email: 'leo.liu@aircambodia.com',
            password: 'K6ITD2025',
          }}
        >
          {!isLogin && (
            <Form.Item
              name="name"
              label="姓名"
              rules={[
                { required: true, message: '请输入您的姓名' },
                { min: 2, message: '姓名至少2个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入姓名"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-lg"
            >
              {isLogin ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Space>
            <Text type="secondary">
              {isLogin ? '还没有账户？' : '已有账户？'}
            </Text>
            <Button
              type="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="p-0"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
