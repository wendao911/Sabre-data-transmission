const express = require('express');
const router = express.Router();
const sftpService = require('../services/sftpService');
const { logTransferDayResult } = require('../../files/services/transferLogService');
const { SFTPConfig } = require('../models');

// SFTP 连接
router.post('/connect', async (req, res) => {
  try {
    const { host, port, username, password, privateKey } = req.body;
    await sftpService.connect({ host, port, username, password, privateKey });
    res.json({ success: true, message: 'SFTP 连接成功' });
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

// 列出远程文件
router.get('/list', async (req, res) => {
  try {
    const { path = '/' } = req.query;
    const files = await sftpService.listFiles(path);
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 上传文件
router.post('/upload', async (req, res) => {
  try {
    const { localPath, remotePath } = req.body;
    await sftpService.uploadFile(localPath, remotePath);
    res.json({ success: true, message: '文件上传成功' });
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

// 删除远程文件
router.delete('/delete', async (req, res) => {
  try {
    const { remotePath } = req.body;
    await sftpService.deleteFile(remotePath);
    res.json({ success: true, message: '文件删除成功' });
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


