import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Progress, List, Typography, Alert, Space, Statistic, Row, Col, Spin } from 'antd';
import VirtualList from 'rc-virtual-list';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { decryptAPI } from '../services/api';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const DecryptPage = () => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [totalFiles, setTotalFiles] = useState(0);
  const [decryptedFiles, setDecryptedFiles] = useState([]);
  const [failedFiles, setFailedFiles] = useState([]);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });

  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const openProgressStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource('http://localhost:3000/api/decrypt/progress');
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleProgressUpdate(data);
      } catch (error) {
        console.error('解析SSE数据失败:', error);
      }
    };

    es.onerror = () => {
      // 不结束解密状态，尝试重连
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (isDecrypting && !reconnectTimerRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          openProgressStream();
        }, 1000);
      }
    };
  };

  // 获取解密状态
  const fetchStatus = async () => {
    try {
      const statusData = await decryptAPI.getStatus();
      setStatus(statusData);
    } catch (error) {
      toast.error('获取状态失败: ' + error.message);
    }
  };

  // 开始解密
  const startDecrypt = async () => {
    try {
      setIsDecrypting(true);
      setProgress(0);
      setDecryptedFiles([]);
      setFailedFiles([]);
      setLogs([]);
      setStats({ total: 0, success: 0, failed: 0 });

      // 启动SSE连接（自动重连）
      openProgressStream();

      // 开始解密
      await decryptAPI.startDecrypt();
    } catch (error) {
      toast.error('启动解密失败: ' + error.message);
      setIsDecrypting(false);
    }
  };

  // 处理进度更新
  const handleProgressUpdate = (data) => {
    switch (data.type) {
      case 'connected':
        addLog('已连接到进度流', 'info');
        break;
      case 'start':
        addLog('开始解密...', 'info');
        break;
      case 'info':
        addLog(data.message, 'info');
        if (data.progress !== undefined) {
          setProgress(prev => Math.max(prev, data.progress));
        }
        if (data.current !== undefined && data.total !== undefined) {
          setCurrentFile(`${data.current}/${data.total}`);
          setTotalFiles(data.total);
        }
        break;
      case 'file_start':
        addLog(`开始解密: ${data.filename} (${data.keyFile})`, 'info');
        if (data.progress !== undefined) {
          setProgress(prev => Math.max(prev, data.progress));
        }
        if (data.current !== undefined && data.total !== undefined) {
          setCurrentFile(`${data.current}/${data.total}`);
          setTotalFiles(data.total);
        }
        break;
      case 'file_success':
        addLog(`✓ 解密成功: ${data.filename}`, 'success');
        if (data.progress !== undefined) {
          setProgress(prev => Math.max(prev, data.progress));
        }
        setDecryptedFiles(prev => ([
          ...prev,
          {
            filename: data.filename,
            timestamp: new Date().toISOString()
          }
        ]));
        setStats(prev => ({
          ...prev,
          success: prev.success + 1,
          total: data.total || prev.total
        }));
        break;
      case 'file_error':
        addLog(`✗ 解密失败: ${data.filename}`, 'error');
        if (data.progress !== undefined) {
          setProgress(prev => Math.max(prev, data.progress));
        }
        setFailedFiles(prev => ([
          ...prev,
          {
            filename: data.filename,
            error: data.error || '未知错误',
            timestamp: new Date().toISOString()
          }
        ]));
        setStats(prev => ({
          ...prev,
          failed: prev.failed + 1,
          total: data.total || prev.total
        }));
        break;
      case 'complete':
        addLog('解密完成!', 'success');
        setIsDecrypting(false);
        if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null; }
        if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
        toast.success(`解密完成! 成功: ${data.data?.success || 0}, 失败: ${data.data?.failed || 0}`);
        break;
      case 'error':
        addLog(`错误: ${data.message}`, 'error');
        // 出错也保留状态与连接，等待自动重连/后续事件
        toast.error(data.message);
        break;
      default:
        console.log('未知的进度类型:', data);
    }
  };

  // 添加日志
  const addLog = (message, type = 'info') => {
    setLogs(prev => ([
      ...prev,
      {
        message,
        type,
        timestamp: new Date().toISOString()
      }
    ]));
  };

  // 停止解密
  const stopDecrypt = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsDecrypting(false);
    addLog('用户停止解密', 'warning');
  };

  // 重置状态
  const resetStatus = () => {
    setProgress(0);
    setCurrentFile('');
    setTotalFiles(0);
    setDecryptedFiles([]);
    setFailedFiles([]);
    setLogs([]);
    setStats({ total: 0, success: 0, failed: 0 });
  };

  // 组件挂载时获取状态
  useEffect(() => {
    fetchStatus();
    
    // 清理函数
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="px-6 pb-6 pt-0 space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">文件解密</Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchStatus}
            disabled={isDecrypting}
          >
            刷新状态
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={resetStatus}
            disabled={isDecrypting}
          >
            重置
          </Button>
        </Space>
      </div>

      {/* 状态概览 */}
      {status && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="加密文件总数"
                value={status.encryptionDir?.gpgFiles || 0}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="AITS密钥"
                value={status.privateKeys?.aits?.exists ? '可用' : '不可用'}
                valueStyle={{ color: status.privateKeys?.aits?.exists ? '#3f8600' : '#cf1322' }}
                prefix={status.privateKeys?.aits?.exists ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="K6密钥"
                value={status.privateKeys?.k6?.exists ? '可用' : '不可用'}
                valueStyle={{ color: status.privateKeys?.k6?.exists ? '#3f8600' : '#cf1322' }}
                prefix={status.privateKeys?.k6?.exists ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="K6密码"
                value={status.passphrases?.k6?.exists ? '可用' : '不可用'}
                valueStyle={{ color: status.passphrases?.k6?.exists ? '#3f8600' : '#cf1322' }}
                prefix={status.passphrases?.k6?.exists ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 解密控制 */}
      <Card title="解密控制">
        <div className="flex items-center space-x-4">
          {!isDecrypting ? (
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={startDecrypt}
              disabled={!status?.privateKeys?.aits?.exists || !status?.privateKeys?.k6?.exists || !status?.passphrases?.k6?.exists}
            >
              开始解密
            </Button>
          ) : (
            <Button
              danger
              size="large"
              icon={<PauseCircleOutlined />}
              onClick={stopDecrypt}
            >
              停止解密
            </Button>
          )}
          
          {isDecrypting && (
            <div className="flex items-center space-x-2">
              <Spin size="small" />
              <Text>正在解密中...</Text>
            </div>
          )}
        </div>

        {/* 进度条 */}
        {isDecrypting && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <Text>解密进度</Text>
              <Text>{currentFile}</Text>
            </div>
            <Progress 
              percent={progress} 
              status={isDecrypting ? 'active' : 'success'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        )}
      </Card>

      {/* 统计信息 */}
      {stats.total > 0 && (
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总文件数"
                value={stats.total}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="成功解密"
                value={stats.success}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="解密失败"
                value={stats.failed}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        {/* 成功解密的文件 */}
        <Col span={12}>
          <Card title="成功解密的文件" size="small">
            <div style={{ height: 300, overflow: 'auto' }}>
              <VirtualList data={decryptedFiles} itemHeight={36} itemKey="timestamp">
                {(item) => (
                  <List.Item key={item.timestamp}>
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>{item.filename}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </Text>
                    </div>
                  </List.Item>
                )}
              </VirtualList>
            </div>
          </Card>
        </Col>

        {/* 解密失败的文件 */}
        <Col span={12}>
          <Card title="解密失败的文件" size="small">
            <div style={{ height: 300, overflow: 'auto' }}>
              <VirtualList data={failedFiles} itemHeight={44} itemKey="timestamp">
                {(item) => (
                  <List.Item key={item.timestamp}>
                    <div className="flex items-center space-x-2">
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <div>
                        <Text>{item.filename}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.error}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              </VirtualList>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 日志 */}
      <Card title="解密日志" size="small">
        <div style={{ height: 256, overflow: 'auto' }}>
          <VirtualList data={logs} itemHeight={30} itemKey="timestamp">
            {(item) => (
              <List.Item key={item.timestamp}>
                <div className="flex items-center space-x-2 w-full">
                  <Text type="secondary" style={{ fontSize: '12px', minWidth: '80px' }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text 
                    style={{ 
                      color: item.type === 'success' ? '#52c41a' : 
                             item.type === 'error' ? '#ff4d4f' : 
                             item.type === 'warning' ? '#faad14' : '#666'
                    }}
                  >
                    {item.message}
                  </Text>
                </div>
              </List.Item>
            )}
          </VirtualList>
        </div>
      </Card>
    </div>
  );
};

export default DecryptPage;
