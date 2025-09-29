import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Tag, 
  Tooltip, 
  Popconfirm,
  InputNumber,
  message
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { ModernTable, ModernPagination } from '../../../components/Common';

const FileMappingList = ({
  rules,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView,
  onDelete,
  onToggleRule,
  onUpdatePriority
}) => {
  const { t } = useLanguage();
  const [editingPriority, setEditingPriority] = useState({});

  // 处理优先级编辑
  const handlePriorityEdit = (rule) => {
    setEditingPriority({ ...editingPriority, [rule._id]: rule.priority });
  };

  const handlePrioritySave = async (rule) => {
    const newPriority = editingPriority[rule._id];
    if (newPriority !== undefined && newPriority !== rule.priority) {
      try {
        await onUpdatePriority(rule, newPriority);
        setEditingPriority({ ...editingPriority, [rule._id]: undefined });
      } catch (error) {
        message.error(t('priorityUpdateFailed'));
      }
    }
  };

  const handlePriorityCancel = (rule) => {
    setEditingPriority({ ...editingPriority, [rule._id]: undefined });
  };

  // 表格列定义
  const columns = [
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">
            {record.enabled ? (
              <Tag color="green" size="small">{t('enabled')}</Tag>
            ) : (
              <Tag color="red" size="small">{t('disabled')}</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('module'),
      dataIndex: 'module',
      key: 'module',
      width: 80,
      align: 'center',
      render: (module) => {
        const moduleColors = {
          'SAL': 'blue',
          'UPL': 'green',
          'OWB': 'orange',
          'IWB': 'purple',
          'MAS': 'cyan'
        };
        return (
          <Tag color={moduleColors[module] || 'default'} size="small">
            {module}
          </Tag>
        );
      },
    },
    {
      title: t('sourceDirectory'),
      dataIndex: ['source', 'directory'],
      key: 'sourceDirectory',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
          {text}
        </code>
      ),
    },
    {
      title: t('sourcePattern'),
      dataIndex: ['source', 'pattern'],
      key: 'sourcePattern',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
          {text}
        </code>
      ),
    },
    {
      title: t('destinationPath'),
      dataIndex: ['destination', 'path'],
      key: 'destinationPath',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
          {text}
        </code>
      ),
    },
    {
      title: t('destinationFilename'),
      dataIndex: ['destination', 'filename'],
      key: 'destinationFilename',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
          {text}
        </code>
      ),
    },
    {
      title: t('conflictStrategy'),
      dataIndex: ['destination', 'conflict'],
      key: 'conflictStrategy',
      width: 100,
      render: (strategy) => {
        const strategyMap = {
          overwrite: { color: 'red', text: t('overwrite') },
          rename: { color: 'blue', text: t('rename') },
          skip: { color: 'orange', text: t('skip') }
        };
        const config = strategyMap[strategy] || { color: 'default', text: strategy };
        return <Tag color={config.color} size="small">{config.text}</Tag>;
      },
    },
    {
      title: t('priority'),
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      align: 'center',
      render: (priority, record) => {
        const isEditing = editingPriority[record._id] !== undefined;
        return (
          <div className="flex items-center justify-center">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <InputNumber
                  size="small"
                  min={1}
                  max={1000}
                  value={editingPriority[record._id]}
                  onChange={(value) => setEditingPriority({
                    ...editingPriority,
                    [record._id]: value
                  })}
                  style={{ width: 60 }}
                />
                <Button
                  size="small"
                  type="link"
                  onClick={() => handlePrioritySave(record)}
                >
                  保存
                </Button>
                <Button
                  size="small"
                  type="link"
                  onClick={() => handlePriorityCancel(record)}
                >
                  取消
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-medium">{priority}</span>
                <Button
                  size="small"
                  type="text"
                  icon={<SwapOutlined />}
                  onClick={() => handlePriorityEdit(record)}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t('retryAttempts'),
      dataIndex: ['retry', 'attempts'],
      key: 'retryAttempts',
      width: 80,
      align: 'center',
      render: (attempts) => (
        <span className="text-sm">{attempts || 0}</span>
      ),
    },
    {
      title: t('operation'),
      key: 'operation',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('view')}>
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title={t('edit')}>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.enabled ? t('disable') : t('enable')}>
            <Button
              size="small"
              type="text"
              icon={record.enabled ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => onToggleRule(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t('confirmDelete')}
            description={t('confirmDeleteMessage')}
            onConfirm={() => onDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title={t('delete')}>
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ModernTable
      columns={columns}
      dataSource={rules}
      loading={loading}
      rowKey="_id"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      scroll={{ x: 1200 }}
      size="small"
    />
  );
};

export default FileMappingList;
