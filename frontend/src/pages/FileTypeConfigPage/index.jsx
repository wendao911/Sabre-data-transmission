import React from 'react';
import { Card, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { PageTitle, PageContainer } from '../../components/Common';
import { useLanguage } from './hooks/useLanguage';
import { useFileTypeConfigPage } from './hooks/useFileTypeConfigPage';
import FileTypeConfigTable from './components/FileTypeConfigTable';
import FileTypeConfigModal from './components/FileTypeConfigModal';

const FileTypeConfigPage = () => {
  const { t } = useLanguage();
  const {
    // 状态
    loading,
    configs,
    total,
    currentPage,
    pageSize,
    selectedRowKeys,
    isAddModalVisible,
    isEditModalVisible,
    editingConfig,
    moduleOptions,
    
    // 方法
    loadConfigs,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleAddSubmit,
    handleEditSubmit,
    handleAddCancel,
    handleEditCancel,
    setCurrentPage,
    setPageSize,
    setSelectedRowKeys
  } = useFileTypeConfigPage();

  // 表格列定义
  const columns = [
    {
      title: t('colSerialNumber'),
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 80,
      sorter: (a, b) => a.serialNumber - b.serialNumber
    },
    {
      title: t('colModule'),
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module) => {
        const moduleOption = moduleOptions.find(opt => opt.value === module);
        return <Tag color="blue">{moduleOption?.label || module}</Tag>;
      }
    },
    {
      title: t('colFileType'),
      dataIndex: 'fileType',
      key: 'fileType',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: t('colPushPath'),
      dataIndex: 'pushPath',
      key: 'pushPath',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: t('colRemark'),
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: t('colStatus'),
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? t('statusEnabled') : t('statusDisabled')}
        </Tag>
      )
    },
    {
      title: t('colAction'),
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('btnEdit')}
          </Button>
          <Popconfirm
            title={t('confirmDeleteTitle')}
            onConfirm={() => handleDelete(record._id)}
            okText={t('confirmDeleteOk')}
            cancelText={t('confirmDeleteCancel')}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              {t('btnDelete')}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        icon={<SettingOutlined />}
      />

      {/* 数据表格 */}
      <Card
        extra={
          <Space>
            <Tooltip title={t('btnRefresh')}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadConfigs}
                size="small"
                shape="circle"
              />
            </Tooltip>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              {t('btnAdd')}
            </Button>
          </Space>
        }
      >
        <FileTypeConfigTable
          columns={columns}
          configs={configs}
          loading={loading}
          selectedRowKeys={selectedRowKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowSelectionChange={setSelectedRowKeys}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </Card>

      {/* 添加配置模态框 */}
      <FileTypeConfigModal
        visible={isAddModalVisible}
        title={t('modalAddTitle')}
        onSubmit={handleAddSubmit}
        onCancel={handleAddCancel}
        moduleOptions={moduleOptions}
      />

      {/* 编辑配置模态框 */}
      <FileTypeConfigModal
        visible={isEditModalVisible}
        title={t('modalEditTitle')}
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        moduleOptions={moduleOptions}
        initialValues={editingConfig}
      />
    </PageContainer>
  );
};

export default FileTypeConfigPage;