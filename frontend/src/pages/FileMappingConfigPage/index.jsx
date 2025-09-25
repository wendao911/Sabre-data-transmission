import React from 'react';
import { Card, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useFileMappingPage } from './hooks/useFileMappingPage';
import FileMappingToolbar from './components/FileMappingToolbar';
import FileMappingList from './components/FileMappingList';
import CreateMappingModal from './components/CreateMappingModal';
import EditMappingModal from './components/EditMappingModal';
import ViewMappingModal from './components/ViewMappingModal';
import { useLanguage } from './hooks/useLanguage';

const { Title, Paragraph } = Typography;

const FileMappingConfigPage = () => {
  const { t } = useLanguage();
  const {
    rules,
    loading,
    pagination,
    searchTerm,
    enabled,
    setSearchTerm,
    handlePageChange,
    handleToggleEnabled,
    handleRefresh,
    createModalVisible,
    handleCreate,
    handleCreateConfirm,
    handleCreateCancel,
    editModalVisible,
    viewModalVisible,
    editingRule,
    viewingRule,
    handleEdit,
    handleView,
    handleViewCancel,
    handleEditConfirm,
    handleEditCancel,
    handleDelete,
    handleToggleRule,
    handleUpdatePriority
  } = useFileMappingPage();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <SwapOutlined className="text-2xl text-blue-600" />
        <div>
          <Title level={2} className="!mb-0">{t('pageTitle')}</Title>
          <Paragraph className="!mb-0 text-gray-600">
            {t('pageDescription')}
          </Paragraph>
        </div>
      </div>

      {/* 文件映射内容 */}
      <Card>
        <FileMappingToolbar 
          searchTerm={searchTerm}
          enabled={enabled}
          onSearchChange={setSearchTerm}
          onToggleEnabled={handleToggleEnabled}
          onRefresh={handleRefresh}
          onCreate={handleCreate}
        />
        
        <FileMappingList
          rules={rules}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onToggleRule={handleToggleRule}
          onUpdatePriority={handleUpdatePriority}
        />
      </Card>

      {/* 创建映射规则模态框 */}
      <CreateMappingModal
        visible={createModalVisible}
        onConfirm={handleCreateConfirm}
        onCancel={handleCreateCancel}
      />

      {/* 编辑映射规则模态框 */}
      <EditMappingModal
        visible={editModalVisible}
        rule={editingRule}
        onConfirm={handleEditConfirm}
        onCancel={handleEditCancel}
      />

      {/* 查看映射规则模态框 */}
      <ViewMappingModal
        visible={viewModalVisible}
        rule={viewingRule}
        onCancel={handleViewCancel}
      />
    </div>
  );
};

export default FileMappingConfigPage;
