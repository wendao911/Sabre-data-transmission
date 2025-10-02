import React, { useEffect, useMemo, useState } from 'react';
import { Card, Empty, Table, Tag, Space, Button, Tooltip, message, Statistic, Row, Col, Typography } from 'antd';
import { DashboardOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons';
import { PageTitle, PageContainer } from '../../components/Common';
import { scheduleService, transferLogService } from './services/scheduleService';
import { useNavigate } from 'react-router-dom';


const POLL_MS = 15000;
const { Text } = Typography;

const HomePage = () => {
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
      message.error(e.message || '加载定时任务失败');
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
      message.success('已触发任务运行');
    } catch (e) {
      message.error(e.message || '触发失败');
    } finally {
      setRunning(prev => ({ ...prev, [taskType]: false }));
      load();
    }
  };

  const viewTransferDetails = () => {
    navigate('/system-logs', { state: { activeTab: 'transfer' } });
  };

  const columns = [
    { title: '任务类型', dataIndex: 'taskType', key: 'taskType', width: 140,
      render: (v) => {
        const text = v === 'decrypt' ? '文件解密' : v === 'transfer' ? 'SFTP传输' : v;
        return <Tag color={v === 'decrypt' ? 'geekblue' : 'purple'}>{text}</Tag>;
      }
    },
    { title: 'Cron 表达式', dataIndex: 'cron', key: 'cron', width: 180 },
    { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 100,
      render: (v) => v ? <Tag icon={<CheckCircleOutlined />} color="success">启用</Tag> : <Tag icon={<CloseCircleOutlined />} color="default">停用</Tag>
    },
    { title: '下次运行时间', dataIndex: 'nextRunAt', key: 'nextRunAt', width: 220,
      render: (v) => v ? <Space><ClockCircleOutlined />{v.toLocaleString()}</Space> : '-'
    },
    { title: '最近更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 220,
      render: (v) => v ? v.toLocaleString() : '-'
    },
    { title: '操作', key: 'actions', fixed: 'right', width: 160,
      render: (_, row) => (
        <Space>
          <Tooltip title="立即运行">
            <Button type="primary" size="small" icon={running[row.taskType] ? <SyncOutlined spin /> : <ThunderboltOutlined />} onClick={() => runNow(row.taskType)} disabled={!row.enabled || running[row.taskType]}>运行</Button>
          </Tooltip>
          <Tooltip title="刷新状态">
            <Button size="small" onClick={load}>刷新</Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageContainer>
      <PageTitle
        title="仪表盘"
        subtitle="系统概览和快速操作"
        icon={<DashboardOutlined />}
      />

      <Row gutter={16}>
        <Col span={24}>
          <Card title="定时任务状态" extra={<Button size="small" onClick={load} icon={<SyncOutlined />}>刷新</Button>}>
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
            title="文件传输日志" 
            extra={
              <Button 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={viewTransferDetails}
              >
                查看详情
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
                    success: { color: 'success', text: '成功' }, 
                    partial: { color: 'processing', text: '部分成功' }, 
                    failed: { color: 'error', text: '失败' }, 
                    skipped: { color: 'default', text: '跳过' } 
                  };
                  const status = statusMap[log.status] || { color: 'default', text: log.status };
                  
                  return (
                    <Col span={12} key={log._id || index}>
                      <Card size="small" style={{ height: '100%' }}>
                        <Row gutter={8}>
                          <Col span={12}>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>时间</Text>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>
                                {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                              </div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>状态</Text>
                              <div>
                                <Tag color={status.color} size="small">{status.text}</Tag>
                              </div>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>文件统计</Text>
                              <div style={{ fontSize: 14 }}>
                                总计: {log.totalFiles || 0} | 成功: {log.syncedFiles || 0}
                              </div>
                              <div style={{ fontSize: 12, color: '#666' }}>
                                跳过: {log.skippedFiles || 0} | 失败: {log.failedFiles || 0}
                              </div>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>成功率</Text>
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
                description="暂无传输日志" 
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