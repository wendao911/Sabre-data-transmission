import { apiClient } from '../apiClient';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.getClient().post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async register(name, email, password) {
    try {
      const response = await apiClient.getClient().post('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      apiClient.handleError(error);
    }
  },

  async verifyToken(token) {
    try {
      const response = await apiClient.getClient().get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  }
};

export default authService;
