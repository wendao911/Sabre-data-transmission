import { apiClient } from '../apiClient';

export const healthService = {
  async check() {
    try {
      const response = await apiClient.getClient().get('/health');
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  }
};

export default healthService;
