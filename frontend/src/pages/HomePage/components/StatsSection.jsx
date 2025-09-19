import React from 'react';
import { Card, Row, Col, Statistic, Skeleton } from 'antd';
import { FileOutlined, UnlockOutlined } from '@ant-design/icons';

const StatsSection = ({ stats, loading }) => {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map(i => (
          <Col xs={24} sm={8} key={i}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="总文件数"
            value={stats?.totalFiles || 0}
            prefix={<FileOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="已解密文件"
            value={stats?.decryptedFiles || 0}
            prefix={<UnlockOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="系统状态"
            value={stats?.systemStatus || '正常'}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export { StatsSection };
