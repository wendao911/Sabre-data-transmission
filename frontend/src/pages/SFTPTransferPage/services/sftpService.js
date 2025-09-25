import { sftpService as apiSftpService } from '../../../services';

export const sftpService = {
  async getStatus() {
    try {
      const result = await apiSftpService.getStatus();
      return result;
    } catch (error) {
      console.error('获取 SFTP 状态失败:', error);
      throw error;
    }
  },

  async getActiveFtpConfig() {
    try {
      const result = await apiSftpService.getActiveFtpConfig();
      return result;
    } catch (error) {
      console.error('获取活跃 FTP 配置失败:', error);
      throw error;
    }
  },

  async connect(params) {
    try {
      const result = await apiSftpService.connect(params);
      return result;
    } catch (error) {
      console.error('SFTP 连接失败:', error);
      throw error;
    }
  },

  async disconnect() {
    try {
      const result = await apiSftpService.disconnect();
      return result;
    } catch (error) {
      console.error('SFTP 断开连接失败:', error);
      throw error;
    }
  },

  async listDirectory(path) {
    try {
      const result = await apiSftpService.listDirectory(path);
      return result;
    } catch (error) {
      console.error('列出目录失败:', error);
      throw error;
    }
  },

  async createDirectory(path) {
    try {
      const result = await apiSftpService.createDirectory(path);
      return result;
    } catch (error) {
      console.error('创建目录失败:', error);
      throw error;
    }
  },

  async deleteDirectory(path) {
    try {
      const result = await apiSftpService.deleteDirectory(path);
      return result;
    } catch (error) {
      console.error('删除目录失败:', error);
      throw error;
    }
  },

  async deleteFile(path) {
    try {
      const result = await apiSftpService.deleteFile(path);
      return result;
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  },

  async uploadMultiple(files, path, onProgress) {
    try {
      const result = await apiSftpService.uploadMultiple(files, path, onProgress);
      return result;
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  },

  async downloadFile(remotePath, localPath) {
    try {
      const result = await apiSftpService.downloadFile(remotePath, localPath);
      return result;
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  },

  downloadAsAttachment(path) {
    try {
      apiSftpService.downloadAsAttachment(path);
    } catch (error) {
      console.error('下载附件失败:', error);
      throw error;
    }
  }
};
