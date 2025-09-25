import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spin, message, Tag, Space, Tooltip } from 'antd';
import { 
  FileOutlined, 
  DownloadOutlined, 
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { decryptService } from '../services/decryptService';
import { useLanguage } from '../hooks/useLanguage';

const DecryptedFileList = ({ selectedDate }) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  const loadFiles = async (date) => {
    if (!date) return;
    
    try {
      setLoading(true);
      const result = await decryptService.getDecryptedFiles(date);
      if (result.success) {
        const fileList = result.data || [];
        setFiles(fileList);
        setPagination(prev => ({
          ...prev,
          total: fileList.length,
          current: 1
        }));
      } else {
        message.error(t('loadDecryptedFilesFailed'));
        setFiles([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          current: 1
        }));
      }
    } catch (error) {
      console.error('加载已解密文件失败:', error);
      message.error(t('loadDecryptedFilesFailed'));
      setFiles([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        current: 1
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(selectedDate);
  }, [selectedDate]);

  const formatDate = (date) => {
    if (!date) return '';
    const formatted = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    return formatted;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getFileTypeTag = (filename) => {
    const ext = filename.toLowerCase();
    if (ext.endsWith('.gz')) {
      return <Tag color="orange">{t('gzCompressed')}</Tag>;
    } else if (ext.endsWith('.zip')) {
      return <Tag color="blue">{t('zipCompressed')}</Tag>;
    } else if (ext.endsWith('.txt')) {
      return <Tag color="green">{t('textFile')}</Tag>;
    } else if (ext.endsWith('.dat')) {
      return <Tag color="purple">{t('dataFile')}</Tag>;
    } else if (ext.endsWith('.done')) {
      return <Tag color="cyan">{t('doneFile')}</Tag>;
    } else if (ext.endsWith('.csv')) {
      return <Tag color="lime">{t('csvFile')}</Tag>;
    } else if (ext.endsWith('.json')) {
      return <Tag color="gold">{t('jsonFile')}</Tag>;
    } else {
      return <Tag color="default">{t('otherFile')}</Tag>;
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(`/api/files/download?path=${encodeURIComponent(file.filePath)}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success(t('downloadSuccess'));
      } else {
        message.error(t('downloadFailed'));
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      message.error(t('downloadFailed'));
    }
  };

  const columns = [
    {
      title: t('fileName'),
      dataIndex: 'filename',
      key: 'filename',
      width: '45%',
      minWidth: 250,
      render: (text) => (
        <div className="flex items-center space-x-2 min-w-0">
          <FileOutlined className="text-blue-500 flex-shrink-0" />
          <span className="font-medium break-all text-xs" title={text}>{text}</span>
          <Tag color="green">{t('decrypted')}</Tag>
        </div>
      ),
    },
    {
      title: t('type'),
      dataIndex: 'filename',
      key: 'type',
      width: 80,
      render: (filename) => getFileTypeTag(filename),
    },
    {
      title: t('size'),
      dataIndex: 'size',
      key: 'size',
      width: 70,
      render: (size) => <span className="text-xs">{formatFileSize(size)}</span>,
    },
    {
      title: t('modificationTime'),
      dataIndex: 'mtime',
      key: 'mtime',
      width: 100,
      render: (mtime) => <span className="text-xs">{formatDateTime(mtime)}</span>,
    },
    {
      title: t('operation'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('download')}>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            >
              {t('download')}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!selectedDate) {
    return (
      <Card 
        title={
          <div className="flex items-center space-x-2">
            <CheckCircleOutlined />
            <span>{t('decryptedFileList')}</span>
          </div>
        }
      className="h-96"
    >
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="text-center">
          <CheckCircleOutlined className="text-4xl mb-2" />
          <p>{t('selectDateFirst')}</p>
        </div>
      </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center space-x-2">
            <CheckCircleOutlined />
            <span>{t('decryptedFileList')} - {formatDate(selectedDate)}</span>
            <Tag color="green">{files.length} {t('files')}</Tag>
          </div>
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={() => loadFiles(selectedDate)}
            loading={loading}
            title={t('refresh')}
          />
        </div>
      }
      className="h-96"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          <div className="text-center">
            <CheckCircleOutlined className="text-4xl mb-2" />
            <p>{t('noDecryptedFiles')}</p>
          </div>
        </div>
      ) : (
        <div className="h-40 flex flex-col">
          <Table
            columns={columns}
            dataSource={files}
            rowKey="filename"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              pageSizeOptions: ['5', '10', '20', '50'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('totalFiles', { total }),
              size: 'small',
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize || prev.pageSize
                }));
              },
              onShowSizeChange: (current, size) => {
                setPagination(prev => ({
                  ...prev,
                  current: 1,
                  pageSize: size
                }));
              },
            }}
            size="small"
            scroll={{ y: 220 }}
            className="flex-1"
            tableLayout="fixed"
          />
        </div>
      )}
    </Card>
  );
};

export default DecryptedFileList;
