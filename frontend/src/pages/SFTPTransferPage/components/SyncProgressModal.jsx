import React, { useState, useEffect } from 'react';
import { Modal, Progress, List, Card, Typography, Space, Tag, Divider, Spin } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const { Title, Text } = Typography;

const SyncProgressModal = ({ visible, onCancel, syncData, isRunning }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentRule, setCurrentRule] = useState(null);
  const [ruleProgress, setRuleProgress] = useState({});

  useEffect(() => {
    if (syncData) {
      // 计算总进度
      const totalFiles = syncData.totalFiles || 0;
      const processedFiles = (syncData.synced || 0) + (syncData.skipped || 0) + (syncData.failed || 0);
      const progressPercent = totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0;
      setProgress(progressPercent);

      // 更新规则进度
      if (syncData.ruleResults) {
        const ruleProgressMap = {};
        syncData.ruleResults.forEach(rule => {
          ruleProgressMap[rule.ruleId] = {
            ...rule,
            progress: rule.totalFiles > 0 ? Math.round(((rule.syncedFiles + rule.skippedFiles + rule.failedFiles) / rule.totalFiles) * 100) : 0
          };
        });
        setRuleProgress(ruleProgressMap);
      }
    }
  }, [syncData]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'partial':
        return <SyncOutlined style={{ color: '#faad14' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'skipped':
        return <MinusCircleOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return <SyncOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'partial':
        return 'warning';
      case 'failed':
        return 'error';
      case 'skipped':
        return 'default';
      default:
        return 'processing';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return t('status_success');
      case 'partial':
        return t('status_partial');
      case 'failed':
        return t('status_failed');
      case 'skipped':
        return t('status_skipped');
      case 'no_files':
        return t('status_no_files');
      default:
        return '处理中';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SyncOutlined spin={isRunning} />
          <span>{t('syncProgressTitle')}</span>
          {isRunning && <Spin size="small" />}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      closable={!isRunning}
      maskClosable={false}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* 总体进度 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>{t('overallProgress')}</Title>
          <Progress 
            percent={progress} 
            status={isRunning ? 'active' : (progress === 100 ? 'success' : 'normal')}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">
              {t('totalFiles')}: {syncData?.totalFiles || 0}
            </Text>
            <Space>
              <Tag color="success">{t('synced')}: {syncData?.synced || 0}</Tag>
              <Tag color="warning">{t('skipped')}: {syncData?.skipped || 0}</Tag>
              <Tag color="error">{t('failed')}: {syncData?.failed || 0}</Tag>
            </Space>
          </div>
        </Card>

        {/* 规则详情 */}
        <Card size="small">
          <Title level={5}>{t('ruleDetails')}</Title>
          {syncData?.ruleResults && syncData.ruleResults.length > 0 ? (
            <List
              dataSource={syncData.ruleResults}
              renderItem={(rule) => (
                <List.Item key={rule.ruleId}>
                  <Card 
                    size="small" 
                    style={{ width: '100%' }}
                    title={
                      <Space>
                        {getStatusIcon(rule.status)}
                        <Text strong>{rule.ruleName}</Text>
                        <Tag color={getStatusColor(rule.status)}>
                          {getStatusText(rule.status)}
                        </Tag>
                        <Tag color="blue">{rule.periodType}</Tag>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Progress 
                        percent={ruleProgress[rule.ruleId]?.progress || 0}
                        size="small"
                        status={rule.status === 'failed' ? 'exception' : 'normal'}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <Text type="secondary">
                        {t('module')}: {rule.module} | {t('ruleTotalFiles')}: {rule.totalFiles}
                      </Text>
                      <Space size="small">
                        <Text style={{ color: '#52c41a' }}>✓ {rule.syncedFiles}</Text>
                        <Text style={{ color: '#faad14' }}>- {rule.skippedFiles}</Text>
                        <Text style={{ color: '#ff4d4f' }}>✗ {rule.failedFiles}</Text>
                      </Space>
                    </div>
                    {rule.message && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {rule.message}
                        </Text>
                      </div>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text type="secondary">{t('noneRuleInfo')}</Text>
            </div>
          )}
        </Card>

        {/* 当前处理信息 */}
        {isRunning && (
          <Card size="small" style={{ marginTop: 16, background: '#f6ffed' }}>
            <Space>
              <SyncOutlined spin />
              <Text>{t('running')}</Text>
            </Space>
          </Card>
        )}

        {/* 完成信息 */}
        {!isRunning && syncData && (
          <Card size="small" style={{ marginTop: 16, background: progress === 100 ? '#f6ffed' : '#fff7e6' }}>
            <Space>
              {progress === 100 ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <SyncOutlined />}
              <Text>
                {progress === 100 ? t('finished') : t('stopped')}
              </Text>
            </Space>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default SyncProgressModal;
