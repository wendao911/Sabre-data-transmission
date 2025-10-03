import React, { useState } from 'react';
import { Modal, Progress, Descriptions, Tag, Input, Button, message } from 'antd';
import { CloudServerOutlined } from '@ant-design/icons';
import { useSFTPTransfer } from './hooks/useSFTPTransfer';
import { useLanguage } from './hooks/useLanguage';
import { ConnectionConfig } from './components/ConnectionConfig';
import { FileBrowser } from './components/FileBrowser';
import { LocalFileBrowser } from './components/LocalFileBrowser';
import { CreateDirectoryModal } from './components/CreateDirectoryModal';
import { SyncModal } from './components/SyncModal';
import SyncProgressModal from './components/SyncProgressModal';
import { PageTitle, PageContainer } from '../../components/Common';
import fileService from '../../services/fileService';


const SFTPTransferPage = () => {
  const { t } = useLanguage();
  const [fileDetailVisible, setFileDetailVisible] = useState(false);
  const [fileDetail, setFileDetail] = useState(null);
  const {
    // State
    isConnected,
    connecting,
    connectedSince,
    activeFtpConfig,
    loadingConfig,
    currentPath,
    directoryList,
    listLoading,
    sftpPagination,
    localPath,
    localList,
    localLoading,
    localPagination,
    syncModalVisible,
    createDirModalVisible,
    uploadFileList,
    uploading,
    operationProgress,
    operationStatus,
    syncDate,
    syncLoading,
    localCreateDirModalVisible,
    transferModalVisible,
    transferTarget,
    transfering,
    transferProgress,
    
    // Actions
    handleConnect,
    handleDisconnect,
    loadActiveFtpConfig,
    handleCreateDirectory,
    handleDelete,
    handleUpload,
    handleFileChange,
    handleRemoveFile,
    handleDownload,
    handleDownloadFile,
    
    // Modal controls
    onCreateDirectory,
    onSync,
    onNavigateDirectory,
    onGoToParent,
    onRefresh,
    onSftpPageChange,
    onSftpSortChange,
    onNavigateLocal,
    onGoToParentLocal,
    onRefreshLocal,
    onLocalSortChange,
    onLocalPageChange,
    closeSyncProgress,
    syncProgressVisible,
    syncProgressData,
    syncRunning,
    openLocalCreateDirectory,
    closeLocalCreateDirectory,
    handleLocalCreateDirectorySubmit,
    handleLocalUpload,
    handleLocalDelete,
    handleLocalDownload,
    openTransferModal,
    closeTransferModal,
    submitTransferToSftp,
    onClose,
    syncByMapping,
    setSyncDate
  } = useSFTPTransfer();


  return (
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={t('pageDescription')}
        icon={<CloudServerOutlined />}
      />

      <ConnectionConfig
        activeFtpConfig={activeFtpConfig}
        loadingConfig={loadingConfig}
        isConnected={isConnected}
        connecting={connecting}
        connectedSince={connectedSince}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRefresh={loadActiveFtpConfig}
      />

      <div className="grid grid-cols-2 gap-4">
        <LocalFileBrowser
          currentPath={localPath}
          items={localList}
          loading={localLoading}
          onRefresh={onRefreshLocal}
          onNavigate={onNavigateLocal}
          onGoToParent={onGoToParentLocal}
          onCreateDirectory={openLocalCreateDirectory}
          onUpload={handleLocalUpload}
          onDelete={handleLocalDelete}
          onDownload={handleLocalDownload}
          pagination={localPagination}
          onPageChange={(page, pageSize) => onLocalPageChange(page, pageSize)}
          onSortChange={(field, order) => onLocalSortChange(field, order)}
          onTransfer={openTransferModal}
        />

        <FileBrowser
          title={activeFtpConfig ? `${activeFtpConfig.host}:${activeFtpConfig.sftpPort || 22}` : 'SFTP 远程文件'}
          currentPath={currentPath}
          directoryList={directoryList}
          listLoading={listLoading}
          isConnected={isConnected}
          onRefresh={onRefresh}
          onCreateDirectory={onCreateDirectory}
          onSync={onSync}
          onNavigateDirectory={onNavigateDirectory}
          onGoToParent={onGoToParent}
          onDelete={handleDelete}
          onDownloadFile={handleDownloadFile}
          pagination={sftpPagination}
          onPageChange={(page, pageSize) => onSftpPageChange(page, pageSize)}
          onSortChange={(field, order) => onSftpSortChange(field, order)}
          onViewFile={async (path) => {
            try {
              const resp = await fileService.getUploadLogByPath(path.startsWith('/') ? path.substring(1) : path);
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
      </div>

      <CreateDirectoryModal
        visible={createDirModalVisible}
        currentPath={currentPath}
        onClose={() => onClose('createDir')}
        onCreate={handleCreateDirectory}
      />

      <CreateDirectoryModal
        visible={localCreateDirModalVisible}
        currentPath={localPath || '/'}
        onClose={closeLocalCreateDirectory}
        onCreate={handleLocalCreateDirectorySubmit}
      />

      <SyncModal
        visible={syncModalVisible}
        syncDate={syncDate}
        syncLoading={syncLoading}
        onClose={() => onClose('sync')}
        onSyncDateChange={setSyncDate}
        onSync={syncByMapping}
      />

      <Modal
        title={t('transferTitle')}
        open={transferModalVisible}
        onCancel={closeTransferModal}
        onOk={submitTransferToSftp}
        okText={t('transferOk')}
        cancelText={t('transferCancel')}
        confirmLoading={transfering}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600">{t('labelLocalFile')}
            <code className="bg-gray-50 px-2 py-1 rounded ml-2">{transferTarget ? (transferTarget.path || (localPath ? `${localPath}/${transferTarget.name}` : transferTarget.name)) : '-'}</code>
          </div>
          <div className="text-sm text-gray-600">{t('labelTargetHost')}
            <code className="bg-gray-50 px-2 py-1 rounded ml-2">{activeFtpConfig ? `${activeFtpConfig.host}:${activeFtpConfig.sftpPort || 22}` : '-'}</code>
          </div>
          <div className="text-sm text-gray-600">{t('labelTargetDir')}
            <code className="bg-gray-50 px-2 py-1 rounded ml-2">{currentPath || '/'}</code>
          </div>
          {transfering && (
            <div className="pt-2">
              <Progress percent={transferProgress} size="small" status={transferProgress < 100 ? 'active' : 'normal'} />
            </div>
          )}
          <div className="text-xs text-gray-400">{t('tipTransfer')}</div>
        </div>
      </Modal>

      {/* 同步进度模态框 */}
      <SyncProgressModal
        visible={syncProgressVisible}
        onCancel={closeSyncProgress}
        syncData={syncProgressData}
        isRunning={syncRunning}
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

export default SFTPTransferPage;