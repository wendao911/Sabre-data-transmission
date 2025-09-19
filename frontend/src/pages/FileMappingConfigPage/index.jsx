import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { FileSyncOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const FileMappingConfigPage = () => {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <FileSyncOutlined className="text-2xl text-purple-600" />
        <div>
          <Title level={2} className="!mb-0">文件映射</Title>
          <Paragraph className="!mb-0 text-gray-600">配置文件路径映射和同步规则</Paragraph>
        </div>
      </div>

      {/* 配置内容 - 暂时空置 */}
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="文件映射配置功能开发中..."
        />
      </Card>
    </div>
  );
};

export default FileMappingConfigPage;
