const { SystemLog } = require('../models/SystemLog');

class SystemLogService {
  static async logSystemLifecycle(action, message, details = {}) {
    try {
      return await SystemLog.create({
        level: 'info',
        module: 'system',
        action,
        message,
        details: { ...details, timestamp: new Date(), pid: process.pid, nodeVersion: process.version }
      });
    } catch (error) {
      console.error('记录系统生命周期日志失败:', error);
    }
  }

  static async logDatabaseStatus(action, message, details = {}) {
    try {
      const level = action.includes('failed') || action.includes('error') ? 'error' : 'info';
      return await SystemLog.create({ level, module: 'database', action, message, details: { ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录数据库状态日志失败:', error);
    }
  }

  static async logSchedulerStatus(action, message, details = {}) {
    try {
      let level = 'info';
      if (action.includes('failed') || action.includes('error')) level = 'error';
      else if (action.includes('warning') || action.includes('timeout')) level = 'warn';
      return await SystemLog.create({ level, module: 'scheduler', action, message, details: { ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录调度器状态日志失败:', error);
    }
  }

  static async logFileOperation(module, action, message, details = {}) {
    try {
      let level = 'info';
      if (action.includes('failed') || action.includes('error')) level = 'error';
      else if (action.includes('warning') || action.includes('timeout')) level = 'warn';
      return await SystemLog.create({ level, module, action, message, details: { ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录文件操作日志失败:', error);
    }
  }

  static async logSystemError(module, action, message, error, details = {}) {
    try {
      return await SystemLog.create({ level: 'error', module, action, message, details: { ...details, error: error.message || error, stack: error.stack, timestamp: new Date() } });
    } catch (logError) {
      console.error('记录系统错误日志失败:', logError);
    }
  }

  static async logSystemWarning(module, action, message, details = {}) {
    try {
      return await SystemLog.create({ level: 'warn', module, action, message, details: { ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录系统警告日志失败:', error);
    }
  }

  static async logConfigChange(configType, action, message, details = {}) {
    try {
      return await SystemLog.create({ level: 'info', module: 'config', action, message, details: { configType, ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录配置变更日志失败:', error);
    }
  }

  static async logPerformance(module, action, message, details = {}) {
    try {
      return await SystemLog.create({ level: 'info', module, action, message, details: { ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录性能监控日志失败:', error);
    }
  }

  static async logSecurityEvent(action, message, details = {}) {
    try {
      const level = action.includes('failed') || action.includes('denied') ? 'warn' : 'info';
      return await SystemLog.create({ level, module: 'security', action, message, details: { ...details, timestamp: new Date() } });
    } catch (error) {
      console.error('记录安全事件日志失败:', error);
    }
  }
}

module.exports = SystemLogService;


