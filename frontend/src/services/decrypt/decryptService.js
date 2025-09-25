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
  },

  // 获取加密文件日期列表
  async getEncryptedDates() {
    try {
      const response = await apiClient.getClient().get('/decrypt/encrypted-dates');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, data: [] };
    }
  },

  // 获取带解密状态的日期列表
  async getEncryptedDatesWithStatus() {
    try {
      const response = await apiClient.getClient().get('/decrypt/encrypted-dates-with-status');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, data: [] };
    }
  },

  // 获取已解密文件列表
  async getDecryptedFiles(date) {
    try {
      const response = await apiClient.getClient().get(`/decrypt/decrypted-files?date=${date}`);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, data: [] };
    }
  },

  // 获取指定日期的加密文件列表
  async getEncryptedFiles(date) {
    try {
      const response = await apiClient.getClient().get(`/decrypt/encrypted-files?date=${date}`);
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, data: [] };
    }
  },

  // 批量处理指定日期的所有文件
  async batchProcessFiles(date) {
    try {
      const response = await apiClient.getClient().post('/decrypt/batch-process', { date });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  },

  // 批量处理指定日期的所有文件（带进度推送）
  async batchProcessFilesWithProgress(date, onProgress) {
    try {
      const response = await fetch(`${apiClient.getClient().defaults.baseURL}/decrypt/batch-process-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'final') {
                return data;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              } else if (onProgress) {
                onProgress(data);
              }
            } catch (error) {
              console.error('解析进度数据失败:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('批量处理失败:', error);
      throw error;
    }
  }
};

export default decryptService;
