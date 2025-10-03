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


