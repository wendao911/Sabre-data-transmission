import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { FileOutlined, UnlockOutlined, SettingOutlined } from '@ant-design/icons';

const QuickActions = ({ navigate }) => {
  const actions = [
    {
      title: '文件浏览器',
      icon: <FileOutlined />,
      onClick: () => navigate('/files'),
      type: 'primary'
    },
    {
      title: '开始解密',
      icon: <UnlockOutlined />,
      onClick: () => navigate('/files'),
      type: 'default'
    },
  ];

  return (
    <Card title="快速操作">
      <Row gutter={[16, 16]}>
        {actions.map((action, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Button 
              type={action.type}
              size="large" 
              block
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.title}
            </Button>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export { QuickActions };
