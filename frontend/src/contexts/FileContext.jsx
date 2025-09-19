import React, { createContext, useContext, useState, useCallback } from 'react';
import { fileService } from '../services';

const FileContext = createContext();

export { FileContext };

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const filesData = await fileService.getFiles();
      setFiles(filesData || []);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    try {
      const uploadedFile = await fileService.uploadFile(file);
      setFiles(prev => [uploadedFile, ...prev]);
      return true;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return false;
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }, []);

  const downloadFile = useCallback(async (fileId) => {
    try {
      const blob = await fileService.downloadFile(fileId);
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to download file:', error);
      return false;
    }
  }, []);

  const value = {
    files,
    isLoading,
    loadFiles,
    uploadFile,
    deleteFile,
    downloadFile,
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};
