import React from 'react';
import { Card, Typography, Row, Col, Table } from 'antd';

const { Title, Text } = Typography;

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
    <div className="px-6 pb-6 pt-0 space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="!m-0">关于应用</Title>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card>
            <Table
              size="middle"
              pagination={false}
              columns={columns}
              dataSource={dataSource}
              rowKey="key"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AboutPage;


