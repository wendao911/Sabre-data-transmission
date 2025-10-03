import { apiClient } from './apiClient';

export const fileService = {
  async getFiles(params = {}) {
    try {
      const { items } = await this.browseFiles(params);
      return items || [];
    } catch (error) {
      apiClient.handleError(error);
      return [];
    }
  },

  async uploadFile({ file, targetPath = '', baseName, fileTypeConfig, remark }) {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('targetPath', targetPath);
      form.append('baseName', baseName);
      if (fileTypeConfig !== undefined && fileTypeConfig !== null) {
        form.append('fileTypeConfig', String(fileTypeConfig));
      }
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
      const response = await apiClient.getClient().post(`/files/download`, { path: filePath }, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

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
  },

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

