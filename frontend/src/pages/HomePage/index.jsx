import React from 'react';
import { Card, Empty } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { PageTitle, PageContainer } from '../../components/Common';


const HomePage = () => {
  return (
    <PageContainer>
      <PageTitle
        title="仪表盘"
        subtitle="系统概览和快速操作"
        icon={<DashboardOutlined />}
      />

      {/* 仪表盘内容区域 - 暂时空置 */}
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="仪表盘内容开发中..."
        />
      </Card>
    </PageContainer>
  );
};

export default HomePage;