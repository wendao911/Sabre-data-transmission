const SFTPClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

class SFTPService {
  constructor() {
    this.client = new SFTPClient();
    this.isConnected = false;
    this.lastConnectionTime = null;
  }

  async connect(params = {}) {
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        if (this.client && this.isConnected) {
          try { await this.client.end(); } catch (_) {}
        }
        this.client = new SFTPClient();

        const cfg = {
          host: params.host,
          port: params.port || 22,
          username: params.user || params.username,
          password: params.password,
          readyTimeout: 30000,
          algorithms: { serverHostKey: ['ssh-rsa', 'ssh-dss', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-ed25519'] }
        };

        if (!cfg.host) {
          return { success: false, message: 'SFTP配置不完整，缺少host。' };
        }

        if (params.privateKey) {
          cfg.privateKey = Buffer.isBuffer(params.privateKey) ? params.privateKey : fs.readFileSync(params.privateKey);
          if (params.passphrase) cfg.passphrase = params.passphrase;
          delete cfg.password;
        }

        await this.client.connect(cfg);
        await this.client.cwd();
        this.isConnected = true;
        this.lastConnectionTime = new Date();
        return { success: true, message: 'SFTP连接成功' };
      } catch (err) {
        lastError = err;
        this.isConnected = false;
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 1000));
        }
      }
    }
    return { success: false, message: `SFTP连接失败: ${lastError?.message || '未知错误'}` };
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await this.client.end();
        this.isConnected = false;
        this.lastConnectionTime = null;
      }
      return { success: true, message: 'SFTP连接已断开' };
    } catch (error) {
      return { success: false, message: `断开连接失败: ${error.message}` };
    }
  }

  isConnectedToSFTP() {
    if (this.isConnected && this.lastConnectionTime) {
      try {
        const config = require('../../../config');
        const maxMs = (config.sftp && config.sftp.connectionMaxMs) ? config.sftp.connectionMaxMs : (60 * 60 * 1000);
        if (Date.now() - this.lastConnectionTime > maxMs) {
          this.isConnected = false;
          this.lastConnectionTime = null;
          try { this.client.end(); } catch (_) {}
        }
      } catch (_) {}
    }
    return this.isConnected;
  }

  async ensureConnection() {
    if (!this.isConnected) return { success: false, message: 'SFTP未连接' };
    try {
      await this.client.cwd();
      return { success: true };
    } catch (e) {
      this.isConnected = false;
      return { success: false, message: 'SFTP连接失效' };
    }
  }

  async listDirectory(remotePath = '/') {
    try {
      const ensure = await this.ensureConnection();
      if (!ensure.success) return ensure;
      const list = await this.client.list(remotePath);
      return { success: true, data: list.map(it => ({ name: it.name, type: it.type === 'd' ? 'directory' : 'file', size: it.size, date: it.modifyTime ? new Date(it.modifyTime) : undefined, permissions: it.longname })) };
    } catch (e) {
      return { success: false, message: `列出目录失败: ${e.message}` };
    }
  }

  async createDirectory(remotePath) {
    try {
      const ensure = await this.ensureConnection();
      if (!ensure.success) return ensure;
      await this.client.mkdir(remotePath, true);
      return { success: true, message: '目录创建成功' };
    } catch (e) {
      return { success: false, message: `创建目录失败: ${e.message}` };
    }
  }

  async uploadFile(localPath, remotePath) {
    try {
      const ensure = await this.ensureConnection();
      if (!ensure.success) return ensure;
      const remoteDir = path.posix.dirname(remotePath.replace(/\\/g, '/'));
      if (remoteDir && remoteDir !== '.' && remoteDir !== '/') {
        try { await this.client.mkdir(remoteDir, true); } catch (_) {}
      }
      await this.client.fastPut(localPath, remotePath);
      return { success: true, message: '文件上传成功' };
    } catch (e) {
      return { success: false, message: `文件上传失败: ${e.message}` };
    }
  }

  async downloadFile(remotePath, localPath) {
    try {
      const ensure = await this.ensureConnection();
      if (!ensure.success) return ensure;
      const localDir = path.dirname(localPath);
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
      await this.client.fastGet(remotePath, localPath);
      return { success: true, message: '文件下载成功' };
    } catch (e) {
      return { success: false, message: `文件下载失败: ${e.message}` };
    }
  }

  async deleteFile(remotePath) {
    try {
      const ensure = await this.ensureConnection();
      if (!ensure.success) return ensure;
      await this.client.delete(remotePath);
      return { success: true, message: '文件删除成功' };
    } catch (e) {
      return { success: false, message: `文件删除失败: ${e.message}` };
    }
  }

  async deleteDirectory(remotePath) {
    try {
      const ensure = await this.ensureConnection();
      if (!ensure.success) return ensure;
      await this.client.rmdir(remotePath, true);
      return { success: true, message: '目录删除成功' };
    } catch (e) {
      return { success: false, message: `目录删除失败: ${e.message}` };
    }
  }
}

module.exports = new SFTPService();


