// 导出所有 API 服务
export { authService } from './auth';
export { fileService } from './files';
export { decryptService } from './decrypt';
export { sftpService } from './sftp';
export { scheduleService } from './schedule';
export { healthService } from './health';

// 为了向后兼容，保留旧的导出方式（使用同步导入）
import { authService } from './auth';
import { fileService } from './files';
import { decryptService } from './decrypt';
import { sftpService } from './sftp';
import { scheduleService } from './schedule';
import { healthService } from './health';

export const authAPI = {
  login: (email, password) => authService.login(email, password),
  register: (name, email, password) => authService.register(name, email, password),
  verifyToken: (token) => authService.verifyToken(token),
};

export const fileAPI = {
  // legacy
  getFiles: () => fileService.getFiles(),
  uploadFile: (file) => fileService.uploadFile(file),
  deleteFile: (fileId) => fileService.deleteFile(fileId),
  downloadFile: (fileId) => fileService.downloadFile(fileId),
  // new read-only apis
  listEncrypted: (q) => fileService.listEncrypted(q),
  listEncryptedGroups: (q) => fileService.listEncryptedGroups(q),
  listEncryptedByDate: (date, q) => fileService.listEncryptedByDate(date, q),
  listDecryptedDirs: (q) => fileService.listDecryptedDirs(q),
  listDecryptedFiles: (dir, q) => fileService.listDecryptedFiles(dir, q),
};

export const decryptAPI = {
  getStatus: () => decryptService.getStatus(),
  startDecrypt: (params) => decryptService.startDecrypt(params),
  getFiles: () => decryptService.getFiles(),
  getProgressStream: () => decryptService.getProgressStream(),
  startByDate: (date) => decryptService.startByDate(date),
  startByMonth: (month) => decryptService.startByMonth(month),
  startByFile: (path) => decryptService.startByFile(path),
};

export const sftpAPI = {
  connect: (config) => sftpService.connect(config),
  disconnect: () => sftpService.disconnect(),
  getStatus: () => sftpService.getStatus(),
  listDirectory: (path = '/') => sftpService.listDirectory(path),
  createDirectory: (path) => sftpService.createDirectory(path),
  deleteDirectory: (path) => sftpService.deleteDirectory(path),
  uploadFile: (file, remotePath) => sftpService.uploadFile(file, remotePath),
  downloadFile: (remotePath, localPath) => sftpService.downloadFile(remotePath, localPath),
  deleteFile: (path) => sftpService.deleteFile(path),
  uploadMultiple: (files, remoteDir, onProgress) => sftpService.uploadMultiple(files, remoteDir, onProgress),
  downloadMultiple: (files) => sftpService.downloadMultiple(files),
  syncEncrypted: (date, remoteDir) => sftpService.syncEncrypted(date, remoteDir),
  syncDecrypted: (date) => sftpService.syncDecrypted(date),
  downloadStreamUrl: (remotePath) => sftpService.getDownloadStreamUrl(remotePath),
  downloadAsAttachment: (remotePath) => sftpService.downloadAsAttachment(remotePath),
};

export const scheduleAPI = {
  getConfigs: () => scheduleService.getConfigs(),
  update: ({ taskType, cron, enabled, params }) => scheduleService.update({ taskType, cron, enabled, params }),
  run: ({ taskType, offsetDays = 1 }) => scheduleService.run({ taskType, offsetDays })
};

export const healthAPI = {
  check: () => healthService.check(),
};

// 默认导出
export default {
  auth: authService,
  files: fileService,
  decrypt: decryptService,
  sftp: sftpService,
  schedule: scheduleService,
  health: healthService,
};
