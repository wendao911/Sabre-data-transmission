import { apiClient } from './apiClient';

export const healthService = {
  async check() {
    const response = await apiClient.getClient().get('/health');
    return response.data;
  }
};

export default healthService;

