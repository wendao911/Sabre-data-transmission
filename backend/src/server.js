const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const mongoose = require('mongoose');
const schedulerService = require('./services/schedulerService');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    config.cors.origin,
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/files', require('./routes/files'));
app.use('/api/decrypt', require('./routes/decrypt'));
const ftpRoutes = require('./routes/ftp');
app.use('/api/ftp', ftpRoutes.router);
app.use('/api/schedule', require('./routes/schedule'));

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
      server: config.server,
      ftp: {
        host: config.ftp.host,
        port: config.ftp.port,
        user: config.ftp.user,
        password: config.ftp.password ? '***' : 'undefined',
        secure: config.ftp.secure
      },
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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
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
