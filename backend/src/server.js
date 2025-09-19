const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const mongoose = require('mongoose');
const schedulerService = require('./modules/schedule/services');

const app = express();
const ENV = config.server.nodeEnv || process.env.NODE_ENV || 'development';
const PORT = config.server.port;

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (
    ENV === 'development'
      ? [config.cors.origin, 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
      : [config.cors.origin]
  ).filter(Boolean),
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
app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/users', require('./modules/users/routes'));
app.use('/api/files', require('./modules/files/routes'));
app.use('/api/decrypt', require('./modules/decrypt/routes'));
app.use('/api/sftp', require('./modules/sftp/routes'));
app.use('/api/schedule', require('./modules/schedule/routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
app.use((err, req, res, next) => {
  console.error(err.stack);
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
    // 使用写死的 URI 与基础连接选项
    await mongoose.connect(config.database.uri, {
      maxPoolSize: config.database.options.maxPoolSize,
      minPoolSize: config.database.options.minPoolSize,
      connectTimeoutMS: config.database.options.connectTimeoutMS,
      socketTimeoutMS: config.database.options.socketTimeoutMS,
      serverSelectionTimeoutMS: config.database.options.serverSelectionTimeoutMS
    });
    console.log('✅ 已连接 MongoDB');

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    });

    // 初始化调度服务（读取DB配置并启动任务）
    try {
      await schedulerService.loadAndStartAll();
      console.log('⏲️  定时任务已初始化');
    } catch (e) {
      console.error('定时任务初始化失败:', e.message);
    }
  } catch (err) {
    console.error('❌ 连接 MongoDB 失败：', err);
    process.exit(1);
  }
}

start();

module.exports = app;

// Graceful shutdown
async function shutdown(signal) {
  try {
    console.log(`\n${signal} received. Shutting down...`);
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(0);
  } catch (e) {
    console.error('Error during shutdown:', e);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
