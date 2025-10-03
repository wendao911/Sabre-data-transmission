import { apiClient } from '../apiClient';

export const fileService = {
  // Legacy file operations
  async getFiles() {
    try {
      const response = await apiClient.getClient().get('/files');
      return response.data.files;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.getClient().post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.file;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async deleteFile(fileOrPath) {
    try {
      let path = typeof fileOrPath === 'string'
        ? fileOrPath
        : (fileOrPath?.path || fileOrPath?.fullPath || fileOrPath?.name || '');
      if (path && path.startsWith('/')) path = path.substring(1);
      const response = await apiClient.getClient().delete(`/files/delete`, {
        data: { path }
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async downloadFile(filePath) {
    try {
      const response = await apiClient.getClient().get(`/files/download?path=${encodeURIComponent(filePath)}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  // New read-only file APIs
  async listEncrypted({ search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await apiClient.getClient().get('/files/encrypted', {
        params: { search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async listEncryptedGroups({ search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await apiClient.getClient().get('/files/encrypted-groups', {
        params: { search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async listEncryptedByDate(date, { search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await apiClient.getClient().get('/files/encrypted-by-date', {
        params: { date, search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async listDecryptedDirs({ search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await apiClient.getClient().get('/files/decrypted-dirs', {
        params: { search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async listDecryptedFiles(dir, { search = '', page = 1, pageSize = 50 } = {}) {
    try {
      const response = await apiClient.getClient().get('/files/decrypted', {
        params: { dir, search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  // 文件浏览器 API
  async browseFiles(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await apiClient.getClient().get(`/files/browser?${queryParams.toString()}`);
      return response.data?.data || { items: [], total: 0, page: 1, pageSize: 50 };
    } catch (error) {
      apiClient.handleError(error);
      return { items: [], total: 0, page: 1, pageSize: 50 };
    }
  },

  // 创建目录 API
  async createDirectory(currentPath, directoryName) {
    try {
      const response = await apiClient.getClient().post('/files/create-directory', {
        currentPath,
        directoryName
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  }
  ,

  // 上传文件 API
  async uploadFile({ file, targetPath = '', baseName, fileTypeConfig, remark }) {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('targetPath', targetPath);
      form.append('baseName', baseName);
      if (fileTypeConfig) form.append('fileTypeConfig', fileTypeConfig);
      if (remark !== undefined) form.append('remark', remark);

      const client = apiClient.getClient();
      const response = await client.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  },

  // 获取指定相对路径的上传记录
  async getUploadLogByPath(relativePath) {
    try {
      const response = await apiClient.getClient().get('/files/upload-log/by-path', {
        params: { path: relativePath }
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  },
  
  // 更新上传记录备注
  async updateUploadLogRemark(id, remark) {
    try {
      const response = await apiClient.getClient().put(`/files/upload-log/${id}/remark`, { remark });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  }
};

export default fileService;
