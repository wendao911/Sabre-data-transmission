import { apiClient } from '../../../services/apiClient';

class FileTypeConfigService {
  /**
   * 获取文件类型配置列表
   */
  async getConfigs(params = {}) {
    try {
      const response = await apiClient.getClient().get('/file-type-config', { params });
      return response.data;
    } catch (error) {
      console.error('获取文件类型配置列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个文件类型配置
   */
  async getConfig(id) {
    try {
      const response = await apiClient.getClient().get(`/file-type-config/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取文件类型配置失败:', error);
      throw error;
    }
  }

  /**
   * 创建文件类型配置
   */
  async createConfig(data) {
    try {
      const response = await apiClient.getClient().post('/file-type-config', data);
      return response.data;
    } catch (error) {
      console.error('创建文件类型配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新文件类型配置
   */
  async updateConfig(id, data) {
    try {
      const response = await apiClient.getClient().put(`/file-type-config/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新文件类型配置失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件类型配置
   */
  async deleteConfig(id) {
    try {
      const response = await apiClient.getClient().delete(`/file-type-config/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除文件类型配置失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除文件类型配置
   */
  async batchDeleteConfigs(ids) {
    try {
      const response = await apiClient.getClient().delete('/file-type-config/batch', {
        data: { ids }
      });
      return response.data;
    } catch (error) {
      console.error('批量删除文件类型配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取模块列表
   */
  async getModules() {
    try {
      const response = await apiClient.getClient().get('/file-type-config/modules');
      return response.data;
    } catch (error) {
      console.error('获取模块列表失败:', error);
      throw error;
    }
  }
}

export const fileTypeConfigService = new FileTypeConfigService();
