import React from 'react';
import { Card, Progress, Typography, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DecryptProgress = ({
  isDecrypting,
  progress,
  currentFile,
  totalFiles,
  status
}) => {
  if (!isDecrypting && progress === 0) {
    return null;
  }

  return (
    <Card title="解密进度" className="mb-6">
      <div className="space-y-4">
        <Progress
          percent={Math.round(progress)}
          status={isDecrypting ? 'active' : 'success'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        
        {currentFile && (
          <div className="text-center">
            <Text type="secondary">
              正在处理: {currentFile}
            </Text>
          </div>
        )}
        
        {totalFiles > 0 && (
          <div className="text-center">
            <Text type="secondary">
              总文件数: {totalFiles}
            </Text>
          </div>
        )}
        
        {status && (
          <Alert
            message={status}
            type={isDecrypting ? 'info' : 'success'}
            icon={<InfoCircleOutlined />}
            showIcon
          />
        )}
      </div>
    </Card>
  );
};

export { DecryptProgress };
