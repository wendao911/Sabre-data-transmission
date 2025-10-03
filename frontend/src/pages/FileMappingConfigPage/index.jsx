import React from 'react';
import { Card } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useFileMappingPage } from './hooks/useFileMappingPage';
import FileMappingToolbar from './components/FileMappingToolbar';
import FileMappingList from './components/FileMappingList';
import CreateMappingModal from './components/CreateMappingModal';
import EditMappingModal from './components/EditMappingModal';
import ViewMappingModal from './components/ViewMappingModal';
import { useLanguage } from './hooks/useLanguage';
import { PageTitle, PageContainer } from '../../components/Common';


const FileMappingConfigPage = () => {
  const { t } = useLanguage();
  const {
    rules,
    loading,
    pagination,
    searchTerm,
    enabled,
    matchType,
    setSearchTerm,
    handlePageChange,
    handleToggleEnabled,
    handleMatchTypeChange,
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
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={t('pageDescription')}
        icon={<SwapOutlined />}
      />

      {/* 文件映射内容 */}
      <Card>
        <FileMappingToolbar 
          searchTerm={searchTerm}
          enabled={enabled}
          matchType={matchType}
          onSearchChange={setSearchTerm}
          onToggleEnabled={handleToggleEnabled}
          onMatchTypeChange={handleMatchTypeChange}
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
    </PageContainer>
  );
};

export default FileMappingConfigPage;
