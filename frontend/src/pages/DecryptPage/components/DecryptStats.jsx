import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FileOutlined } from '@ant-design/icons';

const DecryptStats = ({ stats }) => {
  if (!stats || (stats.total === 0 && stats.success === 0 && stats.failed === 0)) {
    return null;
  }

  return (
    <Card title="解密统计" className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title="总文件数"
            value={stats.total}
            prefix={<FileOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="成功解密"
            value={stats.success}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="解密失败"
            value={stats.failed}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export { DecryptStats };
