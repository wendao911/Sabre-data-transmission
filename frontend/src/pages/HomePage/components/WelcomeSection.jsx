import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const WelcomeSection = ({ navigate }) => {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="text-center py-8">
        <Title level={1} className="text-white mb-4">
          欢迎使用 Sabre Data Management Desktop
        </Title>
        <Paragraph className="text-blue-100 text-lg mb-6">
          专业的文件浏览与解密系统，让您的文件浏览更加高效安全
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/files')}
            className="bg-white text-blue-600 border-white hover:bg-blue-50"
          >
            开始使用
            <ArrowRightOutlined />
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export { WelcomeSection };
