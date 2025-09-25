import React from 'react';
import { Modal, Progress } from 'antd';
import { useSFTPTransfer } from './hooks/useSFTPTransfer';
import { ConnectionConfig } from './components/ConnectionConfig';
import { FileBrowser } from './components/FileBrowser';
import { LocalFileBrowser } from './components/LocalFileBrowser';
import { UploadModal } from './components/UploadModal';
import { CreateDirectoryModal } from './components/CreateDirectoryModal';
import { DownloadModal } from './components/DownloadModal';
import { SyncModal } from './components/SyncModal';

const SFTPTransferPage = () => {
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
    uploadModalVisible,
    downloadModalVisible,
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
    onUpload,
    onDownload,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SFTP文件传输</h1>
      </div>

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
          onUpload={onUpload}
          onDownload={onDownload}
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

      <UploadModal
        visible={uploadModalVisible}
        currentPath={currentPath}
        uploadFileList={uploadFileList}
        uploading={uploading}
        operationProgress={operationProgress}
        operationStatus={operationStatus}
        onClose={() => onClose('upload')}
        onFileChange={handleFileChange}
        onRemoveFile={handleRemoveFile}
        onUpload={handleUpload}
      />

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

      <DownloadModal
        visible={downloadModalVisible}
        onClose={() => onClose('download')}
        onDownload={handleDownload}
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
        title="传输到 SFTP"
        open={transferModalVisible}
        onCancel={closeTransferModal}
        onOk={submitTransferToSftp}
        okText="开始传输"
        cancelText="取消"
        confirmLoading={transfering}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600">本地文件：
            <code className="bg-gray-50 px-2 py-1 rounded ml-2">{transferTarget ? (transferTarget.path || (localPath ? `${localPath}/${transferTarget.name}` : transferTarget.name)) : '-'}</code>
          </div>
          <div className="text-sm text-gray-600">SFTP 目标主机：
            <code className="bg-gray-50 px-2 py-1 rounded ml-2">{activeFtpConfig ? `${activeFtpConfig.host}:${activeFtpConfig.sftpPort || 22}` : '-'}</code>
          </div>
          <div className="text-sm text-gray-600">SFTP 目标目录：
            <code className="bg-gray-50 px-2 py-1 rounded ml-2">{currentPath || '/'}</code>
          </div>
          {transfering && (
            <div className="pt-2">
              <Progress percent={transferProgress} size="small" status={transferProgress < 100 ? 'active' : 'normal'} />
            </div>
          )}
          <div className="text-xs text-gray-400">说明：将按原文件名上传到指定目录，必要时会自动创建远程目录。</div>
        </div>
      </Modal>
    </div>
  );
};

export default SFTPTransferPage;