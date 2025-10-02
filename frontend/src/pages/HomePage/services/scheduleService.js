import { apiClient } from '../../../services/apiClient';

const client = apiClient.getClient();

export const scheduleService = {
  async getConfigs() {
    try {
      const { data } = await client.get('/schedule');
      if (data?.success) return data.data || [];
      throw new Error(data?.error || 'Failed to fetch schedule configs');
    } catch (e) {
      throw apiClient.handleError(e);
    }
  },

  async getRuntime() {
    try {
      const { data } = await client.get('/schedule/runtime');
      if (data?.success) return data.data || [];
      throw new Error(data?.error || 'Failed to fetch schedule runtime');
    } catch (e) {
      throw apiClient.handleError(e);
    }
  },

  async run(taskType) {
    try {
      const { data } = await client.post('/schedule/run', { taskType });
      if (data?.success) return true;
      throw new Error(data?.error || 'Failed to run task');
    } catch (e) {
      throw apiClient.handleError(e);
    }
  }
};

export const transferLogService = {
  async listRecent(limit = 5) {
    try {
      const { data } = await client.get('/sftp/sync/sessions', {
        params: { page: 1, pageSize: limit, sortBy: 'createdAt', sortOrder: -1 }
      });
      if (data?.success) return data.data?.logs || [];
      throw new Error(data?.error || 'Failed to fetch recent transfer logs');
    } catch (e) {
      throw apiClient.handleError(e);
    }
  }
};


