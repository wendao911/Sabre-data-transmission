import React from 'react';
import { Table, Space, Button, Tag, Tooltip, Popconfirm } from 'antd';
import {
  EditOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { timezoneUtils } from '../../../utils/timezone';

const TaskList = ({ 
  tasks, 
  loading, 
  onEdit, 
  onRun,
  t
}) => {
  const columns = [
    {
      title: t('taskName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: t('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? t('status.enabled') : t('status.disabled')}
        </Tag>
      ),
    },
    {
      title: t('cronExpression'),
      dataIndex: 'cron',
      key: 'cron',
      render: (cron) => (
        <div className="font-mono text-sm">
          {cron}
        </div>
      ),
    },
    {
      title: t('lastRun'),
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (lastRun) => (
        <div className="text-sm text-gray-500">
          {lastRun ? timezoneUtils.formatInCambodiaTime(lastRun) : t('neverRun')}
        </div>
      ),
    },
    {
      title: t('nextRun'),
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (nextRun) => (
        <div className="text-sm text-gray-500">
          {nextRun ? timezoneUtils.formatInCambodiaTime(nextRun) : t('notScheduled')}
        </div>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={t('edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title={t('confirmRun')}
            onConfirm={() => onRun(record.type)}
            okText={t('confirmOk')}
            cancelText={t('confirmCancel')}
          >
            <Tooltip title={t('runNow')}>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
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
      dataSource={tasks}
      rowKey="id"
      loading={loading}
      pagination={false}
      className="mt-4"
    />
  );
};

export default TaskList;
