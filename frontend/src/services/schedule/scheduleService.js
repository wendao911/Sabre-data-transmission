import { apiClient } from '../apiClient';

export const scheduleService = {
  async getConfigs() {
    try {
      const response = await apiClient.getClient().get('/schedule/');
      return response.data?.data || [];
    } catch (error) {
      apiClient.handleError(error);
      return [];
    }
  },

  async update({ taskType, cron, enabled, params }) {
    try {
      const response = await apiClient.getClient().post('/schedule/update', { taskType, cron, enabled, params });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  },

  async run({ taskType, offsetDays = 1 }) {
    try {
      const response = await apiClient.getClient().post('/schedule/run', { taskType, offsetDays });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
      return { success: false, error: error.message };
    }
  },

};

export default scheduleService;
