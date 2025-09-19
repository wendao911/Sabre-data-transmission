import { fileService as apiFileService } from '../../../services/files';
import config from '../../../config';

export const fileService = {
  async getFiles(params = {}) {
    try {
      const browserConfig = config.fileBrowser || {};
      const requestParams = {
        path: params.path || '',
        page: params.page || 1,
        pageSize: params.pageSize || browserConfig.pageSize || 50,
        search: params.search || '',
        sortBy: params.sortBy || browserConfig.sortBy || 'name',
        sortOrder: params.sortOrder || browserConfig.sortOrder || 'asc',
        showHidden: params.showHidden || browserConfig.showHiddenFiles || false
      };
      
      return await apiFileService.browseFiles(requestParams);
    } catch (error) {
      console.error('获取文件列表失败:', error);
      throw error;
    }
  },

  async performAction(action, file) {
    try {
      // 根据不同的操作类型调用不同的API
      switch (action) {
        case 'download':
          return await this.downloadFile(file);
        case 'delete':
          return await this.deleteFile(file);
        case 'decrypt':
          return await this.decryptFile(file);
        default:
          throw new Error('不支持的操作类型');
      }
    } catch (error) {
      console.error('文件操作失败:', error);
      throw error;
    }
  },

  async downloadFile(file) {
    try {
      return await apiFileService.downloadFile(file.path);
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  },

  async deleteFile(file) {
    try {
      return await apiFileService.deleteFile(file.path);
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  },

  async decryptFile(file) {
    // 实现文件解密逻辑
    console.log('解密文件:', file);
  },

  async createDirectory(currentPath, directoryName) {
    try {
      return await apiFileService.createDirectory(currentPath, directoryName);
    } catch (error) {
      console.error('创建目录失败:', error);
      throw error;
    }
  },

  async uploadFile({ file, targetPath = '', baseName }) {
    try {
      return await apiFileService.uploadFile({ file, targetPath, baseName });
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  }
};
