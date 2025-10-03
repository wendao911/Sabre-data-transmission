import { apiClient } from './apiClient';

export const decryptService = {
  async getStatus() {
    const response = await apiClient.getClient().get('/decrypt/status');
    return response.data.data;
  },
  async startDecrypt(params = {}) {
    const payload = {};
    if (params?.date) payload.date = params.date;
    if (params?.month) payload.month = params.month;
    if (params?.filePath) payload.filePath = params.filePath;
    const response = await apiClient.getClient().post('/decrypt/start', payload, { timeout: 0 });
    return response.data.data;
  },
  async getFiles() {
    const response = await apiClient.getClient().get('/decrypt/files');
    return response.data.data;
  },
  getProgressStream() {
    return new EventSource(`${apiClient.getClient().defaults.baseURL}/decrypt/progress`);
  },
  async startByDate(date) {
    const response = await apiClient.getClient().post('/decrypt/start-by-date', { date });
    return response.data?.data;
  },
  async startByMonth(month) {
    const response = await apiClient.getClient().post('/decrypt/start-by-month', { month });
    return response.data?.data;
  },
  async startByFile(path) {
    const response = await apiClient.getClient().post('/decrypt/start-by-file', { path });
    return response.data?.data;
  },
  async getEncryptedDates() {
    const response = await apiClient.getClient().get('/decrypt/encrypted-dates');
    return response.data;
  },
  async getEncryptedDatesWithStatus() {
    const response = await apiClient.getClient().get('/decrypt/encrypted-dates-with-status');
    return response.data;
  },
  async getDecryptedFiles(date) {
    const response = await apiClient.getClient().get(`/decrypt/decrypted-files?date=${date}`);
    return response.data;
  },
  async getEncryptedFiles(date) {
    const response = await apiClient.getClient().get(`/decrypt/encrypted-files?date=${date}`);
    return response.data;
  },
  async batchProcessFiles(date) {
    const response = await apiClient.getClient().post('/decrypt/batch-process', { date });
    return response.data;
  }
};

export default decryptService;

