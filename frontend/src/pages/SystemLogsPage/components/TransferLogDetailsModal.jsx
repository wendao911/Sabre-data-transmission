import React from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Space, Divider, Card, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
// 使用原生 Date 对象处理日期
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-';
  
  // 如果是 YYYYMMDD 格式的字符串，先转换为 Date 对象
  let d;
  if (typeof date === 'string' && /^\d{8}$/.test(date)) {
    // YYYYMMDD 格式
    const year = parseInt(date.substring(0, 4));
    const month = parseInt(date.substring(4, 6)) - 1; // 月份从0开始
    const day = parseInt(date.substring(6, 8));
    d = new Date(year, month, day);
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return '-';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else if (format === 'YYYY-MM-DD HH:mm:ss') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return `${year}-${month}-${day}`;
};

const { Title, Text } = Typography;

const TransferLogDetailsModal = ({ visible, onClose, sessionData }) => {
  const { t } = useLanguage();

  if (!sessionData) return null;

  // 适配新的日志模型数据结构
  const taskData = sessionData;

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'partial': return 'orange';
      case 'no_files': return 'gray';
      default: return 'default';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined />;
      case 'failed': return <CloseCircleOutlined />;
      case 'partial': return <ExclamationCircleOutlined />;
      case 'no_files': return <InfoCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  // 规则结果列定义
  const ruleResultColumns = [
    {
      title: t('ruleName'),
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 150,
      ellipsis: true
    },
    {
      title: t('module'),
      dataIndex: 'module',
      key: 'module',
      width: 80
    },
    {
      title: t('periodType'),
      dataIndex: 'periodType',
      key: 'periodType',
      width: 100,
      render: (type) => {
        const getPeriodTypeText = (periodType) => {
          switch (periodType) {
            case 'daily': return t('periodDaily');
            case 'weekly': return t('periodWeekly');
            case 'monthly': return t('periodMonthly');
            case 'adhoc': return t('periodAdhoc');
            default: return periodType || t('periodAdhoc');
          }
        };
        return (
          <Tag color="blue">{getPeriodTypeText(type)}</Tag>
        );
      }
    },
    {
      title: t('totalFiles'),
      dataIndex: 'totalFiles',
      key: 'totalFiles',
      width: 80,
      align: 'center'
    },
    {
      title: t('syncedFiles'),
      dataIndex: 'syncedFiles',
      key: 'syncedFiles',
      width: 80,
      align: 'center',
      render: (count) => <Tag color="green">{count}</Tag>
    },
    {
      title: t('skippedFiles'),
      dataIndex: 'skippedFiles',
      key: 'skippedFiles',
      width: 80,
      align: 'center',
      render: (count) => <Tag color="orange">{count}</Tag>
    },
    {
      title: t('failedFiles'),
      dataIndex: 'failedFiles',
      key: 'failedFiles',
      width: 80,
      align: 'center',
      render: (count) => <Tag color="red">{count}</Tag>
    },
    {
      title: t('colStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {t(`status_${status}`)}
        </Tag>
      )
    },
    {
      title: t('message'),
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text) => text || '-'
    }
  ];

  // 失败文件详情列定义
  const failedFileColumns = [
    {
      title: t('filename'),
      dataIndex: 'filename',
      key: 'filename',
      width: 200,
      ellipsis: true
    },
    {
      title: t('localPath'),
      dataIndex: 'localPath',
      key: 'localPath',
      width: 200,
      ellipsis: true
    },
    {
      title: t('remotePath'),
      dataIndex: 'remotePath',
      key: 'remotePath',
      width: 200,
      ellipsis: true
    },
    {
      title: t('fileSize'),
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size) => size ? `${(size / 1024).toFixed(1)} KB` : '-'
    },
    {
      title: t('errorMessage'),
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      ellipsis: true,
      render: (text) => (
        <Text type="danger" ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      )
    }
  ];

  // 获取所有失败文件（从规则结果中获取）
  const allFailedFiles = taskData.ruleResults?.flatMap(rule => 
    rule.failedFilesDetails?.map(file => ({
      ...file,
      ruleName: rule.ruleName,
      module: rule.module
    })) || []
  ) || [];

  return (
    <Modal
      title={t('transferDetails')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      className="transfer-log-details-modal"
    >
      <div className="space-y-4">
        {/* 任务概览 */}
        <Card title={t('taskOverview')} size="small">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label={t('colTaskDate')}>
              {formatDate(taskData.taskDate, 'YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label={t('colDuration')}>
              {taskData.duration ? Math.round(taskData.duration / 1000) : 0}s
            </Descriptions.Item>
            <Descriptions.Item label={t('colTotalFiles')}>
              {taskData.totalFiles || 0}
            </Descriptions.Item>
            <Descriptions.Item label={t('colStatus')}>
              <Tag color={getStatusColor(taskData.status)} icon={getStatusIcon(taskData.status)}>
                {t(`status_${taskData.status}`)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 文件统计 */}
        <Card title={t('fileStatistics')} size="small">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title={t('colSynced')}
                value={taskData.successCount || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('colSkipped')}
                value={taskData.skippedCount || 0}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('colFailed')}
                value={taskData.failedCount || 0}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('successRate')}
                value={`${taskData.totalFiles > 0 ? Math.round(((taskData.successCount || 0) / taskData.totalFiles) * 100) : 0}%`}
                valueStyle={{ color: taskData.totalFiles > 0 && ((taskData.successCount || 0) / taskData.totalFiles) >= 0.8 ? '#52c41a' : '#fa8c16' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 规则结果 */}
        <Card title={t('ruleResults')} size="small">
          <Table
            columns={ruleResultColumns}
            dataSource={taskData.ruleResults || []}
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
            rowKey={(record, index) => `${record.ruleId}-${index}`}
          />
        </Card>

        {/* 失败文件详情 */}
        {allFailedFiles.length > 0 && (
          <Card title={t('failedFilesDetails')} size="small">
            <Table
              columns={failedFileColumns}
              dataSource={allFailedFiles}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true
              }}
              size="small"
              scroll={{ x: 1000 }}
              rowKey={(record, index) => `${record.filename}-${index}`}
            />
          </Card>
        )}

        {/* 任务详情 */}
        <Card title={t('taskDetails')} size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label={t('startTime')}>
              {formatDate(taskData.startTime, 'YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label={t('endTime')}>
              {formatDate(taskData.endTime, 'YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label={t('totalRules')}>
              {taskData.totalRules || 0}
            </Descriptions.Item>
            <Descriptions.Item label={t('createdAt')}>
              {formatDate(taskData.createdAt, 'YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {taskData.errorMessage && (
              <Descriptions.Item label={t('errorMessage')} span={2}>
                <Text type="danger">{taskData.errorMessage}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default TransferLogDetailsModal;
