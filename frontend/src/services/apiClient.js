import axios from 'axios';
import { getApiBaseUrl, getApiTimeout } from '../utils/config';

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: getApiTimeout(),
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

  getClient() {
    return this.client;
  }

  get baseURL() {
    return API_BASE_URL;
  }
}

export const apiClient = new ApiClient();
export { API_BASE_URL };
