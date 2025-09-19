import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <DashboardOutlined className="text-2xl text-blue-600" />
        <div>
          <Title level={2} className="!mb-0">仪表盘</Title>
          <Paragraph className="!mb-0 text-gray-600">系统概览和快速操作</Paragraph>
        </div>
      </div>

      {/* 仪表盘内容区域 - 暂时空置 */}
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="仪表盘内容开发中..."
        />
      </Card>
    </div>
  );
};

export default HomePage;