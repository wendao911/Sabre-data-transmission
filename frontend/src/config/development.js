// 开发环境配置
export const developmentConfig = {
  // API 配置
  api: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // 应用配置
  app: {
    name: 'ACCA Desktop',
    version: '1.0.0',
    environment: 'development',
    debug: true,
    logLevel: 'debug',
  },

  // 功能开关
  features: {
    enableHotReload: true,
    enableDevTools: true,
    enableMockData: false,
    enableAnalytics: false,
    enableErrorReporting: false,
  },

  // 文件上传配置
  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['.gz', '.zip', '.txt', '.dat', '.done'],
    chunkSize: 1024 * 1024, // 1MB
    maxConcurrent: 3,
  },

  // 文件浏览器配置
  fileBrowser: {
    rootPath: 'ACCA', // 根目录路径，发布时可修改
    pageSize: 50, // 每页显示文件数
    allowedFileTypes: ['.gz', '.zip', '.txt', '.dat', '.done', '.csv', '.json'], // 允许的文件类型
    showHiddenFiles: false, // 是否显示隐藏文件
    sortBy: 'name', // 排序方式：name, size, date
    sortOrder: 'asc', // 排序顺序：asc, desc
  },

  // SFTP 配置
  sftp: {
    connectionTimeout: 30000, // 30秒
    keepAliveInterval: 30000, // 30秒
    maxRetries: 3,
    retryDelay: 2000, // 2秒
  },

  // 解密配置
  decrypt: {
    progressUpdateInterval: 1000, // 1秒
    maxConcurrentFiles: 5,
    timeout: 30 * 60 * 1000, // 30分钟
  },

  // 调度任务配置
  schedule: {
    defaultCron: '0 2 * * *', // 每天凌晨2点
    maxHistoryDays: 30,
    cleanupInterval: 24 * 60 * 60 * 1000, // 24小时
  },

  // 日志配置
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  },

  // 缓存配置
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 50, // 最大缓存条目数
  },

  // 安全配置
  security: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24小时
    refreshThreshold: 60 * 60 * 1000, // 1小时
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15分钟
  },

  // UI 配置
  ui: {
    theme: 'light',
    language: 'zh-CN',
    pageSize: 20,
    autoRefresh: 30000, // 30秒
    showTooltips: true,
    enableAnimations: true,
  },

  // 时区配置
  timezone: {
    // 柬埔寨时区 (UTC+7)
    timezone: 'Asia/Phnom_Penh',
    offset: '+07:00',
    displayName: '柬埔寨时间 (UTC+7)'
  },

  // 开发工具配置
  devTools: {
    enableReduxDevTools: true,
    enableReactDevTools: true,
    enableNetworkInspector: true,
    enablePerformanceMonitor: true,
  }
};

export default developmentConfig;