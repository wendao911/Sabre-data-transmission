import { apiClient } from '../../../services/apiClient';

export const fileMappingService = {
  // 获取映射规则列表
  async getRules(params = {}) {
    try {
      const response = await apiClient.getClient().get('/file-mapping', { params });
      return response.data;
    } catch (error) {
      console.error('获取映射规则列表失败:', error);
      throw error;
    }
  },

  // 获取单个映射规则
  async getRuleById(id) {
    try {
      const response = await apiClient.getClient().get(`/file-mapping/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取映射规则失败:', error);
      throw error;
    }
  },

  // 创建映射规则
  async createRule(ruleData) {
    try {
      const response = await apiClient.getClient().post('/file-mapping', ruleData);
      return response.data;
    } catch (error) {
      console.error('创建映射规则失败:', error);
      throw error;
    }
  },

  // 更新映射规则
  async updateRule(id, ruleData) {
    try {
      const response = await apiClient.getClient().put(`/file-mapping/${id}`, ruleData);
      return response.data;
    } catch (error) {
      console.error('更新映射规则失败:', error);
      throw error;
    }
  },

  // 删除映射规则
  async deleteRule(id) {
    try {
      const response = await apiClient.getClient().delete(`/file-mapping/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除映射规则失败:', error);
      throw error;
    }
  },

  // 批量删除映射规则
  async deleteRules(ids) {
    try {
      const response = await apiClient.getClient().delete('/file-mapping', { data: { ids } });
      return response.data;
    } catch (error) {
      console.error('批量删除映射规则失败:', error);
      throw error;
    }
  },

  // 切换规则启用状态
  async toggleRule(id, enabled) {
    try {
      const response = await apiClient.getClient().patch(`/file-mapping/${id}/toggle`, { enabled });
      return response.data;
    } catch (error) {
      console.error('切换规则状态失败:', error);
      throw error;
    }
  },

  // 更新规则优先级
  async updatePriority(id, priority) {
    try {
      const response = await apiClient.getClient().patch(`/file-mapping/${id}/priority`, { priority });
      return response.data;
    } catch (error) {
      console.error('更新优先级失败:', error);
      throw error;
    }
  },

  // 获取启用的映射规则
  async getEnabledRules() {
    try {
      const response = await apiClient.getClient().get('/file-mapping/enabled/list');
      return response.data;
    } catch (error) {
      console.error('获取启用的映射规则失败:', error);
      throw error;
    }
  }
};
