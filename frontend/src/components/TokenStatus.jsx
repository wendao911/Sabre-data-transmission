import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Button, Modal, message } from 'antd';
import { ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const TokenStatus = () => {
  const { tokenStatus, tokenManager, logout } = useAuth();
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  useEffect(() => {
    if (!tokenStatus) return;

    // 如果token即将过期，显示提醒
    if (tokenStatus.status === 'warning' || tokenStatus.status === 'refresh_needed') {
      setShowExpiryModal(true);
    }
  }, [tokenStatus]);

  if (!tokenStatus) return null;

  const getStatusConfig = () => {
    switch (tokenStatus.status) {
      case 'valid':
        return {
          color: 'green',
          icon: <CheckCircleOutlined />,
          text: '正常',
          tooltip: `剩余时间: ${tokenManager.getTimeLeftFormatted()}`
        };
      case 'refresh_needed':
        return {
          color: 'orange',
          icon: <ClockCircleOutlined />,
          text: '即将过期',
          tooltip: `剩余时间: ${tokenManager.getTimeLeftFormatted()}，建议重新登录`
        };
      case 'warning':
        return {
          color: 'red',
          icon: <ExclamationCircleOutlined />,
          text: '即将过期',
          tooltip: `剩余时间: ${tokenManager.getTimeLeftFormatted()}，请立即重新登录`
        };
      case 'expired':
        return {
          color: 'red',
          icon: <ExclamationCircleOutlined />,
          text: '已过期',
          tooltip: 'Token已过期，请重新登录'
        };
      default:
        return {
          color: 'default',
          icon: <ClockCircleOutlined />,
          text: '未知状态',
          tooltip: 'Token状态未知'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleReLogin = () => {
    logout();
    setShowExpiryModal(false);
    message.info('请重新登录');
  };

  const handleExtendSession = () => {
    // 这里可以实现自动刷新token的逻辑
    // 目前只是关闭提醒，实际应用中需要调用刷新接口
    setShowExpiryModal(false);
    message.info('请重新登录以延长会话时间');
  };

  return (
    <>
      <Tooltip title={statusConfig.tooltip}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Badge 
            color={statusConfig.color} 
            text={statusConfig.text}
          />
          <span style={{ color: statusConfig.color === 'red' ? '#ff4d4f' : undefined }}>
            {statusConfig.icon}
          </span>
        </div>
      </Tooltip>

      <Modal
        title="会话即将过期"
        open={showExpiryModal}
        onCancel={() => setShowExpiryModal(false)}
        footer={[
          <Button key="extend" type="primary" onClick={handleExtendSession}>
            重新登录
          </Button>,
          <Button key="logout" onClick={handleReLogin}>
            退出登录
          </Button>
        ]}
        closable={false}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            您的登录会话将在 <strong>{tokenManager.getTimeLeftFormatted()}</strong> 后过期
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            为了安全起见，请重新登录以继续使用系统
          </p>
        </div>
      </Modal>
    </>
  );
};

export default TokenStatus;
