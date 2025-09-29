import React from 'react';
import { Modal, Progress } from 'antd';
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


const SFTPTransferPage = () => {
  const { t } = useLanguage();
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
    </PageContainer>
  );
};

export default SFTPTransferPage;