import React from 'react';
import { Table, Button, Space, Tag, Tooltip, message } from 'antd';
import { 
  FolderOutlined, 
  FileOutlined, 
  DownloadOutlined, 
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { timezoneUtils } from '../../../utils/timezone';

const FileBrowserList = ({
  files,
  loading,
  pagination,
  onPageChange,
  onFileAction,
  onNavigateToDirectory
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.isDirectory) {
      return <FolderOutlined className="text-blue-500" />;
    }
    return <FileOutlined className="text-gray-500" />;
  };

  const getFileTypeTag = (file) => {
    if (file.isDirectory) {
      return <Tag color="blue">文件夹</Tag>;
    }
    
    const ext = file.extension?.toLowerCase();
    if (['.gz', '.zip'].includes(ext)) {
      return <Tag color="orange">压缩文件</Tag>;
    } else if (['.txt', '.csv', '.json'].includes(ext)) {
      return <Tag color="green">文本文件</Tag>;
    } else if (['.dat', '.done'].includes(ext)) {
      return <Tag color="purple">数据文件</Tag>;
    } else {
      return <Tag color="default">文件</Tag>;
    }
  };

  const handleAction = async (action, file) => {
    try {
      await onFileAction(action, file);
      message.success(`${action === 'download' ? '下载' : '删除'}操作已开始`);
    } catch (error) {
      message.error(`${action === 'download' ? '下载' : '删除'}操作失败`);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          {getFileIcon(record)}
          <Tooltip title={record.isDirectory ? '点击进入目录' : ''}>
            <span 
              className={`font-medium ${record.isDirectory ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors' : 'text-gray-900'}`}
              onClick={record.isDirectory ? () => onNavigateToDirectory(record.path) : undefined}
            >
              {text}
            </span>
          </Tooltip>
          {record.isDirectory && (
            <Tag color="blue" size="small">目录</Tag>
          )}
        </div>
      ),
    },
    {
      title: '类型',
      key: 'type',
      render: (_, record) => getFileTypeTag(record),
      width: 100,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size, record) => (
        <span className="text-gray-600">
          {record.isDirectory ? '-' : formatFileSize(size)}
        </span>
      ),
      width: 100,
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
      key: 'mtime',
      render: (mtime) => (
        <span className="text-gray-600 text-sm">
          {timezoneUtils.formatInCambodiaTime(mtime, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ),
      width: 150,
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      render: (path) => (
        <span className="text-gray-500 text-sm font-mono">
          {path || '/'}
        </span>
      ),
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.isFile && (
            <>
              <Tooltip title="下载">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  size="small"
                  onClick={() => handleAction('download', record)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleAction('delete', record)}
                />
              </Tooltip>
            </>
          )}
          {record.isDirectory && (
            <Tooltip title="进入目录">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => onNavigateToDirectory(record.path)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={files}
      rowKey="fullPath"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        onChange: onPageChange,
        onShowSizeChange: (current, size) => {
          onPageChange(1, size);
        }
      }}
      scroll={{ x: 800 }}
      className="mt-4"
    />
  );
};

export default FileBrowserList;
