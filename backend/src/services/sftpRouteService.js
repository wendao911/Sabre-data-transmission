const path = require('path');
const fs = require('fs');
const config = require('../config');
const sftpService = require('./sftpService');
const { SFTPConfig } = require('../models/SFTPConfig');
const TransferLogFile = require('../models/TransferLogFile');
const { syncByMapping } = require('./syncService');

function getStatus() {
  return {
    connected: sftpService.isConnectedToSFTP(),
    connectedSince: sftpService.lastConnectionTime || null
  };
}

async function connect(params) {
  return await sftpService.connect(params);
}

async function disconnect() {
  return await sftpService.disconnect();
}

async function connectActive() {
  const active = await SFTPConfig.findOne({ status: 1 });
  if (!active) {
    return { success: false, status: 404, message: '未找到已启用的 SFTP 配置' };
  }
  const params = { host: active.host, port: active.sftpPort || active.port || 22, username: active.user, password: active.password };
  return await sftpService.connect(params);
}

async function listDirectory(remotePath = '/') {
  return await sftpService.listDirectory(remotePath);
}

async function upload({ localPath, remotePath, fileId }) {
  let resolvedLocalPath = localPath;
  if (resolvedLocalPath && !path.isAbsolute(resolvedLocalPath)) {
    const rootPath = config.fileBrowser?.rootPath || process.cwd();
    resolvedLocalPath = path.resolve(rootPath, resolvedLocalPath);
  }
  const finalLocalPath = resolvedLocalPath || localPath;
  const fileName = path.basename(finalLocalPath);
  let fileSize = 0;
  try { const stats = fs.statSync(finalLocalPath); fileSize = stats.size; } catch (_) {}
  const result = await sftpService.uploadFile(finalLocalPath, remotePath);
  try {
    const fileLog = new TransferLogFile({ taskLogId: null, ruleLogId: null, fileName, fileId: fileId || null, localPath: finalLocalPath, remotePath, fileSize, status: result?.success ? 'success' : 'fail', errorMessage: result?.success ? null : (result?.message || '上传失败'), transferTime: new Date() });
    await fileLog.save();
  } catch (_) {}
  return result || { success: false, message: '上传失败' };
}

async function mkdir(remotePath) {
  return await sftpService.createDirectory(remotePath);
}

async function download(remotePath, localPath) {
  return await sftpService.downloadFile(remotePath, localPath);
}

async function downloadStream(remotePath) {
  const ensure = await sftpService.ensureConnection();
  if (!ensure.success) return { success: false, status: 503, message: ensure.message || 'SFTP未连接' };
  const filename = path.posix.basename(remotePath);
  const data = await sftpService.client.get(remotePath);
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return { success: true, filename, buffer };
}

async function syncByMappingDate(dateInput) {
  const dateStr = /^\d{8}$/.test(dateInput) ? dateInput : String(dateInput).replace(/-/g, '');
  if (!/^\d{8}$/.test(dateStr)) {
    return { success: false, status: 400, message: 'date 参数格式应为 YYYYMMDD 或 YYYY-MM-DD' };
  }
  return await syncByMapping(dateStr);
}

async function deleteFile(remotePath) {
  return await sftpService.deleteFile(remotePath);
}

async function deleteDirectory(remotePath) {
  return await sftpService.deleteDirectory(remotePath);
}

module.exports = {
  getStatus,
  connect,
  disconnect,
  connectActive,
  listDirectory,
  upload,
  mkdir,
  download,
  downloadStream,
  syncByMappingDate,
  deleteFile,
  deleteDirectory
};

// ---- SFTP 配置 CRUD ----
async function listConfigs() {
  const configs = await SFTPConfig.find().sort({ updatedAt: -1 });
  return configs;
}

async function getActiveConfig() {
  const config = await SFTPConfig.findOne({ status: 1 });
  return config;
}

async function createConfig(configData) {
  const payload = { ...configData, protocol: 'sftp' };
  if (payload.status === 1) {
    await SFTPConfig.updateMany({}, { status: 0 });
  }
  const config = new SFTPConfig(payload);
  await config.save();
  return config;
}

async function updateConfig(id, configData) {
  const payload = { ...configData, protocol: 'sftp' };
  if (payload.status === 1) {
    await SFTPConfig.updateMany({ _id: { $ne: id } }, { status: 0 });
  }
  const config = await SFTPConfig.findByIdAndUpdate(id, payload, { new: true });
  return config;
}

async function deleteConfig(id) {
  const config = await SFTPConfig.findByIdAndDelete(id);
  return !!config;
}

async function activateConfig(id) {
  await SFTPConfig.updateMany({}, { status: 0 });
  const config = await SFTPConfig.findByIdAndUpdate(id, { status: 1 }, { new: true });
  return config;
}

async function testConnection(configData) {
  try {
    const conn = await connect(configData);
    if (conn?.success) {
      await disconnect();
      return { success: true, message: 'SFTP 连接测试成功' };
    }
    return conn || { success: false, message: 'SFTP 连接失败' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

module.exports.listConfigs = listConfigs;
module.exports.getActiveConfig = getActiveConfig;
module.exports.createConfig = createConfig;
module.exports.updateConfig = updateConfig;
module.exports.deleteConfig = deleteConfig;
module.exports.activateConfig = activateConfig;
module.exports.testConnection = testConnection;


