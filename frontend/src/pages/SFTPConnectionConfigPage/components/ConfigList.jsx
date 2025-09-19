import React from 'react';
import { Table, Button, Space, Tag, Tooltip, Popconfirm } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  PlayCircleOutlined,
  StopOutlined,
  WifiOutlined
} from '@ant-design/icons';

const ConfigList = ({ 
  configs, 
  loading, 
  activeConfig, 
  onEdit, 
  onDelete, 
  onActivate, 
  onTest,
  t
}) => {
  const columns = [
    {
      title: t('configName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium flex items-center space-x-2">
            <span>{text}</span>
            {record.status === 1 && (
              <Tag color="blue" size="small">{t('active')}</Tag>
            )}
          </div>
          {record.description && (
            <div className="text-sm text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: t('serverAddress'),
      dataIndex: 'host',
      key: 'host',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-sm text-gray-500">端口: {record.sftpPort}</div>
        </div>
      ),
    },
    {
      title: t('username'),
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? t('enabled') : t('disabled')}
        </Tag>
      ),
    },
    {
      title: t('updateTime'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('testConnection')}>
            <Button
              type="text"
              icon={<WifiOutlined />}
              onClick={() => onTest(record)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title={t('edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          
          {record.status !== 1 && (
            <Tooltip title={t('activate')}>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => onActivate(record._id)}
                size="small"
              />
            </Tooltip>
          )}
          
          {record.status === 1 && (
            <Tooltip title={t('enabled')}>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                disabled
                size="small"
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title={t('confirmDelete')}
            onConfirm={() => onDelete(record._id)}
            okText={t('confirmOk')}
            cancelText={t('confirmCancel')}
          >
            <Tooltip title={t('delete')}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={configs}
      loading={loading}
      rowKey="_id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`,
      }}
    />
  );
};

export default ConfigList;
