import React, { useState } from 'react';
import { Card } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useSFTPConfig } from './hooks/useSFTPConfig';
import { useLanguage } from './hooks/useLanguage';
import ConfigToolbar from './components/ConfigToolbar';
import ConfigList from './components/ConfigList';
import ConfigForm from './components/ConfigForm';
import { PageTitle, PageContainer } from '../../components/Common';


const SFTPConnectionConfigPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { t } = useLanguage();
  const {
    configs,
    loading,
    activeConfig,
    loadConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    testConnection
  } = useSFTPConfig();

  // 新增配置
  const handleAdd = () => {
    setEditingConfig(null);
    setFormVisible(true);
  };

  // 编辑配置
  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormVisible(true);
  };

  // 删除配置
  const handleDelete = async (id) => {
    await deleteConfig(id);
  };

  // 启用配置
  const handleActivate = async (id) => {
    await activateConfig(id);
  };

  // 测试连接
  const handleTest = async (configData) => {
    await testConnection(configData);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    setFormLoading(true);
    try {
      if (editingConfig) {
        await updateConfig(editingConfig._id, values);
      } else {
        await createConfig(values);
      }
      setFormVisible(false);
      setEditingConfig(null);
    } finally {
      setFormLoading(false);
    }
  };

  // 取消表单
  const handleCancel = () => {
    setFormVisible(false);
    setEditingConfig(null);
  };

  return (
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={t('pageDescription')}
        icon={<CloudUploadOutlined />}
      />

      {/* 配置内容 */}
      <Card>
        <ConfigToolbar
          onAdd={handleAdd}
          onRefresh={loadConfigs}
          loading={loading}
          total={configs.length}
          t={t}
        />
        
        <ConfigList
          configs={configs}
          loading={loading}
          activeConfig={activeConfig}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onTest={handleTest}
          t={t}
        />
      </Card>

      {/* 配置表单 */}
      <ConfigForm
        visible={formVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        onTest={handleTest}
        initialValues={editingConfig}
        loading={formLoading}
        t={t}
      />
    </PageContainer>
  );
};

export default SFTPConnectionConfigPage;
