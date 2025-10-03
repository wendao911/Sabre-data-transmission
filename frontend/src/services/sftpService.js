import { apiClient } from './apiClient';

export const sftpService = {
  async connect(config) {
    const res = await apiClient.getClient().post('/sftp/connect', config);
    return res.data;
  },
  async connectActive() {
    const res = await apiClient.getClient().post('/sftp/connect/active');
    return res.data;
  },
  async disconnect() {
    const res = await apiClient.getClient().post('/sftp/disconnect');
    return res.data;
  },
  async getStatus() {
    const res = await apiClient.getClient().get('/sftp/status');
    return res.data;
  },
  async listDirectory(path = '/') {
    const res = await apiClient.getClient().get('/sftp/list', { params: { path } });
    return res.data;
  },
  async createDirectory(path) {
    const res = await apiClient.getClient().post('/sftp/mkdir', { path });
    return res.data;
  },
  async deleteDirectory(path) {
    const res = await apiClient.getClient().delete('/sftp/dir', { data: { path } });
    return res.data;
  },
  async deleteFile(path) {
    const res = await apiClient.getClient().delete('/sftp/file', { data: { path } });
    return res.data;
  },
  async uploadFile(localPath, remotePath) {
    const res = await apiClient.getClient().post('/sftp/upload', { localPath, remotePath });
    return res.data;
  },
  async uploadFromServer(localPath, remotePath) {
    const res = await apiClient.getClient().post('/sftp/upload', { localPath, remotePath });
    return res.data;
  },
  async downloadFile(remotePath, localPath) {
    const res = await apiClient.getClient().post('/sftp/download', { remotePath, localPath });
    return res.data;
  },
  getDownloadStreamUrl(remotePath) {
    const base = apiClient.getBaseUrl();
    return `${base}/sftp/download-stream?path=${encodeURIComponent(remotePath)}`;
  },
  async getFtpConfigs() {
    const res = await apiClient.getClient().get('/sftp/configs');
    return res.data;
  },
  async getActiveFtpConfig() {
    const res = await apiClient.getClient().get('/sftp/configs/active');
    return res.data;
  },
  async createFtpConfig(configData) {
    const res = await apiClient.getClient().post('/sftp/configs', configData);
    return res.data;
  },
  async updateFtpConfig(id, configData) {
    const res = await apiClient.getClient().put(`/sftp/configs/${id}`, configData);
    return res.data;
  },
  async deleteFtpConfig(id) {
    const res = await apiClient.getClient().delete(`/sftp/configs/${id}`);
    return res.data;
  },
  async activateFtpConfig(id) {
    const res = await apiClient.getClient().post(`/sftp/configs/${id}/activate`);
    return res.data;
  },
  async testConnection(configData) {
    const res = await apiClient.getClient().post('/sftp/test-connection', configData);
    return res.data;
  },
};

export default sftpService;

