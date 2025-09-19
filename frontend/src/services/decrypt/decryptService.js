import { apiClient } from '../apiClient';

export const decryptService = {
  async getStatus() {
    try {
      const response = await apiClient.getClient().get('/decrypt/status');
      return response.data.data; // 返回data字段中的状态信息
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async startDecrypt(params = {}) {
    try {
      // 按默认超时发起请求；若后续仍需加长，可改成 { timeout: 600000 }
      const payload = {};
      if (params && params.date) payload.date = params.date;
      if (params && params.month) payload.month = params.month;
      if (params && params.filePath) payload.filePath = params.filePath;
      const response = await apiClient.getClient().post('/decrypt/start', payload, { timeout: 0 });
      return response.data.data; // 返回data字段中的结果
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async getFiles() {
    try {
      const response = await apiClient.getClient().get('/decrypt/files');
      return response.data.data; // 返回data字段中的文件信息
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  getProgressStream() {
    return new EventSource('http://localhost:3000/api/decrypt/progress');
  },

  async startByDate(date) {
    try {
      const response = await apiClient.getClient().post('/decrypt/start-by-date', { date });
      return response.data?.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async startByMonth(month) {
    try {
      const response = await apiClient.getClient().post('/decrypt/start-by-month', { month });
      return response.data?.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async startByFile(path) {
    try {
      const response = await apiClient.getClient().post('/decrypt/start-by-file', { path });
      return response.data?.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  }
};

export default decryptService;
