const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const mongoose = require('mongoose');
const { registerAllJobs } = require('./jobs/registry');
const SystemLogService = require('./services/systemLogService');

const app = express();
const ENV = config.server.nodeEnv || process.env.NODE_ENV || 'development';
const PORT = config.server.port;

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (
    ENV === 'development'
      ? [
          config.cors.origin,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://172.24.176.1:3000',
          'http://172.24.176.1:3001'
        ]
      : [config.cors.origin]
  ).filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
if (ENV !== 'test') {
  app.use(morgan('combined'));
}
const jsonLimit = Math.max(1, Math.ceil(((config.file && config.file.maxSize) ? config.file.maxSize : 10485760) / (1024 * 1024))) + 'mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/files', require('./routes/files'));
app.use('/api/decrypt', require('./routes/decrypt'));
app.use('/api/sftp', require('./routes/sftp'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/file-mapping', require('./routes/fileMapping'));
app.use('/api/system', require('./routes/system'));
app.use('/api/file-type-config', require('./routes/fileTypeConfig'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // 记录性能监控数据
    const memUsage = process.memoryUsage();
    await SystemLogService.logPerformance('system', 'health_check', '系统健康检查', {
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      cpuUsage: process.cpuUsage(),
      pid: process.pid
    });

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Configuration check endpoint
app.get('/api/config-check', (req, res) => {
  res.json({
    success: true,
    data: {
      server: { ...config.server, nodeEnv: ENV },
      file: config.file,
      database: {
        uri: config.database.uri ? '***' : 'undefined'
      }
    }
  });
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  
  // 记录系统错误
  await SystemLogService.logSystemError('api', 'request_error', 'API 请求错误', err, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    body: req.body
  });
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 连接 MongoDB 后再启动服务
let server;
async function start() {
  try {
    // 记录系统启动
    await SystemLogService.logSystemLifecycle('startup', '系统启动中', {
      version: process.env.npm_package_version || '1.0.0',
      port: PORT,
      environment: ENV,
      nodeVersion: process.version
    });

    // 使用写死的 URI 与基础连接选项
    await mongoose.connect(config.database.uri, {
      maxPoolSize: config.database.options.maxPoolSize,
      minPoolSize: config.database.options.minPoolSize,
      connectTimeoutMS: config.database.options.connectTimeoutMS,
      socketTimeoutMS: config.database.options.socketTimeoutMS,
      serverSelectionTimeoutMS: config.database.options.serverSelectionTimeoutMS
    });
    console.log('✅ 已连接 MongoDB');
    
    // 记录数据库连接成功
    await SystemLogService.logDatabaseStatus('connect', '数据库连接成功', {
      host: config.database.uri.split('@')[1]?.split('/')[0] || 'localhost',
      database: config.database.uri.split('/').pop() || 'acca'
    });

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    });

    // 记录系统启动完成
    await SystemLogService.logSystemLifecycle('startup_complete', '系统启动完成', {
      port: PORT,
      environment: ENV,
      uptime: process.uptime()
    });

    // 注册基于 DB 配置的 jobs（只负责执行，配置存放在 schedule 模块）
    try {
      await registerAllJobs();
      console.log('⏲️  Jobs 已根据配置完成注册');
      
      // 记录任务注册成功
      await SystemLogService.logSchedulerStatus('jobs_registered', '定时任务注册完成', {
        registeredAt: new Date()
      });
    } catch (e) {
      console.error('Jobs 注册失败:', e.message);
      
      // 记录任务注册失败
      await SystemLogService.logSystemError('scheduler', 'jobs_registration_failed', '定时任务注册失败', e);
    }
  } catch (err) {
    console.error('❌ 连接 MongoDB 失败：', err);
    
    // 记录数据库连接失败
    await SystemLogService.logDatabaseStatus('connect_failed', '数据库连接失败', {
      error: err.message,
      host: config.database.uri.split('@')[1]?.split('/')[0] || 'localhost'
    });
    
    process.exit(1);
  }
}

start();

module.exports = app;

// Graceful shutdown
async function shutdown(signal) {
  try {
    console.log(`\n${signal} received. Shutting down...`);
    
    // 记录系统关闭
    await SystemLogService.logSystemLifecycle('shutdown', '系统正在关闭', {
      signal: signal,
      uptime: process.uptime(),
      reason: 'graceful_shutdown'
    });
    
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
    
    // 记录数据库断开连接
    await SystemLogService.logDatabaseStatus('disconnect', '数据库连接已断开', {
      reason: 'system_shutdown'
    });
    
    try { await mongoose.disconnect(); } catch (_) {}
    
    // 记录系统关闭完成
    await SystemLogService.logSystemLifecycle('shutdown_complete', '系统关闭完成', {
      signal: signal,
      totalUptime: process.uptime()
    });
    
    process.exit(0);
  } catch (e) {
    console.error('Error during shutdown:', e);
    
    // 记录关闭过程中的错误
    await SystemLogService.logSystemError('system', 'shutdown_error', '系统关闭过程中发生错误', e);
    
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
