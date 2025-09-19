// 生产环境配置
export const productionConfig = {
  // API 配置
  api: {
    baseURL: 'https://api.acca.com/api',
    timeout: 30000, // 生产环境超时时间更长
    retryAttempts: 5,
    retryDelay: 2000,
  },

  // 应用配置
  app: {
    name: 'ACCA Desktop',
    version: '1.0.0',
    environment: 'production',
    debug: false,
    logLevel: 'error',
  },

  // 功能开关
  features: {
    enableHotReload: false,
    enableDevTools: false,
    enableMockData: false,
    enableAnalytics: true,
    enableErrorReporting: true,
  },

  // 文件上传配置
  upload: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['.gz', '.zip', '.txt', '.dat', '.done'],
    chunkSize: 2 * 1024 * 1024, // 2MB
    maxConcurrent: 5,
  },

  // 文件浏览器配置
  fileBrowser: {
    rootPath: 'ACCA', // 根目录路径，发布时可修改
    pageSize: 100, // 每页显示文件数
    allowedFileTypes: ['.gz', '.zip', '.txt', '.dat', '.done', '.csv', '.json'], // 允许的文件类型
    showHiddenFiles: false, // 是否显示隐藏文件
    sortBy: 'name', // 排序方式：name, size, date
    sortOrder: 'asc', // 排序顺序：asc, desc
  },

  // SFTP 配置
  sftp: {
    connectionTimeout: 60000, // 60秒
    keepAliveInterval: 60000, // 60秒
    maxRetries: 5,
    retryDelay: 5000, // 5秒
  },

  // 解密配置
  decrypt: {
    progressUpdateInterval: 2000, // 2秒
    maxConcurrentFiles: 10,
    timeout: 60 * 60 * 1000, // 60分钟
  },

  // 调度任务配置
  schedule: {
    defaultCron: '0 2 * * *', // 每天凌晨2点
    maxHistoryDays: 90,
    cleanupInterval: 24 * 60 * 60 * 1000, // 24小时
  },

  // 日志配置
  logging: {
    level: 'error',
    enableConsole: false,
    enableFile: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
  },

  // 缓存配置
  cache: {
    enable: true,
    ttl: 30 * 60 * 1000, // 30分钟
    maxSize: 200, // 最大缓存条目数
  },

  // 安全配置
  security: {
    tokenExpiry: 8 * 60 * 60 * 1000, // 8小时
    refreshThreshold: 30 * 60 * 1000, // 30分钟
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000, // 30分钟
  },

  // UI 配置
  ui: {
    theme: 'light',
    language: 'zh-CN',
    pageSize: 50,
    autoRefresh: 60000, // 60秒
    showTooltips: true,
    enableAnimations: false, // 生产环境关闭动画以提高性能
  },

  // 时区配置
  timezone: {
    // 柬埔寨时区 (UTC+7)
    timezone: 'Asia/Phnom_Penh',
    offset: '+07:00',
    displayName: '柬埔寨时间 (UTC+7)'
  },

  // 性能配置
  performance: {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enableServiceWorker: true,
    enableCompression: true,
  },

  // 监控配置
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserAnalytics: true,
    samplingRate: 0.1, // 10% 采样率
  }
};

export default productionConfig;