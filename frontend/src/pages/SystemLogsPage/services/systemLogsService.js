import { apiClient } from '../../../services/apiClient';

class SystemLogsService {
  /**
   * 获取系统日志
   */
  async getSystemLogs(params = {}) {
    try {
      const response = await apiClient.getClient().get('/system/logs', { params });
      return response.data;
    } catch (error) {
      console.error('获取系统日志失败:', error);
      throw error;
    }
  }


  /**
   * 获取系统状态概览
   */
  async getSystemStatus() {
    try {
      const response = await apiClient.getClient().get('/system/status');
      return response.data;
    } catch (error) {
      console.error('获取系统状态失败:', error);
      throw error;
    }
  }

  /**
   * 清理旧日志
   */
  async cleanupLogs(daysToKeep = 30) {
    try {
      const response = await apiClient.getClient().delete('/system/logs', {
        data: { daysToKeep }
      });
      return response.data;
    } catch (error) {
      console.error('清理日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取解密日志
   */
  async getDecryptLogs(params = {}) {
    try {
      const response = await apiClient.getClient().get('/decrypt/logs', { params });
      return response.data;
    } catch (error) {
      console.error('获取解密日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取传输日志
   */
  async getTransferLogs(params = {}) {
    try {
      const response = await apiClient.getClient().get('/sftp/sync/sessions', { params });
      return response.data;
    } catch (error) {
      console.error('获取传输日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取传输日志详情
   */
  async getTransferLogDetails(sessionId) {
    try {
      const response = await apiClient.getClient().get(`/sftp/sync/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('获取传输日志详情失败:', error);
      throw error;
    }
  }

  /**
   * 导出日志
   */
  async exportLogs(type, params = {}) {
    try {
      const response = await apiClient.getClient().get(`/system/logs/export/${type}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('导出日志失败:', error);
      throw error;
    }
  }
}

export const systemLogsService = new SystemLogsService();
