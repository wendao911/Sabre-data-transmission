import React from 'react';
import { Card, Button, Table, Space, Divider, Tooltip, Popconfirm } from 'antd';
import { ReloadOutlined, FolderOutlined, FileOutlined, PlusOutlined, CloudUploadOutlined, DownloadOutlined, DeleteOutlined, SwapRightOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const LocalFileBrowser = ({
  currentPath,
  items,
  loading,
  onRefresh,
  onNavigate,
  onGoToParent,
  onCreateDirectory,
  onUpload,
  onDelete,
  onDownload,
  pagination,
  onPageChange,
  onSortChange,
  onTransfer
}) => {
  const { t } = useLanguage();
  const generateBreadcrumb = () => {
    const base = { name: t('breadcrumb_root') || '资源根目录', path: '' };
    if (!currentPath) return [base];
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumb = [base];
    let acc = '';
    parts.forEach(p => {
      acc += (acc ? '/' : '') + p;
      breadcrumb.push({ name: p, path: acc });
    });
    return breadcrumb;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0 || bytes === undefined || bytes === null) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
    return `${y}/${m}/${d} ${hh}:${mm}`;
  };

  const columns = [
    {
      title: t('col_name') || '名称',
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
              style={{ cursor: isDirectory ? 'pointer' : 'default', color: isDirectory ? '#1890ff' : '#000' }}
              onClick={() => {
                if (isDirectory) {
                  const next = currentPath ? `${currentPath}/${record.name}` : record.name;
                  onNavigate(next);
                }
              }}
            >
              {text}
            </span>
          </Space>
        );
      }
    },
    {
      title: t('col_type') || '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      sorter: true,
      render: (type) => (type === 'directory' ? (t('type_directory') || '目录') : (t('type_file') || '文件'))
    },
    {
      title: t('col_size') || '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      sorter: true,
      render: (size, record) => (record.type === 'directory' ? '-' : formatFileSize(size))
    },
    {
      title: t('col_mtime') || '修改时间',
      dataIndex: 'mtime',
      key: 'mtime',
      width: 160,
      sorter: true,
      render: (mtime) => formatDateDisplay(mtime)
    }
  ];

  return (
    <Card title={t('local_server_files') || '服务器本地文件'}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button type="text" icon={<ReloadOutlined />} onClick={() => onRefresh(currentPath)} loading={loading} />
          <Button type="text" icon={<FolderOutlined />} onClick={onGoToParent} disabled={!currentPath} />
        </div>
        <div className="flex items-center space-x-1">
          <Tooltip title={t('action_create_dir') || '创建目录'}>
            <Button type="text" icon={<PlusOutlined />} onClick={onCreateDirectory} />
          </Tooltip>
          <Tooltip title={t('action_upload') || '上传文件'}>
            <Button type="text" icon={<CloudUploadOutlined />} onClick={onUpload} />
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center space-x-1 text-sm mb-2">
        <span className="text-gray-500">{t('breadcrumb_path') || '路径'}:</span>
        {generateBreadcrumb().map((item, idx) => (
          <React.Fragment key={item.path}>
            {idx > 0 && <span className="text-gray-400">/</span>}
            <button
              className={`px-2 py-1 rounded text-sm hover:bg-white transition-colors ${
                item.path === (currentPath || '') ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => onNavigate(item.path)}
              disabled={item.path === (currentPath || '')}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      <Table 
        columns={[
          ...columns,
          {
            title: t('col_action') || '操作',
            key: 'action',
            width: 110,
            render: (_, record) => (
              <Space size={0}>
                {!record.isDirectory && (
                  <Tooltip title={t('action_download') || '下载'}>
                    <Button type="text" icon={<DownloadOutlined />} onClick={() => onDownload(record)} />
                  </Tooltip>
                )}
                {!record.isDirectory && (
                  <Tooltip title={t('action_transfer_to_sftp') || '传输到SFTP'}>
                    <Button type="text" icon={<SwapRightOutlined />} onClick={() => onTransfer(record)} />
                  </Tooltip>
                )}
                <Popconfirm
                  title={`${t('confirm_delete_prefix') || '确认删除'}${record.isDirectory ? (t('type_directory') || '目录') : (t('type_file') || '文件')}？`}
                  description={`${(t('confirm_delete_desc_prefix') || '将删除：')}${record.name}`}
                  okText={t('ok_delete') || '删除'}
                  cancelText={t('cancel') || '取消'}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onDelete(record)}
                >
                  <Tooltip title={t('action_delete') || '删除'}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
        dataSource={items}
        loading={loading}
        rowKey="name"
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 10,
          total: pagination?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (t('pagination_total') ? t('pagination_total', { start: range[0], end: range[1], total }) : `第 ${range[0]}-${range[1]} 条，共 ${total} 条`),
          onChange: onPageChange,
          onShowSizeChange: (current, size) => onPageChange(1, size)
        }}
        onChange={(pg, filters, sorter) => {
          const order = Array.isArray(sorter) ? sorter[0]?.order : sorter?.order;
          const field = Array.isArray(sorter) ? sorter[0]?.field : sorter?.field;
          if (typeof onPageChange === 'function') onPageChange(pg.current, pg.pageSize);
          if (order && field && typeof onSortChange === 'function') onSortChange(field, order);
        }}
        size="small"
      />
    </Card>
  );
};

export { LocalFileBrowser };


