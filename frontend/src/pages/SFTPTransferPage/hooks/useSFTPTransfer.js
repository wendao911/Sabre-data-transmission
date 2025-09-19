import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { sftpService } from '../services/sftpService';
import toast from 'react-hot-toast';

export const useSFTPTransfer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeFtpConfig, setActiveFtpConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [directoryList, setDirectoryList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [createDirModalVisible, setCreateDirModalVisible] = useState(false);
  const [uploadFileList, setUploadFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState('');
  const [syncDate, setSyncDate] = useState(null);
  const [syncType, setSyncType] = useState('encrypted');
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
    loadActiveFtpConfig();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const result = await sftpService.getStatus();
      setIsConnected(result.data?.connected || false);
    } catch (error) {
      console.error('检查 SFTP 连接状态失败:', error);
    }
  };

  const loadActiveFtpConfig = async () => {
    setLoadingConfig(true);
    try {
      const resp = await sftpService.getActiveFtpConfig();
      if (resp?.success && resp.data) {
        setActiveFtpConfig(resp.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleConnect = async () => {
    if (!activeFtpConfig) {
      toast.error('没有可用的 SFTP 配置');
      return;
    }
    setConnecting(true);
    try {
      const connectParams = {
        host: activeFtpConfig.host,
        port: activeFtpConfig.sftpPort || 22,
      };
      if (activeFtpConfig.userType === 'authenticated' && activeFtpConfig.user) {
        connectParams.user = activeFtpConfig.user;
        connectParams.password = activeFtpConfig.password;
      }
      const resp = await sftpService.connect(connectParams);
      if (resp?.success) {
        setIsConnected(true);
        toast.success('SFTP 连接成功');
        await loadDirectoryList('/');
      } else {
        toast.error(resp?.message || '连接失败');
      }
    } catch (error) {
      toast.error('连接失败: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await sftpService.disconnect();
      if (result.success) {
        setIsConnected(false);
        setDirectoryList([]);
        setCurrentPath('/');
        toast.success('已断开SFTP连接');
      }
    } catch (error) {
      toast.error('断开连接失败: ' + error.message);
    }
  };

  const loadDirectoryList = async (path = currentPath) => {
    try {
      setListLoading(true);
      const res = await sftpService.listDirectory(path);
      if (res.success) {
        setDirectoryList(res.data || []);
        setCurrentPath(path);
      } else {
        toast.error(res.message || '加载目录失败');
      }
    } catch (e) {
      toast.error('加载目录失败: ' + e.message);
    } finally {
      setListLoading(false);
    }
  };

  const goToParentDirectory = () => {
    if (currentPath === '/' || currentPath === '') {
      toast.success('已经在根目录');
      return;
    }
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadDirectoryList(parentPath);
  };

  const handleCreateDirectory = async (values) => {
    try {
      const newPath = currentPath === '/' ? `/${values.name}` : `${currentPath}/${values.name}`;
      const result = await sftpService.createDirectory(newPath);
      if (result.success) {
        toast.success('目录创建成功');
        setCreateDirModalVisible(false);
        await loadDirectoryList(currentPath);
      } else {
        toast.error(result.message || '创建目录失败');
      }
    } catch (error) {
      toast.error('创建目录失败: ' + error.message);
    }
  };

  const handleDelete = async (item) => {
    Modal.confirm({
      title: `确认删除${item.type === 'directory' ? '目录' : '文件'}`,
      content: `确定要删除 ${item.name} 吗？`,
      onOk: async () => {
        try {
          const path = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
          const result = item.type === 'directory' 
            ? await sftpService.deleteDirectory(path) 
            : await sftpService.deleteFile(path);
          if (result.success) {
            toast.success('删除成功');
            await loadDirectoryList(currentPath);
          } else {
            toast.error(result.message || '删除失败');
          }
        } catch (error) {
          toast.error('删除失败: ' + error.message);
        }
      },
    });
  };

  const handleUpload = async () => {
    if (uploadFileList.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }
    setUploading(true);
    setOperationProgress(0);
    setOperationStatus('准备上传...');
    try {
      const files = uploadFileList.map(file => file.originFileObj);
      setOperationStatus(`正在上传 ${uploadFileList.length} 个文件`);
      const result = await sftpService.uploadMultiple(files, currentPath, (percent) => {
        setOperationProgress(percent);
      });
      if (!result.success) {
        toast.error(result.message || '上传失败');
        setOperationStatus('上传失败');
        return;
      }
      setOperationProgress(100);
      setOperationStatus('上传完成');
      toast.success('上传完成');
      setUploadModalVisible(false);
      setUploadFileList([]);
      await loadDirectoryList(currentPath);
    } catch (error) {
      setOperationStatus('上传失败');
      toast.error('上传失败: ' + error.message);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setOperationProgress(0);
        setOperationStatus('');
      }, 2000);
    }
  };

  const handleFileChange = (info) => {
    setUploadFileList(info.fileList);
  };

  const handleRemoveFile = (file) => {
    const newFileList = uploadFileList.filter(item => item.uid !== file.uid);
    setUploadFileList(newFileList);
  };

  const handleDownload = async (values) => {
    try {
      const { remotePath, localPath } = values;
      const result = await sftpService.downloadFile(remotePath, localPath);
      if (result.success) {
        toast.success('文件下载成功');
        setDownloadModalVisible(false);
      } else {
        toast.error(result.message || '下载失败');
      }
    } catch (error) {
      toast.error('下载失败: ' + error.message);
    }
  };

  const handleDownloadFile = (path) => {
    sftpService.downloadAsAttachment(path);
  };

  return {
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
    loadDirectoryList,
    goToParentDirectory,
    handleCreateDirectory,
    handleDelete,
    handleUpload,
    handleFileChange,
    handleRemoveFile,
    handleDownload,
    handleDownloadFile,
    
    // Modal controls
    setUploadModalVisible,
    setDownloadModalVisible,
    setSyncModalVisible,
    setCreateDirModalVisible,
    setSyncType,
    setSyncDate,
    
    // Direct actions
    onCreateDirectory: () => setCreateDirModalVisible(true),
    onUpload: () => setUploadModalVisible(true),
    onDownload: () => setDownloadModalVisible(true),
    onSync: () => setSyncModalVisible(true),
    onNavigateDirectory: loadDirectoryList,
    onGoToParent: goToParentDirectory,
    onRefresh: loadDirectoryList,
    onClose: (modal) => {
      if (modal === 'upload') setUploadModalVisible(false);
      if (modal === 'download') setDownloadModalVisible(false);
      if (modal === 'sync') setSyncModalVisible(false);
      if (modal === 'createDir') setCreateDirModalVisible(false);
    }
  };
};
