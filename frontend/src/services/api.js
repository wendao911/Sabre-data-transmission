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

  async startDecrypt() {
    try {
      // 按默认超时发起请求；若后续仍需加长，可改成 { timeout: 600000 }
      const response = await this.client.post('/decrypt/start', {}, { timeout: 0 });
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
  startDecrypt: () => apiClient.startDecrypt(),
  getFiles: () => apiClient.getDecryptFiles(),
  getProgressStream: () => new EventSource('http://localhost:3000/api/decrypt/progress'),
  startByDate: (date) => apiClient.client.post('/decrypt/start-by-date', { date }).then(r => r.data?.data),
  startByFile: (path) => apiClient.client.post('/decrypt/start-by-file', { path }).then(r => r.data?.data),
};

export const healthAPI = {
  check: () => apiClient.healthCheck(),
};
