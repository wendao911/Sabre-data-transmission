import React, { useEffect, useMemo, useState } from 'react';
import { Card, Empty, Table, Tag, Space, Button, Tooltip, message, Statistic, Row, Col, Typography } from 'antd';
import { DashboardOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons';
import { PageTitle, PageContainer } from '../../components/Common';
import { scheduleService, transferLogService } from './services/scheduleService';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './hooks/useLanguage';


const POLL_MS = 15000;
const { Text } = Typography;

const HomePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [runtime, setRuntime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [running, setRunning] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const [cfg, rt, logs] = await Promise.all([
        scheduleService.getConfigs(),
        scheduleService.getRuntime(),
        transferLogService.listRecent(2),
      ]);
      setConfigs(cfg || []);
      setRuntime(rt || []);
      setRecentLogs(logs || []);
    } catch (e) {
      message.error(e.message || t('messageLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => {
    const rtMap = new Map(runtime.map(r => [r.taskType, r]));
    return (configs || []).map(c => {
      const rt = rtMap.get(c.taskType) || {};
      return {
        key: c.taskType,
        taskType: c.taskType,
        cron: c.cron,
        enabled: c.enabled,
        nextRunAt: rt.nextRunAt ? new Date(rt.nextRunAt) : null,
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : null,
      };
    });
  }, [configs, runtime]);

  const runNow = async (taskType) => {
    try {
      setRunning(prev => ({ ...prev, [taskType]: true }));
      await scheduleService.run(taskType);
      message.success(t('messageTaskTriggered'));
    } catch (e) {
      message.error(e.message || t('messageTriggerFailed'));
    } finally {
      setRunning(prev => ({ ...prev, [taskType]: false }));
      load();
    }
  };

  const viewTransferDetails = () => {
    navigate('/system-logs', { state: { activeTab: 'transfer' } });
  };

  const columns = [
    { title: t('taskType'), dataIndex: 'taskType', key: 'taskType', width: 140,
      render: (v) => {
        const text = v === 'decrypt' ? t('taskTypeDecrypt') : v === 'transfer' ? t('taskTypeTransfer') : v;
        return <Tag color={v === 'decrypt' ? 'geekblue' : 'purple'}>{text}</Tag>;
      }
    },
    { title: t('cronExpression'), dataIndex: 'cron', key: 'cron', width: 180 },
    { title: t('enabled'), dataIndex: 'enabled', key: 'enabled', width: 100,
      render: (v) => v ? <Tag icon={<CheckCircleOutlined />} color="success">{t('enabled')}</Tag> : <Tag icon={<CloseCircleOutlined />} color="default">{t('disabled')}</Tag>
    },
    { title: t('nextRunTime'), dataIndex: 'nextRunAt', key: 'nextRunAt', width: 220,
      render: (v) => v ? <Space><ClockCircleOutlined />{v.toLocaleString()}</Space> : '-'
    },
    { title: t('lastUpdateTime'), dataIndex: 'updatedAt', key: 'updatedAt', width: 220,
      render: (v) => v ? v.toLocaleString() : '-'
    },
    { title: t('actions'), key: 'actions', fixed: 'right', width: 160,
      render: (_, row) => (
        <Space>
          <Tooltip title={t('runNow')}>
            <Button type="primary" size="small" icon={running[row.taskType] ? <SyncOutlined spin /> : <ThunderboltOutlined />} onClick={() => runNow(row.taskType)} disabled={!row.enabled || running[row.taskType]}>{running[row.taskType] ? t('running') : t('run')}</Button>
          </Tooltip>
          <Tooltip title={t('refresh')}>
            <Button size="small" onClick={load}>{t('refresh')}</Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        icon={<DashboardOutlined />}
      />

      <Row gutter={16}>
        <Col span={24}>
          <Card title={t('scheduledTasks')} extra={<Button size="small" onClick={load} icon={<SyncOutlined />}>{t('refresh')}</Button>}>
            <Table
              loading={loading}
              dataSource={rows}
              columns={columns}
              pagination={false}
              size="middle"
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title={t('transferLogs')} 
            extra={
              <Button 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={viewTransferDetails}
              >
                {t('viewDetails')}
              </Button>
            }
          >
            {recentLogs.length > 0 ? (
              <Row gutter={[16, 16]}>
                {recentLogs.map((log, index) => {
                  const total = (log.totalFiles || 0);
                  const succ = (log.syncedFiles || 0);
                  const rate = total > 0 ? Math.round((succ / total) * 100) : 0;
                  const statusMap = { 
                    success: { color: 'success', text: t('statusSuccess') }, 
                    partial: { color: 'processing', text: t('statusPartial') }, 
                    failed: { color: 'error', text: t('statusFailed') }, 
                    skipped: { color: 'default', text: t('statusSkipped') } 
                  };
                  const status = statusMap[log.status] || { color: 'default', text: log.status };
                  
                  return (
                    <Col span={12} key={log._id || index}>
                      <Card size="small" style={{ height: '100%' }}>
                        <Row gutter={8}>
                          <Col span={12}>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>{t('time')}</Text>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>
                                {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                              </div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>{t('status')}</Text>
                              <div>
                                <Tag color={status.color} size="small">{status.text}</Tag>
                              </div>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>{t('fileStats')}</Text>
                              <div style={{ fontSize: 14 }}>
                                {t('total')}: {log.totalFiles || 0} | {t('success')}: {log.syncedFiles || 0}
                              </div>
                              <div style={{ fontSize: 12, color: '#666' }}>
                                {t('skipped')}: {log.skippedFiles || 0} | {t('failed')}: {log.failedFiles || 0}
                              </div>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>{t('successRate')}</Text>
                              <div>
                                <Statistic 
                                  value={rate} 
                                  suffix="%" 
                                  valueStyle={{ fontSize: 16, color: rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f' }} 
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={t('noTransferLogs')} 
                style={{ padding: '20px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default HomePage;