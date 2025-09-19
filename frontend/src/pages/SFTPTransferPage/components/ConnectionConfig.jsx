import React from 'react';
import { Card, Row, Col, Tag, Button, Space, Spin } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const ConnectionConfig = ({ 
  activeFtpConfig, 
  loadingConfig, 
  isConnected, 
  connecting, 
  onConnect, 
  onDisconnect, 
  onRefresh 
}) => {
  if (loadingConfig) {
    return (
      <Card title="SFTP 连接配置" className="mb-6">
        <div className="text-center py-4">
          <Spin size="large" />
          <p className="mt-2 text-gray-500">加载配置中...</p>
        </div>
      </Card>
    );
  }

  if (!activeFtpConfig) {
    return (
      <Card title="SFTP 连接配置" className="mb-6">
        <div className="text-center py-4">
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
          <p className="mt-2 text-gray-500">没有可用的 SFTP 配置</p>
          <p className="text-sm text-gray-400">请在系统设置中配置 SFTP 连接</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="SFTP 连接配置" className="mb-6">
      <div>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div>
              <span className="text-gray-500">配置名称：</span>
              <span className="font-medium">{activeFtpConfig.name || '未命名'}</span>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <span className="text-gray-500">主机：</span>
              <span className="font-medium">{activeFtpConfig.host}</span>
            </div>
          </Col>
          <Col span={4}>
            <div>
              <span className="text-gray-500">端口：</span>
              <span className="font-medium">{activeFtpConfig.sftpPort || 22}</span>
            </div>
          </Col>
          <Col span={4}>
            <div>
              <span className="text-gray-500">用户类型：</span>
              <Tag color={activeFtpConfig.userType === 'authenticated' ? 'blue' : 'orange'}>
                {activeFtpConfig.userType === 'authenticated' ? '普通用户' : '匿名用户'}
              </Tag>
            </div>
          </Col>
        </Row>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            {isConnected ? (
              <CheckCircleOutlined style={{ color: '#3f8600', fontSize: '16px' }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#cf1322', fontSize: '16px' }} />
            )}
            <span 
              style={{ 
                color: isConnected ? '#3f8600' : '#cf1322', 
                fontSize: '16px', 
                marginLeft: '8px' 
              }}
            >
              {isConnected ? 'SFTP已连接' : 'SFTP未连接'}
            </span>
          </div>
          <Space>
            {!isConnected ? (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                onClick={onConnect} 
                loading={connecting}
              >
                连接 SFTP
              </Button>
            ) : (
              <Button 
                type="default" 
                icon={<ExclamationCircleOutlined />} 
                onClick={onDisconnect}
              >
                断开连接
              </Button>
            )}
            <Button 
              type="default" 
              icon={<ReloadOutlined />} 
              onClick={onRefresh} 
              loading={loadingConfig}
            >
              刷新配置
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export { ConnectionConfig };
