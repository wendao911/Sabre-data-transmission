import React, { useState } from 'react';
import { LockOutlined } from '@ant-design/icons';
import EncryptedFileDates from './components/EncryptedFileDates';
import EncryptedFileList from './components/EncryptedFileList';
import DecryptedFileList from './components/DecryptedFileList';
import { useLanguage } from './hooks/useLanguage';
import { PageTitle, PageContainer } from '../../components/Common';


const DecryptPage = () => {
  const { t } = useLanguage();
  const [selectedFileDate, setSelectedFileDate] = useState(null);
  const handleDateSelect = (date) => {
    setSelectedFileDate(date);
  };

  const handleFileDecrypt = (file) => {
    console.log('解密文件:', file);
    // 这里可以添加单个文件解密的逻辑
  };

  return (
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={t('pageDescription')}
        icon={<LockOutlined />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <EncryptedFileDates 
            onDateSelect={handleDateSelect}
            selectedDate={selectedFileDate}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <EncryptedFileList 
              selectedDate={selectedFileDate}
              onFileDecrypt={handleFileDecrypt}
            />
            <DecryptedFileList 
              selectedDate={selectedFileDate}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DecryptPage;