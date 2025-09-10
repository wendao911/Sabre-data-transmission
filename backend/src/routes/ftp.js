const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, query, validationResult } = require('express-validator');
const ftpService = require('../services/ftpService');
const archiver = require('archiver');
const { PassThrough } = require('stream');

const router = express.Router();

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
    files: 10 // 最多10个文件
  }
});

// 预日志中间件：在multer处理前记录请求已到达
const logUploadStart = (req, res, next) => {
  try {
    console.log('>>> 收到批量上传请求(预处理):', {
      method: req.method,
      url: req.originalUrl,
      contentLength: req.headers['content-length'] || 'unknown',
      contentType: req.headers['content-type'] || 'unknown'
    });

    let received = 0;
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const onData = (chunk) => {
      received += chunk.length;
      if (contentLength > 0) {
        const percent = Math.min(99, Math.floor((received / contentLength) * 100));
        if (percent % 10 === 0) {
          console.log(`>>> 原始请求体接收进度: ${percent}% (${received}/${contentLength})`);
        }
      } else if (received < 5 * 1024 * 1024) { // 每5MB汇报一次（无Content-Length）
        console.log(`>>> 原始请求体已接收: ${Math.floor(received / 1024 / 1024)}MB (无Content-Length)`);
      }
    };
    req.on('data', onData);
    req.on('end', () => {
      console.log('>>> 原始请求体接收完毕, 总字节:', received);
    });
  } catch (_) {}
  next();
};

// 验证中间件
const validateFTPConfig = [
  body('host').notEmpty().withMessage('FTP主机地址不能为空'),
  body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('端口号必须在1-65535之间'),
  body('user').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  body('secure').optional().isBoolean().withMessage('secure必须是布尔值')
];

const validateFTPConfigOptional = [
  body('host').notEmpty().withMessage('FTP主机地址不能为空'),
  body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('端口号必须在1-65535之间'),
  body('user').optional(),
  body('password').optional(),
  body('secure').optional().isBoolean().withMessage('secure必须是布尔值')
];

const validatePath = [
  body('path').notEmpty().withMessage('路径不能为空')
];

const validateQueryPath = [
  query('path').notEmpty().withMessage('路径不能为空')
];

const validateFilePaths = [
  body('localPath').notEmpty().withMessage('本地路径不能为空'),
  body('remotePath').notEmpty().withMessage('远程路径不能为空')
];

// 处理验证错误
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: '参数验证失败',
      details: errors.array()
    });
  }
  next();
};

// POST /api/ftp/connect - 连接到FTP服务器
router.post('/connect', validateFTPConfigOptional, handleValidationErrors, async (req, res) => {
  try {
    const { host, port, user, password, secure } = req.body;
    
    const result = await ftpService.connect({
      host,
      port: port || 21,
      user,
      password,
      secure: secure || false
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '连接FTP服务器时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/connect-env - 使用环境变量配置连接FTP服务器
router.post('/connect-env', async (req, res) => {
  try {
    const result = await ftpService.connectWithEnvConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '使用环境变量连接FTP服务器时发生错误',
      message: error.message
    });
  }
});


// POST /api/ftp/disconnect - 断开FTP连接
router.post('/disconnect', async (req, res) => {
  try {
    const result = await ftpService.disconnect();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '断开FTP连接时发生错误',
      message: error.message
    });
  }
});

// GET /api/ftp/status - 获取FTP连接状态
router.get('/status', async (req, res) => {
  try {
    const isConnected = ftpService.isConnectedToFTP();
    
    // 如果状态显示已连接，验证连接是否真的有效
    if (isConnected) {
      try {
        await ftpService.client.pwd();
        // 连接确实有效
        res.json({
          success: true,
          data: {
            connected: true
          }
        });
      } catch (error) {
        // 连接无效，更新状态
        ftpService.isConnected = false;
        res.json({
          success: true,
          data: {
            connected: false
          }
        });
      }
    } else {
      // 状态显示未连接
      res.json({
        success: true,
        data: {
          connected: false
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取FTP状态时发生错误',
      message: error.message
    });
  }
});

// GET /api/ftp/config - 获取FTP配置
router.get('/config', (req, res) => {
  try {
    const config = require('../config');
    res.json({
      success: true,
      data: {
        host: config.ftp.host,
        port: config.ftp.port,
        user: config.ftp.user,
        password: config.ftp.password,
        secure: config.ftp.secure
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取配置时发生错误',
      message: error.message
    });
  }
});

// GET /api/ftp/list - 列出远程目录内容
router.get('/list', validateQueryPath, handleValidationErrors, async (req, res) => {
  try {
    const { path: remotePath } = req.query;
    const result = await ftpService.listDirectory(remotePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '列出目录内容时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/mkdir - 创建远程目录
router.post('/mkdir', validatePath, handleValidationErrors, async (req, res) => {
  try {
    const { path: remotePath } = req.body;
    const result = await ftpService.createDirectory(remotePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建目录时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/upload - 上传文件到FTP服务器
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { remotePath } = req.body;
    
    // 验证必需参数
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '参数验证失败',
        message: '请选择要上传的文件'
      });
    }
    
    if (!remotePath) {
      return res.status(400).json({
        success: false,
        error: '参数验证失败',
        message: '远程路径不能为空'
      });
    }
    
    console.log(`上传文件: ${req.file.originalname} -> ${remotePath}`);
    
    // 使用上传的文件路径
    const result = await ftpService.uploadFile(req.file.path, remotePath);
    
    // 如果上传成功，删除临时文件
    if (result.success) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`临时文件已删除: ${req.file.path}`);
      } catch (unlinkError) {
        console.warn('删除临时文件失败:', unlinkError.message);
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('上传文件时发生错误:', error);
    res.status(500).json({
      success: false,
      error: '上传文件时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/download - 从FTP服务器下载文件
router.post('/download', validateFilePaths, handleValidationErrors, async (req, res) => {
  try {
    const { remotePath, localPath } = req.body;
    const result = await ftpService.downloadFile(remotePath, localPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '下载文件时发生错误',
      message: error.message
    });
  }
});

// DELETE /api/ftp/file - 删除远程文件
router.delete('/file', validatePath, handleValidationErrors, async (req, res) => {
  try {
    const { path: remotePath } = req.body;
    const result = await ftpService.deleteFile(remotePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除文件时发生错误',
      message: error.message
    });
  }
});

// DELETE /api/ftp/dir - 删除远程目录
router.delete('/dir', validatePath, handleValidationErrors, async (req, res) => {
  try {
    const { path: remotePath } = req.body;
    const result = await ftpService.deleteDirectory(remotePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除目录时发生错误',
      message: error.message
    });
  }
});

// GET /api/ftp/file-info - 获取远程文件信息
router.get('/file-info', validateQueryPath, handleValidationErrors, async (req, res) => {
  try {
    const { path: remotePath } = req.query;
    const result = await ftpService.getFileInfo(remotePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取文件信息时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/upload-multiple - 批量上传文件
router.post('/upload-multiple', logUploadStart, upload.array('files', 10), async (req, res) => {
  try {
    console.log('=== 批量上传接口被调用 ===');
    console.log('请求体:', req.body);
    console.log('文件数量:', req.files ? req.files.length : 0);
    
    const { remoteDir } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      console.log('错误: 没有文件');
      return res.status(400).json({
        success: false,
        error: '请选择要上传的文件'
      });
    }
    
    if (!remoteDir) {
      console.log('错误: 远程目录为空');
      return res.status(400).json({
        success: false,
        error: '远程目录不能为空'
      });
    }
    
    console.log(`批量上传 ${files.length} 个文件到目录: ${remoteDir}`);
    
    // 顺序上传，避免FTP连接同时占用导致卡住
    const results = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const remotePath = remoteDir === '/' ? `/${file.originalname}` : `${remoteDir}/${file.originalname}`;
      console.log(`[${i + 1}/${files.length}] 开始上传: ${file.originalname} -> ${remotePath}`);

      const perFileTimeoutMs = Math.min(20 * 60 * 1000, Math.max(120000, Math.floor((file.size / 1024) * 80))); // 2-20分钟
      console.log(`为该文件设置服务器端超时: ${perFileTimeoutMs}ms (size=${file.size})`);

      const timeoutPromise = new Promise((_, reject) => {
        const t = setTimeout(() => {
          clearTimeout(t);
          reject(new Error(`服务器端上传超时: ${file.originalname}`));
        }, perFileTimeoutMs);
      });

      try {
        const uploadPromise = ftpService.uploadFile(file.path, remotePath);
        const result = await Promise.race([uploadPromise, timeoutPromise]);
        console.log(`[${i + 1}/${files.length}] 上传完成: ${file.originalname}`, result);
        results.push({ fileName: file.originalname, ...result });
      } catch (err) {
        console.error(`[${i + 1}/${files.length}] 上传失败: ${file.originalname}`, err.message);
        results.push({ fileName: file.originalname, success: false, message: err.message });
      } finally {
        try {
          fs.unlinkSync(file.path);
          console.log(`临时文件已删除: ${file.path}`);
        } catch (unlinkError) {
          console.warn(`删除临时文件失败: ${file.path}`, unlinkError.message);
        }
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `批量上传完成，成功: ${successCount}/${files.length}`,
      data: results
    });
  } catch (error) {
    console.error('批量上传文件时发生错误:', error);
    res.status(500).json({
      success: false,
      error: '批量上传文件时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/download-multiple - 批量下载文件
router.post('/download-multiple', async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '文件列表不能为空'
      });
    }
    
    // 验证文件列表格式
    for (const file of files) {
      if (!file.remotePath || !file.localPath) {
        return res.status(400).json({
          success: false,
          error: '文件列表格式错误，每个文件必须包含remotePath和localPath'
        });
      }
    }
    
    const result = await ftpService.downloadMultipleFiles(files);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '批量下载文件时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/sync-encrypted - 同步加密文件到FTP
router.post('/sync-encrypted', async (req, res) => {
  try {
    const { date, remoteDir = '/encrypted' } = req.body;
    
    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: '日期格式错误，应为YYYYMMDD'
      });
    }
    
    // 查找指定日期的加密文件
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const encDir = path.join(projectRoot, 'Sabre Data Encryption');
    const dateDir = path.join(encDir, date);
    
    if (!fs.existsSync(dateDir)) {
      return res.status(404).json({
        success: false,
        error: '指定日期的加密文件目录不存在'
      });
    }
    
    // 获取目录下的所有.gpg文件（在 remoteDir 下保留日期子目录）
    const files = fs.readdirSync(dateDir)
      .filter(file => file.endsWith('.gpg'))
      .map(file => ({
        localPath: path.join(dateDir, file),
        remotePath: `${remoteDir}/${date}/${file}`
      }));
    
    if (files.length === 0) {
      return res.json({
        success: true,
        message: '指定日期没有找到加密文件',
        data: []
      });
    }
    
    // 直接批量上传
    const result = await ftpService.uploadMultipleFiles(files);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '同步加密文件时发生错误',
      message: error.message
    });
  }
});

// POST /api/ftp/sync-decrypted - 同步解密文件到FTP（保留日期，但去掉 'decrypted' 目录）
router.post('/sync-decrypted', async (req, res) => {
  try {
    const { date } = req.body; // 忽略 remoteDir，直接放在根下的 /{date}
    
    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: '日期格式错误，应为YYYYMMDD'
      });
    }
    
    // 查找指定日期的解密文件
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const decDir = path.join(projectRoot, 'Sabre Data Decryption', date);
    
    if (!fs.existsSync(decDir)) {
      return res.status(404).json({
        success: false,
        error: '指定日期的解密文件目录不存在'
      });
    }
    
    // 递归获取目录下的所有文件，相对 decDir 的路径直接挂到 /{date}/ 下
    const getAllFiles = (dir, basePath = '') => {
      const files = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          files.push(...getAllFiles(fullPath, relativePath));
        } else {
          files.push({
            localPath: fullPath,
            remotePath: `/${date}/${relativePath}`
          });
        }
      }
      
      return files;
    };
    
    const files = getAllFiles(decDir);
    
    if (files.length === 0) {
      return res.json({
        success: true,
        message: '指定日期没有找到解密文件',
        data: []
      });
    }
    
    // 直接批量上传
    const result = await ftpService.uploadMultipleFiles(files);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '同步解密文件时发生错误',
      message: error.message
    });
  }
});

// GET /api/ftp/download-stream?path=... - 流式下载文件或目录（目录打包为zip）
router.get('/download-stream', async (req, res) => {
  try {
    const remotePath = req.query.path;
    if (!remotePath) {
      return res.status(400).json({ success: false, error: 'path 参数必填' });
    }

    const ensure = await ftpService.ensureConnection();
    if (!ensure.success) {
      return res.status(500).json({ success: false, error: ensure.message || 'FTP未连接' });
    }

    const baseName = path.basename(remotePath).replace(/\\/g, '/');

    let isDirectory = false;
    let listErr = null;
    let dirList = null;
    try {
      const listResult = await ftpService.listDirectory(remotePath);
      if (listResult && listResult.success) {
        isDirectory = true;
        dirList = listResult.data || [];
      }
    } catch (e) {
      listErr = e;
    }

    if (isDirectory) {
      const zipName = `${baseName || 'archive'}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipName)}"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => {
        console.error('归档错误:', err);
        try { res.status(500).end(); } catch (_) {}
      });
      archive.pipe(res);

      async function appendDirectory(dir, prefix = '') {
        const childResult = await ftpService.listDirectory(dir);
        if (!childResult.success) return;
        for (const item of childResult.data || []) {
          const childRemote = dir === '/' ? `/${item.name}` : `${dir}/${item.name}`;
          const childNameInZip = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.type === 'directory') {
            await appendDirectory(childRemote, childNameInZip);
          } else {
            const pass = new PassThrough();
            archive.append(pass, { name: childNameInZip });
            await ftpService.client.downloadTo(pass, childRemote);
          }
        }
      }

      await appendDirectory(remotePath, baseName);
      await archive.finalize();
      return;
    }

    // 目录列表失败时，尝试按文件下载
    if (listErr) {
      console.warn('目录列出失败，尝试作为文件下载:', listErr.message || listErr);
    }

    const fileName = baseName || 'download.bin';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    const pass = new PassThrough();
    pass.on('error', (err) => {
      console.error('文件流错误:', err);
      try { res.status(500).end(); } catch (_) {}
    });
    pass.pipe(res);
    await ftpService.client.downloadTo(pass, remotePath);
  } catch (error) {
    console.error('下载流接口错误:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      try { res.end(); } catch (_) {}
    }
  }
});

module.exports = router;
