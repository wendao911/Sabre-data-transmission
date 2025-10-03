import React, { useState } from 'react';
import { Card, Modal, Descriptions, Tag, Input, Button, message } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useFileManagementPage } from './hooks/useFileManagementPage';
import FileBrowserToolbar from './components/FileBrowserToolbar';
import FileBrowserList from './components/FileBrowserList';
import CreateDirectoryModal from './components/CreateDirectoryModal';
import UploadFileModal from './components/UploadFileModal';
import { useLanguage } from './hooks/useLanguage';
import { PageTitle, PageContainer } from '../../components/Common';
import fileService from '../../services/fileService';


const FileManagementPage = () => {
  const { t } = useLanguage();
  const [fileDetailVisible, setFileDetailVisible] = useState(false);
  const [fileDetail, setFileDetail] = useState(null);
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
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={`${t('pageDescription')} - 当前路径: ${currentPath || '/'}`}
        icon={<FolderOutlined />}
      />

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
          onViewFile={async (path)=>{
            try {
              const resp = await fileService.getUploadLogByPath(path && path.startsWith('/') ? path.substring(1) : path);
              if (resp?.success && resp.data?.log) {
                setFileDetail(resp.data.log);
              } else {
                setFileDetail({ filePath: path, status: 'not_found' });
              }
            } catch (e) {
              setFileDetail({ filePath: path, status: 'error', errorMessage: e.message });
            } finally {
              setFileDetailVisible(true);
            }
          }}
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

      {/* 文件详情 */}
      <Modal
        title={t('file_details') || '文件详情'}
        open={fileDetailVisible}
        onCancel={() => { setFileDetailVisible(false); setFileDetail(null); }}
        footer={null}
        width={900}
        centered
        styles={{ body: { padding: 20, maxHeight: 600, overflowY: 'auto' } }}
      >
        {fileDetail ? (
          <Descriptions
            bordered
            size="middle"
            column={2}
            labelStyle={{ width: 180, fontWeight: 600, background: '#fafafa' }}
            contentStyle={{ background: '#fff' }}
          >
            <Descriptions.Item label={t('file_path') || '相对路径'} span={2}>{fileDetail.filePath || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('original_name') || '原始文件名'}>{fileDetail.originalName || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('saved_name') || '保存文件名'}>{fileDetail.savedName || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('status') || '状态'}>
              <Tag color={fileDetail.status === 'success' ? 'green' : (fileDetail.status === 'failed' ? 'red' : 'default')}>
                {fileDetail.status || 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('file_size') || '大小'}>{fileDetail.fileSize || 0}</Descriptions.Item>
            <Descriptions.Item label={t('mime_type') || 'MIME类型'}>{fileDetail.mimeType || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('uploaded_by') || '上传用户'}>{fileDetail.uploadedByName || fileDetail.uploadedBy || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('uploaded_at') || '上传时间'}>{fileDetail.uploadedAt ? new Date(fileDetail.uploadedAt).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label={t('file_type') || '文件类型'}>
              {(() => {
                const v = fileDetail?.fileTypeConfig;
                if (!v) return '-';
                if (typeof v === 'string') return v || '-';
                if (typeof v === 'object') {
                  const text = [v.module, v.fileType, v.pushPath].filter(Boolean).join(' / ');
                  return text || '-';
                }
                return '-';
              })()}
            </Descriptions.Item>
            {fileDetail.status === 'not_found' && (
              <Descriptions.Item label={t('message') || '消息'} span={2}>{t('no_upload_log') || '未找到对应的上传记录'}</Descriptions.Item>
            )}
            {fileDetail.status === 'error' && (
              <Descriptions.Item label={t('message') || '消息'} span={2}>{fileDetail.errorMessage || '-'}</Descriptions.Item>
            )}
            <Descriptions.Item label={t('remark') || '备注'} span={2}>
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <Input.TextArea
                  rows={4}
                  defaultValue={fileDetail.remark || ''}
                  onChange={(e)=>{ setFileDetail({ ...fileDetail, remark: e.target.value }); }}
                  maxLength={500}
                  showCount
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  onClick={async ()=>{
                    if (!fileDetail?._id) return;
                    const resp = await fileService.updateUploadLogRemark(fileDetail._id, fileDetail.remark || '');
                    if (resp?.success) {
                      message.success(t('saved') || '已保存');
                    } else {
                      message.error(resp?.error || (t('save_failed') || '保存失败'));
                    }
                  }}
                >{t('save') || '保存'}</Button>
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </PageContainer>
  );
};

export default FileManagementPage;