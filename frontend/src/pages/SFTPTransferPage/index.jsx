import React from 'react';
import { useSFTPTransfer } from './hooks/useSFTPTransfer';
import { ConnectionConfig } from './components/ConnectionConfig';
import { FileBrowser } from './components/FileBrowser';
import { UploadModal } from './components/UploadModal';
import { CreateDirectoryModal } from './components/CreateDirectoryModal';
import { DownloadModal } from './components/DownloadModal';
import { SyncModal } from './components/SyncModal';

const SFTPTransferPage = () => {
  const {
    // State
    isConnected,
    connecting,
    activeFtpConfig,
    loadingConfig,
    currentPath,
    directoryList,
    listLoading,
    uploadModalVisible,
    downloadModalVisible,
    syncModalVisible,
    createDirModalVisible,
    uploadFileList,
    uploading,
    operationProgress,
    operationStatus,
    syncDate,
    syncType,
    syncLoading,
    
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
    onClose,
    setSyncType,
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
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRefresh={loadActiveFtpConfig}
      />

      <FileBrowser
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
      />

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

      <DownloadModal
        visible={downloadModalVisible}
        onClose={() => onClose('download')}
        onDownload={handleDownload}
      />

      <SyncModal
        visible={syncModalVisible}
        syncType={syncType}
        syncDate={syncDate}
        syncLoading={syncLoading}
        onClose={() => onClose('sync')}
        onSyncTypeChange={setSyncType}
        onSyncDateChange={setSyncDate}
        onSync={() => {
          // TODO: 实现同步逻辑
          console.log('同步文件', { syncType, syncDate });
        }}
      />
    </div>
  );
};

export default SFTPTransferPage;