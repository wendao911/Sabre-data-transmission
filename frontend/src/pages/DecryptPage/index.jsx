import React, { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { ReloadOutlined, LockOutlined } from '@ant-design/icons';
import EncryptedFileDates from './components/EncryptedFileDates';
import EncryptedFileList from './components/EncryptedFileList';
import DecryptedFileList from './components/DecryptedFileList';
import { useLanguage } from './hooks/useLanguage';

const { Title, Paragraph } = Typography;

const DecryptPage = () => {
  const { t } = useLanguage();
  const [selectedFileDate, setSelectedFileDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleDateSelect = (date) => {
    setSelectedFileDate(date);
  };

  const handleFileDecrypt = (file) => {
    console.log('解密文件:', file);
    // 这里可以添加单个文件解密的逻辑
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LockOutlined className="text-2xl text-blue-600" />
          <div>
            <Title level={2} className="!mb-0">{t('pageTitle')}</Title>
            <Paragraph className="!mb-0 text-gray-600">
              {t('pageDescription')}
            </Paragraph>
          </div>
        </div>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            {t('refresh')}
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <EncryptedFileDates 
            key={`dates-${refreshKey}`}
            onDateSelect={handleDateSelect}
            selectedDate={selectedFileDate}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <EncryptedFileList 
              key={`encrypted-files-${refreshKey}`}
              selectedDate={selectedFileDate}
              onFileDecrypt={handleFileDecrypt}
            />
            <DecryptedFileList 
              key={`decrypted-files-${refreshKey}`}
              selectedDate={selectedFileDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecryptPage;