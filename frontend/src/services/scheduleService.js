import { apiClient } from './apiClient';

export const scheduleService = {
  async getConfigs() {
    const response = await apiClient.getClient().get('/schedule/');
    return response.data?.data || [];
  },
  async update({ taskType, cron, enabled, params }) {
    const response = await apiClient.getClient().post('/schedule/update', { taskType, cron, enabled, params });
    return response.data;
  },
  async run({ taskType, offsetDays = 1 }) {
    const response = await apiClient.getClient().post('/schedule/run', { taskType, offsetDays });
    return response.data;
  },
};

export default scheduleService;

