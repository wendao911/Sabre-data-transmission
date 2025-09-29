import React from 'react';
import { Card, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PageTitle, PageContainer, ModernTable } from '../../components/Common';


function AboutPage() {
  const buildDate = new Date(2025, 8, 10).toLocaleDateString();

  const columns = [
    { title: '版本', dataIndex: 'version', key: 'version', width: 180 },
    { title: '构建日期', dataIndex: 'buildDate', key: 'buildDate', width: 220 },
    { title: '开发者', dataIndex: 'developer', key: 'developer', width: 200 },
  ];

  const dataSource = [
    { key: 'row1', version: '1.0.0', buildDate, developer: 'K6 ITD Leo' },
  ];

  return (
    <PageContainer>
      <PageTitle
        title="关于应用"
        subtitle="应用版本信息和开发者信息"
        icon={<InfoCircleOutlined />}
      />

      <Row gutter={16}>
        <Col span={24}>
          <Card>
            <ModernTable size="middle" pagination={false} columns={columns} dataSource={dataSource} rowKey="key" />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

export default AboutPage;


