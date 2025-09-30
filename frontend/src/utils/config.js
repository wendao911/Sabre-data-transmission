// 配置工具文件
import config, { validateConfig, mergeConfig, getConfigByEnvironment } from '../config';

// 验证配置
try {
  validateConfig(config);
} catch (error) {
  console.error('配置验证失败:', error.message);
}

// 配置工具类
class ConfigManager {
  constructor() {
    this.config = config;
  }

  // 获取配置值
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  // 设置配置值（仅在开发环境）
  set(path, value) {
    if (this.isDevelopment()) {
      const keys = path.split('.');
      let current = this.config;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
    } else {
      console.warn('配置设置仅在开发环境可用');
    }
  }

  // 检查功能是否启用
  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`, false);
  }

  // 获取 API 配置
  getApiConfig() {
    return this.get('api', {});
  }

  // 获取应用配置
  getAppConfig() {
    return this.get('app', {});
  }

  // 获取上传配置
  getUploadConfig() {
    return this.get('upload', {});
  }

  // 获取 SFTP 配置
  getSftpConfig() {
    return this.get('sftp', {});
  }

  // 获取解密配置
  getDecryptConfig() {
    return this.get('decrypt', {});
  }

  // 获取调度配置
  getScheduleConfig() {
    return this.get('schedule', {});
  }

  // 获取日志配置
  getLoggingConfig() {
    return this.get('logging', {});
  }

  // 获取缓存配置
  getCacheConfig() {
    return this.get('cache', {});
  }

  // 获取安全配置
  getSecurityConfig() {
    return this.get('security', {});
  }

  // 获取 UI 配置
  getUiConfig() {
    return this.get('ui', {});
  }

  // 检查是否为开发环境
  isDevelopment() {
    return this.get('app.environment') === 'development';
  }

  // 检查是否为生产环境
  isProduction() {
    return this.get('app.environment') === 'production';
  }

  // 检查是否为测试环境
  isTest() {
    return this.get('app.environment') === 'test';
  }

  // 获取调试状态
  isDebugEnabled() {
    return this.get('app.debug', false);
  }

  // 获取日志级别
  getLogLevel() {
    return this.get('logging.level', 'info');
  }

  // 合并配置
  mergeConfig(overrideConfig) {
    this.config = mergeConfig(this.config, overrideConfig);
  }

  // 重置为默认配置
  resetToDefault() {
    this.config = getConfigByEnvironment(this.get('app.environment', 'development'));
  }

  // 获取 API 基础 URL
  getApiBaseUrl() {
    // 仅通过环境变量覆盖（构建时注入），禁止使用缓存/本地存储
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
    return this.get('api.baseURL', 'http://localhost:3000/api');
  }

  // 获取 API 超时时间
  getApiTimeout() {
    return this.get('api.timeout', 300000); // 5分钟超时
  }

  // 获取最大文件大小
  getMaxFileSize() {
    return this.get('upload.maxFileSize', 100 * 1024 * 1024);
  }

  // 获取页面大小
  getPageSize() {
    return this.get('ui.pageSize', 20);
  }

  // 获取主题
  getTheme() {
    return this.get('ui.theme', 'light');
  }

  // 获取语言
  getLanguage() {
    return this.get('ui.language', 'zh-CN');
  }
}

// 创建配置管理器实例
const configManager = new ConfigManager();

// 导出配置管理器和便捷方法
export default configManager;

// 便捷导出
export const getConfig = (path, defaultValue) => configManager.get(path, defaultValue);
export const setConfig = (path, value) => configManager.set(path, value);
export const isFeatureEnabled = (feature) => configManager.isFeatureEnabled(feature);
export const isDevelopment = () => configManager.isDevelopment();
export const isProduction = () => configManager.isProduction();
export const isTest = () => configManager.isTest();
export const isDebugEnabled = () => configManager.isDebugEnabled();
export const getApiBaseUrl = () => configManager.getApiBaseUrl();
export const getApiTimeout = () => configManager.getApiTimeout();
export const getMaxFileSize = () => configManager.getMaxFileSize();
export const getPageSize = () => configManager.getPageSize();
export const getTheme = () => configManager.getTheme();
export const getLanguage = () => configManager.getLanguage();