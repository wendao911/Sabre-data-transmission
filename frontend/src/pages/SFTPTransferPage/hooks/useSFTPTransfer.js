import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import sftpService from '../../../services/sftpService';
import { apiClient, API_BASE_URL } from '../../../services/apiClient';
import toast from 'react-hot-toast';

export const useSFTPTransfer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedSince, setConnectedSince] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [activeFtpConfig, setActiveFtpConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [directoryList, setDirectoryList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [sftpPage, setSftpPage] = useState(1);
  const [sftpPageSize, setSftpPageSize] = useState(10);
  const [sftpTotal, setSftpTotal] = useState(0);
  const [sftpSortBy, setSftpSortBy] = useState('name'); // name | type | size | date
  const [sftpSortOrder, setSftpSortOrder] = useState('ascend'); // ascend | descend
  const [localPath, setLocalPath] = useState('');
  const [localList, setLocalList] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(10);
  const [localTotal, setLocalTotal] = useState(0);
  const [localSortBy, setLocalSortBy] = useState('name');
  const [localSortOrder, setLocalSortOrder] = useState('asc');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [createDirModalVisible, setCreateDirModalVisible] = useState(false);
  const [uploadFileList, setUploadFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState('');
  const [syncDate, setSyncDate] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [localCreateDirModalVisible, setLocalCreateDirModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transfering, setTransfering] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  // 同步进度相关状态
  const [syncProgressVisible, setSyncProgressVisible] = useState(false);
  const [syncProgressData, setSyncProgressData] = useState(null);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncInterval, setSyncInterval] = useState(null);
  // 远端目录使用右侧 SFTP 浏览器当前目录 currentPath

  useEffect(() => {
    checkConnectionStatus();
    loadActiveFtpConfig();
    loadLocalList('');
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const result = await sftpService.getStatus();
      setIsConnected(result.data?.connected || false);
      setConnectedSince(result.data?.connectedSince || null);
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
        setConnectedSince(new Date());
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
        setConnectedSince(null);
        setDirectoryList([]);
        setCurrentPath('/');
        toast.success('已断开SFTP连接');
      }
    } catch (error) {
      toast.error('断开连接失败: ' + error.message);
    }
  };

  const loadDirectoryList = async (
    path = currentPath,
    page = sftpPage,
    pageSize = sftpPageSize,
    sortField = sftpSortBy,
    sortOrder = sftpSortOrder
  ) => {
    try {
      setListLoading(true);
      const res = await sftpService.listDirectory(path);
      if (!res.success) {
        toast.error(res.message || '加载目录失败');
        return;
      }
      // 排序（目录优先）
      const items = Array.isArray(res.data) ? res.data.slice() : [];
      const toKey = (it) => {
        switch (sortField) {
          case 'type':
            return it.type === 'directory' ? 0 : 1;
          case 'size':
            return it.size || 0;
          case 'date':
            return new Date(it.date || it.mtime || 0).getTime();
          case 'name':
          default:
            return String(it.name || '').toLowerCase();
        }
      };
      items.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        const av = toKey(a);
        const bv = toKey(b);
        if (sortOrder === 'descend') return av > bv ? -1 : av < bv ? 1 : 0;
        return av < bv ? -1 : av > bv ? 1 : 0;
      });

      // 分页（前端）
      const total = items.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paged = items.slice(start, end);

      setDirectoryList(paged);
      setCurrentPath(path);
      setSftpPage(page);
      setSftpPageSize(pageSize);
      setSftpTotal(total);
      setSftpSortBy(sortField);
      setSftpSortOrder(sortOrder);
    } catch (e) {
      toast.error('加载目录失败: ' + e.message);
    } finally {
      setListLoading(false);
    }
  };

  // 本地浏览：复用文件浏览器后端 /api/files/browser
  const loadLocalList = async (
    path = localPath,
    page = localPage,
    pageSize = localPageSize,
    sortBy = localSortBy,
    sortOrder = localSortOrder
  ) => {
    try {
      setLocalLoading(true);
      const { default: fileService } = await import('../../../services/fileService');
      const res = await fileService.browseFiles({ path, page, pageSize, sortBy, sortOrder });
      setLocalList((res.items || []).map(it => ({
        name: it.name,
        path: it.path,
        type: it.isDirectory ? 'directory' : 'file',
        isDirectory: !!it.isDirectory,
        isFile: !it.isDirectory,
        size: it.size,
        mtime: it.mtime
      })));
      setLocalPath(path || '');
      setLocalPage(res.page || page || 1);
      setLocalPageSize(res.pageSize || pageSize || 10);
      setLocalTotal(res.total || 0);
      setLocalSortBy(sortBy);
      setLocalSortOrder(sortOrder);
    } catch (e) {
      // 忽略错误提示，保持简洁
    } finally {
      setLocalLoading(false);
    }
  };

  const goToParentLocal = () => {
    if (!localPath) return;
    const parts = localPath.split('/').filter(Boolean);
    const parent = parts.slice(0, -1).join('/');
    loadLocalList(parent, 1, localPageSize, localSortBy, localSortOrder);
  };

  const openLocalCreateDirectory = () => setLocalCreateDirModalVisible(true);

  const closeLocalCreateDirectory = () => setLocalCreateDirModalVisible(false);

  const handleLocalCreateDirectorySubmit = async (values) => {
    try {
      const name = values?.name || values?.directoryName;
      if (!name) return;
      const { default: fileService } = await import('../../../services/fileService');
      const resp = await fileService.createDirectory(localPath || '', name);
      if (resp?.success) {
        await loadLocalList(localPath || '');
        setLocalCreateDirModalVisible(false);
      }
    } catch (e) {}
  };

  const handleLocalUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const { default: fileService } = await import('../../../services/fileService');
      const dot = file.name.lastIndexOf('.');
      const baseName = dot > 0 ? file.name.substring(0, dot) : file.name;
      await fileService.uploadFile({ file, targetPath: localPath || '', baseName });
      await loadLocalList(localPath || '');
    };
    input.click();
  };

  const handleLocalDelete = async (item) => {
    try {
      const { default: fileService } = await import('../../../services/fileService');
      const target = item.path || (localPath ? `${localPath}/${item.name}` : item.name);
      const resp = await fileService.deleteFile(target);
      if (resp?.success) await loadLocalList(localPath || '');
    } catch (e) {}
  };

  const handleLocalDownload = (item) => {
    const path = item.path || (localPath ? `${localPath}/${item.name}` : item.name);
    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/files/download?path=${encodeURIComponent(path)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 关闭同步进度模态框
  const closeSyncProgress = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }
    setSyncProgressVisible(false);
    setSyncRunning(false);
    setSyncProgressData(null);
  };

  const openTransferModal = (item) => {
    if (item?.isDirectory) return;
    setTransferTarget(item);
    setTransferModalVisible(true);
  };

  const closeTransferModal = () => {
    setTransferTarget(null);
    setTransferModalVisible(false);
  };

  const submitTransferToSftp = async () => {
    try {
      if (!isConnected) {
        toast.error('SFTP未连接，请先连接');
        return;
      }
      if (!transferTarget) return;
      const localFullPath = transferTarget.path || (localPath ? `${localPath}/${transferTarget.name}` : transferTarget.name);
      const remoteDir = currentPath || '/';
      const remotePath = remoteDir === '/' ? `/${transferTarget.name}` : `${remoteDir}/${transferTarget.name}`;
      setTransfering(true);
      setTransferProgress(10);
      const resp = await sftpService.uploadFromServer(localFullPath, remotePath);
      setTransferProgress(90);
      if (resp?.success) {
        setTransferProgress(100);
        toast.success('传输成功');
        closeTransferModal();
        // 刷新右侧 SFTP 目录列表
        await loadDirectoryList(currentPath || '/');
      } else {
        toast.error(resp?.message || '传输失败');
      }
    } catch (e) {
      toast.error('传输失败: ' + e.message);
    } finally {
      setTimeout(() => setTransferProgress(0), 400);
      setTransfering(false);
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

  // 映射规则同步
  const syncByMapping = async () => {
    if (!syncDate) {
      toast.error('请选择同步日期');
      return;
    }
    if (!isConnected) {
      toast.error('SFTP未连接');
      return;
    }
    setSyncLoading(true);
    setSyncRunning(true);
    setSyncProgressVisible(true);
    setSyncProgressData({
      totalFiles: 0,
      synced: 0,
      skipped: 0,
      failed: 0,
      ruleResults: []
    });
    
    try {
      const day = typeof syncDate === 'string' ? syncDate : (syncDate?.format ? syncDate.format('YYYY-MM-DD') : new Date(syncDate).toISOString().slice(0,10));
      const resp = await apiClient.getClient().post('/sftp/sync/by-mapping', { date: day });
      
      if (resp?.data?.success) {
        const data = resp.data.data;
        console.log('同步返回数据:', data);
        // 确保 ruleResults 字段存在
        const progressData = {
          ...data,
          ruleResults: data.details || data.ruleResults || []
        };
        console.log('处理后的进度数据:', progressData);
        setSyncProgressData(progressData);
        setSyncRunning(false);
        toast.success(`同步完成：成功 ${data.synced}，跳过 ${data.skipped}，失败 ${data.failed}`);
        await loadDirectoryList(currentPath || '/');
      } else {
        setSyncRunning(false);
        toast.error(resp?.data?.message || '同步失败');
      }
    } catch (e) {
      setSyncRunning(false);
      toast.error('同步失败: ' + e.message);
    } finally {
      setSyncLoading(false);
      setSyncDate(null);
      setSyncModalVisible && setSyncModalVisible(false);
    }
  };

  return {
    // State
    isConnected,
    connecting,
    connectedSince,
    activeFtpConfig,
    loadingConfig,
    currentPath,
    directoryList,
    listLoading,
    sftpPagination: { current: sftpPage, pageSize: sftpPageSize, total: sftpTotal },
    sftpSort: { sortBy: sftpSortBy, sortOrder: sftpSortOrder },
    localPath,
    localList,
    localLoading,
    localPagination: { current: localPage, pageSize: localPageSize, total: localTotal },
    localSort: { sortBy: localSortBy, sortOrder: localSortOrder },
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
    checkConnectionStatus,
    loadDirectoryList,
    loadLocalList,
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
    setSyncDate,
    
    // Direct actions
    onCreateDirectory: () => setCreateDirModalVisible(true),
    onUpload: () => setUploadModalVisible(true),
    onDownload: () => setDownloadModalVisible(true),
    onSync: () => setSyncModalVisible(true),
    onNavigateDirectory: loadDirectoryList,
    onGoToParent: goToParentDirectory,
    onRefresh: (p = currentPath) => loadDirectoryList(p, sftpPage, sftpPageSize, sftpSortBy, sftpSortOrder),
    onSftpPageChange: (page, pageSize) => loadDirectoryList(currentPath, page, pageSize, sftpSortBy, sftpSortOrder),
    onSftpSortChange: (field, order) => {
      // 将 antd 字段映射
      const mappedField = field === 'mtime' ? 'date' : field;
      const mappedOrder = order || sftpSortOrder;
      return loadDirectoryList(currentPath, 1, sftpPageSize, mappedField, mappedOrder);
    },
    onNavigateLocal: (p) => loadLocalList(p, 1, localPageSize, localSortBy, localSortOrder),
    onGoToParentLocal: goToParentLocal,
    onRefreshLocal: (p = localPath) => loadLocalList(p, localPage, localPageSize, localSortBy, localSortOrder),
    onLocalPageChange: (page, pageSize) => loadLocalList(localPath, page, pageSize, localSortBy, localSortOrder),
    onLocalSortChange: (field, order) => {
      // 后端接受 name/size/date；将 mtime 映射为 date
      const mappedField = field === 'mtime' ? 'date' : field;
      const mappedOrder = order === 'ascend' ? 'asc' : order === 'descend' ? 'desc' : localSortOrder;
      return loadLocalList(localPath, 1, localPageSize, mappedField, mappedOrder);
    },
    openTransferModal,
    closeTransferModal,
    submitTransferToSftp,
    syncByMapping,
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
    onClose: (modal) => {
      if (modal === 'upload') setUploadModalVisible(false);
      if (modal === 'download') setDownloadModalVisible(false);
      if (modal === 'sync') setSyncModalVisible(false);
      if (modal === 'createDir') setCreateDirModalVisible(false);
    }
  };
};
