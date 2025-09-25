import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spin, message, Tag, Space, Tooltip, Progress, Modal } from 'antd';
import { 
  FileOutlined, 
  PlayCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { decryptService } from '../services/decryptService';
import { useLanguage } from '../hooks/useLanguage';

const EncryptedFileList = ({ selectedDate, onFileDecrypt }) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    decrypted: 0,
    copied: 0,
    failed: 0,
    currentFile: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  const loadFiles = async (date) => {
    if (!date) return;
    
    try {
      setLoading(true);
      const result = await decryptService.getEncryptedFiles(date);
      if (result.success) {
        const fileList = result.data || [];
        setFiles(fileList);
        setPagination(prev => ({
          ...prev,
          total: fileList.length,
          current: 1
        }));
      } else {
        message.error(t('loadFilesFailed'));
        setFiles([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          current: 1
        }));
      }
    } catch (error) {
      console.error('加载文件列表失败:', error);
      message.error(t('loadFilesFailed'));
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
    if (selectedDate) {
      loadFiles(selectedDate);
    } else {
      setFiles([]);
    }
  }, [selectedDate]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const getFileTypeTag = (filename) => {
    const ext = filename.toLowerCase();
    if (ext.endsWith('.gpg')) {
      return <Tag color="red">{t('gpgEncrypted')}</Tag>;
    } else if (ext.endsWith('.gz')) {
      return <Tag color="orange">GZ压缩</Tag>;
    } else if (ext.endsWith('.zip')) {
      return <Tag color="blue">{t('zipCompressed')}</Tag>;
    } else if (ext.endsWith('.txt')) {
      return <Tag color="green">文本文件</Tag>;
    } else if (ext.endsWith('.dat')) {
      return <Tag color="purple">数据文件</Tag>;
    } else if (ext.endsWith('.done')) {
      return <Tag color="cyan">{t('completionMark')}</Tag>;
    } else if (ext.endsWith('.csv')) {
      return <Tag color="lime">CSV文件</Tag>;
    } else if (ext.endsWith('.json')) {
      return <Tag color="gold">{t('jsonFile')}</Tag>;
    } else {
      return <Tag color="default">{t('otherFile')}</Tag>;
    }
  };

  const handleDecryptFile = (file) => {
    if (onFileDecrypt) {
      onFileDecrypt(file);
    }
  };

  const handleBatchProcess = async () => {
    if (!selectedDate) {
      message.warning('请先选择一个日期');
      return;
    }

    try {
      setBatchProcessing(true);
      setProgressVisible(true);
      setProgress({
        total: 0,
        processed: 0,
        decrypted: 0,
        copied: 0,
        failed: 0,
        currentFile: null
      });
      
      console.log(`开始批量处理日期 ${selectedDate} 的文件...`);
      
      const result = await decryptService.batchProcessFilesWithProgress(selectedDate, (progressData) => {
        console.log('进度更新:', progressData);
        setProgress(progressData);
      });
      
      if (result.success) {
        const { processed, decrypted, copied, failed, total } = result.data;
        
        if (failed === 0) {
          message.success(`批量处理完成！共处理 ${processed}/${total} 个文件，解密 ${decrypted} 个，复制 ${copied} 个`);
        } else {
          message.warning(`批量处理完成！共处理 ${processed}/${total} 个文件，解密 ${decrypted} 个，复制 ${copied} 个，失败 ${failed} 个`);
        }
        
        // 刷新文件列表
        loadFiles(selectedDate);
      } else {
        message.error(result.error || '批量处理失败');
      }
    } catch (error) {
      console.error('批量处理失败:', error);
      
      if (error.message.includes('timeout')) {
        message.error('批量处理超时，请稍后重试。处理大量文件需要较长时间。');
      } else {
        message.error('批量处理失败: ' + error.message);
      }
    } finally {
      setBatchProcessing(false);
      setProgressVisible(false);
    }
  };

  const columns = [
    {
      title: t('fileName'),
      dataIndex: 'filename',
      key: 'filename',
      render: (text, record) => (
        <div className="flex items-center space-x-2 min-w-0">
          <FileOutlined className="text-blue-500 flex-shrink-0" />
          <span className="font-medium break-all text-xs" title={text}>{text}</span>
          {getFileTypeTag(text)}
        </div>
      ),
      ellipsis: false,
      width: '45%',
      minWidth: 250,
    },
    {
      title: t('size'),
      dataIndex: 'size',
      key: 'size',
      render: (size) => (
        <span className="text-gray-600 text-xs">
          {formatFileSize(size)}
        </span>
      ),
      width: 70,
      align: 'right',
    },
    {
      title: t('modificationTime'),
      dataIndex: 'mtime',
      key: 'mtime',
      render: (mtime) => (
        <span className="text-gray-600 text-xs">
          {new Date(mtime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ),
      width: 100,
    },
    {
      title: t('operation'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {record.isGpg ? (
            <Tooltip title="解密此文件">
              <Button
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleDecryptFile(record)}
              >
                {t('decrypt')}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="此文件无需解密">
              <Button
                size="small"
                disabled
                icon={<PlayCircleOutlined />}
              >
                {t('noDecryptionNeeded')}
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (!selectedDate) {
    return (
      <Card title={t('fileList')} className="h-96">
        <div className="flex justify-center items-center h-64 text-gray-500">
          <div className="text-center">
            <InfoCircleOutlined className="text-4xl mb-2" />
            <p>{t('selectDateFirst')}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileOutlined />
              <span>{t('fileList')} - {formatDate(selectedDate)}</span>
              <Tag color="blue">{files.length} {t('files')}</Tag>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                type="primary"
                size="small" 
                icon={<ThunderboltOutlined />}
                onClick={handleBatchProcess}
                loading={batchProcessing}
                title="批量处理所有文件（解密+复制）"
              >
                {t('batchProcess')}
              </Button>
              <Button 
                type="text" 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => loadFiles(selectedDate)}
                loading={loading}
                title="刷新文件列表"
              />
            </div>
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
            <FileOutlined className="text-4xl mb-2" />
            <p>该日期下没有文件</p>
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
              showTotal: (total) => `共 ${total} 个文件`,
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

      {/* 进度条模态框 */}
      <Modal
        title={t('processingProgress')}
        open={progressVisible}
        closable={false}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="text-center">
            <Progress
              type="circle"
              percent={progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0}
              format={(percent) => `${progress.processed}/${progress.total}`}
              size={120}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('totalFiles')}:</span>
              <span className="font-medium">{progress.total}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('processed')}:</span>
              <span className="font-medium text-blue-600">{progress.processed}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('decrypted')}:</span>
              <span className="font-medium text-green-600">{progress.decrypted}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('copied')}:</span>
              <span className="font-medium text-blue-600">{progress.copied}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('failed')}:</span>
              <span className="font-medium text-red-600">{progress.failed}</span>
            </div>
          </div>

          {progress.currentFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">{t('currentFile')}:</div>
              <div className="font-medium truncate" title={progress.currentFile}>
                {progress.currentFile}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default EncryptedFileList;
