import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - only redirect if not on login page
          localStorage.removeItem('auth_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  handleError(error) {
    if (error.response?.data) {
      const apiError = error.response.data;
      // 透传后端详细错误（包含 errors 数组等），便于定位问题
      const detailed = apiError.error || apiError.message || apiError.errors || apiError.data || apiError;
      const text = typeof detailed === 'string' ? detailed : JSON.stringify(detailed);
      throw new Error(text || 'An error occurred');
    }
    throw new Error(error.message || 'Network error');
  }

  // Auth API
  async login(email, password) {
    try {
      const response = await this.client.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(name, email, password) {
    try {
      const response = await this.client.post('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyToken(token) {
    try {
      const response = await this.client.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  // File API
  async getFiles() {
    try {
      const response = await this.client.get('/files');
      return response.data.files;
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.file;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteFile(fileId) {
    try {
      await this.client.delete(`/files/${fileId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async downloadFile(fileId) {
    try {
      const response = await this.client.get(`/files/download/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Decrypt API
  async getDecryptStatus() {
    try {
      const response = await this.client.get('/decrypt/status');
      return response.data.data; // 返回data字段中的状态信息
    } catch (error) {
      this.handleError(error);
    }
  }

  async startDecrypt(params = {}) {
    try {
      // 按默认超时发起请求；若后续仍需加长，可改成 { timeout: 600000 }
      const payload = {};
      if (params && params.date) payload.date = params.date;
      if (params && params.month) payload.month = params.month;
      if (params && params.filePath) payload.filePath = params.filePath;
      const response = await this.client.post('/decrypt/start', payload, { timeout: 0 });
      return response.data.data; // 返回data字段中的结果
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDecryptFiles() {
    try {
      const response = await this.client.get('/decrypt/files');
      return response.data.data; // 返回data字段中的文件信息
    } catch (error) {
      this.handleError(error);
    }
  }

  // Files (read-only)
  async listEncrypted({ search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await this.client.get('/files/encrypted', {
        params: { search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async listEncryptedGroups({ search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await this.client.get('/files/encrypted-groups', {
        params: { search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async listEncryptedByDate(date, { search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await this.client.get('/files/encrypted-by-date', {
        params: { date, search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async listDecryptedDirs({ search = '', page = 1, pageSize = 20 } = {}) {
    try {
      const response = await this.client.get('/files/decrypted-dirs', {
        params: { search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async listDecryptedFiles(dir, { search = '', page = 1, pageSize = 50 } = {}) {
    try {
      const response = await this.client.get('/files/decrypted', {
        params: { dir, search, page, pageSize },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

const apiClient = new ApiClient();

export const authAPI = {
  login: (email, password) => apiClient.login(email, password),
  register: (name, email, password) => apiClient.register(name, email, password),
  verifyToken: (token) => apiClient.verifyToken(token),
};

export const fileAPI = {
  // legacy
  getFiles: () => apiClient.getFiles(),
  uploadFile: (file) => apiClient.uploadFile(file),
  deleteFile: (fileId) => apiClient.deleteFile(fileId),
  downloadFile: (fileId) => apiClient.downloadFile(fileId),
  // new read-only apis
  listEncrypted: (q) => apiClient.listEncrypted(q),
  listEncryptedGroups: (q) => apiClient.listEncryptedGroups(q),
  listEncryptedByDate: (date, q) => apiClient.listEncryptedByDate(date, q),
  listDecryptedDirs: (q) => apiClient.listDecryptedDirs(q),
  listDecryptedFiles: (dir, q) => apiClient.listDecryptedFiles(dir, q),
};

export const decryptAPI = {
  getStatus: () => apiClient.getDecryptStatus(),
  startDecrypt: (params) => apiClient.startDecrypt(params),
  getFiles: () => apiClient.getDecryptFiles(),
  getProgressStream: () => new EventSource('http://localhost:3000/api/decrypt/progress'),
  startByDate: (date) => apiClient.client.post('/decrypt/start-by-date', { date }).then(r => r.data?.data),
  startByMonth: (month) => apiClient.client.post('/decrypt/start-by-month', { month }).then(r => r.data?.data),
  startByFile: (path) => apiClient.client.post('/decrypt/start-by-file', { path }).then(r => r.data?.data),
};

export const healthAPI = {
  check: () => apiClient.healthCheck(),
};

// FTP API
export const ftpAPI = {
  // 连接管理
  connect: (config) => apiClient.client.post('/ftp/connect', config).then(r => r.data),
  connectWithEnv: () => apiClient.client.post('/ftp/connect-env').then(r => r.data),
  disconnect: () => apiClient.client.post('/ftp/disconnect').then(r => r.data),
  getStatus: () => apiClient.client.get('/ftp/status').then(r => r.data),
  getConfig: () => apiClient.client.get('/ftp/config').then(r => r.data),
  
  // 目录操作
  listDirectory: (path = '/') => apiClient.client.get('/ftp/list', { params: { path } }).then(r => r.data),
  createDirectory: (path) => apiClient.client.post('/ftp/mkdir', { path }).then(r => r.data),
  deleteDirectory: (path) => apiClient.client.delete('/ftp/dir', { data: { path } }).then(r => r.data),
  
  // 文件操作
  uploadFile: (file, remotePath) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('remotePath', remotePath);
    return apiClient.client.post('/ftp/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(r => r.data);
  },
  downloadFile: (remotePath, localPath) => apiClient.client.post('/ftp/download', { remotePath, localPath }).then(r => r.data),
  deleteFile: (path) => apiClient.client.delete('/ftp/file', { data: { path } }).then(r => r.data),
  getFileInfo: (path) => apiClient.client.get('/ftp/file-info', { params: { path } }).then(r => r.data),
  
  // 批量操作
  uploadMultiple: (files, remoteDir, onProgress) => {
    console.log('=== API uploadMultiple 调用 ===');
    console.log('文件数量:', files.length);
    console.log('远程目录:', remoteDir);
    
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`添加文件 ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
      formData.append('files', file);
    });
    formData.append('remoteDir', remoteDir);
    
    // 计算总文件大小，设置合适的超时时间（上限15分钟）
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const computed = (totalSize / 1024) * 50; // 每KB 50ms
    const timeoutMs = Math.min(15 * 60 * 1000, Math.max(120000, Math.floor(computed))); // 2分钟-15分钟
    
    console.log('总文件大小:', totalSize, 'bytes');
    console.log('超时时间(客户端):', timeoutMs, 'ms');
    
    return apiClient.client.post('/ftp/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: timeoutMs,
      onUploadProgress: (evt) => {
        if (!evt) return;
        const total = evt.total || totalSize;
        const loaded = evt.loaded || 0;
        const percent = total > 0 ? Math.min(99, Math.floor((loaded / total) * 100)) : 0; // 保留1%给服务端处理
        if (typeof onProgress === 'function') onProgress(percent, loaded, total);
      },
    }).then(r => {
      console.log('API响应:', r.data);
      return r.data;
    }).catch(error => {
      console.error('API调用失败:', error);
      throw error;
    });
  },
  downloadMultiple: (files) => apiClient.client.post('/ftp/download-multiple', { files }).then(r => r.data),
  
  // 同步操作
  syncEncrypted: (date, remoteDir = '/encrypted') => apiClient.client.post('/ftp/sync-encrypted', { date, remoteDir }).then(r => r.data),
  syncDecrypted: (date, remoteDir = '/decrypted') => apiClient.client.post('/ftp/sync-decrypted', { date, remoteDir }).then(r => r.data),
  downloadStreamUrl: (remotePath) => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/ftp/download-stream?path=${encodeURIComponent(remotePath)}`;
    return url;
  },
  downloadAsAttachment: (remotePath) => {
    const url = ftpAPI.downloadStreamUrl(remotePath);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};

// Schedule API
export const scheduleAPI = {
  getConfigs: () => apiClient.client.get('/schedule/').then(r => r.data?.data || []),
  update: ({ taskType, cron, enabled, params }) => apiClient.client.post('/schedule/update', { taskType, cron, enabled, params }).then(r => r.data),
  run: ({ taskType, offsetDays = 1 }) => apiClient.client.post('/schedule/run', { taskType, offsetDays }).then(r => r.data),
  
  // FTP 配置管理
  getFtpConfigs: () => apiClient.client.get('/schedule/ftp-config').then(r => r.data),
  getActiveFtpConfig: () => apiClient.client.get('/schedule/ftp-config/active').then(r => r.data),
  createFtpConfig: (payload) => apiClient.client.post('/schedule/ftp-config', payload).then(r => r.data),
  updateFtpConfig: (id, payload) => apiClient.client.put(`/schedule/ftp-config/${id}`, payload).then(r => r.data),
  activateFtpConfig: (id) => apiClient.client.post(`/schedule/ftp-config/${id}/activate`).then(r => r.data),
  deleteFtpConfig: (id) => apiClient.client.delete(`/schedule/ftp-config/${id}`).then(r => r.data),
  
  // 兼容旧版本
  getFtpConfig: () => apiClient.client.get('/schedule/ftp-config/active').then(r => r.data),
  saveFtpConfig: (payload) => apiClient.client.post('/schedule/ftp-config', payload).then(r => r.data)
};