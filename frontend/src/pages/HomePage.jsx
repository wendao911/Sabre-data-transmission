import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { 
  FileOutlined, 
  UnlockOutlined, 
  SettingOutlined, 
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: '文件管理',
      description: '上传、下载、删除和管理您的文件',
      icon: <FileOutlined className="text-4xl text-blue-500" />,
      action: () => navigate('/files'),
      color: 'blue'
    },
    {
      title: '文件解密',
      description: '批量解密GPG加密文件',
      icon: <UnlockOutlined className="text-4xl text-green-500" />,
      action: () => navigate('/files'),
      color: 'green'
    },
    {
      title: '系统设置',
      description: '配置应用程序设置',
      icon: <SettingOutlined className="text-4xl text-purple-500" />,
      action: () => navigate('/settings'),
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="text-center py-8">
          <Title level={1} className="text-white mb-4">
            欢迎使用 Sabre Data Management Desktop
          </Title>
          <Paragraph className="text-blue-100 text-lg mb-6">
            专业的文件管理与解密系统，让您的文件管理更加高效安全
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

      {/* 功能卡片 */}
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

      {/* 统计信息 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总文件数"
              value={0}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已解密文件"
              value={0}
              prefix={<UnlockOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="系统状态"
              value="正常"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Button 
              type="primary" 
              size="large" 
              block
              icon={<FileOutlined />}
              onClick={() => navigate('/files')}
            >
              文件管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button 
              size="large" 
              block
              icon={<UnlockOutlined />}
              onClick={() => navigate('/files')}
            >
              开始解密
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button 
              size="large" 
              block
              icon={<SettingOutlined />}
              onClick={() => navigate('/settings')}
            >
              系统设置
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;
