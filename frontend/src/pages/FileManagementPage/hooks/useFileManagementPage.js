import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { fileService } from '../services/fileService';
import config from '../../../config';

export const useFileManagementPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: config.fileBrowser?.pageSize || 50,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(config.fileBrowser?.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState(config.fileBrowser?.sortOrder || 'asc');
  const [showHidden, setShowHidden] = useState(config.fileBrowser?.showHiddenFiles || false);
  const [currentPath, setCurrentPath] = useState('');
  const [rootPath, setRootPath] = useState('');
  const [parentPath, setParentPath] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const fetchFiles = async (page = 1, search = '', sort = sortBy, order = sortOrder, hidden = showHidden, path = currentPath) => {
    setLoading(true);
    try {
      const data = await fileService.getFiles({ 
        path,
        page, 
        pageSize: pagination.pageSize, 
        search, 
        sortBy: sort, 
        sortOrder: order,
        showHidden: hidden
      });
      setFiles(data.items || []);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: data.total || 0
      }));
      setCurrentPath(data.currentPath || '');
      setRootPath(data.rootPath || '');
      setParentPath(data.parentPath || null);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(pagination.current, searchTerm, sortBy, sortOrder, showHidden);
  }, [searchTerm, sortBy, sortOrder, showHidden]);

  const handlePageChange = (page) => {
    fetchFiles(page, searchTerm, sortBy, sortOrder, showHidden);
  };

  const handleFileAction = async (action, file) => {
    try {
      if (action === 'download') {
        const blob = await fileService.downloadFile(file);
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success('下载成功');
      } else if (action === 'delete') {
        const confirmed = await new Promise((resolve) => {
          Modal.confirm({
            title: '确认删除',
            content: `确定要删除 ${file.name} 吗？该操作不可恢复。`,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });
        if (!confirmed) return;

        const result = await fileService.deleteFile(file);
        if (result.success) {
          message.success('删除成功');
          // 刷新文件列表
          fetchFiles(pagination.current, searchTerm, sortBy, sortOrder, showHidden, currentPath);
        } else {
          message.error(result.error || '删除失败');
        }
      } else {
        await fileService.performAction(action, file);
        // 刷新列表
        fetchFiles(pagination.current, searchTerm, sortBy, sortOrder, showHidden, currentPath);
      }
    } catch (error) {
      console.error('文件操作失败:', error);
      message.error(`${action === 'download' ? '下载' : '删除'}操作失败: ${error.message}`);
    }
  };

  const handleSort = (newSortBy) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  };

  const handleToggleHidden = () => {
    setShowHidden(!showHidden);
  };

  const handleNavigateToDirectory = (directoryPath) => {
    setCurrentPath(directoryPath);
    fetchFiles(1, searchTerm, sortBy, sortOrder, showHidden, directoryPath);
  };

  const handleNavigateToParent = () => {
    if (parentPath !== null) {
      handleNavigateToDirectory(parentPath);
    }
  };

  const handleNavigateToRoot = () => {
    handleNavigateToDirectory('');
  };

  const handleRefresh = () => {
    fetchFiles(pagination.current, searchTerm, sortBy, sortOrder, showHidden, currentPath);
  };

  const handleCreateDirectory = () => {
    setCreateModalVisible(true);
  };

  const handleCreateDirectoryConfirm = async (directoryName) => {
    try {
      const result = await fileService.createDirectory(currentPath, directoryName);
      if (result.success) {
        message.success('目录创建成功');
        setCreateModalVisible(false);
        // 刷新文件列表
        fetchFiles(pagination.current, searchTerm, sortBy, sortOrder, showHidden, currentPath);
      } else {
        message.error(result.error || '创建目录失败');
      }
    } catch (error) {
      message.error('创建目录失败: ' + error.message);
    }
  };

  const handleCreateDirectoryCancel = () => {
    setCreateModalVisible(false);
  };

  const handleUpload = () => {
    setUploadModalVisible(true);
  };

  const handleUploadConfirm = async ({ file, targetPath, baseName, fileTypeConfig, remark }) => {
    try {
      const result = await fileService.uploadFile({ file, targetPath: targetPath ?? currentPath, baseName, fileTypeConfig, remark });
      if (result.success) {
        message.success('上传成功');
        setUploadModalVisible(false);
        fetchFiles(pagination.current, searchTerm, sortBy, sortOrder, showHidden, currentPath);
      } else {
        message.error(result.error || '上传失败');
      }
    } catch (error) {
      message.error('上传失败: ' + error.message);
    }
  };

  const handleUploadCancel = () => {
    setUploadModalVisible(false);
  };

  return {
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
    setSortBy,
    setSortOrder,
    setShowHidden,
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
  };
};
