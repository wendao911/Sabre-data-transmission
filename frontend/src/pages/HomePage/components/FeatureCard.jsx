import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const FeatureCard = ({ features }) => {
  return (
    <Row gutter={[24, 24]}>
      {features.map((feature, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <Card
            hoverable
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={feature.action}
          >
            <div className="text-center">
              <div className="mb-4">{feature.icon}</div>
              <Title level={4} className="mb-3">
                {feature.title}
              </Title>
              <Paragraph type="secondary" className="mb-4">
                {feature.description}
              </Paragraph>
              <Button 
                type="link" 
                className="p-0"
                icon={<ArrowRightOutlined />}
              >
                了解更多
              </Button>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export { FeatureCard };
