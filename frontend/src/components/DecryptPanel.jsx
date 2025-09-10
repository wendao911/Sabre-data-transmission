import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Progress, 
  Statistic, 
  Row, 
  Col, 
  Alert, 
  Spin, 
  List, 
  Tag,
  Space,
  Typography,
  Divider,
  Badge
} from 'antd';
import { 
  UnlockOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { decryptAPI } from '../services/api';

const { Title, Text } = Typography;

const DecryptPanel = () => {
  const [status, setStatus] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptResult, setDecryptResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // 获取解密状态
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await decryptAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('获取状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 开始解密
  const handleDecrypt = async () => {
    try {
      setIsDecrypting(true);
      setDecryptResult(null);
      setProgress(0);
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);
      
      const response = await decryptAPI.startDecrypt();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setDecryptResult(response.data);
        // 解密完成后重新获取状态
        setTimeout(() => {
          fetchStatus();
        }, 1000);
      }
    } catch (error) {
      console.error('解密失败:', error);
    } finally {
      setIsDecrypting(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-10">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">正在加载解密状态...</div>
        </div>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <Alert
          message="无法获取解密状态"
          description="请检查后端服务是否正常运行"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const isSystemReady = status.encryptionDir.exists && 
                       status.privateKey.exists && 
                       status.passphrase.exists;

  return (
    <div className="space-y-6">
      <Card 
        title={
          <Space>
            <UnlockOutlined className="text-blue-600" />
            <span className="text-lg font-semibold">文件解密管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStatus}
              loading={loading}
            >
              刷新状态
            </Button>
            <Button 
              type="primary" 
              icon={<UnlockOutlined />}
              onClick={handleDecrypt}
              loading={isDecrypting}
              disabled={!isSystemReady || isDecrypting}
              size="large"
            >
              {isDecrypting ? '解密中...' : '开始解密'}
            </Button>
          </Space>
        }
      >
        {/* 系统状态检查 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={6}>
            <Card size="small" className="text-center">
              <Statistic
                title="加密文件夹"
                value={status.encryptionDir.exists ? '存在' : '不存在'}
                prefix={
                  status.encryptionDir.exists ? 
                    <CheckCircleOutlined className="text-green-500" /> : 
                    <ExclamationCircleOutlined className="text-red-500" />
                }
                valueStyle={{ 
                  color: status.encryptionDir.exists ? '#52c41a' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <Statistic
                title="解密文件夹"
                value={status.decryptionDir.exists ? '存在' : '不存在'}
                prefix={
                  status.decryptionDir.exists ? 
                    <CheckCircleOutlined className="text-green-500" /> : 
                    <ExclamationCircleOutlined className="text-red-500" />
                }
                valueStyle={{ 
                  color: status.decryptionDir.exists ? '#52c41a' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <Statistic
                title="私钥文件"
                value={status.privateKey.exists ? '存在' : '不存在'}
                prefix={
                  status.privateKey.exists ? 
                    <CheckCircleOutlined className="text-green-500" /> : 
                    <ExclamationCircleOutlined className="text-red-500" />
                }
                valueStyle={{ 
                  color: status.privateKey.exists ? '#52c41a' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <Statistic
                title="密码文件"
                value={status.passphrase.exists ? '存在' : '不存在'}
                prefix={
                  status.passphrase.exists ? 
                    <CheckCircleOutlined className="text-green-500" /> : 
                    <ExclamationCircleOutlined className="text-red-500" />
                }
                valueStyle={{ 
                  color: status.passphrase.exists ? '#52c41a' : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* 文件统计 */}
        {status.encryptionDir.exists && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={12}>
              <Card size="small" className="text-center">
                <Statistic
                  title="GPG文件总数"
                  value={status.encryptionDir.gpgFiles || 0}
                  prefix={<FileOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" className="text-center">
                <Statistic
                  title="涉及日期数"
                  value={status.encryptionDir.dates ? status.encryptionDir.dates.length : 0}
                  prefix={<InfoCircleOutlined className="text-purple-500" />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 系统就绪状态 */}
        {!isSystemReady && (
          <Alert
            message="系统未就绪"
            description="请确保所有必要的文件和文件夹都存在"
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        {/* 解密进度 */}
        {isDecrypting && (
          <Card className="mb-4">
            <Title level={5} className="flex items-center">
              <ClockCircleOutlined className="mr-2" />
              解密进度
            </Title>
            <Progress 
              percent={Math.round(progress)} 
              status="active" 
              format={() => '正在解密文件...'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary" className="block mt-2">
              请稍候，解密过程可能需要几分钟时间
            </Text>
          </Card>
        )}

        {/* 解密结果 */}
        {decryptResult && (
          <Card>
            <Title level={5} className="flex items-center">
              <CheckCircleOutlined className="mr-2 text-green-500" />
              解密结果
            </Title>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="总文件数"
                  value={decryptResult.total}
                  prefix={<FileOutlined className="text-blue-500" />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="成功解密"
                  value={decryptResult.success}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="失败数量"
                  value={decryptResult.failed}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<ExclamationCircleOutlined className="text-red-500" />}
                />
              </Col>
            </Row>
            
            {decryptResult.errors && decryptResult.errors.length > 0 && (
              <>
                <Divider />
                <Title level={5}>错误信息</Title>
                <List
                  size="small"
                  dataSource={decryptResult.errors}
                  renderItem={(error) => (
                    <List.Item>
                      <Text type="danger">{error}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}
          </Card>
        )}

        {/* 日期列表 */}
        {status.encryptionDir.dates && status.encryptionDir.dates.length > 0 && (
          <Card>
            <Title level={5} className="flex items-center">
              <InfoCircleOutlined className="mr-2" />
              涉及的日期
            </Title>
            <div className="flex flex-wrap gap-2">
              {status.encryptionDir.dates.map(date => (
                <Badge key={date} count={0} showZero>
                  <Tag color="blue" className="px-3 py-1">
                    {date}
                  </Tag>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* 解密目录状态 */}
        {status.decryptionDir.exists && status.decryptionDir.subdirs && (
          <Card>
            <Title level={5} className="flex items-center">
              <CheckCircleOutlined className="mr-2 text-green-500" />
              已创建的日期目录
            </Title>
            <div className="flex flex-wrap gap-2">
              {status.decryptionDir.subdirs.map(dir => (
                <Tag key={dir} color="green" className="px-3 py-1">
                  {dir}
                </Tag>
              ))}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default DecryptPanel;
