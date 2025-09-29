const express = require('express');
const router = express.Router();
const sftpService = require('../services/sftpService');
const { logTransferDayResult } = require('../../files/services/transferLogService');
const { SFTPConfig } = require('../models');
const { syncByMapping } = require('../services/syncService');
const path = require('path');
const fs = require('fs');

// 引入会话路由
router.use('/sync/sessions', require('./sessions'));

// 连接状态
router.get('/status', (req, res) => {
  try {
    const isConnected = sftpService.isConnectedToSFTP();
    const connectedSince = sftpService.lastConnectionTime || null;
    return res.json({ success: true, data: { connected: isConnected, connectedSince } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// SFTP 连接
router.post('/connect', async (req, res) => {
  try {
    const { host, port, sftpPort, user, password, privateKey, passphrase } = req.body;
    const params = {
      host,
      port: sftpPort || port || 22,
      user: user,
      password,
      privateKey,
      passphrase
    };
    const result = await sftpService.connect(params);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SFTP 断开连接
router.post('/disconnect', async (req, res) => {
  try {
    await sftpService.disconnect();
    res.json({ success: true, message: 'SFTP 断开连接成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 使用当前激活配置进行连接
router.post('/connect/active', async (req, res) => {
  try {
    const active = await SFTPConfig.findOne({ status: 1 });
    if (!active) {
      return res.status(404).json({ success: false, message: '未找到已启用的 SFTP 配置' });
    }
    const params = {
      host: active.host,
      port: active.sftpPort || active.port || 22,
      username: active.user,
      password: active.password
    };
    const result = await sftpService.connect(params);
    if (!result.success) {
      return res.status(500).json(result);
    }
    return res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 列出远程文件
router.get('/list', async (req, res) => {
  try {
    const { path = '/' } = req.query;

    const result = await sftpService.listDirectory(path);
    if (!result.success) return res.status(500).json(result);
    return res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 上传文件（支持从服务器本地路径推送到SFTP）
router.post('/upload', async (req, res) => {
  try {
    const path = require('path');
    const config = require('../../../config');
    const { localPath, remotePath } = req.body;

    // 计算服务器本地文件的绝对路径（如果传的是相对路径，则基于文件浏览器根目录）
    let resolvedLocalPath = localPath;
    if (resolvedLocalPath && !path.isAbsolute(resolvedLocalPath)) {
      const rootPath = config.fileBrowser?.rootPath || process.cwd();
      resolvedLocalPath = path.resolve(rootPath, resolvedLocalPath);
    }

    const result = await sftpService.uploadFile(resolvedLocalPath || localPath, remotePath);
    if (!result?.success) {
      return res.status(500).json(result || { success: false, message: '文件上传失败' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建远程目录（与前端服务对齐）
router.post('/mkdir', async (req, res) => {
  try {
    const { path: remotePath } = req.body;
    const result = await sftpService.createDirectory(remotePath);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 下载文件
router.post('/download', async (req, res) => {
  try {
    const { remotePath, localPath } = req.body;
    await sftpService.downloadFile(remotePath, localPath);
    res.json({ success: true, message: '文件下载成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 以附件流的方式下载远程文件（供前端直接打开新窗口下载）
router.get('/download-stream', async (req, res) => {
  try {
    const remotePath = req.query.path;
    if (!remotePath) {
      return res.status(400).json({ success: false, message: '缺少 path 参数' });
    }

    // 确保连接可用
    const ensure = await sftpService.ensureConnection();
    if (!ensure.success) {
      return res.status(503).json({ success: false, message: ensure.message || 'SFTP未连接' });
    }

    const filename = path.posix.basename(remotePath);
    const data = await sftpService.client.get(remotePath);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).end(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 根据映射规则同步文件（按日期）
router.post('/sync/by-mapping', async (req, res) => {
  try {
    const { date } = req.body; // YYYY-MM-DD
    if (!date) return res.status(400).json({ success: false, message: '缺少 date 参数' });
    const result = await syncByMapping(date);
    return res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除远程文件
router.delete('/delete', async (req, res) => { // 兼容老路径
  try {
    const { remotePath } = req.body;
    await sftpService.deleteFile(remotePath);
    res.json({ success: true, message: '文件删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除远程文件（与前端服务对齐）
router.delete('/file', async (req, res) => {
  try {
    const { path: remotePath } = req.body;
    const result = await sftpService.deleteFile(remotePath);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除远程目录（与前端服务对齐）
router.delete('/dir', async (req, res) => {
  try {
    const { path: remotePath } = req.body;
    const result = await sftpService.deleteDirectory(remotePath);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SFTP 配置管理 API
// 获取所有 SFTP 配置
router.get('/configs', async (req, res) => {
  try {
    const configs = await SFTPConfig.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取当前激活的 SFTP 配置
router.get('/configs/active', async (req, res) => {
  try {
    const config = await SFTPConfig.findOne({ status: 1 });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建 SFTP 配置
router.post('/configs', async (req, res) => {
  try {
    const configData = {
      ...req.body,
      protocol: 'sftp' // 固定为 SFTP
    };

    // 如果新配置要激活，先取消其他配置的激活状态
    if (configData.status === 1) {
      await SFTPConfig.updateMany({}, { status: 0 });
    }

    const config = new SFTPConfig(configData);
    await config.save();
    res.json({ success: true, data: config, message: 'SFTP 配置创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新 SFTP 配置
router.put('/configs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const configData = {
      ...req.body,
      protocol: 'sftp' // 固定为 SFTP
    };

    // 如果更新配置要激活，先取消其他配置的激活状态
    if (configData.status === 1) {
      await SFTPConfig.updateMany({ _id: { $ne: id } }, { status: 0 });
    }

    const config = await SFTPConfig.findByIdAndUpdate(id, configData, { new: true });
    if (!config) {
      return res.status(404).json({ success: false, message: 'SFTP 配置不存在' });
    }
    res.json({ success: true, data: config, message: 'SFTP 配置更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除 SFTP 配置
router.delete('/configs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await SFTPConfig.findByIdAndDelete(id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'SFTP 配置不存在' });
    }
    res.json({ success: true, message: 'SFTP 配置删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 激活 SFTP 配置
router.post('/configs/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    // 先取消所有配置的激活状态
    await SFTPConfig.updateMany({}, { status: 0 });

    // 激活指定配置
    const config = await SFTPConfig.findByIdAndUpdate(id, { status: 1 }, { new: true });
    if (!config) {
      return res.status(404).json({ success: false, message: 'SFTP 配置不存在' });
    }

    res.json({ success: true, data: config, message: 'SFTP 配置已激活' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 测试 SFTP 连接
router.post('/test-connection', async (req, res) => {
  try {
    const configData = req.body;
    await sftpService.connect(configData);
    await sftpService.disconnect();
    res.json({ success: true, message: 'SFTP 连接测试成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 使用数据库配置连接 SFTP
async function connectSFTPWithActiveConfig() {
  const SFTPConfig = require('../models/SFTPConfig');
  const config = await SFTPConfig.findOne({ status: 1 });
  if (!config) {
    throw new Error('未找到活跃的 SFTP 配置');
  }
  await sftpService.connect({
    host: config.host,
    port: config.sftpPort,
    username: config.user,
    password: config.password
  });
}

// 传输解密文件
async function transferDecryptedFiles(date) {
  const fs = require('fs').promises;
  const path = require('path');

  const decryptedDir = path.join(__dirname, '../../../uploads/decrypted', date);
  const files = await fs.readdir(decryptedDir);

  for (const file of files) {
    const localPath = path.join(decryptedDir, file);
    const remotePath = `/uploads/${date}/${file}`;
    await sftpService.uploadFile(localPath, remotePath);
  }

  await logTransferDayResult(date, files.length, 'success');
}

module.exports = router;
module.exports.connectSFTPWithActiveConfig = connectSFTPWithActiveConfig;
module.exports.transferDecryptedFiles = transferDecryptedFiles;


