import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, Space, Spin } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const ConnectionConfig = ({ 
  activeFtpConfig, 
  loadingConfig, 
  isConnected, 
  connecting, 
  connectedSince,
  onConnect, 
  onDisconnect, 
  onRefresh 
}) => {
  const { t } = useLanguage();
  const [connectedElapsed, setConnectedElapsed] = useState('');

  useEffect(() => {
    if (!isConnected || !connectedSince) {
      setConnectedElapsed('');
      return undefined;
    }
    const startMs = new Date(connectedSince).getTime();
    const format = (ms) => {
      if (ms < 0 || Number.isNaN(ms)) return '';
      const sec = Math.floor(ms / 1000);
      const days = Math.floor(sec / 86400);
      const hrs = Math.floor((sec % 86400) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      if (days > 0) return `${days}天 ${pad(hrs)}:${pad(mins)}:${pad(s)}`;
      return `${pad(hrs)}:${pad(mins)}:${pad(s)}`;
    };
    const tick = () => setConnectedElapsed(format(Date.now() - startMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isConnected, connectedSince]);
  if (loadingConfig) {
    return (
      <Card title={t('conn_title')} className="mb-6">
        <div className="text-center py-4">
          <Spin size="large" />
          <p className="mt-2 text-gray-500">{t('conn_loading')}</p>
        </div>
      </Card>
    );
  }

  if (!activeFtpConfig) {
    return (
      <Card title={t('conn_title')} className="mb-6">
        <div className="text-center py-4">
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
          <p className="mt-2 text-gray-500">{t('conn_empty')}</p>
          <p className="text-sm text-gray-400">{t('conn_hint')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={t('conn_title')} className="mb-6">
      <div>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div>
              <span className="text-gray-500">{t('conn_name')}：</span>
              <span className="font-medium">{activeFtpConfig.name || t('conn_unnamed')}</span>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <span className="text-gray-500">{t('conn_host')}：</span>
              <span className="font-medium">{activeFtpConfig.host}</span>
            </div>
          </Col>
          <Col span={4}>
            <div>
              <span className="text-gray-500">{t('conn_port')}：</span>
              <span className="font-medium">{activeFtpConfig.sftpPort || 22}</span>
            </div>
          </Col>
          <Col span={4}>
            <div>
              <span className="text-gray-500">{t('conn_user')}：</span>
              <span className="font-medium">{activeFtpConfig.user || '-'}</span>
            </div>
          </Col>
          <Col span={4}>
            <div>
              <span className="text-gray-500">{t('conn_userType')}：</span>
              <Tag color={activeFtpConfig.userType === 'authenticated' ? 'blue' : 'orange'}>
                {activeFtpConfig.userType === 'authenticated' ? t('conn_user_normal') : t('conn_user_anonymous')}
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
              {isConnected ? t('conn_status_connected') : t('conn_status_disconnected')}
            </span>
            {isConnected && connectedElapsed && (
              <span className="ml-3 text-gray-500 text-sm">{t('conn_since')}：{connectedElapsed}</span>
            )}
          </div>
          <Space>
            {!isConnected ? (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                onClick={onConnect} 
                loading={connecting}
              >
                {t('conn_btn_connect')}
              </Button>
            ) : (
              <Button 
                type="default" 
                icon={<ExclamationCircleOutlined />} 
                onClick={onDisconnect}
              >
                {t('conn_btn_disconnect')}
              </Button>
            )}
            <Button 
              type="default" 
              icon={<ReloadOutlined />} 
              onClick={onRefresh} 
              loading={loadingConfig}
            >
              {t('conn_btn_refresh')}
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export { ConnectionConfig };
