const { SystemLog } = require('../models/SystemLog');

/**
 * 系统日志服务类
 * 提供系统运行状态的日志记录功能
 */
class SystemLogService {
  
  /**
   * 记录系统生命周期事件
   */
  static async logSystemLifecycle(action, message, details = {}) {
    try {
      return await SystemLog.create({
        level: 'info',
        module: 'system',
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date(),
          pid: process.pid,
          nodeVersion: process.version
        }
      });
    } catch (error) {
      console.error('记录系统生命周期日志失败:', error);
    }
  }

  /**
   * 记录数据库连接状态
   */
  static async logDatabaseStatus(action, message, details = {}) {
    try {
      const level = action.includes('failed') || action.includes('error') ? 'error' : 'info';
      return await SystemLog.create({
        level: level,
        module: 'database',
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录数据库状态日志失败:', error);
    }
  }

  /**
   * 记录 SFTP 连接状态
   */
  static async logSFTPStatus(action, message, details = {}) {
    try {
      const level = action.includes('failed') || action.includes('error') ? 'error' : 'info';
      return await SystemLog.create({
        level: level,
        module: 'sftp',
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录 SFTP 状态日志失败:', error);
    }
  }

  /**
   * 记录定时任务执行状态
   */
  static async logSchedulerStatus(action, message, details = {}) {
    try {
      let level = 'info';
      if (action.includes('failed') || action.includes('error')) {
        level = 'error';
      } else if (action.includes('warning') || action.includes('timeout')) {
        level = 'warn';
      }
      
      return await SystemLog.create({
        level: level,
        module: 'scheduler',
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录调度器状态日志失败:', error);
    }
  }

  /**
   * 记录文件操作状态
   */
  static async logFileOperation(module, action, message, details = {}) {
    try {
      let level = 'info';
      if (action.includes('failed') || action.includes('error')) {
        level = 'error';
      } else if (action.includes('warning') || action.includes('timeout')) {
        level = 'warn';
      }
      
      return await SystemLog.create({
        level: level,
        module: module,
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录文件操作日志失败:', error);
    }
  }

  /**
   * 记录系统异常
   */
  static async logSystemError(module, action, message, error, details = {}) {
    try {
      return await SystemLog.create({
        level: 'error',
        module: module,
        action: action,
        message: message,
        details: {
          ...details,
          error: error.message || error,
          stack: error.stack,
          timestamp: new Date()
        }
      });
    } catch (logError) {
      console.error('记录系统错误日志失败:', logError);
    }
  }

  /**
   * 记录系统警告
   */
  static async logSystemWarning(module, action, message, details = {}) {
    try {
      return await SystemLog.create({
        level: 'warn',
        module: module,
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录系统警告日志失败:', error);
    }
  }

  /**
   * 记录配置变更
   */
  static async logConfigChange(configType, action, message, details = {}) {
    try {
      return await SystemLog.create({
        level: 'info',
        module: 'config',
        action: action,
        message: message,
        details: {
          configType: configType,
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录配置变更日志失败:', error);
    }
  }

  /**
   * 记录性能监控数据
   */
  static async logPerformance(module, action, message, details = {}) {
    try {
      return await SystemLog.create({
        level: 'info',
        module: module,
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录性能监控日志失败:', error);
    }
  }

  /**
   * 记录安全事件
   */
  static async logSecurityEvent(action, message, details = {}) {
    try {
      const level = action.includes('failed') || action.includes('denied') ? 'warn' : 'info';
      return await SystemLog.create({
        level: level,
        module: 'security',
        action: action,
        message: message,
        details: {
          ...details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('记录安全事件日志失败:', error);
    }
  }

  /**
   * 查询系统日志
   */
  static async getLogs(options = {}) {
    try {
      const {
        page = 1,
        pageSize = 50,
        level,
        module,
        action,
        startDate,
        endDate,
        searchText,
        sortBy = 'createdAt',
        sortOrder = -1
      } = options;

      const query = {};
      
      if (level) query.level = level;
      if (module) query.module = module;
      if (action) query.action = action;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      // 搜索文本功能 - 在消息和详情中搜索
      if (searchText) {
        query.$or = [
          { message: { $regex: searchText, $options: 'i' } },
          { action: { $regex: searchText, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * pageSize;
      const sort = { [sortBy]: sortOrder };

      const [logs, total] = await Promise.all([
        SystemLog.find(query).sort(sort).skip(skip).limit(pageSize).lean(),
        SystemLog.countDocuments(query)
      ]);

      return {
        success: true,
        data: {
          logs,
          pagination: {
            current: page,
            pageSize,
            total,
            pages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      console.error('查询系统日志失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取日志统计信息
   */
  static async getLogStats(options = {}) {
    try {
      const { startDate, endDate, module } = options;
      
      const matchQuery = {};
      if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
      }
      if (module) matchQuery.module = module;

      const stats = await SystemLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              level: '$level',
              module: '$module'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.module',
            levels: {
              $push: {
                level: '$_id.level',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('获取日志统计失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 清理旧日志
   */
  static async cleanupLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await SystemLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      await SystemLogService.logSystemLifecycle(
        'cleanup',
        `清理了 ${result.deletedCount} 条超过 ${daysToKeep} 天的旧日志`,
        { deletedCount: result.deletedCount, cutoffDate }
      );

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('清理旧日志失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SystemLogService;
