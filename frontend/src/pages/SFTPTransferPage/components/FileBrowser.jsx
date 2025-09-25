import React from 'react';
import { Card, Button, Table, Space, Divider, Tooltip, Popconfirm } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  FolderOutlined,
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const FileBrowser = ({
  title,
  currentPath,
  directoryList,
  listLoading,
  isConnected,
  onRefresh,
  onCreateDirectory,
  onUpload,
  onDownload,
  onSync,
  onNavigateDirectory,
  onGoToParent,
  onDelete,
  onDownloadFile,
  pagination,
  onPageChange,
  onSortChange
}) => {
  const generateBreadcrumb = () => {
    const base = { name: '资源根目录', path: '/' };
    if (!currentPath || currentPath === '/') return [base];
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumb = [base];
    let acc = '';
    parts.forEach(p => {
      acc += `/${p}`;
      breadcrumb.push({ name: p, path: acc });
    });
    return breadcrumb;
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => {
        const isDirectory = record.type === 'directory';
        return (
          <Space>
            {isDirectory ? (
              <FolderOutlined style={{ color: '#1890ff' }} />
            ) : (
              <FileOutlined style={{ color: '#52c41a' }} />
            )}
            <span
              style={{
                cursor: isDirectory ? 'pointer' : 'default',
                color: isDirectory ? '#1890ff' : '#000'
              }}
              onClick={() => {
                if (isDirectory) {
                  const newPath = currentPath === '/' ? `/${record.name}` : `${currentPath}/${record.name}`;
                  onNavigateDirectory(newPath);
                }
              }}
            >
              {text}
            </span>
          </Space>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      sorter: true,
      render: (type) => (type === 'directory' ? '目录' : '文件'),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      sorter: true,
      render: (size, record) => (record.type === 'directory' ? '-' : (size ? formatFileSize(size) : '-')),
    },
    {
      title: '修改时间',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      sorter: true,
      render: (date) => formatDateDisplay(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Space size={0}>
          {record.type !== 'directory' && (
            <Tooltip title="下载">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => {
                  const path = currentPath === '/' ? `/${record.name}` : `${currentPath}/${record.name}`;
                  onDownloadFile(path);
                }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title={`确认删除${record.type === 'directory' ? '目录' : '文件'}？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record)}
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDateDisplay = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return typeof value === 'string' ? value : '-';
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const y = dt.getFullYear();
    const m = pad(dt.getMonth() + 1);
    const d = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    const ss = pad(dt.getSeconds());
    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
  };

  return (
    <Card title={title || 'SFTP 远程文件'}>
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Tooltip title="刷新当前目录">
            <Button type="text" icon={<ReloadOutlined />} onClick={() => onRefresh(currentPath)} loading={listLoading} />
          </Tooltip>
          <Tooltip title="返回上级目录">
            <Button type="text" icon={<FolderOutlined />} onClick={onGoToParent} disabled={currentPath === '/' || currentPath === ''} />
          </Tooltip>
          <Divider type="vertical" />
        </Space>
        <Space>
          <Tooltip title="创建目录">
            <Button type="text" icon={<PlusOutlined />} onClick={onCreateDirectory} disabled={!isConnected} />
          </Tooltip>
          <Tooltip title="同步文件到SFTP（自动连接）">
            <Button type="text" icon={<SyncOutlined />} onClick={onSync} />
          </Tooltip>
        </Space>
      </div>

      <div className="flex items-center space-x-1 text-sm mb-2">
        <span className="text-gray-500">路径:</span>
        {generateBreadcrumb().map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <button
              className={`px-2 py-1 rounded text-sm hover:bg-white transition-colors ${item.path === currentPath
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-blue-600'
                }`}
              onClick={() => onNavigateDirectory(item.path)}
              disabled={item.path === currentPath}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

       <Table
        columns={columns}
        dataSource={directoryList}
        loading={listLoading}
        rowKey="name"
         pagination={{
           current: pagination?.current || 1,
           pageSize: pagination?.pageSize || 10,
           total: pagination?.total || 0,
           showSizeChanger: true,
           showQuickJumper: true,
           showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
           onChange: onPageChange,
           onShowSizeChange: (current, size) => onPageChange(1, size)
         }}
        size="small"
         onChange={(pg, filters, sorter) => {
           const order = Array.isArray(sorter) ? sorter[0]?.order : sorter?.order;
           const field = Array.isArray(sorter) ? sorter[0]?.field : sorter?.field;
           if (typeof onPageChange === 'function') onPageChange(pg.current, pg.pageSize);
           if (order && field && typeof onSortChange === 'function') onSortChange(field, order);
         }}
      />
    </Card>
  );
};

export { FileBrowser };
