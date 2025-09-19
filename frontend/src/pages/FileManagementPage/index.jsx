import React from 'react';
import { Card, Typography } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useFileManagementPage } from './hooks/useFileManagementPage';
import FileBrowserToolbar from './components/FileBrowserToolbar';
import FileBrowserList from './components/FileBrowserList';
import CreateDirectoryModal from './components/CreateDirectoryModal';
import UploadFileModal from './components/UploadFileModal';

const { Title, Paragraph } = Typography;

const FileManagementPage = () => {
  const {
    files,
    loading,
    pagination,
    searchTerm,
    sortBy,
    sortOrder,
    showHidden,
    currentPath,
    rootPath,
    parentPath,
    setSearchTerm,
    handlePageChange,
    handleFileAction,
    handleSort,
    handleToggleHidden,
    handleNavigateToDirectory,
    handleNavigateToParent,
    handleNavigateToRoot,
    handleRefresh,
    createModalVisible,
    handleCreateDirectory,
    handleCreateDirectoryConfirm,
    handleCreateDirectoryCancel,
    uploadModalVisible,
    handleUpload,
    handleUploadConfirm,
    handleUploadCancel
  } = useFileManagementPage();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <FolderOutlined className="text-2xl text-blue-600" />
        <div>
          <Title level={2} className="!mb-0">文件浏览器</Title>
          <Paragraph className="!mb-0 text-gray-600">
            当前路径: {currentPath || '/'}
          </Paragraph>
        </div>
      </div>

      {/* 文件浏览器内容 */}
      <Card>
        <FileBrowserToolbar 
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          showHidden={showHidden}
          currentPath={currentPath}
          parentPath={parentPath}
          onSearchChange={setSearchTerm}
          onSort={handleSort}
          onToggleHidden={handleToggleHidden}
          onNavigateToDirectory={handleNavigateToDirectory}
          onNavigateToParent={handleNavigateToParent}
          onNavigateToRoot={handleNavigateToRoot}
          onRefresh={handleRefresh}
          onCreateDirectory={handleCreateDirectory}
          onUpload={handleUpload}
        />
        
        <FileBrowserList 
          files={files}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onFileAction={handleFileAction}
          onNavigateToDirectory={handleNavigateToDirectory}
        />
      </Card>

      {/* 创建目录模态框 */}
      <CreateDirectoryModal
        visible={createModalVisible}
        currentPath={currentPath}
        onConfirm={handleCreateDirectoryConfirm}
        onCancel={handleCreateDirectoryCancel}
      />

      <UploadFileModal
        visible={uploadModalVisible}
        currentPath={currentPath}
        onConfirm={handleUploadConfirm}
        onCancel={handleUploadCancel}
      />
    </div>
  );
};

export default FileManagementPage;