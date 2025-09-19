import React from 'react';
import { Card, List, Tag, Typography, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DecryptLogs = ({ decryptedFiles, failedFiles, logs }) => {
  const hasData = decryptedFiles.length > 0 || failedFiles.length > 0 || logs.length > 0;

  if (!hasData) {
    return (
      <Card title="解密日志">
        <Empty description="暂无解密记录" />
      </Card>
    );
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'file_success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'file_error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'file_success':
        return 'success';
      case 'file_error':
        return 'error';
      default:
        return 'processing';
    }
  };

  return (
    <Card title="解密日志">
      <div className="space-y-4">
        {decryptedFiles.length > 0 && (
          <div>
            <Text strong className="text-green-600">
              成功解密的文件 ({decryptedFiles.length})
            </Text>
            <List
              size="small"
              dataSource={decryptedFiles}
              renderItem={(file) => (
                <List.Item>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <Text code>{file}</Text>
                </List.Item>
              )}
            />
          </div>
        )}

        {failedFiles.length > 0 && (
          <div>
            <Text strong className="text-red-600">
              解密失败的文件 ({failedFiles.length})
            </Text>
            <List
              size="small"
              dataSource={failedFiles}
              renderItem={(file) => (
                <List.Item>
                  <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  <Text code>{file}</Text>
                </List.Item>
              )}
            />
          </div>
        )}

        {logs.length > 0 && (
          <div>
            <Text strong>详细日志</Text>
            <List
              size="small"
              dataSource={logs}
              renderItem={(log, index) => (
                <List.Item>
                  <div className="flex items-center space-x-2">
                    {getLogIcon(log.type)}
                    <Tag color={getLogColor(log.type)}>
                      {log.type || 'info'}
                    </Tag>
                    <Text>{log.message}</Text>
                    {log.timestamp && (
                      <Text type="secondary" className="text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export { DecryptLogs };
