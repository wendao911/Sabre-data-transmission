import { apiClient, API_BASE_URL } from '../apiClient';

export const sftpService = {
  async connect(config) {
    try {
      const response = await apiClient.getClient().post('/sftp/connect', config);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async connectActive() {
    try {
      const response = await apiClient.getClient().post('/sftp/connect/active');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async disconnect() {
    try {
      const response = await apiClient.getClient().post('/sftp/disconnect');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async getStatus() {
    try {
      const response = await apiClient.getClient().get('/sftp/status');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async listDirectory(path = '/') {
    try {
      const response = await apiClient.getClient().get('/sftp/list', { params: { path } });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async createDirectory(path) {
    try {
      const response = await apiClient.getClient().post('/sftp/mkdir', { path });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async deleteDirectory(path) {
    try {
      const response = await apiClient.getClient().delete('/sftp/dir', { data: { path } });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async uploadFile(file, remotePath) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('remotePath', remotePath);
      const response = await apiClient.getClient().post('/sftp/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  // 从服务器本地路径推送到SFTP（后端读取本地文件再上传）
  async uploadFromServer(localPath, remotePath) {
    try {
      const response = await apiClient.getClient().post('/sftp/upload', { localPath, remotePath });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async downloadFile(remotePath, localPath) {
    try {
      const response = await apiClient.getClient().post('/sftp/download', { remotePath, localPath });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async deleteFile(path) {
    try {
      const response = await apiClient.getClient().delete('/sftp/file', { data: { path } });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async uploadMultiple(files, remoteDir, onProgress) {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('remoteDir', remoteDir);
      const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
      const computed = (totalSize / 1024) * 50; // 每KB 50ms
      const timeoutMs = Math.min(15 * 60 * 1000, Math.max(120000, Math.floor(computed)));
      
      const response = await apiClient.getClient().post('/sftp/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: timeoutMs,
        onUploadProgress: (evt) => {
          if (!evt) return;
          const total = evt.total || totalSize;
          const loaded = evt.loaded || 0;
          const percent = total > 0 ? Math.min(99, Math.floor((loaded / total) * 100)) : 0;
          if (typeof onProgress === 'function') onProgress(percent, loaded, total);
        },
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async downloadMultiple(files) {
    try {
      const response = await apiClient.getClient().post('/sftp/download-multiple', { files });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async syncEncrypted(date, remoteDir = '/encrypted') {
    try {
      const response = await apiClient.getClient().post('/sftp/sync-encrypted', { date, remoteDir });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async syncDecrypted(date) {
    try {
      const response = await apiClient.getClient().post('/sftp/sync-decrypted', { date });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  getDownloadStreamUrl(remotePath) {
    const base = API_BASE_URL.replace(/\/$/, '');
    return `${base}/sftp/download-stream?path=${encodeURIComponent(remotePath)}`;
  },

  downloadAsAttachment(remotePath) {
    const url = sftpService.getDownloadStreamUrl(remotePath);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  // SFTP 配置管理方法
  async getFtpConfigs() {
    try {
      const response = await apiClient.getClient().get('/sftp/configs');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async getActiveFtpConfig() {
    try {
      const response = await apiClient.getClient().get('/sftp/configs/active');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async createFtpConfig(configData) {
    try {
      const response = await apiClient.getClient().post('/sftp/configs', configData);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async updateFtpConfig(id, configData) {
    try {
      const response = await apiClient.getClient().put(`/sftp/configs/${id}`, configData);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async deleteFtpConfig(id) {
    try {
      const response = await apiClient.getClient().delete(`/sftp/configs/${id}`);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async activateFtpConfig(id) {
    try {
      const response = await apiClient.getClient().post(`/sftp/configs/${id}/activate`);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async testConnection(configData) {
    try {
      const response = await apiClient.getClient().post('/sftp/test-connection', configData);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  }
};

export default sftpService;
